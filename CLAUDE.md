# School-Data: Arkitektur og Dataflyt

## Kjernekonsept: To-lags arkitektur

School-data har **to separate lag**:

```
┌─────────────────────────────────────────────────────────────────┐
│  LAG 1: UDIR (nasjonalt)                    data/udir/          │
│  ─────────────────────────────────────────────────────────────  │
│  • Alle fag (90+)           - Fagdefinisjoner fra UDIR          │
│  • Alle programområder      - Timefordeling, krav               │
│  • Alle regler              - Eksklusjoner, forutsetninger      │
│  → Uavhengig av skole. Endringer her påvirker ALLE skoler.      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  LAG 2: SKOLE (filter)                      data/skoler/        │
│  ─────────────────────────────────────────────────────────────  │
│  • school-config.yml        - Hvilke programområder skolen har  │
│  • tilbud.yml               - HVILKE fag skolen tilbyr          │
│  • blokkskjema/             - NÅR/HVOR fagene undervises        │
│  → Filtrerer fra UDIR. Endringer her påvirker KUN denne skolen. │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  APPER (konsumenter via API)                                    │
│  • Fagkatalog       → Bruker tilbud.yml (viser alle fag)        │
│  • Studieplanlegger → Bruker blokkskjema (fagvalg med blokker)  │
└─────────────────────────────────────────────────────────────────┘
```

## Nøkkelbegreper

**FAG** (`data/udir/fag/`)
- Nasjonal fagdefinisjon fra UDIR. Markdown med frontmatter (id, tittel, fagkode, læreplan)
- Innhold: "Om faget", "Hvordan arbeider man", "Kompetansemål", "Kjerneelementer"
- Samme fag brukes av ALLE skoler

**PROGRAMOMRÅDE** (`data/udir/programomrader/`)
- Timefordeling og krav for studieprogram (fra UDIR)
- Fellesfag med timer per trinn, programfag-krav, fordypningskrav
- **vg1Valg**: Matematikk og fremmedspråk-alternativer (nasjonal standard)
- Eksempler: studiespesialisering.yml, musikk-dans-drama.yml

**REGLER** (`data/udir/regler/`)
- **eksklusjoner.yml**: Fag som ikke kan kombineres (f.eks. R1 og S1)
- **forutsetninger.yml**: Fag som krever andre fag (f.eks. R2 krever R1)
- **fordypning.yml**: Hvilke fag som teller som fordypning (fagområder)

**FORDYPNING OG RELATED-FELTET**

`related`-feltet i API-output beregnes automatisk i build-scriptet:

1. **Standard**: Fag med samme læreplan grupperes (f.eks. Biologi 1 og 2 har begge BIO01-02)
2. **Spesialtilfelle**: Fagområder med `merknad` i fordypning.yml håndteres separat

POS-fagene er et slikt spesialtilfelle:
- Politikk og menneskerettigheter (POS05-02)
- Sosialkunnskap (POS02-02)
- Sosiologi og sosialantropologi (POS04-01)
- Samfunnsgeografi (POS03-01)

Disse har **ulike læreplaner** men utgjør **ett fagområde** for fordypning per UDIR Tabell 6.
For å legge til nye spesialtilfeller: Legg til `merknad`-felt på fagområdet i fordypning.yml.

**SCHOOL-CONFIG** (`data/skoler/{skole}/school-config.yml`)
- Skolens konfigurasjon: navn, kontaktinfo
- **Hvilke programområder skolen tilbyr** (programs)
- Hvilken blokkskjema-versjon som er aktiv

**TILBUD** (`data/skoler/{skole}/tilbud.yml`)
- **HVILKE fag** skolen tilbyr (filter fra 90+ nasjonale)
- **fremmedsprakTilbud**: Hvilke fremmedspråk skolen tilbyr for VG1 (filtrerer UDIR-standard)
- Brukes av: Fagkatalog, Studieplanlegger (fremmedspråk-valg)
- Kan inneholde fag som ikke ennå er plassert i blokkskjema

**BLOKKSKJEMA** (`data/skoler/{skole}/blokkskjema/`)
- **NÅR/HVOR** fagene undervises (praktisk timeplan)
- Hvilke fag i hvilke blokker, parallelle fag (samme blokk = velg én)
- Brukes av: Studieplanlegger
- Versjonsstyrt: `{skoleår}_{variant}.yml` - flere versjoner kan eksistere samtidig

**Forskjell tilbud vs blokkskjema:**
| | tilbud.yml | blokkskjema |
|---|---|---|
| Spørsmål | "Hvilke fag finnes?" | "Når kan jeg ta faget?" |
| Brukes av | Fagkatalog | Studieplanlegger |
| Versjonering | Én liste | Flere versjoner |

