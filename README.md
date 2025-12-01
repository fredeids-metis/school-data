# School Data API

Masterkilde for all skoledata i organisasjonen (BPG + MVGS). API-et brukes av nettsider, apper og chatbotter.

## API-endepunkter

**Base URL:** `https://fredeids-metis.github.io/school-data/api/2025-01`

| Endepunkt | Beskrivelse |
|-----------|-------------|
| `/curriculum/fag.json` | Alle fag med beskrivelser |
| `/curriculum/regler.json` | Valideringsregler |
| `/skoler/index.json` | Liste over skoler |
| `/skoler/{id}/studieplanlegger.json` | Komplett data for studieplanlegger |

**Tilgjengelige skoler:**
- `bergen-private-gymnas` - Bergen Private Gymnas
- `metis-vgs` - Metis Videregående Skole

## Mappestruktur

```
school-data/
├── data/
│   ├── curriculum/          # Felles fagdata (UDIR)
│   │   ├── valgfrie-programfag/
│   │   ├── obligatoriske-programfag/
│   │   ├── fellesfag/
│   │   └── regler.yml       # Valideringsregler
│   │
│   ├── kilder/              # Kildehenvisninger
│   │   ├── versjon.yml      # Sentralt kilderegister
│   │   ├── udir-1-2025/
│   │   ├── vitnemalsregler-2025/
│   │   └── privatskoleforskriften/
│   │
│   └── skoler/              # Skolekonfigurasjoner
│       ├── bergen-private-gymnas/
│       └── metis-vgs/
│
├── scripts/
│   └── build-api-2025-01.js
│
└── docs/api/2025-01/        # Generert API (GitHub Pages)
```

## Datakilder

| Nivå | Kilde | Hva | Kan redigeres? |
|------|-------|-----|----------------|
| 1 | Privatskoleforskriften | Lovverk | Nei |
| 2 | Udir-1-2025 | Timefordeling | Nei |
| 2 | Vitnemålsregler 2025 | Eksklusjoner, fordypning | Nei |
| 3 | Grep API | Fagkoder, kompetansemål | Nei (auto-hentet) |
| 4 | Lokal | Fagets relevans, bilder | Ja |

Se `data/kilder/` for fullstendig kildedokumentasjon.

## Bruk

### Bygg API lokalt

```bash
npm install
npm run build:2025-01
```

### Hent fagdata fra UDIR

```bash
npm run fetch
```

### Test lokalt

```bash
npm run serve
# Åpne http://localhost:8080/api/2025-01/skoler/index.json
```

## Legge til ny skole

1. Opprett `data/skoler/{skole-id}/`
2. Legg til `school-config.yml`, `blokkskjema.yml`, `timefordeling.yml`
3. Kjør `npm run build:2025-01`
4. Push til GitHub

## Apper som bruker dette API-et

- **Studieplanlegger** - Fagvalg for VG2/VG3
- **Fagkatalog** - Oversikt over programfag
- **BPG-botten** - Chatbot for fagvalg

## Vedlikehold

- Årlig sjekk mot nye UDIR-rundskriv (august)
- Oppdater `data/kilder/versjon.yml` ved verifisering
- Kjør `npm run fetch` for å oppdatere fagdata

## Lisens

MIT
