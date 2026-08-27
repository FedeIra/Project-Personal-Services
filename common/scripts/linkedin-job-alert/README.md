# LinkedIn Job Alert Analyzer (.eml)

CLI para procesar un correo .eml de LinkedIn Job Alerts, aplicar filtros duros, puntuar vacantes y devolver Top N links de postulacion.

## Uso rapido

```bash
npm run linkedin-jobs -- "C:\\ruta\\a\\tu\\alerta.eml"
```

## Opciones

```bash
npm run linkedin-jobs -- "C:\\ruta\\alerta.eml" --top 20 --out ./linkedin-top-jobs.json --config ./common/scripts/linkedin-job-alert/config.json
```

## Salidas

- Consola: resumen + ranking.
- JSON: archivo con `selected`, `discarded` y metadata.

## Configuracion

Editar `common/scripts/linkedin-job-alert/config.json` para cambiar:

- Filtros duros (`hardFilters`)
- Tecnologias preferidas/excluidas
- Seniority y ubicacion preferida
- Pesos del score

## Notas

- El parser usa el contenido de texto del email y heuristicas para extraer `title`, `company`, `location` y `url`.
- Los links se limpian para dejar formato corto de LinkedIn (`/jobs/view/<id>`).
