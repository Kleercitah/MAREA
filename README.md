# MAREA — Galápagos Marine Observatory

MAREA es un observatorio marino en línea que reúne observaciones satelitales del océano alrededor del archipiélago de Galápagos y las presenta como un relato visual, en español y en inglés, para cualquier persona interesada en cómo cambia el mar.

## Sobre el proyecto

El Niño altera las aguas del Pacífico oriental y deja su huella en las islas: la temperatura sube, la surgencia se debilita y la producción de fitoplancton cambia. MAREA estudia esas variaciones con datos de satélite y las traduce en mapas, series temporales e indicadores que permiten comparar el presente con episodios anteriores. El observatorio también se ocupa de cinco especies marinas del archipiélago, cuyo hábitat depende de esas mismas condiciones.

MAREA nace en el NASA Space Apps Challenge 2026, dentro del desafío *Be An Earth System Trend Detective!*, y utiliza productos de observación de la Tierra de acceso abierto. El proyecto se desarrolla por fases; en esta etapa están resueltos el procesamiento científico de dos variables oceánicas y el esqueleto de la aplicación web.

## Qué puedes explorar

Hoy el sitio ofrece la portada del observatorio y la navegación completa entre sus siete secciones en español e inglés, con la preferencia de idioma conservada entre visitas y un menú adaptado a pantallas pequeñas. Junto a la interfaz, el proyecto ya publica sus dos series mensuales procesadas —clorofila-a y temperatura superficial del mar del sector marino de Galápagos— con su procedencia, su cobertura y sus limitaciones documentadas.

El resto del observatorio está en desarrollo. La visión completa incluye un mapa oceanográfico interactivo, las series de temperatura superficial y de clorofila-a con sus tendencias y anomalías, la comparación de distintos periodos de El Niño, las fichas de las cinco especies marinas, indicadores ambientales que dan contexto a su hábitat, ilustraciones y fotografías reales, y un informe científico que reúna fuentes, métodos y limitaciones. Las seis secciones correspondientes se están construyendo de forma progresiva y todavía no están disponibles.

## Especies

El observatorio dedica una ficha a cada una de estas cinco especies, todas presentes en el archipiélago: el pingüino de Galápagos (*Spheniscus mendiculus*), la iguana marina (*Amblyrhynchus cristatus*), el lobo marino de Galápagos (*Zalophus wollebaeki*), la tortuga verde (*Chelonia mydas*) y la manta raya oceánica (*Mobula birostris*). Cada ficha relacionará la especie con las condiciones ambientales de la región y acreditará las fuentes y las imágenes utilizadas.

## Datos y fuentes

La clorofila-a proviene del compuesto mensual Level-3 Mapped del sensor MODIS a bordo de Aqua, producido por el NASA Goddard Space Flight Center, y se obtiene a través de la serie Science Quality de NOAA CoastWatch. La temperatura superficial del mar proviene del análisis MUR-JPL-L4-GLOB-v4.1, un producto diario de nivel 4 del NASA Jet Propulsion Laboratory.

Ambas series cubren de enero de 2003 a diciembre de 2024 en el mismo rectángulo alrededor de Galápagos y se publican como JSON en `public/data/`. La metodología completa —productos, versiones, unidades, resolución, agregación mensual, máscaras, umbrales de cobertura, datos ausentes y referencias oficiales— está en [la guía de fuentes y metodología](docs/DATA_SOURCES.md), que también explica cómo reproducir el procesamiento.

## Tecnologías

La aplicación web está construida con React, TypeScript, Vite, React Router y Tailwind CSS, con tipografías locales. El procesamiento científico se escribe en Python y utiliza numpy y netCDF4 para leer los archivos NetCDF originales de NASA y NOAA.

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
