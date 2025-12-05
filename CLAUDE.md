# School-Data: Arkitektur og Dataflyt

## Kjernekonsept

School-data er et **nasjonalt fagbibliotek** med **skolespesifikke filtre**:

```
UDIR (nasjonalt)     →    Skole (lokalt)      →    App (konsument)
─────────────────         ──────────────           ────────────────
Alle fag (90+)           Tilbud (hvilke fag)     Henter via API
Alle regler              Blokkskjema (når/hvor)  Filtrerer selv
Programområder           Versjonsstyring
```

## Nøkkelbegreper

**FAG** (`data/udir/fag/`)
- Nasjonal fagdefinisjon fra UDIR. Markdown med frontmatter (id, tittel, fagkode, læreplan)
- Innhold: "Om faget", "Hvordan arbeider man", "Kompetansemål", "Kjerneelementer"
- Samme fag brukes av ALLE skoler

**PROGRAMOMRÅDE** (`data/udir/programomrader/`)
- Timefordeling og krav for studieprogram (fra UDIR)
- Fellesfag med timer per trinn, programfag-krav, fordypningskrav
- Eksempler: studiespesialisering.yml, musikk-dans-drama.yml

**REGLER** (`data/udir/regler/`)
- **eksklusjoner.yml**: Fag som ikke kan kombineres (f.eks. R1 og S1)
- **forutsetninger.yml**: Fag som krever andre fag (f.eks. R2 krever R1)
- **fordypning.yml**: Hvilke fag som teller som fordypning

**BLOKKSKJEMA** (`data/skoler/{skole}/blokkskjema/`)
- Skolens praktiske timeplan
- Hvilke fag i hvilke blokker, parallelle fag (samme blokk = velg én)
- Versjonsstyrt: `{skoleår}_{variant}.yml` (f.eks. 26-27_flex.yml)

**TILBUD** (`data/skoler/{skole}/tilbud.yml`)
- Liste over hvilke fag skolen tilbyr (filter fra 90+ nasjonale)

**SCHOOL-CONFIG** (`data/skoler/{skole}/school-config.yml`)
- Skolens konfigurasjon: navn, programområder, aktiv blokkskjema-versjon

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
/2025-01/skoler/{skole}/tilbudt-fag.json  # Skolens fag (filtrert)
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
