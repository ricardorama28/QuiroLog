# DESIGN_BRIEF — MÓDULO DE FLUJO

> Módulo de tarea reutilizable. Se invoca bajo demanda para una tarea específica y repetible.
> Referenciado desde `biblia.md` § 7 (Regla de modularización).
>
> **Este archivo es un DERIVADO de `biblia.md`** — es una foto del estado del proyecto, no la fuente de verdad. Antes de mandarlo a Claude Design, corré la Guardia de frescura (ver sello al pie y `CLAUDE.md` § Cómo trabajar).

---

## Propósito

Producir un **brief de dirección visual** para enviarle a **Claude Design**, destinado a una **renovación del look & feel de QuiroLog** (no un rediseño de producto). El brief traduce lo que la biblia dice sobre qué es la app, quién la usa y qué no se puede romper, a un encargo de **dirección de estilo** acotado y accionable.

Merece su propio módulo porque es un flujo repetible (se va a re-disparar cada vez que se quiera refrescar la identidad visual o pasarle contexto a una herramienta de diseño externa) y porque, al ser un derivado de la biblia, necesita el ritual de sello + guardia de frescura para no enviar una foto vieja.

## Cuándo usarlo

- Cuando se quiera arrancar o refrescar la **dirección visual** de la app y haya que pasarle contexto a Claude Design.
- Cada vez que la biblia avance en algo que afecte la UI (pantallas nuevas, cambios de navegación) y haya que **regenerar** el brief antes de un nuevo hand-off de diseño.

## Entradas requeridas

- `biblia.md` actualizada (fuente de los hechos del producto; nada se inventa acá).
- La pantalla piloto elegida para validar el vibe (default sugerido: **Inicio / Dashboard**).
- Cualquier referencia visual del usuario (opcional): apps que le gusten, paleta de partida, etc.

---

## EL BRIEF (esto es lo que se le envía a Claude Design)

### 1. Qué ES QuiroLog hoy

Una **PWA mobile-first** que funciona como **logbook de cirugías offline-first** para traumatología/ortopedia, con un **catálogo clínico de 55 procedimientos** al lado. Reemplaza el Excel manual: se registra una cirugía en segundos desde el teléfono y se consulta la técnica quirúrgica en el mismo lugar. Los datos viven primero en el dispositivo (funciona sin red) y se replican a la nube.

> Nota de alcance: **no** mencionar facturación ni cobro. Es una decisión de producto abierta, fuera del alcance de este brief.

### 2. Quién es la usuaria real

Una **traumatóloga / residente de ortopedia**. La usa **en el celular**, muchas veces **en pabellón o entre cirugías, sin buena señal**. Implicancias de diseño no negociables:

- **Mobile-first de verdad:** el diseño se evalúa en pantalla de celular, en la mano, posiblemente con guantes y apuro.
- **Legible rápido en contexto clínico:** jerarquía visual clara, contraste alto, el dato importante se lee de un vistazo. Nada que dependa de leer con calma.
- **Sin asumir conectividad:** el diseño no debe comunicar estados que dependan de estar online como si fueran lo normal; offline es un escenario de primera clase.

### 3. Inventario de pantallas a cubrir

La app tiene **5 tabs de navegación** + Login. Cada pantalla con su propósito:

1. **Inicio (Dashboard / logbook)** — vista de aterrizaje: métricas de actividad (meta semanal, volumen), contexto del día y acceso rápido. Es el pulso de la bitácora.
2. **Casos** — "Mis casos" (lista de cirugías registradas, planned/done) + **detalle de caso** (ficha de una cirugía individual con sus campos).
3. **Calendario** — los casos ubicados en el tiempo; vista de agenda/mes.
4. **Procedimientos** — **lista** del catálogo (búsqueda multicampo, favoritos/pin) + **ficha rica** de un procedimiento + **formulario** de creación/edición.
5. **Ajustes** — preferencias del dispositivo (meta semanal, dark mode, export/import, etc.).
6. **Login** — autenticación (Google / email-password) y opción de "continuar localmente". Fuera de los tabs.

