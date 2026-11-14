# Fuentes de datos y metodología

MAREA trabaja con dos variables oceánicas observadas desde satélite: la concentración de clorofila-a en la superficie y la temperatura superficial del mar. Durante El Niño, el debilitamiento de los vientos alisios reduce la surgencia en el Pacífico oriental y el agua cálida se extiende sobre el archipiélago. Ese cambio deja huella en la temperatura del agua y, con ella, en la disponibilidad de nutrientes y en la producción de fitoplancton. Las dos series cubren el mismo rectángulo alrededor de Galápagos y el mismo calendario mensual, pero proceden de productos independientes, con su propia malla, su propia máscara y sus propios controles de calidad.

Este documento describe qué mide cada variable, con qué producto se obtuvo y cómo se transformó en la serie mensual que publica el observatorio.

## Clorofila-a

La clorofila-a estimada por satélite mide la concentración del pigmento fotosintético en las capas superficiales del océano y sirve como indicador de la abundancia de fitoplancton, la base de la red trófica marina. En un episodio cálido, la menor disponibilidad de nutrientes suele reducir esa producción, con efectos que se propagan hacia arriba en el ecosistema.

El producto es el compuesto mensual Level-3 Mapped **MODISA_L3m_CHL** de la colección estándar 2022.0. Lo genera el Ocean Biology Processing Group del NASA Goddard Space Flight Center a partir del sensor MODIS a bordo de Aqua, con el algoritmo OCI. La variable `chlor_a` tiene una resolución nominal de 4 km y se expresa en mg/m³. MAREA lo obtiene de la serie Science Quality R2022 que distribuye NOAA CoastWatch con el identificador `erdMH1chlamday_R2022SQ`.

La serie procesada cubre de enero de 2003 a octubre de 2024, con 261 medias mensuales válidas de los 264 meses solicitados. Enero, noviembre y diciembre de 2024 no aparecen en el inventario de la colección consultada y quedan registrados como ausentes. Como control de calidad adicional, el recorte de enero de 2003 se contrasta celda por celda con el gránulo NetCDF4 original que publica NASA, cuyo identificador es `AQUA_MODIS.20030101_20030131.L3m.MO.CHL.chlor_a.4km.nc` y cuya revisión declarada es R2022.0. Solo si ambos coinciden se procesa la serie completa. La serie se identifica por la colección, la edición Science Quality y la huella del recorte; los atributos globales del agregado pueden reflejar una revisión menor posterior a la del primer gránulo.

