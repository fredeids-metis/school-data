# School-Data Arkitektur Migrering
**Dato:** 2025-12-05
**Status:** FULLFØRT

## 1. GODKJENT NY STRUKTUR

### Separasjon: UDIR (nasjonalt) vs Skole (lokalt)

```
data/
├── udir/                                    # NASJONALT (single source of truth)
│   ├── README.md
│   ├── metadata.yml                         # Versjon, kilder, sist oppdatert
│   │
│   ├── programomrader/                      # Timefordeling per program
│   │   ├── studiespesialisering.yml         # Timer, fellesfag, fordypningskrav
│   │   ├── musikk-dans-drama.yml
│   │   └── medier-kommunikasjon.yml
│   │
│   ├── fag/                                 # Fagdefinisjoner
│   │   ├── fellesfag/                       # .md-filer med læreplaner
│   │   ├── obligatoriske-programfag/
│   │   └── valgfrie-programfag/
│   │
│   ├── regler/                              # Valideringsregler
│   │   ├── eksklusjoner.yml
│   │   ├── forutsetninger.yml
│   │   └── fordypning.yml
│   │
│   └── kilder/
│       └── lk20/                            # Master-lister for import
│           ├── fellesfag_lk20.txt
│           ├── valgfrie-programfag_lk20.txt
│           └── obligatoriske-programfag_lk20.txt
│
├── skoler/                                  # SKOLESPESIFIKT
│   ├── bergen-private-gymnas/
│   │   ├── school-config.yml
│   │   ├── tilbud.yml
│   │   ├── blokkskjema/
│   │   │   ├── 26-27_standard.yml           # Renamed fra v2
│   │   │   └── 26-27_flex.yml               # Renamed fra vanilla
│   │   ├── arkiv/                           # Arkiverte gamle filer
│   │   │   ├── blokkskjema.yml
│   │   │   └── blokkskjema_test.yml
│   │   └── assets/bilder/
│   │
│   └── metis-vgs/
│       ├── school-config.yml
│       ├── tilbud.yml
│       └── blokkskjema_v2.yml               # Må migreres til blokkskjema/
│
├── arkiv/                                   # Arkiverte filer
│   └── arkiv_regler.yml
│
└── kilder/                                  # Originale UDIR-kilder (beholdes)
```

## 2. MIGRASJONSPLAN - STATUS

### Fase 1: Opprett UDIR-struktur ✅ FULLFØRT
- [x] Opprett `data/udir/` med undermapper
- [x] Opprett `data/udir/programomrader/studiespesialisering.yml`
- [x] Opprett `data/udir/programomrader/musikk-dans-drama.yml`
- [x] Opprett `data/udir/programomrader/medier-kommunikasjon.yml`
- [x] Splitt og flytt `regler.yml` → `data/udir/regler/` (eksklusjoner, forutsetninger, fordypning)
- [x] Flytt `data/curriculum/fellesfag/` → `data/udir/fag/fellesfag/`
- [x] Flytt `data/curriculum/obligatoriske-programfag/` → `data/udir/fag/obligatoriske-programfag/`
- [x] Flytt `data/curriculum/valgfrie-programfag/` → `data/udir/fag/valgfrie-programfag/`
- [x] Flytt TXT-filer → `data/udir/kilder/lk20/`
- [x] Opprett `data/udir/metadata.yml` og `data/udir/README.md`

### Fase 2: Forenkle skolemapper ✅ FULLFØRT
- [x] Slett `data/schools/bergen-private-gymnas/timefordeling.yml` (erstattes av udir/)
- [x] Rename `blokkskjema_v2.yml` → `blokkskjema/26-27_standard.yml`
- [x] Rename `blokkskjema_vanilla.yml` → `blokkskjema/26-27_flex.yml`
- [x] Arkiver `blokkskjema.yml` og `blokkskjema_test.yml`
- [x] Rename `data/schools/` → `data/skoler/`
- [x] Oppdater `school-config.yml` med nye blokkskjema-stier

### Fase 3: Oppdater build-scripts ✅ FULLFØRT
- [x] Oppdater `build-api-2025-01.js` til ny struktur
- [x] Oppdater `build-api-v2.js` til ny struktur
- [x] Begge scripts bygger uten feil
- [ ] Slett `docs/api/v1/` (kan gjøres manuelt)
- [ ] Konsolider til ETT script (valgfritt, begge fungerer)

### Fase 4: Oppdater Studieplanlegger ⏳ VENTER
- [ ] Oppdater DataHandler til ny API-struktur (hvis nødvendig)
- [ ] Verifiser at validering fungerer med udir/regler
- [ ] Test alle programområder

## 3. BLOKKSKJEMA NAVNEKONVENSJON

```
{skoleår}_{variant}.yml

Eksempler:
- 26-27_standard.yml   (tidligere blokkskjema_v2.yml)
- 26-27_flex.yml       (tidligere blokkskjema_vanilla.yml)
```

## 4. FILER SOM BLE SLETTET

| Fil/Mappe | Grunn |
|-----|----------|
| `docs/api/v1/` | Ubrukt gammel API |
| `data/skoler/bergen-private-gymnas/assets/` | Ubrukte bilder |
| `data/skoler/bergen-private-gymnas/arkiv/` | Gamle blokkskjema-filer |
| `data/arkiv/` | Gammel regler.yml backup |
| `scripts/build-api.js` | Gammel v1 build-script |
| `scripts/compare-data.js` | Utdatert utility |
| `scripts/sync-images.js` | Utdatert utility |
| `scripts/sync-sections.js` | Utdatert utility |
| `scripts/migrate-curriculum.sh` | Engangsmigreringsscript |
| `timefordeling.yml` (i schools/) | Erstattes av udir/ |
| `data/curriculum/` | Flyttet til udir/fag/ |

## 5. FILER SOM BLE FLYTTET

| Fra | Til |
|-----|-----|
| `data/curriculum/regler.yml` | `data/udir/regler/` (splittet i 3 filer) |
| `data/curriculum/fellesfag/` | `data/udir/fag/fellesfag/` |
| `data/curriculum/obligatoriske-programfag/` | `data/udir/fag/obligatoriske-programfag/` |
| `data/curriculum/valgfrie-programfag/` | `data/udir/fag/valgfrie-programfag/` |
| `data/curriculum/*_lk20.txt` | `data/udir/kilder/lk20/` |

## 6. METIS-VGS

- Har samme struktur som BPG
- Bruker fortsatt gammel `blokkskjema_v2.yml` (ikke migrert til blokkskjema/)
- Kan migreres etter at BPG er testet og verifisert

## 7. VIKTIGE BESLUTNINGER

1. **Skoleår:** 26-27 (gjelder neste skoleår)
2. **Metis-VGS:** Beholdes, migreres senere
3. **API-versjoner:** Begge (v2 og 2025-01) oppdatert til ny struktur
4. **Implementering:** Fullført, studieplanlegger bør fungere

## 8. VERIFISERING

Begge build-scripts kjørt med suksess:

```
npm run build:2025-01
  ✅ 90 fag lastet
  ✅ 30 tilbudte fag (BPG)
  ✅ 4 blokker, 57 fag-oppføringer

npm run build:v2
  ✅ 91 fag lastet
  ✅ 2 blokkskjema-versjoner (BPG)
  ✅ 4 blokker, 57 fag-oppføringer
```

---
*Generert: 2025-12-05*
*Status: Fase 1-3 fullført, Fase 4 venter på testing*
