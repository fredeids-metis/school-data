# Studieplanlegger: Avhengighetsanalyse til school-data

**Dato:** 2025-12-05
**Formaal:** Kartlegge alle avhengigheter fra studieplanlegger-appen til school-data for planlagt restrukturering

---

## 1. Oppsummering

Studieplanlegger-appen har **tette koblinger** til school-data via API v2 (primert) og API v1 (legacy). Restruktureringen vil kreve endringer i:

1. **API-endepunkter** - URL-paths i DataHandler
2. **Datastrukturer** - Feltnavn i JSON-responser
3. **Valideringslogikk** - ValidationService som leser regler.yml-strukturen
4. **Build-scripts** - Generering av studieplanlegger.json

---

## 2. API-endepunkter

### 2.1 Primaer API (v2) - Brukes som standard

```
BASE_URL: https://fredeids-metis.github.io/school-data/api/v2
```

| Endepunkt | Metode | Fil i DataHandler |
|-----------|--------|-------------------|
| `/api/v2/schools/{schoolId}/studieplanlegger.json` | GET | `loadFromV2API()` linje 77-154 |

**Hardkodet default schoolId:** `bergen-private-gymnas` (linje 23)

### 2.2 Legacy API (v1) - Fortsatt stoettet

```
BASE_URL: https://fredeids-metis.github.io/school-data/api/v1
```

| Endepunkt | Metode | Fil i DataHandler |
|-----------|--------|-------------------|
| `/api/v1/schools/{schoolId}/curriculum.json` | GET | `loadCurriculum()` linje 398-424 |
| `/api/v1/schools/{schoolId}/blokkskjema.json` | GET | `loadBlokkskjema()` linje 474-498 |
| `/api/v1/curriculum/timefordeling.json` | GET | `loadTimefordeling()` linje 504-528 |

### 2.3 Implikasjoner for restrukturering

**KRITISK:** Ved endring av mappestruktur maa disse API-paths oppdateres:

| Naavaerende path | Planlagt ny path | Pavirket kode |
|------------------|------------------|---------------|
| `api/v2/schools/{schoolId}/studieplanlegger.json` | `api/v2/skoler/{schoolId}/studieplanlegger.json` | DataHandler linje 80 |
| `api/v1/schools/{schoolId}/curriculum.json` | `api/v1/skoler/{schoolId}/curriculum.json` | DataHandler linje 404 |
| `api/v1/schools/{schoolId}/blokkskjema.json` | `api/v1/skoler/{schoolId}/blokkskjema.json` | DataHandler linje 482 |
| `api/v1/curriculum/timefordeling.json` | `api/v1/udir/fag/timefordeling.json` | DataHandler linje 512 |

---

## 3. Datastrukturer som forventes (v2 API)

### 3.1 studieplanlegger.json - Toppnivaa

```javascript
// DataHandler linje 97-136
const requiredFields = ['blokkskjema', 'curriculum', 'regler'];

this.data = {
  blokkskjema: { ... },      // Blokkskjema-struktur
  curriculum: { ... },       // Fagdata
  regler: { ... },           // Valideringsregler fra regler.yml
  valgregler: { ... },       // Per-programomraade valgregler
  timevalidering: { ... },   // Timer-validering
  school: { ... },           // Skoleinformasjon
  fellesfag: { ... },        // Fra timefordeling.yml
  fellesProgramfag: { ... }, // Fra timefordeling.yml
  vg1Valg: { ... }           // VG1 matematikk og fremmedspraak
}
```

### 3.2 blokkskjema - Struktur

```javascript
// DataHandler linje 104-125
// Multi-versjon format (ny):
{
  activeVersion: 'v2',
  versions: {
    'v1': { versjon, struktur, blokker: { ... } },
    'v2': { versjon, struktur, blokker: { ... } }
  }
}

// Legacy format (gammel):
{
  versjon: '2025',
  struktur: '...',
  blokker: {
    'blokk1': {
      navn: 'Blokk 1',
      beskrivelse: '...',
      tilgjengeligFor: { vg2: [...], vg3: [...] },
      fag: [
        {
          id: 'fysikk-1',
          title: 'Fysikk 1',
          timer: 140,
          fagkode: 'FYS1002',
          lareplan: 'https://...',
          trinn: 'vg2',
          tilgjengeligFor: ['studiespesialisering'],
          merknad: null,
          obligatorisk: false
        }
      ]
    }
  }
}
```

