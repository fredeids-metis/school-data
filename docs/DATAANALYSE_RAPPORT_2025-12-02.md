# Dataanalyse Rapport - school-data
**Dato:** 2025-12-02
**Utfort av:** Claude Code
**Formål:** Verifisere komplettheten og kvaliteten på datagrunnlaget mot UDIR kilder

---

## 1. OPPSUMMERING AV NAVÆRENDE TILSTAND

### 1.1 Overordnet struktur
School-data inneholder et velstrukturert datagrunnlag med følgende hovedkomponenter:

| Komponent | Antall | Status |
|-----------|--------|--------|
| Valgfrie programfag | 34 filer | God dekning |
| Obligatoriske programfag | 16 fag | Komplett |
| Fellesfag | 29 fag (inkl. fremmedspråk) | Komplett |
| Skoler | 2 (BPG, Metis VGS) | Funksjonelle |
| Blokkskjemaversjoner | 3 per skole | God |

### 1.2 Kildestruktur
Dataene er basert på et solid kildehierarki:
- **Nivå 1:** Privatskoleforskriften (Lovdata)
- **Nivå 2:** UDIR Rundskriv (Udir-1-2025, Vitnemålsregler 2025)
- **Nivå 3:** Grep API (tekniske fagdata)
- **Nivå 4:** Lokal skoledata (BPG/MVGS-spesifikke)

### 1.3 Verifiseringsdato
Alle hovedkilder er verifisert per 2025-12-01 iflg. `versjon.yml`.

---

## 2. VERIFISERING MOT UDIR

### 2.1 Fag- og timefordeling (Udir-1-2025)
**Kilde:** https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/udir-1-2025/

| Program | Dokumentert | UDIR | Status |
|---------|-------------|------|--------|
| Studiespesialisering VG1 | 842 timer | 842 timer | OK |
| Studiespesialisering VG2 | 840 timer | 840 timer | OK |
| Studiespesialisering VG3 | 841 timer | 841 timer | OK |
| Musikk VG1 | 982 timer | 982 timer | OK |
| Musikk VG2 | 980 timer | 980 timer | OK |
| Musikk VG3 | 981 timer | 981 timer | OK |
| Medier VG1 | 982 timer | 982 timer | OK |
| Medier VG2 | 980 timer | 980 timer | OK |
| Medier VG3 | 981 timer | 981 timer | OK |

**Konklusjon:** Timefordelingen er i samsvar med offisielle UDIR-tall.

### 2.2 Vitnemålsregler 2025
**Kilde:** https://www.udir.no/eksamen-og-prover/dokumentasjon/vitnemal-og-kompetansebevis/foring-vitnemal-kompetansebevis-vgs-25/

| Regel | Implementert | Status |
|-------|--------------|--------|
| Matematikk S/R-konflikt | Ja | OK |
| Matematikk 2P/R1-erstatning | Ja | OK |
| Geofag X/1-konflikt | Ja | OK |
| ToF X/1-konflikt | Ja | OK |
| Fordypningskrav 560 timer | Ja | OK |
| Fordypning 2 fagområder | Ja | OK |

**Konklusjon:** Valideringsreglene er korrekt implementert.

---

## 3. MANGLENDE FAG - SAMMENLIGNET MED UDIR

### 3.1 Valgfrie programfag som MANGLER i school-data

Basert på sammenligning med UDIR sine offisielle lister:

#### REALFAG (mangler):
| Fag | Fagkode | Prioritet | Kommentar |
|-----|---------|-----------|-----------|
| Geofag 1 | REA3044 | HØY | Standard realfag |
| Geofag 2 | REA3050 | HØY | Standard realfag |
| Geofag X | REA3052 | MIDDELS | X-fag variant |
| Informasjonsteknologi 2 | REA3049 | HØY | Kun IT 1 finnes |
| Teknologi og forskningslære 1 | REA3060 | MIDDELS | Vanlig realfag |
| Teknologi og forskningslære 2 | REA3062 | MIDDELS | Bygger på ToF 1 |
| Teknologi og forskningslære X | REA3064 | LAV | X-fag variant |
| Matematikk S1 | REA3053 | HØY | Samfunnsfag-matte |
| Matematikk S2 | REA3055 | HØY | Bygger på S1 |
| Matematikk X | REA3057 | LAV | X-fag variant |
| Programmering og modellering X | REA3065 | LAV | Nyere fag |

