# Blokkskjema v2 - Oppdatering 2025-11-20

## Oppsummering

blokkskjema_v2.yml har blitt oppdatert med faktisk fagtilbud basert på blokkskjema-bilde fra Bergen Private Gymnas.

---

## Hva er gjort

### 1. ✅ Validering av alle fag

Alle 30 unike fag fra bildet er validert mot curriculum-data:
- **28 valgfrie programfag**: Funnet i valgfrie-programfag_lk20.txt
- **1 fremmedspråk**: Spansk I+II (FSP6226)
- **1 fellesfag**: Historie vg3 (HIS1010)

**Resultat**: Alle fag validert ✅

Se [BLOKKSKJEMA_V2_FAGMATCHING.md](BLOKKSKJEMA_V2_FAGMATCHING.md) for detaljer.

---

### 2. ✅ Matching av fag-ID

Alle fag fra bildet er matched med korrekt fag-ID og fagkode:
- Fag-ID følger kebab-case konvensjon
- Eksempel: "Markedsføring og ledelse 1" → `markedsforing-og-ledelse-1` (SAM3045)

---

### 3. ✅ Oppdatering av blokkskjema_v2.yml

Alle 4 blokker er oppdatert med faktisk fagtilbud fra bildet.

#### BLOKK 1
**Tilgjengelig for**:
- VG2: Studiespesialisering, Musikk, Medier
- VG3: Studiespesialisering

**VG2 fag (9)**:
- matematikk-2p, matematikk-r1, biologi-1, okonomistyring, markedsforing-og-ledelse-1, sosiologi-og-sosialantropologi, rettslare-2, psykologi-1, bilde

**VG3 fag (2)**:
- matematikk-r2, historie-vg3 (obligatorisk)

---

#### BLOKK 2
**Tilgjengelig for**:
- VG2: Studiespesialisering
- VG3: Studiespesialisering, Medier

**VG2 fag (7)**:
- matematikk-2p, matematikk-r1, kjemi-1, entreprenorskap-og-bedriftsutvikling-1, politikk-og-menneskerettigheter, rettslare-1, grafisk-design

**VG3 fag (5)**:
- biologi-2, markedsforing-og-ledelse-2, psykologi-2, musikk-fordypning-2 (kun Musikk), historie-vg3 (obligatorisk)

---

#### BLOKK 3
**Tilgjengelig for**:
- VG2: Studiespesialisering, Musikk, Medier
- VG3: Studiespesialisering, Musikk, Medier

**VG2 fag (7)**:
- matematikk-2p, fysikk-1, markedsforing-og-ledelse-1, sosialkunnskap, rettslare-1, musikk-fordypning-1 (kun Musikk), grafisk-design

**VG3 fag (6)**:
- fysikk-2, entreprenorskap-og-bedriftsutvikling-2, psykologi-2, musikk-fordypning-2 (kun Musikk), spansk-i-ii-vg3 (betinget obligatorisk), historie-vg3 (obligatorisk)

---

#### BLOKK 4
**Tilgjengelig for**:
- VG2: Studiespesialisering
- VG3: Studiespesialisering, Musikk, Medier

**VG2 fag (5)**:
- matematikk-2p, fysikk-1, biologi-1, okonomi-og-ledelse, psykologi-1

**VG3 fag (6)**:
- kjemi-2, markedsforing-og-ledelse-2, sosiologi-og-sosialantropologi, rettslare-2, engelsk-1, historie-vg3 (obligatorisk)

---

## Viktige endringer

### 1. Spansk I+II
- **ENDRET**: Kun i Blokk 3 (ikke Blokk 4 som tidligere)
- **Status**: Betinget obligatorisk for elever uten fremmedspråk fra ungdomsskolen
- **Tilgjengelig**: Alle programmer (VG3)

### 2. Historie VG3
- **BEKREFTET**: I alle 4 blokker (VG3)
- **Status**: Obligatorisk for alle VG3-elever
- **Type**: Fellesfag, men må velges i blokkskjema

