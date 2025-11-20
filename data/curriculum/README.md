# Curriculum Data Structure

## Oversikt

Dette katalogen inneholder strukturert informasjon om fagene i videregående opplæring basert på Kunnskapsløftet LK20.

---

## Mappestruktur

```
curriculum/
├── valgfrie-programfag/           # 33 valgfrie programfag
│   ├── Biologi_1.md
│   ├── Matematikk_R1.md
│   └── ...
│
├── obligatoriske-programfag/      # 16 obligatoriske programfag (MUS/MOK)
│   ├── Musikk_dans_drama.md
│   ├── Mediesamfunnet_1.md
│   └── ...
│
├── fellesfag/                     # 27 fellesfag (16 + 11 fremmedspråk)
│   ├── Norsk_VG1.md
│   ├── Historie_VG3.md
│   └── ...
│
├── valgfrie-programfag_lk20.txt   # Master-liste: 33 valgfrie programfag
├── obligatoriske-programfag_lk20.txt  # Master-liste: 16 obligatoriske programfag
└── fellesfag_lk20.txt             # Master-liste: 27 fellesfag
```

---

## Fagkategorier

### 1. Valgfrie Programfag (33 fag)
Fag som elever kan velge innenfor eller på tvers av programområder.

**Kategorier:**
- Matematikk (3 fag): R1, R2, 2P*
- Naturfag (6 fag): Biologi 1/2, Fysikk 1/2, Kjemi 1/2
- Samfunnsøkonomi og næringsliv (10 fag)
- Samfunnsfag (9 fag)
- Språk (2 fag): Engelsk 1/2
- Musikk fordypning (2 fag)
- Kunst og design (2 fag)
- Informasjonsteknologi (1 fag)

*Matematikk 2P har dual-type: både fellesfag og programfag

### 2. Obligatoriske Programfag (16 fag)
Fag som er obligatoriske for elever i spesifikke utdanningsprogram.

#### Musikk, dans og drama (10 fag)
**VG1 (5 fag):**
- Musikk, dans og drama
- Ergonomi og bevegelse 1
- Instrument, kor, samspill 1
- Musikk i perspektiv 1
- Lytting

**VG2 (4 fag):**
- Ergonomi og bevegelse 2
- Instruksjon og ledelse
- Instrument, kor, samspill 2
- Musikk i perspektiv 2

**VG3 (1 fag):**
- Musikk

#### Medier og kommunikasjon (6 fag)
**VG1-3:** Mediesamfunnet 1/2/3, Medieuttrykk 1/2/3

### 3. Fellesfag (27 fag)
Fag som er obligatoriske for alle elever i videregående opplæring.

**VG1 (8 fag):** Engelsk, Geografi, Kroppsøving, Matematikk (1P/1T), Naturfag, Norsk, Samfunnskunnskap

**VG2 (4 fag):** Historie, Kroppsøving, Matematikk 2P*, Norsk

**VG3 (4 fag):** Historie, Kroppsøving, Norsk, Religion og etikk

**Fremmedspråk (11 fag):** Betinget obligatorisk for elever uten fremmedspråk i grunnskolen

---

## Markdown File Format

Alle fagfiler følger samme struktur:

```yaml
---
id: biologi-1                    # Unik ID (kebab-case)
title: Biologi 1                 # Visningsnavn
fagkode: REA3035                 # Offisiell Udir fagkode
lareplan: BIO01-02               # Læreplankode
type: programfag                 # eller "fellesfag" eller ["fellesfag", "programfag"]
obligatorisk: false              # true/false/"betinget"
trinn: vg2                       # vg1/vg2/vg3 (hvis relevant)
program: null                    # "musikk"/"medier" (hvis obligatorisk programfag)
vimeo: ""                        # Video-link (fylles ut av skole)
generert: 2025-11-20             # Dato for generering
---

# Fagnavn

**Læreplan:** Læreplan i ...

## Om faget
[Beskrivelse av faget]

## Kompetansemål
- [Liste med kompetansemål]

## Kjerneelementer
### [Navn på kjerneelement]
[Beskrivelse]

## Ressurser
<!-- Vimeo-link eller andre ressurser -->

---
*Læreplan fra [Utdanningsdirektoratet](https://www.udir.no)*
```

---

## Master-lister (.txt-filer)

Master-listene brukes av `fetch-curriculum.sh` for å hente fagdata fra Udirs API.

**Format:**
```
Fagnavn;Fagkode;Læreplankode
```

**Eksempel:**
```
Biologi 1;REA3035;BIO01-02
Matematikk R1;REA3056;MAT03-02
```

---

## Spesielle Tilfeller

### Matematikk 2P - Dual Type
Matematikk 2P er både fellesfag og programfag:
- **Fellesfag:** Obligatorisk for de fleste elever
- **Programfag:** Kan erstattes hvis elev velger Matematikk R1/S1

Håndteres med: `type: ["fellesfag", "programfag"]`

### Fremmedspråk - Betinget Obligatorisk
Fremmedspråk er obligatorisk kun for elever som ikke hadde fremmedspråk i grunnskolen.

Håndteres med: `obligatorisk: "betinget"`

---

## Hvordan Legge Til Nye Fag

### 1. Legg til i master-liste
Rediger relevant `.txt`-fil og legg til linjen:
```
Fagnavn;Fagkode;Læreplankode
```

### 2. Hent fagdata fra Udir
Kjør fetch-script:
```bash
./scripts/fetch-curriculum.sh
```

### 3. Verifiser
Sjekk at markdown-filen er opprettet korrekt i riktig mappe.

### 4. Bygg API
```bash
npm run build
```

---

## API-Generering

Build-scriptet (`scripts/build-api.js`) leser alle markdown-filer og genererer JSON-API:

**Output:**
```
docs/api/v1/curriculum/
├── valgfrie-programfag.json
├── obligatoriske-programfag.json
├── fellesfag.json
└── all.json                     # Kombinert (deprecated v1 format)
```

**v2 API-struktur (nested):**
```json
{
  "metadata": {...},
  "curriculum": {
    "valgfrieProgramfag": [...],
    "obligatoriskeProgramfag": [...],
    "fellesfag": [...]
  }
}
```

---

## Vedlikehold

### Oppdatere fagdata fra Udir
```bash
./scripts/fetch-curriculum.sh
```

### Regenerere API
```bash
npm run build
```

### Validere struktur
```bash
npm run validate  # (hvis implementert)
```

---

## Kilder

- **Fag- og timefordeling:** [Udir-1-2025](https://www.udir.no/laring-og-trivsel/lareplanverket/kunnskapsloftet-fag--og-timefordeling/)
- **Læreplaner:** [Udir Læreplanverket](https://www.udir.no/lk20/)
- **Føring av vitnemål:** [Udir vitnemålsregler 2025](https://www.udir.no/eksamen-og-prover/vitnemal/)

---

*Sist oppdatert: 2025-11-20*
