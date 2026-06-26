# CLAUDE.md — {NOMBRE_PROYECTO}

> Entrada operativa. La verdad completa del proyecto vive en `biblia.md` — leela entera antes de codear.
> Este archivo NO repite la biblia: solo dice cómo trabajar y dónde quedamos.

---

## REGLA DE ORO

Todo cambio de arquitectura, feature, endpoint, modelo de datos o decisión técnica debe quedar reflejado en `biblia.md` en la misma sesión en que se implementa. El estado de avance se actualiza acá abajo.

Al iniciar una sesión sobre este repo:
1. Leer `biblia.md` completo — es la fuente de verdad.
2. Leer el ESTADO ACTUAL más abajo — es dónde quedamos.
3. Seguir desde el "próximo paso". No reescribir lo que ya funciona.

---

## ESTADO ACTUAL

> Fuente única del avance. No duplicar en biblia.md.

- **Fase activa:** {N — nombre}
- **Etapa activa:** {N.N — nombre}
- **Último paso completado:** {descripción exacta}
- **Próximo paso:** {el siguiente work-order, literal}
- **Último archivo tocado:** {ruta}
- **Notas de sesión:** {decisiones tomadas que aún no están en biblia.md, si las hay}

---

## PROTOCOLO DE RETOMA (corte de contexto)

Si estás por quedarte sin contexto o cortás la sesión:
1. Actualizá el bloque ESTADO ACTUAL: último paso completado, próximo paso exacto, último archivo tocado.
2. Si tomaste decisiones que cambian la verdad del proyecto, llevalas a `biblia.md`.
3. Commit: `WIP: {dónde quedó}`.

Al retomar: leer ESTADO ACTUAL antes que nada y continuar desde el próximo paso.

---

## CÓMO TRABAJAR

- Tomar de a **una etapa** por sesión. No mezclar etapas.
- Trabajar en bloques chicos y auditables. Validar antes de seguir.
- {Reglas operativas específicas del proyecto: setup, comandos, convenciones de commit.}

---

## QUÉ NO HACER NUNCA

- No duplicar contenido entre este archivo y `biblia.md`.
- No hardcodear credenciales ni secretos.
- {prohibiciones específicas del proyecto}
