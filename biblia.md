# QuiroLog — BIBLIA DE ARQUITECTURA

> Fuente de verdad del proyecto. Toda decisión técnica, de producto y de negocio vive acá.
> Antes de implementar cualquier feature, leer este archivo completo.
> El estado de avance (fase/etapa/paso actual) NO vive acá — vive en `CLAUDE.md`. Acá vive el plan; allá, dónde vamos.
>
> **Nota de origen:** este documento fue *reconstruido sobre un proyecto ya en producción* (Fases 0, 0.5 y 1 implementadas y probadas). No es greenfield. Lo ya construido no se re-litiga; se formaliza. Los bordes abiertos (Fase 2 y 3) sí están cerrados explícitamente más abajo.

---

## 1. VISIÓN DEL PRODUCTO

QuiroLog es una **PWA mobile-first** para que médicos de traumatología y ortopedia (residentes y cirujanos) **registren sus cirugías en tiempo real** desde el teléfono, lleven su bitácora operatoria (logbook) y consulten un **catálogo clínico de 55 procedimientos**. Reemplaza el Excel manual y reduce el error administrativo.

**Propuesta de valor:** registrar una cirugía en segundos desde el quirófano, con un catálogo de técnica quirúrgica al lado, y tener la bitácora siempre disponible aunque no haya red.

**Modelo de negocio:** no definido como prioridad en esta etapa. La herramienta es de uso profesional individual; la monetización (suscripción / institucional) queda fuera de alcance hasta después de Fase 2. **No se debe diseñar nada que asuma un modelo de cobro todavía.**

---

## 2. CONTEXTO DEL USUARIO / EQUIPO

- **Usuario final:** médico traumatólogo/ortopedista o residente. Usa el teléfono en el quirófano o entre cirugías. Prioridad absoluta: rapidez de carga y funcionamiento sin red.
- **Quién desarrolla:** un desarrollador principal apoyado por modelos en terminal que ejecutan etapas una por una. El handoff a terminal es el modo de trabajo previsto (ver `CLAUDE.md`).
- **Restricción de privacidad de origen:** los datos de pacientes son sensibles. El sistema está diseñado **des-identificado por defecto** (ver § Invariantes y Fase 3).

---

## 3. STACK TÉCNICO

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Frontend | React 19 + TypeScript + Vite 8 | SPA mobile-first, build rápido |
| UI | TailwindCSS 3 + lucide-react | Estética glassmorphism, iconografía médica/ósea |
| PWA | vite-plugin-pwa | Instalable, offline-first |
| Routing | react-router-dom 7 | Navegación cliente (BrowserRouter) |
| Estado | Store reactivo propio (`useSyncExternalStore`) sobre localStorage | Una sola fuente por dominio, sin librería externa |
| Persistencia local | localStorage | Offline-first; fuente local de verdad |
| Backend / Auth / DB | Supabase (Postgres + Auth + RLS) | Sync por-registro, OAuth Google + email/password |
| Deploy | Vercel | Deploya **`main`** (ver reglas operativas en `CLAUDE.md`) |

**Notas no obvias:**
- `npm install --legacy-peer-deps` es obligatorio (pinneado en `vercel.json` y `.npmrc`) por conflictos de peer-deps con React 19.
- `vercel.json` reescribe todo a `/index.html` para que funcione el routing cliente.
- Supabase es **opcional en runtime**: si faltan `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, `supabase` es `null` y la app corre 100% local (modo "continuar localmente"). Todo el código de sync chequea `if (!supabase)`.

---

## 4. ARQUITECTURA DE DATOS / SISTEMA

### 4.1 Modelo de dominio (TypeScript — `src/types/index.ts`)

- **`Procedure`** — entrada del catálogo clínico. Campo `source: 'kb' | 'user'` y `userEdited: boolean` distinguen catálogo global de overrides del usuario. `pinned?` marca favoritos.
- **`SurgicalCase`** — una cirugía registrada. `procedureNameSnapshot` congela el nombre del procedimiento al momento del caso. `ownerId?` (Fase 1+) y `collaborators?` (Fase 2+). `patientLabel?` es **texto libre NO identificable por diseño**. `syncState: 'local' | 'synced' | 'pending'`.
- **`Settings`** — device-local, no sincroniza (weeklyGoal, darkMode, autoEnrich, externalSearch).

### 4.2 Persistencia local (`src/lib/storage.ts`)

Claves localStorage:

```
quirolog_cases               → SurgicalCase[]
quirolog_procedures          → Procedure[]
quirolog_settings            → Settings
quirolog_kb_seeded_version   → marca de versión sembrada del catálogo
quirolog_tombstones          → Tombstone[] (id + kind de borrados pendientes)
quirolog_local_only          → "true" si el usuario eligió modo local (en AuthContext)
```

### 4.3 Esquema remoto (Supabase — `supabase/migrations/0001_cases.sql`)

```
cases (id text PK, owner_id uuid = auth.uid(), procedure_id, procedure_name_snapshot,
       date, status, role, laterality, patient_label, diagnosis, institution,
       implant_used, intraop_notes, notes, actual_duration_min, created_at, updated_at)
   RLS: cases_owner_rw → owner_id = auth.uid()  (lectura+escritura solo del dueño)

