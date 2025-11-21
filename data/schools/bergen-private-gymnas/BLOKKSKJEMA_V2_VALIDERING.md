# Blokkskjema v2 - Timevalidering

Dette dokumentet validerer at blokkskjema_v2.yml stemmer overens med TIMEFORDELING.md.

## Validering: Studiespesialisering

### VG2 Studiespesialisering

**Fra TIMEFORDELING.md:**
- Fellesfag: 420 timer
- Programfag: 420 timer (3 fag)
- **Totalt VG2**: 840 timer

**Fra blokkskjema_v2.yml:**
- Elev velger fra alle 4 blokker
- Velger 3 programfag totalt = 420 timer
  - **Alternativ A**: 3 fag á 140 timer = 420 timer
  - **Alternativ B**: 2 fag á 140 timer + Matematikk 2P (84 timer) = 364 timer
    - Men hvis Matematikk 2P velges, teller det som fellesfag (420 timer fellesfag inkluderer Mat 2P)
    - Så totalt programfag = 280 timer + 84 timer (Mat 2P fra fellesfag) = 364 timer
    - **PROBLEM**: Dette gir ikke 420 timer programfag!

**Løsning:**
- Hvis Matematikk R1 velges:
  - Matematikk 2P (84t fellesfag) erstattes av Matematikk R1 (140t programfag)
  - Totalt: 2 andre programfag (280t) + Matematikk R1 (140t) = 420 timer ✓
- Hvis Matematikk 2P beholdes:
  - 3 programfag á 140 timer = 420 timer ✓
  - Matematikk 2P (84t) teller som fellesfag

**RESULTAT VG2 Studiespesialisering:** ✅ Stemmer med TIMEFORDELING.md

---

### VG3 Studiespesialisering

**Fra TIMEFORDELING.md:**
- Fellesfag: 421 timer
- Programfag: 420 timer
  - **280 timer**: Fordypning (2 fag nivå 2)
  - **140 timer**: Valgfritt programfag
- **Totalt VG3**: 841 timer

**Fra blokkskjema_v2.yml:**
- Elev velger fra alle 4 blokker
- Velger 3 programfag totalt:
  - Historie VG3 (113 timer) - OBLIGATORISK
  - 2 andre programfag

**PROBLEM:** Historie er fellesfag, ikke programfag!

**Analyse:**
- Fellesfag VG3 ifølge TIMEFORDELING:
  - Historie VG3: 113 timer
  - Kroppsøving: 56 timer
  - Norsk: 168 timer
  - Religion og etikk: 84 timer
  - **Totalt**: 421 timer ✓

- Hvis historie (113t) legges i blokkskjema:
  - Programfag valgt: Historie (113t) + 2 fag nivå 2 (280t) = 393 timer
  - **PROBLEM**: Dette gir bare 393 timer programfag, ikke 420 timer!

**Mulig løsning:**
- Historie VG3 skal IKKE være i blokkskjema
- Elev velger 3 programfag á 140 timer = 420 timer (2 fordypning + 1 valgfritt)
- Historie telles automatisk som fellesfag (421 timer total fellesfag)

**ANBEFALING:** Fjern Historie fra blokkskjema for Studiespesialisering VG3

**RESULTAT VG3 Studiespesialisering:** ⚠️ Trenger justeringer - Historie bør ikke være i blokkskjema

---

## Validering: Musikk, dans og drama

### VG2 Musikk

**Fra TIMEFORDELING.md:**
- Fellesfag: 504 timer
- Felles programfag: 336 timer (fordelt over VG2/VG3)
- Valgfrie programfag: 140 timer (1 fag)
- **Totalt VG2**: 980 timer

**Fra blokkskjema_v2.yml:**
- Elev velger fra Blokk 1 eller Blokk 3
- Velger 1 valgfritt programfag = 140 timer
- Én av blokkene bør være matematikk (anbefaling)