**Felter som leses fra blokkskjema.blokker[].fag[]:**
- `id` - Curriculum ID (f.eks. 'fysikk-1')
- `title` - Visningsnavn
- `timer` - Antall timer
- `fagkode` - UDIR fagkode (f.eks. 'FYS1002')
- `lareplan` - URL til laereplan
- `trinn` - 'vg2' eller 'vg3'
- `tilgjengeligFor` - Array av programomraader
- `merknad` - Eventuell merknad
- `obligatorisk` - Boolean (for Historie VG3)

### 3.3 curriculum - Struktur

```javascript
// DataHandler linje 341-351
this.curriculum = {
  valgfrieProgramfag: [
    {
      id: 'fysikk-1',
      title: 'Fysikk 1',
      shortTitle: 'Fysikk 1',
      fagkode: 'FYS1002',
      timer: 140,
      lareplan: '...',
      bilde: 'fysikk-1.jpg',
      vimeo: 'https://vimeo.com/...',
      beskrivelseHTML: '...',
      kjerneelementer: [...],
      hvordanArbeiderMan: '...',
      fagetsRelevans: '...',
      related: ['fysikk-2']
    }
  ],
  obligatoriskeProgramfag: [ ... ],
  fellesfag: [ ... ]
}
```

**Felter som leses fra curriculum:**
- `id`, `title`, `shortTitle` - Identifikasjon
- `fagkode`, `timer`, `lareplan` - Fagdata
- `bilde`, `vimeo` - Media
- `beskrivelseHTML`, `kjerneelementer` - Innhold for modal
- `hvordanArbeiderMan`, `fagetsRelevans` - Ekstra innhold
- `related` - Relaterte fag for fordypning

### 3.4 regler - Valideringsstruktur (KRITISK)

```javascript
// ValidationService linje 70-91
this.eksklusjoner = regler.eksklusjoner || [];
this.forutsetninger = regler.forutsetninger || [];
this.fagomrader = regler.fagomrader || {};
this.fordypningKrav = regler.fordypning || {};
this.spesialregler = regler.spesialregler || {};
```

**3.4.1 eksklusjoner**
```javascript
// ValidationService linje 220-266
eksklusjoner: [
  {
    id: 'r-vs-s-linja',
    type: 'blocking',
    beskrivelse: 'R-linja og S-linja kan ikke kombineres',
    feilmelding: 'Du kan ikke ta fag fra baade R- og S-linja',
    forslag: 'Velg matematikk fra samme linje',

    // Format 1: konfliktGrupper (gruppe vs gruppe)
    konfliktGrupper: [
      ['matematikk-r1', 'matematikk-r2'],
      ['matematikk-s1', 'matematikk-s2']
    ],

    // Format 2: gruppe (gjensidig eksklusjon)
    gruppe: ['fag-a', 'fag-b', 'fag-c']
  }
]
```

**3.4.2 forutsetninger**
```javascript
// ValidationService linje 271-299
forutsetninger: [
  {
    fag: 'fysikk-2',          // Eller array: ['fysikk-2', 'kjemi-2']
    krever: ['fysikk-1'],     // Array av alternativer
    type: 'blocking',         // Eller 'warning'
    feilmelding: 'Fysikk 2 krever Fysikk 1',
    forslag: 'Velg Fysikk 1 foerst'
  }
]
```

**3.4.3 fagomrader (for fordypning)**
```javascript
// ValidationService linje 97-110
fagomrader: {
  'realfag': {
    navn: 'Realfag',
    fag: ['biologi-1', 'biologi-2', 'fysikk-1', 'fysikk-2', 'kjemi-1', 'kjemi-2']
  },
  'sprak': {
    navn: 'Spraakfag',
    fag: ['spansk-iii', 'tysk-iii', 'fransk-iii', 'engelsk-fordjuping']
  },
  // ... flere fagomraader
}
```