### 4. Tono y dirección buscada

**Tech-med:** algo juvenil y bien *tech*, sin perder el enfoque médico/clínico serio. Profesional pero no acartonado; moderno sin volverse un gadget de consumo.

- **Tipografía** con carácter (que aporte a la identidad, no genérica).
- **Fondo dinámico sutil** — movimiento/ambiente discreto que dé vida sin competir con el dato ni golpear el rendimiento ni la legibilidad clínica.
- Estética coherente con la base actual (glassmorphism, iconografía médica/ósea) pero elevada: paleta, jerarquía y componentes con una identidad más fuerte y deliberada.

---

## Reglas y restricciones (qué Claude Design NO debe romper)

Estas son barreras duras. El encargo es **restyling de dirección visual**, no rediseño de producto:

- **Mobile-first innegociable.** Tiene que verse bien y funcionar en pantalla de celular. Es el criterio de aceptación principal.
- **No proponer features nuevas ni cambiar flujos.** Es restyling, no rediseño de producto. Mismas pantallas, mismas acciones.
- **No tocar la lógica de datos, los invariantes (§ 4.6) ni la estructura de navegación.** Los **5 tabs** se mantienen; no se agregan, quitan ni reordenan secciones.
- **Dark mode existe y debe seguir soportado.** Toda propuesta visual se entrega pensando en claro **y** oscuro.
- **Es solo DIRECCIÓN VISUAL:** paleta, tipografía, espaciado, sistema de componentes, jerarquía. **La implementación en código es un paso posterior de Claude Code, fuera de este brief.** No se pide código.

## Recomendación de alcance de entrega (por etapas)

**No** rediseñar las 6 pantallas de una. Enfoque escalonado:

1. **Etapa A — Dirección de estilo + 1 pantalla piloto.** Definir el sistema visual (paleta, tipografía, espaciado, componentes base, tratamiento del fondo dinámico, comportamiento en dark mode) y aplicarlo a **UNA** pantalla piloto — sugerida: **Inicio / Dashboard** — para **validar el vibe** antes de invertir en el resto.
2. **Etapa B — Extensión al resto.** Recién con la dirección validada, extender el sistema a Casos (+detalle), Calendario, Procedimientos (lista + ficha + formulario), Ajustes y Login.

Esto reduce el costo de un mal vibe a una sola pantalla y deja un sistema reutilizable antes de escalar.

## Salida esperada

- Un documento de **dirección visual** (no código): tokens de paleta, escala tipográfica, espaciado, sistema de componentes y jerarquía, con tratamiento explícito de **claro y oscuro**.
- Aplicación de esa dirección a la **pantalla piloto** (Inicio/Dashboard) como prueba de concepto del vibe.
- Todo entregable consumido o re-enviado debe re-chequearse contra la biblia (ver sello).

## Checklist de validación

- [ ] El brief no inventa nada: cada hecho de producto sale de `biblia.md`.
- [ ] No se menciona facturación/cobro (decisión abierta, fuera de alcance).
- [ ] Las 6 pantallas están listadas con su propósito y se respetan los **5 tabs**.
- [ ] Las 5 restricciones duras están declaradas explícitas (mobile-first, no-features, no-lógica/nav, dark mode, solo-dirección-visual).
- [ ] Se recomienda el enfoque por etapas (estilo + piloto, luego el resto).
- [ ] El sello de frescura está al pie y se corrió la Guardia antes de enviar.

---

> **Sincronizado con `biblia.md` hasta: 2026-06-26 — última entrada considerada: MT-001 (ErrorBoundary, 2026-06-26); BUG-001 resuelto (2026-06-26).**
> Guardia de frescura corrida al generar (skill berserk-arquitect v0.2.0): se escanearon STEPS / BUGS / MEJORAS TÉCNICAS; ninguna entrada posterior toca la dirección visual. Si la biblia avanza en algo que afecte la UI (pantallas, navegación, identidad), **regenerar este brief y actualizar el sello** antes de re-enviarlo a Claude Design.