Referencias: [colección NASA y DOI](https://doi.org/10.5067/AQUA/MODIS/L3M/CHL/2022.0) · [catálogo Level-3 de OB.DAAC](https://oceandata.sci.gsfc.nasa.gov/l3/) · [guía de acceso OB.DAAC](https://nasa.github.io/oceandata-notebooks/notebooks/modis/modis_explore_l3.html) · [distribución y metadatos de CoastWatch](https://coastwatch.pfeg.noaa.gov/erddap/griddap/erdMH1chlamday_R2022SQ.html) · [inventario de gránulos](https://coastwatch.pfeg.noaa.gov/erddap/files/erdMH1chlamday_R2022SQ/) · [política de datos de NASA](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-information-guidance)

## Temperatura superficial

La temperatura superficial de fondo es la variable más directa para seguir el calentamiento asociado a El Niño: mide la temperatura de la capa de agua que responde al intercambio con la atmósfera y permite comparar el comportamiento de un año con el de los episodios anteriores.

El producto es **MUR-JPL-L4-GLOB-v4.1**, un análisis global diario de nivel 4 que el Jet Propulsion Laboratory de NASA produce dentro del programa MEaSUREs. Combina observaciones satelitales de varios sensores con mediciones in situ mediante un análisis variacional multiescala, a una resolución de 0,01° (aproximadamente 1 km en el ecuador). Al ser un producto analizado, cada celda contiene un valor diario aunque ese día no exista una medición local.

MAREA utiliza la distribución de NOAA CoastWatch. El compuesto mensual `jplMURSST41mday` aporta los campos `sst`, `mask` y `nobs`, y expresa la temperatura en grados Celsius; el producto original de NASA declara kelvin, de modo que el lector comprueba las unidades en cada lote y aplica la conversión °C = K − 273,15 solo cuando es necesario. Los meses que no están en el compuesto mensual se calculan a partir de los campos diarios auténticos de MUR (`jplMURSST41`), con la misma malla y la misma máscara. Junio de 2023 es el único caso: no aparece en el compuesto mensual y se reconstruyó a partir de sus 30 análisis diarios.

La serie procesada cubre de enero de 2003 a diciembre de 2024, con 264 medias mensuales válidas. La malla del recorte tiene 326 centros de latitud por 301 de longitud, de los cuales 91.581 celdas corresponden a mar abierto.

Referencias: [producto NASA y política de citación](https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1) · [DOI del producto](https://doi.org/10.5067/GHGMR-4FJ04) · [distribución mensual, campos y términos de uso](https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41mday.html) · [distribución diaria](https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41.html)

## Área de estudio

La región analizada es un rectángulo de 92° O a 89° O y de 1,5° S a 1,75° N. Es un sector analítico que contiene las aguas del archipiélago y su entorno inmediato, y sus bordes se alinean con las mallas regulares de ambos productos. El polígono GeoJSON de la serie delimita ese recorte y la configuración es común a las dos variables: [galapagos.json](../scripts/data/galapagos.json).

Solo se consideran celdas de mar abierto. La clorofila combina la bandera LAND del propio producto L3 con el relieve NOAA ETOPO1 en su versión Ice Surface, registrado en nodos de 1 minuto de arco. Una celda de 1/24° es elegible únicamente si todos los nodos de relieve de su huella, bordes incluidos, tienen altitud válida por debajo del nivel del mar; se aplica una tolerancia de 0,00002° para la representación float32 de los centros. Esta regla conservadora descarta celdas mixtas que, a esa escala, podrían contener tierra. La temperatura usa la máscara de mar abierto del propio análisis MUR, que marca cada celda con la combinación de banderas `open_sea`, `land`, `open_lake` y sus variantes con hielo. La malla de temperatura es más fina (0,01°), de modo que cada variable conserva la resolución nativa de su producto.

Referencias: [banderas de calidad de NASA](https://oceandata.sci.gsfc.nasa.gov/ocl2flags/) · [ETOPO1 en CoastWatch](https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.html) · [ETOPO1 en NCEI](https://www.ncei.noaa.gov/products/etopo-global-relief-model)

## Tratamiento y calidad

Cada compuesto se asigna a un mes calendario a partir de su tiempo CF en UTC, y el registro de la serie se identifica con el primer día de ese mes. Se rechazan los meses duplicados y se descartan las fechas fuera del periodo solicitado.

Antes de promediar se aplican la máscara, el valor de relleno y el rango válido declarado por cada producto, y se excluyen los valores no finitos. La clorofila admite concentraciones de 0,001 a 100 mg/m³. La media regional es una media ponderada por área: en la malla regular de clorofila el peso es el coseno de la latitud, y en la malla de temperatura es el área esférica de la intersección de cada celda con el rectángulo, de modo que las celdas del borde aportan solo su parte interior.

Una media mensual se publica únicamente si cumple dos umbrales operativos, ambos configurables y fijados en el 50 %. El primero exige que al menos la mitad de las celdas marinas elegibles aporten una observación. El segundo se aplica solo a la temperatura, donde cada celda debe tener análisis en al menos la mitad de los días del mes. En la clorofila, cada celda válida significa que el compuesto mensual contiene una estimación; el producto no informa cuántos días despejados contribuyeron a esa celda.

Cada mes ocupa un registro compatible con el contrato `Observation`. El campo `qualityFlag` vale `valid` cuando hay media, y `insufficient-coverage`, `no-valid-pixels` o `month-absent` cuando la observación no alcanza los criterios o el compuesto no existe; en esos tres casos el valor es `null`. La clorofila publica en `coverage.validCellsByMonth` el numerador observado de cada mes, frente a las 5.070 celdas oceánicas del recorte de 5.616 celdas; los meses presentes abarcan entre 3.348 y 5.070 celdas válidas, es decir, del 66,0 % al 100 %. La temperatura registra en `coverage.byMonth` las celdas marinas elegibles, las celdas válidas, los días calendario del mes y la suma de días de análisis de las celdas válidas. La cobertura temporal de un mes se obtiene dividiendo `contributingCellDays` entre `validCells × calendarDays`; en toda la serie estuvo entre el 92,9 % y el 100 %, y ninguna celda marina quedó fuera por el umbral de días. La cobertura mide la disponibilidad del análisis de nivel 4, no la presencia de mediciones directas.

Las series publicadas son las de [chlorophyll-monthly.json](../public/data/chlorophyll-monthly.json) y [sst-monthly.json](../public/data/sst-monthly.json). Cada archivo se escribe de forma atómica e incluye la descripción del conjunto de datos, la región, las observaciones, la cobertura y la procedencia con URL, fecha de descarga y huella SHA-256 de cada entrada.

## Referencias

- NASA Goddard Space Flight Center, Ocean Biology Processing Group. *MODIS Aqua Level-3 Mapped chlorophyll-a, versión 2022.0*. [https://doi.org/10.5067/AQUA/MODIS/L3M/CHL/2022.0](https://doi.org/10.5067/AQUA/MODIS/L3M/CHL/2022.0)
- NASA Jet Propulsion Laboratory. *MUR-JPL-L4-GLOB-v4.1, Multi-scale Ultra-high Resolution Sea Surface Temperature Analysis*. PO.DAAC. [https://doi.org/10.5067/GHGMR-4FJ04](https://doi.org/10.5067/GHGMR-4FJ04)
- NOAA CoastWatch ERDDAP. *Distribución de las colecciones utilizadas*. [erdMH1chlamday_R2022SQ](https://coastwatch.pfeg.noaa.gov/erddap/griddap/erdMH1chlamday_R2022SQ.html) · [jplMURSST41mday](https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41mday.html) · [jplMURSST41](https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplMURSST41.html)
- NOAA National Centers for Environmental Information. *ETOPO1 Global Relief Model*. [https://www.ncei.noaa.gov/products/etopo-global-relief-model](https://www.ncei.noaa.gov/products/etopo-global-relief-model)
- NASA. *Earth Science Data and Information Policy*. [https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-information-guidance](https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-information-guidance)

## Reproducibilidad

Los scripts de procesamiento están en `scripts/data/` y solo necesitan Python, numpy y netCDF4. Desde la raíz del proyecto:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r scripts/data/requirements.txt
.\.venv\Scripts\python.exe -m scripts.data.chlorophyll
.\.venv\Scripts\python.exe -m scripts.data.sst
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py"
```

En Linux o macOS, el intérprete del entorno es `.venv/bin/python`. Las descargas públicas quedan en `.marea-cache/`; cada una se guarda con su procedencia y se verifica por SHA-256 al reutilizarla, y cada petición admite hasta tres intentos antes de fallar. Añadir `--offline` reproduce los resultados a partir de la caché existente sin acceder a la red. La clorofila y la temperatura comparten la configuración de la región, pero descargan y validan sus propios archivos. Si una fuente deja de responder, el proceso se detiene sin publicar: el JSON se escribe solo al final y de forma atómica, de modo que el archivo anterior se conserva intacto y la ejecución puede repetirse cuando la descarga vuelva a estar disponible.

El acceso directo a los gránulos de NASA por el navegador Level-3 puede pedir Earthdata Login; es un requisito de la fuente, no del pipeline. MAREA no necesita credenciales para descargar ni para procesar los datos de esta fase.