### 3. Musikk fordypning
- **Musikk fordypning 1**: Kun Blokk 3 (VG2)
- **Musikk fordypning 2**: Blokk 2 OG Blokk 3 (VG3)
- **Tilgjengelig**: Kun for elever på Musikk-programmet

### 4. Matematikk 2P
- **BEKREFTET**: I alle 4 blokker (VG2)
- **Type**: Både fellesfag og valgfritt programfag
- **Kan erstattes**: Av Matematikk R1

### 5. Fag som kun er i én blokk
- **Økonomistyring**: Kun Blokk 1 (VG2)
- **Økonomi og ledelse**: Kun Blokk 4 (VG2)
- **Politikk og menneskerettigheter**: Kun Blokk 2 (VG2)
- **Sosialkunnskap**: Kun Blokk 3 (VG2)
- **Bilde**: Kun Blokk 1 (VG2)
- **Engelsk 1**: Kun Blokk 4 (VG3)
- **Spansk I+II**: Kun Blokk 3 (VG3)

---

## Blokktilgang per program

### VG2
- **Studiespesialisering**: Alle blokker (1, 2, 3, 4)
- **Musikk**: Blokk 1, 3
- **Medier**: Blokk 1, 3

### VG3
- **Studiespesialisering**: Alle blokker (1, 2, 3, 4)
- **Musikk**: Blokk 3, 4
- **Medier**: Blokk 2, 3, 4

---

## Statistikk

### Totalt antall fagoppføringer i blokkskjema_v2.yml
- **Blokk 1**: 11 fag (9 VG2 + 2 VG3)
- **Blokk 2**: 12 fag (7 VG2 + 5 VG3)
- **Blokk 3**: 13 fag (7 VG2 + 6 VG3)
- **Blokk 4**: 11 fag (5 VG2 + 6 VG3)
- **Totalt**: 47 fagoppføringer

### Unike fag
- **30 unike fag** totalt (inkludert Matematikk 2P og Historie VG3 som forekommer i flere blokker)

### Fag per kategori
- **Matematikk**: 3 fag (2P, R1, R2)
- **Naturfag**: 6 fag (Biologi 1-2, Kjemi 1-2, Fysikk 1-2)
- **Økonomi**: 4 fag (Økonomistyring, Økonomi og ledelse, Samfunnsøkonomi 1-2)
- **Bedriftsledelse**: 4 fag (Markedsføring 1-2, Entreprenørskap 1-2)
- **Samfunnsfag**: 7 fag (Sosiologi, Sosialkunnskap, Politikk, Rettslære 1-2, Psykologi 1-2)
- **Kunst/Musikk**: 4 fag (Bilde, Grafisk design, Musikk fordypning 1-2)
- **Språk**: 2 fag (Engelsk 1, Spansk I+II)
- **Fellesfag**: 1 fag (Historie VG3)

---

## Neste steg

### ✅ Fullført
1. Validert alle fag mot curriculum-data
2. Matched alle fag med fag-ID og fagkoder
3. Oppdatert alle 4 blokker i blokkskjema_v2.yml
4. Oppdatert metadata med datakilde

### ⏭️ Mulige neste steg
1. **Teste blokkskjema_v2.yml** med konkrete fagvalgseksempler
2. **Validere timefordeling** for ulike fagkombinasjoner
3. **Oppdatere valgregler** hvis nødvendig
4. **Generere curriculum.json** basert på blokkskjema_v2.yml
5. **Teste med widgets** for å se at fagtilbudet vises korrekt

---

## Dokumenter opprettet

1. **BLOKKSKJEMA_V2_FAGTILBUD_FRA_BILDE.md** - Renset fagtilbud fra bilde
2. **BLOKKSKJEMA_V2_FAGMATCHING.md** - Validering og matching av fag-ID
3. **BLOKKSKJEMA_V2_OPPDATERING.md** - Dette dokumentet

---

## Konklusjon

blokkskjema_v2.yml er nå oppdatert med faktisk fagtilbud fra Bergen Private Gymnas sitt blokkskjema. Alle fag er validert og matched med korrekte fag-ID og fagkoder. Blokkskjemaet er klart for testing og validering.