procedure_overrides (id text, owner_id uuid, payload jsonb, source, user_edited, updated_at,
                     PK (id, owner_id))     -- DELTA: solo procedimientos user/edited/pinned
   RLS: po_owner_rw → owner_id = auth.uid()

tombstones (id, kind, owner_id, deleted_at, PK (id, owner_id))   -- borrados a propagar
   RLS: tombstones_owner_rw → owner_id = auth.uid()
```

### 4.4 Motor de sincronización (`src/lib/sync.ts`)

- **Write-through:** cada mutación local empuja a remoto si hay usuario (`pushCase`, `upsertOverride`).
- **`reconcile(ownerId)`** (una vez al login): (1) flush tombstones, (2) pull `cases` y `procedure_overrides` del dueño, (3) merge **LWW por `updatedAt`**, (4) push de los locales que faltan en remoto, (5) aplica overrides remotos sobre el catálogo local.
- **`flushPending(ownerId)`** (al volver online): reintenta los `syncState: 'pending'` y los tombstones.
- **`isOverride(p)`** = `source==='user' || userEdited || !!pinned` → único criterio para subir un procedimiento.

### 4.5 Catálogo de 55 (`src/data/procedures.seed.json` + `procedureKnowledgeBase.ts`)

Bundleado en el build (`KB_VERSION` desde `seed.meta.version`). `seedKnowledgeBaseIfNeeded()` lo siembra en localStorage una sola vez por versión (compara IDs sembrados vs IDs del KB, agrega los faltantes). `enrichExisting()` rellena campos vacíos de procedimientos no editados por el usuario, matcheando por slug/alias.

### 4.6 INVARIANTES — qué se cumple SIEMPRE

> Estos 9 invariantes son la columna vertebral del sistema. Cualquier cambio que los viole es un bug, no una feature.

- **INV-1 — Offline-first.** La app funciona 100% sin red. localStorage es la fuente local; la nube es réplica. Supabase ausente ⇒ degradación elegante a modo local.
- **INV-2 — Propiedad única.** Cada caso pertenece a exactamente un `owner_id = auth.uid()`. La RLS aísla por dueño; un usuario nunca lee/escribe datos de otro (excepción: lectura de compartidos en Fase 2, ver § 6).
- **INV-3 — Casos des-identificados por diseño.** La nube **nunca** almacena PII directa del paciente. `patientLabel` es texto libre no identificable (ej. "Paciente 1, 65a"). No existen columnas de nombre/RUT/contacto en `cases`.
- **INV-4 — Catálogo GLOBAL bundleado.** Los 55 procedimientos son globales, read-only y viajan en el build. **NO sincronizan.** Se siembran una vez por `KB_VERSION`.
- **INV-5 — Overrides PRIVADOS por usuario.** `procedure_overrides` es privado por usuario y **SÍ sincroniza**, guardando solo el delta (procedimiento creado, editado o pinneado).
- **INV-6 — Merge LWW.** Ante conflicto entre local y remoto gana el de mayor `updatedAt`. No hay merge campo-a-campo ni UI de conflicto.
- **INV-7 — Snapshot inmutable del procedimiento.** `procedureNameSnapshot` preserva el nombre del procedimiento al momento del caso; sobrevive renombres o borrados del catálogo.
- **INV-8 — KB intacto nunca se sube.** Un procedimiento del catálogo no tocado (`source:'kb'`, `!userEdited`, `!pinned`) **NUNCA** se sube a `procedure_overrides`. (Documentado en `0001_cases.sql`.)
- **INV-9 — Borrados vía tombstones.** Los borrados se propagan por tombstones, que se **flushean antes del pull** en `reconcile` para que un registro borrado no resucite desde remoto.

---

## 5. ALCANCE — QUÉ ENTRA Y QUÉ NO

**En alcance (estado actual, Fases 0–1):** logbook de cirugías (planned/done), catálogo de 55 con búsqueda multicampo, pin + frecuencia de uso, edición/detalle de casos y procedimientos, sync por-registro con Supabase (LWW), modo local sin cuenta, export/import JSON, calendario, dashboard con meta semanal.

**En alcance (próximo):** Fase 2 colaboradores (solo-lectura, por caso) · Fase 0.6 export PDF de la bitácora.

**Fuera de alcance (explícito):**
- **PII de pacientes en la nube** — diferido a Fase 3 y, por decisión, **el dato identificable jamás se sincroniza** (ver § 6, Fase 3). No se agregan columnas PII a `cases` nunca.
- **Edición colaborativa / co-propiedad** — los colaboradores son **solo-lectura**. No hay edición multi-usuario ni merge de escrituras concurrentes entre usuarios.
- **Modelo de cobro / facturación automática** — la facturación mensual figura en la visión original pero NO está en alcance todavía; no diseñar sobre supuestos de pricing.
- **Búsqueda externa / enriquecimiento por IA en runtime** — flag `externalSearch` existe pero apagado; fuera de alcance.

---

## 6. FASES Y ETAPAS

El desarrollo se corta en fases. Cada fase tiene etapas; cada etapa, work-orders atómicos tomables de a uno por sesión de terminal. El avance (casillas) se refleja acá; el puntero de "dónde vamos" vive en `CLAUDE.md`.

> Numeración intencional: las fases fraccionarias (0.5, 0.6) son incrementos de UX/feature que se intercalan entre hitos mayores. **0.6 va después de la 1** a propósito.

### FASE 0 — Catálogo + Logbook base ✅
**Definición:** registrar cirugías y consultar el catálogo clínico, todo local.
- [x] Catálogo rico de procedimientos + bitácora de casos
- [x] Seed de los 55 procedimientos al catálogo visible en el primer arranque

### FASE 0.5 — UX de bitácora ✅
**Definición:** estados planned/done, detalle/edición, favoritos y búsqueda usable.
- [x] Estado planned/done por caso
- [x] Detalle y edición de caso
- [x] Pin + selector por frecuencia de uso
- [x] Búsqueda multicampo en catálogo
- [x] Badge "Por revisar" (dataCompleteness = 'standard')
- [x] Nota de backup

### FASE 1 — Sync en la nube por-registro ✅
**Definición:** los datos del usuario sobreviven al dispositivo, con merge LWW y offline-first.
- [x] Auth Supabase (Google OAuth + email/password + modo local)
- [x] Tablas `cases`, `procedure_overrides`, `tombstones` con RLS owner-only
- [x] `reconcile` LWW al login + write-through + `flushPending` al reconectar
- [x] Tombstones para borrados; INV-8 (KB intacto no se sube)

### FASE 0.6 — Export PDF de la bitácora ⏳
**Definición:** exportar la bitácora operatoria a un PDF presentable (para acreditación / portfolio del residente).
- [ ] Definir layout del PDF (columnas, agrupación por fecha/región/rol)
- [ ] Generar PDF client-side desde los casos del usuario (solo casos propios; ver INV-3: sin PII)
- [ ] Botón de export en SettingsPage / CasesPage

### FASE 2 — Colaboradores (solo-lectura, por caso) ⏳
**Definición (DoD):** un dueño puede compartir un caso puntual con otro usuario por email; el colaborador VE ese caso (read-only) en su app sin poder editarlo ni borrarlo; la RLS lo garantiza a nivel DB; el write-path del cliente nunca intenta escribir un caso ajeno.

**Decisiones de diseño cerradas (no re-litigar):**
- **Granularidad:** por caso individual (tabla `case_collaborators`), no por logbook entero.
- **Permiso:** **solo-lectura.** El colaborador no edita, no borra, no cambia dueño.
- **Invitación:** por **email de una cuenta Supabase existente**. Si el email no tiene cuenta, falla con mensaje claro. Sin invitaciones pendientes ni emails salientes en esta fase.
- **Identidad:** el caso permanece des-identificado (INV-3) también para el colaborador.

**Etapa 2.1 — Esquema y RLS**
- [ ] Migración `case_collaborators (case_id text → cases(id) on delete cascade, collaborator_id uuid → auth.users, owner_id uuid default auth.uid(), created_at, PK (case_id, collaborator_id))`
- [ ] RLS en `case_collaborators`: el dueño (owner_id = auth.uid()) gestiona (insert/delete) las filas de SUS casos; el colaborador puede SELECT las filas donde `collaborator_id = auth.uid()`
- [ ] Nueva policy SELECT-only en `cases`: permitir leer una fila si existe un `case_collaborators` con `case_id = cases.id AND collaborator_id = auth.uid()`. **No** agregar policies de INSERT/UPDATE/DELETE para colaboradores (read-only a nivel DB).
- [ ] Resolución de email → user_id: definir el mecanismo (vista/RPC `security definer` que mapee email a id sin exponer la tabla de usuarios). Documentar la decisión acá al implementarla.

**Etapa 2.2 — Sync de casos compartidos (cliente)**
- [ ] Extender el pull de `reconcile`: además de los casos propios (`eq owner_id`), traer los compartidos (la RLS ya los habilita). Marcarlos en el store local como de solo-lectura (derivar de `ownerId !== user.id`).
- [ ] **Blindar el owner-stamping (landmine):** `pushCase` / `upsertOverride` deben **omitir** cualquier caso cuyo `ownerId` no sea el usuario actual. Hoy `caseToRow(c, ownerId)` estampa el usuario actual como dueño en cada upsert; un colaborador que editara robaría la propiedad. Guard explícito en el cliente además de la RLS.
- [ ] `reconcile` `toPush`: nunca empujar casos compartidos (ya quedan en `remoteMap`, pero agregar guard defensivo por `ownerId`).
- [ ] Export/import: el export incluye **solo casos propios**, jamás los compartidos de otro dueño.

**Etapa 2.3 — UI de compartir y de lectura**
- [ ] En el detalle de un caso propio: gestionar colaboradores (agregar por email, listar, quitar).
- [ ] En la lista/calendario: marcar visualmente los casos compartidos como "Compartido por …" y deshabilitar edición/borrado (botón "quitar de mi vista" = borra solo la fila propia de `case_collaborators`).
- [ ] **Decisión de UX a confirmar al implementar (no bloqueante):** si los casos compartidos cuentan en la meta semanal / stats del colaborador. *Default recomendado:* se muestran en la bitácora pero NO suman a la meta semanal (la meta mide volumen propio). Registrar la resolución en STEPS.

### FASE 3 — PII del paciente (DIFERIDA) ⏳
**Definición:** poder asociar la identidad real de un paciente a un caso, sin romper jamás INV-3.

**Borde cerrado (para no pintarnos en una esquina):**
- El mapa `patientLabel → identidad real` vive **solo en el dispositivo del dueño y JAMÁS se sincroniza**. La nube permanece 100% des-identificada para siempre.
- **Prohibido** agregar columnas PII a `cases` o a cualquier tabla remota. INV-3 es inviolable.
- Implicancia: la PII no sobrevive al cambio de dispositivo salvo por un export/backup **local y explícito** que el dueño maneje fuera de la nube. Asumido y aceptado.
- No diseñar nada hoy que asuma PII en la nube (ni cifrada en `cases`, ni en tabla remota aparte).

---

## 7. REGLA DE MODULARIZACIÓN

Las tareas repetibles con un workflow propio NO viven como sección de esta biblia: se modularizan en su propio archivo MD (ej: `EXPORT_PDF.md`), con el formato de `.claude/skills/berserk-arquitect/assets/modulo.template.md`, y se referencian desde acá.

**Módulos del proyecto:**
- _(ninguno todavía)_ — candidato natural: `EXPORT_PDF.md` cuando arranque Fase 0.6 (crear bajo demanda).

---

## 8. REGLAS DEL PROYECTO (verdad estable)

> Las reglas *operativas* (deploy, verificación, commits) viven en `CLAUDE.md`. Acá, solo las que son verdad del producto/código.

- Los 9 invariantes (§ 4.6) se respetan siempre. Violarlos es un bug.
- Nunca PII directa del paciente en la nube (INV-3 + Fase 3).
- El catálogo de 55 es global y read-only: no se sube, no se edita en el seed (INV-4 / INV-8).
- Todo dato del usuario debe sobrevivir sin red: localStorage primero, nube como réplica (INV-1).
- Los colaboradores son solo-lectura a nivel DB *y* a nivel cliente (defensa en profundidad).

---

## 9. BUGS

Defectos encontrados fuera del flujo normal de etapas.
**Atributos:** estado · etapa donde se reconoció · fecha · duración de corrección · descripción · fix.

---

### ✅ BUG-001 — Blank screen post-Fase 1
- **Estado:** Resuelto
- **Etapa reconocida:** Fase 1 (post-implementación de sync en la nube)
- **Fecha:** 2026-06-26 (causa identificada en historial git)
- **Duración:** ~30 s entre regresión y fix (commits `2ffd042` → `b68098d`, mismo día 2026-06-25)
- **Descripción:** Tras el flujo de Fase 1 la app mostraba pantalla en blanco. **Causa real:** el merge `2ffd042` (`Merge branch 'main' into claude/modest-mendel-lkcdo6`, que junta Fase 1 con Fase 0.5) resolvió mal un conflicto en `src/hooks/useProcedures.ts` y dejó **`togglePin` declarado dos veces con `const` en el mismo scope** (la versión con sync de Fase 1 + la versión simple de main). Dos `const` con el mismo nombre en el mismo bloque ⇒ `SyntaxError` ⇒ el bundle entero no carga ⇒ pantalla en blanco. (No era la hipótesis original de "falta de `ErrorBoundary`".)
- **Fix:** Commit **`b68098d`** (`fix: remove duplicate togglePin introduced by merge`) eliminó la copia duplicada (la versión simple sin sync), dejando la `togglePin` que sincroniza vía `upsertOverride`/`deleteRemoteOverride`. El módulo volvió a compilar y la app a renderizar.

---

## 10. MEJORAS TÉCNICAS

Cambios de calidad técnica que no son feature ni bug.
**Atributos:** estado · etapa de referencia · fecha · duración · impacto medible.

---

### ⏳ MT-001 — ErrorBoundary global
- **Estado:** Propuesta (opcional — ya NO es prerrequisito de Fase 2)
- **Etapa de referencia:** Fase 1 / cuando convenga
- **Fecha:** 2026-06-26
- **Duración:** —
- **Impacto:** robustez general: convierte cualquier crash de render futuro en un fallback visible + log, en vez de pantalla en blanco. **No** estaba ligada a BUG-001 (cuya causa real fue un `togglePin` duplicado, ya resuelto en `b68098d`), así que deja de ser bloqueante para arrancar Fase 2.
- **Descripción:** `App.tsx` no tiene `ErrorBoundary`. Agregar uno que capture errores de render, muestre un fallback y registre el error. Mejora de defensa en profundidad, tomable en cualquier momento.

---

## 11. CONTEXTO PARA NUEVAS SESIONES

> "QuiroLog es una PWA mobile-first (React 19 + Vite + Supabase) para que traumatólogos registren cirugías offline-first, con catálogo de 55 procedimientos y sync por-registro LWW. Fases 0, 0.5 y 1 están en producción; lo próximo es Fase 2 (colaboradores solo-lectura por caso) y Fase 0.6 (export PDF). Leé `CLAUDE.md` (reglas operativas + estado actual) y esta biblia completa antes de tocar nada. Respetá los 9 invariantes del § 4.6 y no re-litigues lo ya construido."
