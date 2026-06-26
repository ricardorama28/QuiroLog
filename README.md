# QuiroLog

QuiroLog es una **PWA mobile-first** para que médicos de traumatología y ortopedia (residentes y cirujanos) registren sus cirugías desde el teléfono y lleven su bitácora operatoria (logbook), incluso sin conexión.

## Qué hace hoy

- **Logbook de cirugías offline-first** — registrá cada caso (agendado/realizado) en segundos; funciona 100% sin red, con localStorage como fuente local.
- **Catálogo clínico de 55 procedimientos** — técnica quirúrgica, indicaciones, implantes y más, con búsqueda multicampo, favoritos y frecuencia de uso.
- **Sync por-registro en la nube** — con Supabase (auth Google / email), merge last-write-wins; también podés usarla en modo local sin cuenta.
- **Calendario y dashboard** — vista mensual de casos y meta semanal.
- **Export/import JSON** de tus datos.

Los casos son **des-identificados por diseño**: la app no almacena PII directa del paciente en la nube.