**3.4.4 fordypning**
```javascript
// ValidationService linje 389-411
fordypning: {
  'studiespesialisering': {
    minTimer: 560,
    minOmrader: 2,
    timerPerOmrade: 280
  },
  'musikk-dans-drama': {
    minOmrader: 0  // Ikke krav til fordypning
  }
}
```

### 3.5 valgregler - Per programomraade

```javascript
// DataHandler linje 273-284
valgregler: {
  'studiespesialisering': {
    vg2: {
      minAntallFag: 3,
      maxAntallFag: 4,
      obligatoriskeFag: ['matematikk-r1', 'matematikk-s1', 'matematikk-2p']
    },
    vg3: {
      minAntallFag: 4,
      maxAntallFag: 4,
      obligatoriskeFag: ['historie-vg3']
    }
  }
}
```

### 3.6 fellesfag og fellesProgramfag (fra timefordeling.yml)

```javascript
// DataHandler linje 534-612
fellesfag: {
  vg1: [
    { id: 'norsk-vg1', title: 'Norsk', timer: 140, fagkode: 'NOR1267', tilgjengeligFor: [...] }
  ],
  vg2: [ ... ],
  vg3: [ ... ]
}

fellesProgramfag: {
  'musikk-dans-drama': {
    vg1: [ ... ],
    vg2: [ ... ],
    vg3: [ ... ]
  }
}
```

### 3.7 vg1Valg (matematikk og fremmedspraak)

```javascript
// DataHandler linje 617-663
vg1Valg: {
  matematikk: [
    { id: 'matematikk-1p', fagkode: 'MAT1019', title: 'Matematikk 1P', timer: 140 },
    { id: 'matematikk-1t', fagkode: 'MAT1021', title: 'Matematikk 1T', timer: 140 }
  ],
  fremmedsprak: {
    harFremmedsprak: [
      { id: 'spansk-ii-vg1', fagkode: 'FSP6218', title: 'Spansk II', timer: 113 }
    ],
    ikkeHarFremmedsprak: [
      { id: 'spansk-i-ii-vg1', fagkode: 'FSP6237', title: 'Spansk I+II', timer: 113, merknad: '...' }
    ]
  }
}
```

### 3.8 school - Skoleinformasjon

```javascript
// DataHandler linje 319-328
school: {
  id: 'bergen-private-gymnas',
  name: 'Bergen Private Gymnas',
  programs: ['studiespesialisering', 'musikk-dans-drama', 'medier-kommunikasjon']
}
```

---

## 4. Valideringslogikk implementert i Frontend

### 4.1 ValidationService - Hovedfunksjoner

| Funksjon | Hva den validerer | Avhengigheter fra regler.yml |
|----------|-------------------|------------------------------|
| `canSelectFag()` | Pre-selection sjekk | eksklusjoner, forutsetninger |
| `_checkExclusions()` | Gjensidig eksklusjon | eksklusjoner.gruppe, konfliktGrupper |
| `_checkPrerequisites()` | Forutsetningskrav | forutsetninger.fag, krever |
| `getFordypningStatus()` | Fordypningstelling | fagomrader, fordypning |
| `validateAll()` | Full validering | Alle regler |
| `validateCombinedSelections()` | Cross-trinn validering | eksklusjoner, fagomrader, fordypning |

### 4.2 Fordypningslogikk (KRITISK)

```javascript
// ValidationService linje 388-492
// 1 fordypning = 2 fag fra SAMME fagomraade
// Krav: 2 fordypninger totalt (VG2 + VG3 kombinert)

// Fag ekskludert fra fordypning:
const excludedFromFordypning = [
  'matematikk-2p',      // Fellesfag, ikke fordypning
  'spansk-i-ii',        // Obligatorisk for ikke-fremmedspraak
  'spansk-i-ii-vg3',
  'grafisk-design',     // Mediefag
  'bilde',
  'musikk-fordypning-1',
  'musikk-fordypning-2'
];
```

### 4.3 Matematikk-konfliktsjekk