**Analyse:**
- 504 timer fellesfag ✓
- 336 timer felles programfag (fordelt over VG2/VG3) ✓
- 140 timer valgfritt programfag ✓
- **Totalt**: 504 + 336 + 140 = 980 timer ✓

**RESULTAT VG2 Musikk:** ✅ Stemmer med TIMEFORDELING.md

---

### VG3 Musikk

**Fra TIMEFORDELING.md:**
- Fellesfag: 365 timer
  - Historie VG3: 113 timer
  - Norsk VG3: 168 timer
  - Religion og etikk: 84 timer
- Felles programfag: 476 timer (fordelt over VG2/VG3)
- Valgfrie programfag: 140 timer (1 fag)
- **Totalt VG3**: 981 timer

**Fra blokkskjema_v2.yml:**
- Elev velger fra Blokk 3 eller Blokk 4
- Velger 2 programfag totalt:
  - Historie VG3 (113 timer) - OBLIGATORISK
  - 1 valgfritt programfag (140 timer)
- Totalt valgt: 113 + 140 = 253 timer

**Analyse:**
- Historie VG3 er fellesfag (113 timer) - skal IKKE telle som programfag
- Hvis historie telles som programfag: 113 + 140 = 253 timer programfag ❌
- Hvis historie telles som fellesfag:
  - Fellesfag: 365 timer (inkludert historie 113t) ✓
  - Valgfrie programfag: 140 timer (1 fag) ✓
  - Felles programfag: 476 timer ✓
  - **Totalt**: 365 + 476 + 140 = 981 timer ✓

**PROBLEM:** Hvis historie er i blokkskjema, hvordan sikrer vi at det telles som fellesfag og ikke programfag?

**Mulige løsninger:**
1. **Løsning A**: Historie markeres som "fellesfag-obligatorisk-valg" i blokkskjema
   - Teller mot fellesfag (365 timer)
   - Men må velges i blokkskjema for at systemet skal vite at eleven har valgt det

2. **Løsning B**: Historie tas ut av blokkskjema
   - Telles automatisk som fellesfag
   - Eleven velger kun 1 valgfritt programfag (140 timer)

**ANBEFALING:** Bruk Løsning A - Historie markeres som fellesfag som må velges

**RESULTAT VG3 Musikk:** ⚠️ Trenger klargjøring - Historie må markeres som fellesfag i blokkskjema

---

## Validering: Medier og kommunikasjon

### VG2 Medier

**Fra TIMEFORDELING.md:**
- Fellesfag: 504 timer
- Felles programfag: 280 timer (Mediesamfunnet 2 + Medieuttrykk 2)
- Valgfrie programfag: 140 timer (1 fag)
- **Totalt VG2**: 980 timer (inkludert 56 timer kroppsøving)

**Fra blokkskjema_v2.yml:**
- Elev velger fra Blokk 1 eller Blokk 3 (OPPDATERT - ikke 1, 2, 3, 4)
- Velger 1 valgfritt programfag = 140 timer
- Én av blokkene bør være matematikk (anbefaling)

**Analyse:**
- 504 timer fellesfag ✓
- 280 timer felles programfag ✓
- 140 timer valgfritt programfag ✓
- **Totalt**: 504 + 280 + 140 = 924 timer

**BEKREFTELSE FRA BRUKER:** 980 timer stemmer for Medier VG2

**Analyse av differanse:**
- 980 - 924 = 56 timer mangler
- 56 timer = Kroppsøving VG2 (fellesfag)
- TIMEFORDELING sier "Totalt VG2: 980 timer (inkludert 56 timer kroppsøving)"

**Løsning:**
- Kroppsøving VG2 (56 timer) er EKSTRA fellesfag for Medier (ikke inkludert i 504 timer)
- Fellesfag Medier VG2 totalt: 504 + 56 = 560 timer
- **KORREKT Totalt**: 560 + 280 + 140 = 980 timer ✓

**RESULTAT VG2 Medier:** ✅ Stemmer med TIMEFORDELING.md (980 timer totalt)

---

### VG3 Medier

