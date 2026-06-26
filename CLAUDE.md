# CLAUDE.md — QuiroLog

> Entrada operativa. La verdad completa del proyecto vive en `biblia.md` — leela entera antes de codear.
> Este archivo NO repite la biblia: solo dice cómo trabajar y dónde quedamos.

---

## REGLA DE ORO

Todo cambio de arquitectura, feature, endpoint, modelo de datos o decisión técnica debe quedar reflejado en `biblia.md` en la misma sesión en que se implementa. El estado de avance se actualiza acá abajo.

Al iniciar una sesión sobre este repo:
1. Leer `biblia.md` completo — es la fuente de verdad (incluye los 9 invariantes del § 4.6).
2. Leer el ESTADO ACTUAL más abajo — es dónde quedamos.
3. Seguir desde el "próximo paso". No reescribir lo que ya funciona (Fases 0, 0.5 y 1 están en producción y probadas).

---

## ESTADO ACTUAL

> Fuente única del avance. No duplicar en `biblia.md`.

- **Fase activa:** Arquitectura formalizada. Próxima fase de desarrollo: **Fase 2 — Colaboradores** (también disponible Fase 0.6 — Export PDF).
- **Etapa activa:** ninguna en curso. Arrancar por **Etapa 2.1 — Esquema y RLS** (o 0.6.1 si se prioriza el PDF).
- **Último paso completado:** reconstrucción de `biblia.md` + `CLAUDE.md`; cierre de bordes de Fase 2 y Fase 3; **BUG-001 cerrado** (causa real = `togglePin` duplicado por mal merge `2ffd042`, ya resuelto en `b68098d`; no era falta de `ErrorBoundary`). MT-001 (ErrorBoundary) bajado a mejora opcional.
- **Próximo paso:** Etapa 2.1 — crear migración `case_collaborators` + policy SELECT-only en `cases` para colaboradores (ver `biblia.md` § 6, Fase 2). Vía libre: ya no hay crash de arranque que bloquee.
- **Último archivo tocado:** `biblia.md`, `CLAUDE.md` (nuevos).
- **Notas de sesión:** Bordes cerrados → colab: solo-lectura, por caso, invitación por email de cuenta existente. PII (Fase 3): solo local, jamás en la nube. BUG-001 investigado y cerrado vía historial git (`b68098d`). Todo volcado en `biblia.md`; nada pendiente de migrar.

---

## PROTOCOLO DE RETOMA (corte de contexto)

Si estás por quedarte sin contexto o cortás la sesión:
1. Actualizá el bloque ESTADO ACTUAL: último paso completado, próximo paso exacto, último archivo tocado.
2. Si tomaste decisiones que cambian la verdad del proyecto, llevalas a `biblia.md` (no las dejes solo acá).
3. Commit: `WIP: {dónde quedó}`.

Al retomar: leer ESTADO ACTUAL antes que nada y continuar desde el próximo paso.

---

## CÓMO TRABAJAR

- Tomar de a **una etapa** por sesión. No mezclar etapas.
- Trabajar en bloques chicos y auditables. Validar antes de seguir.
- Setup: `npm install --legacy-peer-deps` (obligatorio por React 19). Dev: `npm run dev`. Build: `npm run build`. Lint: `npm run lint`.
- Migraciones SQL viven en `supabase/migrations/` numeradas (`0001_`, `0002_`, …). Nunca editar una migración ya aplicada; agregar una nueva.
- Commits descriptivos en español, prefijo `feat:` / `fix:` / `chore:`.

### Reglas operativas duras (deploy y verificación)

- **Vercel deploya `main`, NO ramas.** Un push a una rama de feature **no** despliega a producción. Para que un cambio llegue a producción tiene que estar en `main`.
- **Nunca declares "pushed" / "deployado" sin pegar la evidencia.** Antes de afirmar que algo está pusheado, ejecutá y pegá la salida de `git log origin/main -n 3` (o de la rama destino). Sin ese log, no se da por pusheado.
- **Verificá contra PRODUCCIÓN, no contra un preview.** Un preview de Vercel no es producción. La verificación de que un cambio funciona se hace contra el deploy de producción (rama `main`), no contra una URL de preview de rama.

---

## QUÉ NO HACER NUNCA

- No duplicar contenido entre este archivo y `biblia.md`.
- No hardcodear credenciales ni secretos (Supabase vía `VITE_SUPABASE_*` en env).
- No violar los 9 invariantes (`biblia.md` § 4.6). En particular: **nunca PII directa del paciente en la nube** (INV-3 / Fase 3).
- No subir el catálogo de 55 intacto (INV-4 / INV-8).
- No dar por desplegado/verificado un cambio que está solo en una rama (Vercel deploya `main`).
- No re-litigar ni reescribir lo ya construido y probado (Fases 0, 0.5, 1) sin una razón registrada como BUG o MEJORA TÉCNICA.
