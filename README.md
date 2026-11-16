# MAREA — Galápagos Marine Observatory

MAREA es un observatorio marino en línea que reúne observaciones satelitales del océano alrededor del archipiélago de Galápagos y las presenta como un relato visual, en español y en inglés, para cualquier persona interesada en cómo cambia el mar.

**Aplicación:** [kleercitah.github.io/MAREA](https://kleercitah.github.io/MAREA/).

## Sobre el proyecto

El Niño altera las aguas del Pacífico oriental y deja su huella en las islas: la temperatura sube, la surgencia se debilita y la producción de fitoplancton cambia. MAREA estudia esas variaciones con datos de satélite y las traduce en mapas, series temporales e indicadores que permiten comparar el presente con episodios anteriores. El observatorio también se ocupa de cinco especies marinas del archipiélago, cuyo hábitat depende de esas mismas condiciones.

MAREA nace en el NASA Space Apps Challenge 2026, dentro del desafío *Be An Earth System Trend Detective!*, y utiliza productos de observación de la Tierra de acceso abierto. El proyecto se desarrolla por fases; en esta etapa están resueltos el procesamiento científico de dos variables oceánicas, el análisis de tendencias y diferencias en 156 sectores de 0,25°, y las siete secciones de la aplicación que lo presentan, incluido el informe científico.

## Qué puedes explorar

Ocean Explorer permite consultar 525 capas mensuales y 156 sectores de 0,25°. Climate Detective compara los meses con sus referencias y estima tendencias regionales. En los sectores, 11 pruebas de SST y 22 de clorofila-a dan p local < 0,05. Ninguna alcanza q < 0,05 tras el ajuste de Benjamini–Yekutieli por variable. Este resultado limita la evidencia de tendencia a largo plazo.

La cronología distingue los episodios ONI del intervalo de comparación satelital. Vida Marina permite elegir un mes y contrastarlo con estudios de campo. Señales de hábitat reúne fotografías y escenarios independientes de temperatura y clorofila para cada especie, con consecuencias documentadas, hipótesis y un ejemplo real del archivo. El informe científico reúne los resultados y se puede imprimir o guardar como PDF.

## Especies

El observatorio dedica una ficha a cada una de estas cinco especies, todas presentes en el archipiélago: el pingüino de Galápagos (*Spheniscus mendiculus*), la iguana marina (*Amblyrhynchus cristatus*), el lobo marino de Galápagos (*Zalophus wollebaeki*), el cormorán no volador (*Nannopterum harrisi*) y el lobo peletero de Galápagos (*Arctocephalus galapagoensis*). Cada ficha separa la observación satelital, la interpretación ecológica, la evidencia de estudios y las hipótesis de mecanismo, distingue lo que cada indicador puede y no puede representar, y acredita las fuentes y las imágenes utilizadas. Las fotografías son auténticas de la especie correcta y llevan su crédito y licencia; las ilustraciones se identifican como tales. La opción Modelo carga únicamente el GLB de Tripo de la especie seleccionada (54–56 MB). Se puede rotar con ratón o tacto. Su finalidad es ilustrativa y carece de validación anatómica.

## Datos y fuentes

La clorofila-a proviene del compuesto mensual Level-3 Mapped del sensor MODIS a bordo de Aqua, producido por el NASA Goddard Space Flight Center, y se obtiene a través de la serie Science Quality de NOAA CoastWatch. La temperatura superficial del mar proviene del análisis MUR-JPL-L4-GLOB-v4.1, un producto diario de nivel 4 del NASA Jet Propulsion Laboratory.

Ambas series cubren de enero de 2003 a diciembre de 2024 en el mismo rectángulo alrededor de Galápagos y se publican como JSON en `public/data/`. La metodología completa —productos, versiones, unidades, resolución, agregación mensual, máscaras, umbrales de cobertura, datos ausentes y referencias oficiales— está en [la guía de fuentes y metodología](docs/DATA_SOURCES.md), que también explica cómo reproducir el procesamiento.

## Tecnologías

La aplicación web está construida con React, TypeScript, Vite, React Router y Tailwind CSS, con tipografías locales. Los mapas usan Leaflet y los modelos de las especies se visualizan con three.js, que solo se descarga al abrir la vista «Modelo 3D». El procesamiento científico se escribe en Python y utiliza numpy y netCDF4 para leer los archivos NetCDF originales de NASA y NOAA.

## Desarrollo local

Requiere Node.js 22.12 o posterior y npm.

```sh
npm ci
npm run dev
```

Para generar y servir la versión de producción, `npm run build` y `npm run preview`. Los pipelines científicos y sus pruebas se describen en la [guía de fuentes y metodología](docs/DATA_SOURCES.md).

<details>
<summary>Verificaciones del proyecto</summary>

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Las pruebas de navegación se ejecutan con Edge en Windows. En otros entornos se puede indicar un navegador Chromium con la variable `BROWSER_PATH` o instalarlo con `npx playwright-core install chromium`.

</details>

## Créditos y referencias

MAREA utiliza datos de NASA y NOAA y reconoce a las instituciones que los producen y distribuyen:

- NASA Goddard Space Flight Center, Ocean Biology Processing Group, por la colección MODIS Aqua de clorofila-a.
- NASA Jet Propulsion Laboratory y el programa MEaSUREs, por el análisis MUR de temperatura superficial del mar, distribuido por PO.DAAC.
- NOAA CoastWatch ERDDAP, por la distribución de ambas colecciones, y NOAA National Centers for Environmental Information, por el modelo de relieve ETOPO1.
- NASA Space Apps Challenge 2026, por el desafío *Be An Earth System Trend Detective!*.

Los detalles y las referencias completas están en [la guía de fuentes y metodología](docs/DATA_SOURCES.md).
