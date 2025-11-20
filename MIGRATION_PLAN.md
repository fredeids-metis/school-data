# Migreringsplan - Curriculum Omstrukturering

**Dato:** 2025-11-20
**Formål:** Omstrukturere curriculum-data for å skille valgfrie programfag, obligatoriske programfag (MUS/MOK), og fellesfag.

---

## 🎯 MÅL

### Før-situasjon:
```
data/curriculum/
├── programfag/              # 35 filer (blandet innhold)
├── fellesfag/              # Bare README.md
└── programfag_lk20.txt     # 32 valgfrie programfag
```

### Etter-situasjon:
```
data/curriculum/
├── valgfrie-programfag/    # 33 filer (32 fra liste + IT)
├── obligatoriske-programfag/ # 16 filer (MUS/MOK)
├── fellesfag/              # 18 filer (16 + Historie + Spansk I+II)
├── valgfrie-programfag_lk20.txt       # 32 valgfrie
├── obligatoriske-programfag_lk20.txt  # 16 MUS/MOK
└── fellesfag_lk20.txt                 # 18 fellesfag
```

---

## 📋 FASEINNDELING

### FASE 1: Forberedelse og Struktur ✅ SIKKER
**Risiko:** Lav - ingen breaking changes

1. Opprett nye mapper (parallelle med eksisterende)
2. Opprett nye master-lister (.txt-filer)
3. Dokumenter ny struktur

**Output:** Nye tomme mapper + dokumentasjon

---

### FASE 2: Kopiering og Kategorisering ✅ SIKKER
**Risiko:** Lav - gamle filer beholdes

4. Kopier (ikke flytt) filer til nye mapper:
   - 33 filer → `valgfrie-programfag/`
   - 2 filer → `fellesfag/` (Historie, Spansk)
5. Legg til type-felt i frontmatter på kopierte filer

**Output:** Både gamle og nye mapper eksisterer parallelt

---

### FASE 3: Henting av Manglende Fag ⚠️ MODERAT
**Risiko:** Moderat - avhenger av Udir API

6. Hent 16 fellesfag fra Udir
7. Hent 6 MOK-fag fra Udir
8. Hent 10 MUS-fag fra Udir

**Output:** Komplette mapper med alle fag

---

### FASE 4: Build Script Oppdatering ⚠️ MODERAT
**Risiko:** Moderat - kan påvirke API-generering

9. Oppdater `build-api.js`:
   - Les fra alle tre mapper
   - Generer nested JSON-struktur
   - Behold bakoverkompatibilitet (flat struktur også)
10. Test API-generering lokalt

**Output:** Oppdatert build-script som fungerer med nye mapper

---

### FASE 5: School Config Oppdatering ✅ SIKKER
**Risiko:** Lav - bare metadata

11. Oppdater `school-config.yml`:
    - Legg til "Musikk, dans og drama" som program
12. Oppdater `tilbud.yml`:
    - Nested struktur: `valgfrieProgramfag`, `obligatoriskeProgramfag`, `fellesfag`
    - Legg til MOK-fag (6 fag)
    - Legg til MUS-fag (10 fag)

**Output:** Oppdaterte config-filer

---

### FASE 6: Testing og Validering ⚠️ KRITISK
**Risiko:** Lav hvis grundig testet

13. Kjør `npm run build`
14. Valider generert API:
    - Sjekk at alle 3 kategorier finnes
    - Sjekk at antall fag stemmer
    - Sjekk at school-specific data er korrekt
15. Test widgets lokalt (hvis mulig)

**Output:** Validert API som fungerer

---

### FASE 7: Opprydding 🗑️ IRREVERSIBEL
**Risiko:** Høy hvis Fase 6 ikke er 100% OK

16. Fjern gamle `programfag/`-mappe
17. Fjern gammel `programfag_lk20.txt`
18. Oppdater dokumentasjon (README.md)
19. Commit og push til GitHub

**Output:** Ren ny struktur

---

## 🔢 OVERSIKT: Antall Fag per Kategori

### Valgfrie Programfag (33 fag)
- Matematikk: 3 fag (R1, R2, 2P)
- Naturfag: 6 fag (Biologi 1/2, Fysikk 1/2, Kjemi 1/2)
- Samfunnsøkonomi/næring: 10 fag
- Samfunnsfag: 9 fag
- Språk: 2 fag (Engelsk 1/2)
- Musikk fordypning: 2 fag
- Kunst/design: 2 fag
- IT: 1 fag (Informasjonsteknologi 1)

**Total:** 33 fag + 2 som mangler i liste (35 eksisterende filer)

### Obligatoriske Programfag (16 fag)
**Musikk, dans og drama (10 fag):**
- Musikk, dans og drama (MDD2002) - VG1
- Ergonomi og bevegelse 1 (MUS2010) - VG1
- Ergonomi og bevegelse 2 (MUS2011) - VG2
- Instrument, kor, samspill 1 (MUS2012) - VG1
- Instrument, kor, samspill 2 (MUS2013) - VG2
- Musikk i perspektiv 1 (MUS2014) - VG1
- Musikk i perspektiv 2 (MUS2016) - VG2
- Instruksjon og ledelse (MUS2018) - VG2
- Lytting (MDD3007) - VG1
- Musikk (MDD3009) - VG3