```javascript
// ValidationService linje 700-749
// Sjekker om R-linja og S-linja blandes
// R1 VG2 + S2 VG3 = BLOKKERT
// R1 VG2 + R2 VG3 = OK

// Bruker konfliktGrupper fra eksklusjoner
```

---

## 5. Hardkodede verdier

### 5.1 Default schoolId
```javascript
// DataHandler linje 23
this.schoolId = options.schoolId || 'bergen-private-gymnas';
```

### 5.2 API Base URLs
```javascript
// DataHandler linje 35-36
this.apiBaseUrlV1 = 'https://fredeids-metis.github.io/school-data/api/v1';
this.apiBaseUrlV2 = 'https://fredeids-metis.github.io/school-data/api/v2';
```

### 5.3 Programomraade-mapping (legacy v1)
```javascript
// DataHandler linje 572-576
const programMap = {
  'studiespesialisering': 'studiespesialisering',
  'musikk-dans-drama': 'musikk',
  'medier-kommunikasjon': 'medier'
};
```

### 5.4 Fagomraade-mapping for katalog
```javascript
// Studieplanlegger.js linje 1979-1987
const fagomradeMap = {
  'realfag': { name: 'Realfag', fag: ['biologi', 'fysikk', 'geofag', 'informasjonsteknologi', 'kjemi', 'teknologi-og-forskningslare'] },
  'matematikk': { name: 'Matematikk', fag: ['matematikk'] },
  'sprak': { name: 'Spraakfag', fag: ['spansk', 'tysk', 'fransk', 'engelsk', 'kommunikasjon-og-kultur'] },
  'samfunn': { name: 'Samfunnsfag', fag: ['historie', 'politikk', 'rettslaere', 'sosialkunnskap', 'sosiologi', 'psykologi'] },
  'okonomi': { name: 'Økonomi', fag: ['okonomistyring', 'markedsforing', 'samfunnsokonomi', 'entrepreneurskap', 'okonomi-og-ledelse'] },
  'mediefag': { name: 'Mediefag', fag: ['bilde', 'grafisk-design'] },
  'musikkfag': { name: 'Musikkfag', fag: ['musikk-fordypning'] }
};
```

### 5.5 Default fellesfag (fallback)
```javascript
// DataHandler linje 668-744
// Hardkodede fallback-verdier for fellesfag per trinn og program
// Brukes kun hvis API-data mangler
```

---

## 6. Konkrete endringer for restrukturering

### 6.1 KRITISK: API-path endringer

**Fil:** `studieplanlegger/src/core/data-handler.js`

| Linje | Naavaerende | Ny |
|-------|-------------|-----|
| 35 | `school-data/api/v1` | `school-data/api/v1` (behold) |
| 36 | `school-data/api/v2` | `school-data/api/v2` (behold) |
| 80 | `schools/${schoolId}/studieplanlegger.json` | `skoler/${schoolId}/studieplanlegger.json` |
| 404 | `schools/${schoolId}/curriculum.json` | `skoler/${schoolId}/curriculum.json` |
| 482 | `schools/${schoolId}/blokkskjema.json` | `skoler/${schoolId}/blokkskjema.json` |
| 512 | `curriculum/timefordeling.json` | `udir/fag/timefordeling.json` |

### 6.2 KRITISK: regler.yml struktur

Hvis regler.yml splittes opp, maa ValidationService.init() oppdateres:

```javascript
// Naavaerende (ValidationService linje 70-91):
this.eksklusjoner = regler.eksklusjoner || [];
this.forutsetninger = regler.forutsetninger || [];
this.fagomrader = regler.fagomrader || {};
this.fordypningKrav = regler.fordypning || {};

// Hvis regler splittes:
// - eksklusjoner.yml -> regler/eksklusjoner.yml
// - forutsetninger.yml -> regler/forutsetninger.yml
// - fagomrader.yml -> regler/fagomrader.yml
// - fordypning.yml -> regler/fordypning.yml

// DA maa build-script samle disse til ETT regler-objekt for studieplanlegger.json
// ELLER frontend maa oppdateres til aa haandtere flere filer
```

