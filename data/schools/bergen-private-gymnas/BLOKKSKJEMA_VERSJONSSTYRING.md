# Blokkskjema - Versjonsstyring og Deployment

Dette dokumentet beskriver hvordan du bytter mellom blokkskjema-versjoner for Bergen Private Gymnas.

---

## Oversikt

Bergen Private Gymnas har nå et konfigurasjonsstyrt versjonssystem for blokkskjema:

- **v1 (blokkskjema.yml)**: Original versjon - enkel struktur uten eksplisitt programtilgang
- **v2 (blokkskjema_v2.yml)**: Eksperimentell versjon - faktisk fagtilbud fra bilde med eksplisitt programtilgang og timer

**Aktiv versjon**: `v1` (produksjon)

---

## Filstruktur

```
repos/school-data/
├── data/schools/bergen-private-gymnas/
│   ├── school-config.yml          # Konfigurasjonsfil (styrer aktiv versjon)
│   ├── blokkskjema.yml            # v1 - Original (LIVE)
│   └── blokkskjema_v2.yml         # v2 - Eksperimentell (KLAR, men ikke aktivert)
├── scripts/
│   └── build-api.js               # Build-script (leser versjon fra config)
└── docs/api/v1/schools/bergen-private-gymnas/
    └── blokkskjema.json           # Generert JSON (deployed til GitHub Pages)
```

---

## Slik bytter du versjon

### Steg 1: Endre konfigurasjon

Åpne [school-config.yml](school-config.yml) og endre `activeVersion`:

```yaml
blokkskjema:
  activeVersion: "v2"  # Bytt fra "v1" til "v2"
```

### Steg 2: Bygg API

Kjør build-script fra `repos/school-data`:

```bash
cd repos/school-data
npm run build
```

Du vil se:
```
📋 Using blokkskjema version: v2 (blokkskjema_v2.yml)
```

### Steg 3: Valider output

Sjekk at blokkskjema.json ble generert korrekt:

```bash
cat docs/api/v1/schools/bergen-private-gymnas/blokkskjema.json | head -20
```

For v2 skal du se:
```json
{
  "school": "bergen-private-gymnas",
  "versjon": "v2-experimental",
  "blokker": {
    "blokk1": {
      "navn": "Blokk 1",
      "beskrivelse": "Matematikk, Naturfag, Samfunnsfag, Økonomi",
      "tilgjengeligFor": {
        "vg2": ["studiespesialisering", "musikk-dans-drama", "medier-kommunikasjon"],
        "vg3": ["studiespesialisering"]
      },
      "fag": [
        {
          "id": "matematikk-2p",
          "timer": 84,
          "trinn": "vg2",
          "tilgjengeligFor": ["studiespesialisering", "musikk-dans-drama", "medier-kommunikasjon"],
          ...
        }
      ]
    }
  }
}
```

### Steg 4: Commit og deploy

```bash
git add .
git commit -m "Bytt til blokkskjema v2

- Aktiver blokkskjema_v2.yml med faktisk fagtilbud
- Inneholder eksplisitt programtilgang og timer per fag
- Basert på blokkskjema-bilde fra 2025-11-20"

git push origin main
```

GitHub Pages deployer automatisk den nye versjonen til:
```
https://fredeids-metis.github.io/school-data/api/v1/schools/bergen-private-gymnas/blokkskjema.json
```

---

## Rollback (tilbake til v1)

Hvis det oppstår problemer med v2:

### Steg 1: Endre konfigurasjon tilbake

```yaml
blokkskjema:
  activeVersion: "v1"  # Bytt tilbake til "v1"
```

### Steg 2: Bygg og deploy

```bash
npm run build
git add .
git commit -m "Rollback til blokkskjema v1"
git push origin main
```

---

## Versjonsoversikt

### v1 (blokkskjema.yml) - LIVE

**Status**: Produksjon
**Struktur**: Enkel, flat liste av fag per blokk
**Egenskaper**:
- Ingen eksplisitt `tilgjengeligFor` på blokk-nivå
- Ingen `timer` felt
- `vg2Only` / `vg3Only` flagg

**JSON eksempel**:
```json
{
  "school": "bergen-private-gymnas",
  "blokker": {
    "blokk1": {
      "navn": "Blokk 1",
      "fag": [
        {
          "id": "matematikk-2p",
          "vg2Only": true,
          "kategori": "fellesfag"
        }
      ]
    }
  }
}
```

---

### v2 (blokkskjema_v2.yml) - EKSPERIMENTELL

**Status**: Klar for testing, ikke aktivert
**Struktur**: Utvidet med eksplisitt programtilgang og metadata
**Egenskaper**:
- `versjon: "v2-experimental"`
- `beskrivelse` per blokk
- `tilgjengeligFor` på både blokk- og fagnivå
- `timer` felt for alle fag
- `trinn` (vg2/vg3) i stedet for `vg2Only`/`vg3Only`
- `merknad`, `obligatorisk`, `betingetObligatorisk` felt
- `krever` og `anbefaltForutsetning` for prerekvistter

**Datakilde**:
- Blokkskjema-bilde fra Bergen Private Gymnas (2025-11-20)
- TIMEFORDELING.md
- valgfrie-programfag_lk20.txt