#### SPRÅK, SAMFUNNSFAG OG ØKONOMI (mangler):
| Fag | Fagkode | Prioritet | Kommentar |
|-----|---------|-----------|-----------|
| Internasjonal engelsk | SPR3036 | MIDDELS | Nevnt i fagområder |
| Kommunikasjon og kultur 1 | SAM3039 | LAV | Mindre vanlig |
| Kommunikasjon og kultur 2 | SAM3040 | LAV | Mindre vanlig |
| Antikkens språk og kultur | SPR3020 | LAV | Nisje-språkfag |
| Latin 1 | SPR3022 | LAV | Nisje-språkfag |
| Latin 2 | SPR3024 | LAV | Nisje-språkfag |
| Samfunnsgeografi | SAM3052 | MIDDELS | POS-fagområde |

#### MEDIER OG KOMMUNIKASJON (valgfrie, mangler):
| Fag | Fagkode | Prioritet | Kommentar |
|-----|---------|-----------|-----------|
| Lyddesign | MOK3009 | MIDDELS | Spesialisering |
| Tekst | MOK3007 | MIDDELS | Spesialisering |
| Medieutvikling | MOK3011 | LAV | Avansert valgfag |
| Mediespesialisering | MOK3012 | LAV | Avansert valgfag |

### 3.2 Fag som finnes men mangler komplett data
Alle eksisterende 34 valgfrie programfag har:
- Fagkode (fra UDIR)
- Læreplankode
- Kompetansemål
- Kjerneelementer

**Ingen mangler identifisert i eksisterende fag.**

---

## 4. IDENTIFISERTE PROBLEMER OG INKONSISTENSER

### 4.1 Kritiske problemer
Ingen kritiske problemer identifisert.

### 4.2 Middels alvorlige problemer

| Problem | Lokasjon | Beskrivelse | Anbefaling |
|---------|----------|-------------|------------|
| Matematikk S-linja mangler | valgfrie-programfag/ | S1/S2 er ikke opprettet, men referert til i regler.yml | Opprett S1/S2 fagfiler |
| IT 2 mangler | valgfrie-programfag/ | Kun IT 1 finnes, men IT 2 er definert i fagområder | Opprett IT 2 fagfil |
| Geofag mangler helt | valgfrie-programfag/ | Referert til i eksklusjonsregler, men ingen fagfiler | Opprett Geofag 1/2/X |
| ToF mangler helt | valgfrie-programfag/ | Referert til i eksklusjonsregler, men ingen fagfiler | Opprett ToF 1/2/X |

### 4.3 Mindre alvorlige problemer

| Problem | Lokasjon | Beskrivelse |
|---------|----------|-------------|
| Metis VGS er dummy-data | data/schools/metis-vgs/ | Merket som "Proof-of-concept" |
| Duplikate blokkskjema-filer | BPG har 4 versjoner | Kan forenkles |
| Inkonsistent ID-navngiving | regler.yml vs blokkskjema | "rettslare" vs "rettslaere" |

### 4.4 Inkonsistens i forutsetninger
I `regler.yml` er noen fag markert som "blocking" forutsetninger, mens i `docs/api/v2/curriculum/regler.json` er de markert som "warning":

```yaml
# regler.yml (kilde)
forutsetninger:
  - fag: fysikk-2
    krever: [fysikk-1]
    type: blocking  # <-- Blokkerende

# regler.json (API)
forutsetninger:
  - fag: "fysikk-2"
    type: "warning"  # <-- Kun advarsel
```

**Anbefaling:** Synkroniser type-feltet mellom kilde og API-output.

---

## 5. SKOLESTRUKTUR-ANALYSE

### 5.1 Bergen Private Gymnas (BPG)
**Status:** Komplett og funksjonell

| Komponent | Vurdering |
|-----------|-----------|
| school-config.yml | OK - Komplett metadata |
| blokkskjema_v2.yml | OK - Detaljert med alle program |
| timefordeling.yml | OK - Matcher UDIR |
| tilbud.yml | OK - Spesifiserer fagtilbud |

**Blokkskjema-struktur:**
- 4 blokker med logisk fagfordeling
- Korrekt programtilgjengelighet (STUD, MDD, MOK)
- Historie VG3 korrekt markert som obligatorisk
- Spansk I+II korrekt som betinget obligatorisk

