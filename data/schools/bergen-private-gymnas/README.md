# Bergen Private Gymnas - Data

Dette er datarepositoriet for Bergen Private Gymnas.

## Oversikt

**Skole**: Bergen Private Gymnas
**Sted**: Bergen
**Programmer**:
- Studiespesialisering (realfag)
- Musikk, dans og drama
- Medier og kommunikasjon

---

## Filer

### Konfigurasjon

- **[school-config.yml](school-config.yml)** - Hovedkonfigurasjon inkludert versjonsstyring av blokkskjema
- **[tilbud.yml](tilbud.yml)** - Fagtilbud med metadata (bilder, videoer, kategorier)

### Blokkskjema

- **[blokkskjema.yml](blokkskjema.yml)** - v1 (Original, LIVE i produksjon)
- **[blokkskjema_v2.yml](blokkskjema_v2.yml)** - v2 (Eksperimentell, basert på faktisk fagtilbud)

**Aktiv versjon**: v1 (kontrolleres i `school-config.yml`)

### Dokumentasjon

#### Versjonsstyring
- **[BLOKKSKJEMA_VERSJONSSTYRING.md](BLOKKSKJEMA_VERSJONSSTYRING.md)** - Komplett guide for å bytte mellom blokkskjema-versjoner

#### Blokkskjema v2 - Dokumentasjon
- **[BLOKKSKJEMA_V2_OPPDATERING.md](BLOKKSKJEMA_V2_OPPDATERING.md)** - Oppsummering av alle endringer i v2
- **[BLOKKSKJEMA_V2_FAGTILBUD_FRA_BILDE.md](BLOKKSKJEMA_V2_FAGTILBUD_FRA_BILDE.md)** - Renset fagtilbud fra blokkskjema-bilde
- **[BLOKKSKJEMA_V2_FAGMATCHING.md](BLOKKSKJEMA_V2_FAGMATCHING.md)** - Validering av alle 30 fag mot curriculum
- **[BLOKKSKJEMA_V2_VALIDERING.md](BLOKKSKJEMA_V2_VALIDERING.md)** - Timefordeling validering per program

### Assets
- **[assets/](assets/)** - Fagbilder og andre ressurser

---

## Blokkskjema Versjonsoversikt

### v1 (blokkskjema.yml) - LIVE

**Status**: Produksjon ✅
**Struktur**: Enkel, flat liste av fag per blokk
**Egenskaper**: `vg2Only`/`vg3Only` flagg, ingen eksplisitt programtilgang

### v2 (blokkskjema_v2.yml) - EKSPERIMENTELL

**Status**: Klar for testing, ikke aktivert
**Struktur**: Utvidet med eksplisitt programtilgang og metadata
**Egenskaper**:
- `tilgjengeligFor` på blokk- og fagnivå
- `timer` felt for alle fag
- `trinn` (vg2/vg3) i stedet for flagg
- `obligatorisk` / `betingetObligatorisk` støtte
- `krever` og `anbefaltForutsetning` for prerekvistter

**Datakilde**: Blokkskjema-bilde fra Bergen Private Gymnas (2025-11-20)

**Statistikk**:
- 47 fagoppføringer totalt
- 30 unike fag
- Alle fag validert mot curriculum ✅

---

## Viktige endringer i v2

1. **Spansk I+II**: Kun i Blokk 3 (betinget obligatorisk)
2. **Historie VG3**: I alle 4 blokker, markert som obligatorisk
3. **Musikk fordypning**: Kun tilgjengelig for Musikk-programmet
4. **Blokktilgang**: Eksplisitt definert per program og trinn
5. **Timer**: Alle fag har timer-felt for validering

---

## Bytte til blokkskjema v2

For å aktivere blokkskjema v2 i produksjon:

1. Endre `activeVersion: "v2"` i [school-config.yml](school-config.yml)
2. Kjør `npm run build` i school-data repo
3. Commit og push endringer
4. GitHub Pages deployer automatisk

Se [BLOKKSKJEMA_VERSJONSSTYRING.md](BLOKKSKJEMA_VERSJONSSTYRING.md) for detaljert guide.

---

## API Endpoints

Data fra denne skolen blir tilgjengelig via:

```
https://fredeids-metis.github.io/school-data/api/v1/schools/bergen-private-gymnas/
```

**Endpoints**:
- `config.json` - Skolekonfigurasjon
- `curriculum.json` - Komplett curriculum med alle fag
- `blokkskjema.json` - Blokkskjema (versjonsstyrt)
- `programfag.json` - Programfag (deprecated)
- `full.json` - All data kombinert

---

## Kontakt

Ved spørsmål eller endringer, ta kontakt med prosjektansvarlig.

**Sist oppdatert**: 2025-11-20