**Fra TIMEFORDELING.md:**
- Fellesfag: 421 timer
  - Historie VG3: 113 timer
  - Kroppsøving: 56 timer
  - Norsk: 168 timer
  - Religion og etikk: 84 timer
- Felles programfag: 280 timer (Mediesamfunnet 3 + Medieuttrykk 3)
- Valgfrie programfag: 280 timer (2 fag)
- **Totalt VG3**: 981 timer

**Fra blokkskjema_v2.yml:**
- Elev velger fra Blokk 2, 3, eller 4
- Velger 3 programfag totalt:
  - Historie VG3 (113 timer) - OBLIGATORISK
  - 2 valgfrie programfag (280 timer)
- Totalt valgt: 113 + 280 = 393 timer

**Analyse:**
- Samme problem som Musikk VG3: Historie er fellesfag, ikke programfag
- Hvis historie telles som fellesfag:
  - Fellesfag: 421 timer (inkludert historie 113t) ✓
  - Felles programfag: 280 timer ✓
  - Valgfrie programfag: 280 timer (2 fag) ✓
  - **Totalt**: 421 + 280 + 280 = 981 timer ✓

**RESULTAT VG3 Medier:** ⚠️ Samme problem som Musikk - Historie må markeres som fellesfag

---

## OPPSUMMERING (OPPDATERT 2025-11-20)

### ✅ Bekreftet av bruker:

1. **Historie VG3 i blokkskjema** - BEKREFTET
   - Historie skal være i blokkskjema selv om det er fellesfag
   - Dette forenkler valg for Studiespesialisering (må velge fra alle blokker)
   - Historie teller som fellesfag i timeberegningen

2. **Medier VG2 - 980 timer totalt** - BEKREFTET
   - TIMEFORDELING.md er KORREKT med 980 timer
   - Kroppsøving VG2 (56 timer) er ekstra fellesfag for Medier
   - Korrekt beregning: (504 + 56 kroppsøving) + 280 + 140 = 980 timer ✓

3. **Blokktilgang per program** - OPPDATERT:
   - **VG2:**
     - Studiespesialisering: Alle blokker (1, 2, 3, 4) ✓
     - Musikk: Blokk 1, 3 ✓
     - Medier: Blokk 1, 3 (IKKE 1, 2, 3, 4)

   - **VG3:**
     - Studiespesialisering: Alle blokker (1, 2, 3, 4) ✓
     - Musikk: Blokk 3, 4 ✓
     - Medier: Blokk 2, 3, 4 ✓

### Gjenstående spørsmål:

1. **Historie timeberegning for Studiespesialisering VG3:**
   - Studiespesialisering trenger 420 timer programfag
   - Historie (113t fellesfag) + 2 programfag (280t) = 393 timer totalt valgt
   - **Mangler**: 27 timer for å nå 420 timer programfag
   - **Løsning**: Historie teller som fellesfag (421t), programfag = 3 fag á 140t (420t)
   - Men hvordan velges 3 fag á 140t PLUSS historie i blokkskjema?

### Foreslåtte løsninger:

1. **Studiespesialisering VG3:**
   - Velg 4 fag fra blokkskjema: 3 programfag á 140t + Historie (113t)
   - Historie markeres spesielt som "obligatorisk fellesfag" som ikke teller mot programfag
   - Totalt: 420 timer programfag + 421 timer fellesfag (inkludert historie)

2. **Musikk/Medier VG3:**
   - Velg 2-3 fag fra blokkskjema (inkludert historie obligatorisk)
   - Historie teller som fellesfag
   - Resten teller som valgfrie programfag

---

## NESTE STEG

1. **Bekreft med bruker**: Er Historie VG3 ment å være i blokkskjema?
2. **Valider Medier VG2**: Stemmer 980 timer totalt fra TIMEFORDELING.md?
3. **Implementer fagtype**: Legg til støtte for "fellesfag-obligatorisk-valg" i blokkskjema
4. **Test med eksempler**: Lag konkrete fagvalgseksempler for å validere timefordelingen
