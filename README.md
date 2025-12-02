# School Data API

Single source of truth for skoledata. Brukes av studieplanlegger, fagkatalog og chatbotter.

## API-endepunkter

**Primær (v2):** `https://fredeids-metis.github.io/school-data/api/v2`

| Endepunkt | Beskrivelse |
|-----------|-------------|
| `/schools/{id}/studieplanlegger.json` | Komplett data for studieplanlegger |

**Tilgjengelige skoler:**
- `bergen-private-gymnas` - Bergen Private Gymnas

## Mappestruktur

```
school-data/
├── data/
│   ├── curriculum/              # Felles fagdata (UDIR)
│   │   ├── valgfrie-programfag/ # Markdown-filer med fagbeskrivelser
│   │   ├── obligatoriske-programfag/
│   │   ├── fellesfag/
│   │   └── regler.yml           # Valideringsregler (single source of truth)
│   │
│   ├── kilder/                  # Kildehenvisninger
│   │   └── versjon.yml          # Sentralt kilderegister
│   │
│   └── schools/                 # Skolekonfigurasjoner
│       └── bergen-private-gymnas/
│           ├── school-config.yml    # Skolekonfig + blokkskjema-versjoner
│           ├── blokkskjema_v2.yml   # Aktiv versjon
│           ├── blokkskjema_test.yml # Test-versjon
│           ├── blokkskjema_vanilla.yml # Alternativ versjon
│           └── timefordeling.yml
│
├── scripts/
│   ├── build-api-v2.js          # Hovedscript (brukes av studieplanlegger)
│   ├── build-api.js             # v1 (legacy)
│   └── build-api-2025-01.js     # Standard API
│
└── docs/
    ├── api/                     # Generert API (GitHub Pages)
    │   ├── v2/                  # Primær versjon
    │   ├── v1/                  # Legacy
    │   └── 2025-01/             # Standard
    ├── schools/                 # Skole-dokumentasjon
    └── archive/                 # Sesjonsdokumenter
```

## Bruk

### Bygg API

```bash
npm install
npm run build:v2    # Hovedversjon (studieplanlegger)
npm run build:all   # Alle versjoner
```

### Test lokalt

```bash
npm run serve
# Åpne http://localhost:8080/api/v2/schools/bergen-private-gymnas/studieplanlegger.json
```

## Blokkskjema-versjoner

Hver skole kan ha flere blokkskjema-versjoner definert i `school-config.yml`:

```yaml
blokkskjema:
  activeVersion: "v2"
  versions:
    v2: "blokkskjema_v2.yml"      # Aktiv versjon
    test: "blokkskjema_test.yml"  # Test-versjon
    vanilla: "blokkskjema_vanilla.yml"
```

Alle versjoner bygges inn i API og kan velges runtime via `?blokkskjema=vanilla`.

## Klienter

- **Studieplanlegger** - Fagvalg for VG2/VG3 (fredeids-metis/studieplanlegger)
- **Fagkatalog** - Oversikt over programfag (fredeids-metis/fagkatalog)

## Lisens

MIT