**Medier og kommunikasjon (6 fag):**
- Mediesamfunnet 1 (MOK2008) - VG1
- Mediesamfunnet 2 (MOK2009) - VG2
- Mediesamfunnet 3 (MOK2010) - VG3
- Medieuttrykk 1 (MOK2012) - VG1
- Medieuttrykk 2 (MOK2013) - VG2
- Medieuttrykk 3 (MOK2014) - VG3

### Fellesfag (18 fag)
**VG1 (8 fag):**
- Engelsk (ENG1007)
- Geografi (GEO1003)
- Kroppsøving, vg1 (KRO1017)
- Matematikk 1P (MAT1019)
- Matematikk 1T (MAT1021)
- Naturfag (NAT1007)
- Norsk, vg1 (NOR1260)
- Samfunnskunnskap (SAK1001)

**VG2 (4 fag):**
- Historie, vg2 (HIS1009)
- Kroppsøving, vg2 (KRO1018)
- Matematikk 2P (MAT1023) - allerede i valgfrie
- Norsk, vg2 (NOR1264)

**VG3 (4 fag):**
- Historie, vg3 (HIS1010) - allerede eksisterer som Historie.md
- Kroppsøving, vg3 (KRO1019)
- Norsk, vg3 (NOR1267)
- Religion og etikk (REL1003)

**Fremmedspråk (2 fag - betinget obligatoriske):**
- Spansk I+II, vg3 (FSP6226) - allerede eksisterer
- (Andre fremmedspråk kan legges til senere)

**Total fellesfag som skal hentes:** 16 nye + 2 eksisterende = 18

---

## ⚠️ KRITISKE PUNKTER

### 1. Matematikk 2P - Duplikat
**Problem:** Matematikk 2P finnes i både valgfrie og fellesfag
**Løsning:**
- En fil: `Matematikk_2P.md` med `type: ["fellesfag", "programfag"]`
- Eller: To separate filer med ulike perspektiver

**Beslutning påkrevd:** Hvordan håndtere?

### 2. Informasjonsteknologi 1
**Problem:** Finnes som fil, men ikke i programfag_lk20.txt
**Løsning:** Legg til i ny `valgfrie-programfag_lk20.txt`

### 3. Build Script - API Struktur
**Ny struktur:**
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

**Bakoverkompatibilitet (deprecated):**
```json
{
  "programfag": [...alle valgfrie...]
}
```

---

## 🧪 TESTSTRATEGI

### Fase 2 Test:
- [ ] Verifiser at alle 35 filer er kopiert
- [ ] Sjekk at type-felt er lagt til korrekt

### Fase 3 Test:
- [ ] Verifiser at alle 16 MUS/MOK-fag er hentet
- [ ] Verifiser at alle 16 fellesfag er hentet
- [ ] Sjekk at fagkoder matcher listen

### Fase 4 Test:
- [ ] Kjør build-script lokalt
- [ ] Verifiser JSON-struktur
- [ ] Sjekk at antall fag stemmer:
  - valgfrieProgramfag: 33
  - obligatoriskeProgramfag: 16
  - fellesfag: 18

### Fase 6 Test:
- [ ] Full build: `npm run build`
- [ ] Valider alle API-endpoints
- [ ] Sjekk at school-specific data er riktig
- [ ] Test at widgets fungerer (visuell test)

---

## 📦 ROLLBACK PLAN

Hvis noe går galt i Fase 6:

1. **Behold gamle mapper** til Fase 7
2. **Revert build-api.js** til forrige versjon
3. **Revert config-filer** hvis nødvendig
4. **Kjør build på nytt** med gamle strukturer

**Viktig:** IKKE slett gamle mapper før alt er 100% testet!

---

## 📚 DOKUMENTASJON SOM MÅ OPPDATERES

1. `/repos/school-data/README.md`
   - Ny mappestruktur
   - API-struktur
   - Eksempler

2. `/repos/school-data/data/curriculum/README.md` (opprett hvis mangler)
   - Forklaring av de tre kategoriene
   - Hvordan legge til nye fag

3. `fetch-curriculum.sh`
   - Oppdater til å lese fra tre master-lister
   - Output til tre forskjellige mapper

---

## 🚀 NESTE STEG

**ER DU KLAR FOR Å STARTE FASE 1?**

Hvis ja, starter jeg med:
1. Opprette nye mapper
2. Opprette master-lister
3. Dokumentere struktur

**KRITISKE SPØRSMÅL FØR VI STARTER:**

1. **Matematikk 2P duplikat** - Én fil med dual-type, eller to separate filer?
2. **API-versjonering** - Skal vi ha både v1 (flat) og v2 (nested), eller bare oppdatere v1?
3. **Backup** - Skal jeg ta backup av hele `/repos/school-data/` før vi starter?

Hva sier du?