### 6.3 KRITISK: blokkskjema endringer

Hvis valgregler fjernes fra blokkskjema og hentes fra udir/:

**Naavaerende flow:**
```
blokkskjema.yml -> studieplanlegger.json (via build)
```

**Ny flow:**
```
blokkskjema.yml (forenklet) + udir/valgregler.yml -> studieplanlegger.json (via build)
```

**Kode som bruker valgregler:**
- `DataHandler.getValgregler()` linje 273
- `DataHandler.getValgreglerForTrinn()` linje 282
- `UIRenderer.renderProgramfagSlots()` - linje 512
- `Studieplanlegger.updateModalButton()` - linje 1415

### 6.4 MEDIUM: timefordeling endringer

Hvis timefordeling.yml fjernes fra skolemapper:

**Naavaerende:**
```
data/schools/{schoolId}/timefordeling.yml
```

**Ny:**
```
data/udir/programomrader/{programId}/timefordeling.yml
```

**Endringer:**
- Build-script maa hente fra ny lokasjon
- studieplanlegger.json-strukturen kan beholdes (flettes ved build)

---

## 7. Prioritert rekkefoeelge for endringer

### Fase 1: Backend (school-data) - Maa gjoeres foerst

1. **[HØY]** Opprett ny mappestruktur paralellt med gammel
2. **[HØY]** Oppdater build-scripts til aa generere til BEGGE lokasjoner
3. **[HØY]** Test at studieplanlegger.json genereres korrekt
4. **[MEDIUM]** Migrer regler.yml til ny struktur (behold samlet output)

### Fase 2: Frontend (studieplanlegger) - Etter backend

5. **[HØY]** Oppdater API-paths i DataHandler
6. **[MEDIUM]** Test mot ny API-struktur
7. **[LAV]** Fjern legacy v1 stoette (valgfritt)

### Fase 3: Opprydding

8. **[LAV]** Fjern gammel mappestruktur
9. **[LAV]** Oppdater dokumentasjon

---

## 8. Risiko-vurdering

| Risiko | Sannsynlighet | Konsekvens | Mitigering |
|--------|---------------|------------|------------|
| API-paths endres uten frontend-oppdatering | Hoey | Kritisk - app bryter | Deploy backend + frontend samtidig |
| regler.yml struktur endres | Medium | Kritisk - validering bryter | Behold samlet output i studieplanlegger.json |
| valgregler mangler | Medium | Hoey - modal fungerer ikke | Sjekk at alle felter finnes |
| fagomrader mangler | Medium | Hoey - fordypning bryter | Valider mot ValidationService |
| Fallback til v1 API | Lav | Medium | Test v1-paths ogsaa |

---

## 9. Test-sjekkliste foer produksjon

- [ ] studieplanlegger.json genereres korrekt fra ny struktur
- [ ] Alle requiredFields finnes: `blokkskjema`, `curriculum`, `regler`
- [ ] `regler.eksklusjoner` har korrekt format (gruppe/konfliktGrupper)
- [ ] `regler.forutsetninger` har fag som string ELLER array
- [ ] `regler.fagomrader` mapper alle fordypningsfag
- [ ] `regler.fordypning` har krav per programomraade
- [ ] `valgregler` finnes for alle programomraader og trinn
- [ ] VG1 matematikk og fremmedspraak-valg fungerer
- [ ] VG2 blokkskjema viser korrekte fag
- [ ] VG3 blokkskjema viser Historie som obligatorisk
- [ ] Fordypning telles korrekt (2 fag = 1 fordypning)
- [ ] R/S-konflikt blokkeres korrekt
- [ ] Forutsetninger valideres (Fysikk 2 krever Fysikk 1)

---

## 10. Kontaktinformasjon

**Studieplanlegger repo:** https://github.com/fredeids-metis/studieplanlegger
**School-data repo:** https://github.com/fredeids-metis/school-data

Ved spoersmaal om frontend-avhengigheter, se:
- `/Users/fredrik/Documents/studieplanlegger/src/core/data-handler.js`
- `/Users/fredrik/Documents/studieplanlegger/src/core/validation-service.js`