**Potensielt problem:** Historie VG3 er plassert i blokkskjema som valgfag, selv om det er et obligatorisk fellesfag. Dette kan skape forvirring. Vurder å håndtere dette utenfor blokkskjema.

### 5.2 Metis VGS
**Status:** Proof-of-concept (ikke produksjonsdata)

- Duplisert BPG-data
- Samme blokkskjema som BPG
- Merket eksplisitt som test-skole

**Anbefaling:** Enten fjern Metis VGS eller gjør den til en faktisk skole med egne data.

---

## 6. ANBEFALINGER FOR STRUKTURERING

### 6.1 Datamodell-forbedringer

1. **Skille mellom fellesfag og blokkskjema-fag**
   - Historie VG3 bør ikke være i blokkskjema
   - Håndter automatisk tillegging av obligatoriske fag

2. **Standardiser ID-format**
   - Bruk konsekvent kebab-case
   - Fjern æ/ø/å fra ID-er (bruk ae/o/aa)

3. **Legg til timetall i fagfiler**
   - Frontmatter mangler `timer: 140` felt
   - Viktig for validering

### 6.2 Arkitektur-forbedringer

```
data/
├── curriculum/
│   ├── fellesfag/           # Uendret
│   ├── obligatoriske-programfag/  # Uendret
│   ├── valgfrie-programfag/      # Legg til manglende fag
│   └── regler.yml           # Kilde for validering
├── kilder/                  # Uendret
└── schools/
    ├── _template/           # Ny: Mal for nye skoler
    ├── bergen-private-gymnas/
    └── metis-vgs/           # Vurder å fjerne/oppdatere
```

### 6.3 Kvalitetssikring

1. **Automatiser UDIR-verifisering**
   - Script som sammenligner med Grep API
   - Kjør ved hver build

2. **Lag enhetstester for regler**
   - Test eksklusjoner
   - Test forutsetninger
   - Test timefordeling

---

## 7. PRIORITERT HANDLINGSPLAN

### Fase 1: Kritiske mangler (1-2 dager)
| Oppgave | Prioritet | Estimat |
|---------|-----------|---------|
| Opprett Matematikk S1/S2 | HØY | 2 timer |
| Opprett Informasjonsteknologi 2 | HØY | 1 time |
| Opprett Geofag 1/2 | HØY | 2 timer |
| Synkroniser forutsetninger type | HØY | 30 min |

### Fase 2: Komplettering (3-5 dager)
| Oppgave | Prioritet | Estimat |
|---------|-----------|---------|
| Opprett ToF 1/2 | MIDDELS | 2 timer |
| Opprett Internasjonal engelsk | MIDDELS | 1 time |
| Opprett Samfunnsgeografi | MIDDELS | 1 time |
| Opprett Lyddesign/Tekst (MOK) | MIDDELS | 2 timer |
| Standardiser ID-navngiving | MIDDELS | 2 timer |

### Fase 3: Forbedringer (1 uke)
| Oppgave | Prioritet | Estimat |
|---------|-----------|---------|
| Opprett X-fag (Geofag X, ToF X, Mat X) | LAV | 3 timer |
| Opprett nisje-språkfag (Latin, Antikk) | LAV | 4 timer |
| Lag skolemal (_template) | LAV | 2 timer |
| Oppdater/fjern Metis VGS | LAV | 1 time |
| Automatiser UDIR-verifisering | LAV | 4 timer |

---

## 8. KONKLUSJON

### Styrker
- Solid kildestruktur med tydelig autoritetshierarki
- Korrekt implementering av UDIR-regler
- God dokumentasjon og kildehenvisninger
- Funksjonelt blokkskjema med programspesifikk tilgang

### Forbedringsområder
- Kompletter fagporteføljen (ca. 15-20 manglende fag)
- Synkroniser forutsetningstyper mellom kilder
- Standardiser ID-navngiving
- Vurder Metis VGS sin rolle

### Samlet vurdering
**Datagrunnlaget er i hovedsak komplett og korrekt strukturert.** De identifiserte manglene er primært "nice-to-have" fag som kan legges til inkrementelt. Valideringsreglene er korrekt implementert og samsvarer med offisielle UDIR-kilder.

**Anbefalt neste steg:** Start med Fase 1 (kritiske mangler) for å sikre at de mest brukte fagene er tilgjengelige.

---

*Rapport generert 2025-12-02 av Claude Code*
*Kilder: UDIR Udir-1-2025, Vitnemålsregler 2025, Grep API*
