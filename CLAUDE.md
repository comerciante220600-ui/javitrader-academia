# Academia JaviTrader

> Léelo entero antes de tocar nada.

Sitio web estático (HTML + CSS + JS puro, sin build ni framework) que aloja el
**curso de trading e inversión de JaviTrader**. Es la web EN VIVO del curso,
publicada en https://academia.javitrader.com (GitHub Pages). Cada lección es una
página `.html` autocontenida; unos pocos scripts compartidos en `assets/` dan
tema, candado, tests y calculadoras. No hay Node, ni `package.json`, ni
tooling de compilación: lo que ves en el repo es exactamente lo que se sirve.

Este repo (`~/GitHub/javitrader-academia`) es la **copia de trabajo canónica**.
Era la subcarpeta `web-demo/` del curso y hoy es repo independiente
(github `comerciante220600-ui/javitrader-academia`). Ignora cualquier copia en
`~/Documents/GitHub` (iCloud rompía git ahí).

## Qué es esto

- Un **curso evergreen** (compra única, sin membresía ni vídeo): se vende
  conocimiento, NO señales ni promesas de rentabilidad. Tono factual, sin hype.
- Estructura: **9 módulos (M0–M8), 41 lecciones** en 3 rutas (Principiante,
  Trading, Inversión/Cripto). El diferenciador de marca es el M5 (lectura
  on-chain).
- Estado: los 9 módulos están maquetados, con visuales y tests, y auditados.
  Está en **FASE BETA** (regalo a testers con feedback), detrás de un candado
  client-side. Pendiente real antes del lanzamiento: precios + pasarela/gating
  de pago (el candado actual NO es cifrado, solo disuasión).

## Stack y arquitectura

Sitio estático multipágina. Sin dependencias ni proceso de build.

- **Páginas** (todas en la raíz, misma plantilla negro+dorado):
  - `index.html` — PORTADA del curso (3 rutas + 9 módulos con badges).
  - `modulo-0.html` … `modulo-8.html` — portada de cada módulo.
  - Lecciones del M1 en la raíz: `leccion-1.html` … `leccion-6.html`
    (el M1 tiene 6 lecciones; su portada es `modulo-1.html`).
  - Resto de módulos con prefijo: `mN-leccion-1..5.html` (p.ej. `m0-leccion-3.html`).
  - `herramientas.html` — página de calculadoras.
  - `feedback.html` — formulario de feedback de la beta (DETRÁS del candado).
  - `beta.html` — landing PÚBLICA de convocatoria (SIN candado, fuera de la nav).
- **Assets compartidos** (`assets/`, JS vanilla en IIFE, sin librerías):
  - `styles.css` — hoja única. Todo el color sale de variables CSS en `:root`
    (`--bg`, `--gold`, `--text`…). Tipografías Google Fonts (Fraunces, Inter,
    Lora) por CDN. Tema claro se mapea con `html.light`.
  - `theme.js` — interruptor claro/oscuro. Por defecto OSCURO. Corre en `<head>`
    para evitar parpadeo; persiste en `localStorage` (`jt_theme`).
  - `gate.js` — candado beta + marca de agua por persona. Corre en `<head>`.
    La lista de testers (`TESTERS`) se edita a mano dentro del archivo; cada uno
    tiene su `code`. Acceso por enlace `?k=CODIGO`; guarda en `localStorage`
    (`jt_beta_access`). Es obfuscación/disuasión, NO seguridad real.
  - `quiz.js` — motor de autoevaluación. Lee un `<script type="application/json">`
    dentro de cada `<div class="quiz" data-quiz>` con preguntas, opciones,
    respuesta correcta y explicación.
  - `tools.js` — 4 calculadoras (tamaño de posición, asimetría, esperanza,
    apalancamiento/liquidación) renderizadas en `<div class="calc" data-tool="…">`.
- **Orden de scripts en cada página**: `theme.js` y `gate.js` en `<head>`;
  `tools.js` y `quiz.js` al final del `<body>` con `defer`.
- Páginas marcadas `noindex, nofollow` (no listada mientras es beta/demo).

## Convenciones importantes

- **Navegación**: la marca/logo enlaza SIEMPRE a `index.html`. El título del
  módulo enlaza a su portada `modulo-N.html`. Al añadir un módulo nuevo: crear su
  tarjeta en `index.html` y su enlace en "Otros módulos" de las demás portadas.
- **Los assets están inyectados en las ~59 páginas**: si cambias los includes de
  scripts o los testers/tema, hazlo de forma consistente en todas.
- **Tests**: la posición de la respuesta correcta debe repartirse entre A/B/C/D
  (no cargar todo a una letra).
- **Moneda**: TODO el curso va en DÓLARES, salvo la lección fiscal del M8
  (`m8-leccion-3.html`), que usa EUROS por ser ley española y lleva disclaimer
  "no es asesoramiento" al inicio y al final. No mezclar € y $ en una lección.
- **Tema**: cualquier color nuevo debe salir de variables CSS y verse bien en
  claro y en oscuro (revisar ambos).
- Hay un archivo cruft `CNAME 2` (duplicado de `CNAME`, artefacto de iCloud);
  el bueno es `CNAME` = `academia.javitrader.com`. Se puede eliminar el duplicado.

## Despliegue

- **GitHub Pages** desde el repo `comerciante220600-ui/javitrader-academia`
  (rama por defecto). No hay workflow de Actions: Pages sirve los HTML tal cual.
- **Dominio propio** `academia.javitrader.com` vía `CNAME`; DNS en Cloudflare,
  CNAME `academia → comerciante220600-ui.github.io` en modo "DNS only" (nube gris),
  HTTPS forzado.
- Truco si el certificado HTTPS de Pages se atasca: quitar y re-añadir el dominio
  personalizado en la config de Pages lo desbloquea.
- **QA local**: server estático `python -m http.server` con cwd en este repo
  (preview `curso-qa` en `~/.claude/launch.json`). Abrir en el navegador.

## Relación con otros repos

- **curso-trading** (`~/Documents/GitHub/curso-trading`): repo ORIGEN, hoy backup
  viejo (jul-2025) que ni siquiera incluía `web-demo`. NO trabajar ahí; la web en
  vivo es ESTE repo. Existe también `~/GitHub/curso-trading` obsoleto: ignorarlo.
- **javitrader-hub / javitrader.net**: web escaparate de la comunidad (otro repo).
  El dominio raíz `javitrader.com`/`javitrader.net` queda para el hub/bio; esta
  academia vive en el subdominio `academia.`.
- El cierre del curso (M8) enlaza a afiliados de exchanges (Bitunix/BingX), en
  línea con la monetización de la comunidad.

## Principios

- **Español neutro/profesional, sin hype.** No prometer rentabilidades ni dar
  señales: se enseña criterio (contexto/probabilidades), no "compra/vende".
- **Anti-humo**: sin indicadores mágicos ni patrones infalibles.
- **Sin build**: editar HTML/CSS/JS a mano; mantener todo autocontenido y sin
  dependencias nuevas. Cambio en assets = revisar impacto en todas las páginas.
- **Git**: no commitear ni pushear sin que Javier lo pida; si hay que tocar
  `main`, crear rama antes. Mensajes en español.
- **Nada de tocar dinero ni claves.** El gating de pago real llega al lanzamiento.