**Statistikk**:
- 47 fagoppføringer totalt
- 30 unike fag
- Blokk 1: 11 fag (9 VG2 + 2 VG3)
- Blokk 2: 12 fag (7 VG2 + 5 VG3)
- Blokk 3: 13 fag (7 VG2 + 6 VG3)
- Blokk 4: 11 fag (5 VG2 + 6 VG3)

**JSON eksempel**:
```json
{
  "school": "bergen-private-gymnas",
  "versjon": "v2-experimental",
  "blokker": {
    "blokk1": {
      "navn": "Blokk 1",
      "beskrivelse": "Matematikk, Naturfag, Samfunnsfag, Økonomi",
      "tilgjengeligFor": {
        "vg2": ["studiespesialisering", "musikk-dans-drama", "medier-kommunikasjon"],
        "vg3": ["studiespesialisering"]
      },
      "fag": [
        {
          "id": "matematikk-2p",
          "timer": 84,
          "trinn": "vg2",
          "tilgjengeligFor": ["studiespesialisering", "musikk-dans-drama", "medier-kommunikasjon"],
          "merknad": "Fellesfag som kan erstattes av R1",
          "kategori": "fellesfag"
        }
      ]
    }
  }
}
```

**Viktige endringer fra v1**:
1. **Spansk I+II**: Kun i Blokk 3 (ikke Blokk 4)
2. **Musikk fordypning**: Kun tilgjengelig for musikk-dans-drama program
3. **Historie VG3**: I alle 4 blokker, markert som obligatorisk
4. **Blokktilgang per program**:
   - VG2: Studiespesialisering (alle blokker), Musikk (blokk 1+3), Medier (blokk 1+3)
   - VG3: Studiespesialisering (alle blokker), Musikk (blokk 3+4), Medier (blokk 2+3+4)

---

## Widget-integrasjon

Programfag Velger widgeten henter blokkskjema fra:
```
https://fredeids-metis.github.io/school-data/api/v1/schools/bergen-private-gymnas/blokkskjema.json
```

**Viktig**: Widgeten oppdateres automatisk når ny versjon deployes. Ingen kodeendringer nødvendig i widgeten.

### Validering etter deploy

1. Åpne widgeten i nettleser
2. Sjekk at riktig fagtilbud vises per blokk
3. Verifiser at programtilgang er korrekt (f.eks. Musikk-elever ser kun Musikk fordypning)
4. Test fagvalg og valideringsregler

---

## Fremtidige versjoner

For å legge til en ny versjon (f.eks. v3):

### 1. Opprett ny fil

```bash
cp blokkskjema_v2.yml blokkskjema_v3.yml
# Gjør endringer i blokkskjema_v3.yml
```

### 2. Registrer i config

Legg til i [school-config.yml](school-config.yml):

```yaml
blokkskjema:
  activeVersion: "v1"  # Fortsatt v1 i produksjon

  versions:
    v1: "blokkskjema.yml"
    v2: "blokkskjema_v2.yml"
    v3: "blokkskjema_v3.yml"  # Ny versjon

  descriptions:
    v1: "Original blokkskjema"
    v2: "Eksperimentell versjon med faktisk fagtilbud"
    v3: "Din nye versjon beskrivelse her"
```

### 3. Test lokalt

```bash
# Bytt til v3 i config
npm run build
# Valider output
```

### 4. Deploy når klar

Når v3 er testet og klar:
```yaml
activeVersion: "v3"
```

---

## Feilsøking

### "Version not found in config"

**Problem**: Build-scriptet finner ikke versjonen i config.

**Løsning**: Sjekk at `activeVersion` matcher en key i `versions`:

```yaml
blokkskjema:
  activeVersion: "v2"  # Må matche nøkkel under
  versions:
    v1: "blokkskjema.yml"
    v2: "blokkskjema_v2.yml"  # <-- Denne nøkkelen
```

### "File not found"

**Problem**: Build-scriptet finner ikke YAML-filen.

**Løsning**: Sjekk at filnavnet i `versions` er korrekt og at filen eksisterer:

```bash
ls data/schools/bergen-private-gymnas/blokkskjema*.yml
```

### Widget viser fortsatt gammel versjon

**Problem**: Widgeten cacher gamle data.

**Løsning**:
1. Hard refresh i nettleser (Cmd+Shift+R / Ctrl+Shift+R)
2. Sjekk at GitHub Pages har deployet nyeste versjon (kan ta 1-2 minutter)
3. Verifiser JSON-fil direkte: https://fredeids-metis.github.io/school-data/api/v1/schools/bergen-private-gymnas/blokkskjema.json

---

## Referanser

- [BLOKKSKJEMA_V2_OPPDATERING.md](BLOKKSKJEMA_V2_OPPDATERING.md) - Oppsummering av endringer i v2
- [BLOKKSKJEMA_V2_FAGMATCHING.md](BLOKKSKJEMA_V2_FAGMATCHING.md) - Validering av fag
- [BLOKKSKJEMA_V2_VALIDERING.md](BLOKKSKJEMA_V2_VALIDERING.md) - Timefordeling validering
- [TIMEFORDELING.md](TIMEFORDELING.md) - Referansedokument for timer

---

## Kontakt

Ved spørsmål om versjonsstyring eller deployment, ta kontakt med prosjektansvarlig.

**Sist oppdatert**: 2025-11-20