**Dataflyt for VG1-valg (matematikk/fremmedspråk):**
```
UDIR (programomrader/*.yml)    →    Skole (tilbud.yml)    →    API
─────────────────────────────       ──────────────────         ───
vg1Valg:                            fremmedsprakTilbud:        vg1Valg:
  matematikk: [1P, 1T]                harFremmedsprak:           matematikk: [1P, 1T]
  fremmedsprak:                         - spansk-1               fremmedsprak:
    harFremmedsprak:                    - spansk-2                 harFremmedsprak:
      - spansk-1                        - tysk-2                     (filtrert)
      - spansk-2                        - fransk-2                 ikkeHarFremmedsprak:
      - tysk-1                        ikkeHarFremmedsprak:           (filtrert)
      - tysk-2                          - spansk-1-2
      - fransk-1
      - fransk-2
    ikkeHarFremmedsprak:
      - spansk-1-2
      - tysk-1-2
      - fransk-1-2
```

## Mappestruktur

```
data/
├── udir/                                  # NASJONALT
│   ├── fag/
│   │   ├── fellesfag/                    # Norsk, Matte, Engelsk
│   │   ├── obligatoriske-programfag/
│   │   └── valgfrie-programfag/          # Fysikk 1, R1, Psykologi
│   ├── programomrader/                   # Timefordeling per program
│   ├── regler/                           # Eksklusjoner, forutsetninger
│   └── kilder/lk20/                      # Original UDIR-data
│
└── skoler/                                # SKOLESPESIFIKT
    ├── bergen-private-gymnas/
    │   ├── school-config.yml
    │   ├── tilbud.yml
    │   └── blokkskjema/
    │       ├── 26-27_standard.yml
    │       └── 26-27_flex.yml
    └── metis-vgs/
        ├── school-config.yml
        └── blokkskjema_v2.yml

scripts/
├── build-api-v2.js                       # Studieplanlegger (komplett)
└── build-api-2025-01.js                  # Fagkatalog (modulær)

docs/api/                                  # Generert output → GitHub Pages
├── v2/schools/{skole}/studieplanlegger.json
└── 2025-01/skoler/{skole}/...
```

## API-endepunkter

Base: `https://fredeids-metis.github.io/school-data/api/`

**API v2 (Studieplanlegger - alt i ett)**
```
/v2/schools/{skole}/studieplanlegger.json
```

**API 2025-01 (Fagkatalog - modulær)**
```
/2025-01/curriculum/fag.json              # Alle 90+ fag
/2025-01/curriculum/regler.json           # Alle regler
/2025-01/skoler/index.json                # Liste over skoler
/2025-01/skoler/{skole}/tilbud.json       # Skolens valgfrie programfag (fra tilbud.yml)
/2025-01/skoler/{skole}/studieplanlegger.json
```

## Vanlige oppgaver

**Legge til nytt fag**
1. Opprett `data/udir/fag/{kategori}/{Fagnavn}.md`
2. `npm run build`

**La en skole tilby et fag**
1. Legg fag-ID i skolens `blokkskjema/{versjon}.yml`
2. Legg også i `tilbud.yml`
3. `npm run build`

**Endre timefordeling**
1. Rediger `data/udir/programomrader/{program}.yml`
2. `npm run build` - påvirker ALLE skoler med dette programmet

**Legge til ny skole**
1. Opprett `data/skoler/{skole-slug}/`
2. Lag `school-config.yml`, `tilbud.yml`, `blokkskjema/{versjon}.yml`
3. `npm run build`

**Endre skolens fremmedspråk-tilbud**
1. Rediger `data/skoler/{skole}/tilbud.yml` → `fremmedsprakTilbud`
2. Legg til/fjern språk-IDer fra `harFremmedsprak` eller `ikkeHarFremmedsprak`
3. `npm run build` - filtrerer UDIR-standard til kun skolens tilbud

## Build-kommandoer

```bash
npm run build         # Bygger begge API-versjoner
npm run build:v2      # Kun Studieplanlegger
npm run build:2025-01 # Kun Fagkatalog
npm run serve         # Lokal server port 8080
```

## Viktige prinsipper

1. **UDIR-data er uavhengig av skole** - Fag-endringer påvirker ikke skole-config
2. **Skole filtrerer, ikke dupliserer** - Blokkskjema refererer til fag-ID
3. **Én kilde til sannhet** - Fagbeskrivelse ligger KUN i .md-filen
4. **Blokkskjema er versjonert** - `{skoleår}_{variant}.yml`

## Relaterte prosjekter

- **Studieplanlegger**: Fagvalg VG2/VG3, validerer mot regler og blokkskjema
- **Fagkatalog**: Viser skolens fagtilbud med beskrivelser og bilder
