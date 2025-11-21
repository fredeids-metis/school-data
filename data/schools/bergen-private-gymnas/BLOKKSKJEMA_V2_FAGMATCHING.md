# Blokkskjema v2 - Fagmatching og validering

Dette dokumentet matcher fagnavnene fra blokkskjema-bildet med fag-ID fra curriculum-data.

## Validering mot valgfrie-programfag_lk20.txt

| Fagnavn fra bilde | Fag-ID | Fagkode | Status | Merknad |
|-------------------|--------|---------|--------|---------|
| **MATEMATIKK** |
| Matematikk 2P | matematikk-2p | MAT1023 | ✅ | Fellesfag/Valgfritt |
| Matematikk R1 | matematikk-r1 | REA3056 | ✅ | Erstatter Mat 2P |
| Matematikk R2 | matematikk-r2 | REA3058 | ✅ | Krever R1 |
| **NATURFAG** |
| Biologi 1 | biologi-1 | REA3035 | ✅ | |
| Biologi 2 | biologi-2 | REA3036 | ✅ | |
| Kjemi 1 | kjemi-1 | REA3045 | ✅ | |
| Kjemi 2 | kjemi-2 | REA3046 | ✅ | Krever Kjemi 1 |
| Fysikk 1 | fysikk-1 | REA3038 | ✅ | |
| Fysikk 2 | fysikk-2 | REA3039 | ✅ | Krever Fysikk 1 |
| **ØKONOMI** |
| Økonomistyring | okonomistyring | SAM3068 | ✅ | |
| Økonomi og ledelse | okonomi-og-ledelse | SAM3070 | ✅ | |
| Samfunnsøkonomi 1 | samfunnsokonomi-1 | SAM3060 | ✅ | |
| Samfunnsøkonomi 2 | samfunnsokonomi-2 | SAM3061 | ✅ | |
| Markedsføring og ledelse 1 | markedsforing-og-ledelse-1 | SAM3045 | ✅ | |
| Markedsføring og ledelse 2 | markedsforing-og-ledelse-2 | SAM3046 | ✅ | Krever nivå 1 |
| Entreprenørskap og bedriftsutvikling 1 | entreprenorskap-og-bedriftsutvikling-1 | SAM3063 | ✅ | |
| Entreprenørskap og bedriftsutvikling 2 | entreprenorskap-og-bedriftsutvikling-2 | SAM3064 | ✅ | |
| **SAMFUNNSFAG** |
| Sosiologi og sosialantropologi | sosiologi-og-sosialantropologi | SAM3054 | ✅ | |
| Politikk og menneskerettigheter | politikk-og-menneskerettigheter | SAM3055 | ✅ | |
| Sosialkunnskap | sosialkunnskap | SAM3051 | ✅ | |
| Rettslaere 1 | rettslare-1 | SAM3057 | ✅ | |
| Rettslaere 2 | rettslare-2 | SAM3058 | ✅ | |
| Psykologi 1 | psykologi-1 | SAM3072 | ✅ | |
| Psykologi 2 | psykologi-2 | SAM3073 | ✅ | |
| **KUNST/MUSIKK** |
| Bilde | bilde | MOK3008 | ✅ | |
| Grafisk design | grafisk-design | MOK3010 | ✅ | |
| Musikk fordypning 1 | musikk-fordypning-1 | MUS3006 | ✅ | Kun Musikk-elever |
| Musikk fordypning 2 | musikk-fordypning-2 | MUS3008 | ✅ | Kun Musikk-elever |
| **SPRÅK** |
| Engelsk 1 | engelsk-1 | SPR3029 | ✅ | |
| Spansk I+II | spansk-i-ii-vg3 | FSP6226 | ✅ | Betinget obligatorisk |
| **FELLESFAG** |
| Historie vg3 | historie-vg3 | HIS1010 | ✅ | Alle programmer |

## Resultat

### ✅ Alle fag validert!

**Totalt fag fra bilde**: 30 unike fag
- **28 valgfrie programfag**: Alle funnet i valgfrie-programfag_lk20.txt
- **1 fremmedspråk**: Spansk I+II (FSP6226) - betinget obligatorisk
- **1 fellesfag**: Historie vg3 (HIS1010) - obligatorisk for alle VG3

### Fag-ID konvensjoner

Alle fag-ID følger kebab-case konvensjon:
- Små bokstaver
- Bindestrek mellom ord
- Æ, Ø, Å erstattes med ae, o, a

**Eksempler**:
- "Markedsføring og ledelse 1" → `markedsforing-og-ledelse-1`
- "Entreprenørskap og bedriftsutvikling 2" → `entreprenorskap-og-bedriftsutvikling-2`
- "Sosiologi og sosialantropologi" → `sosiologi-og-sosialantropologi`

---

## Fagoversikt per blokk (med fag-ID)

### BLOKK 1

**VG2 fag:**
- `matematikk-2p` (MAT1023)
- `matematikk-r1` (REA3056)
- `biologi-1` (REA3035)
- `okonomistyring` (SAM3068)
- `markedsforing-og-ledelse-1` (SAM3045)
- `sosiologi-og-sosialantropologi` (SAM3054)
- `rettslare-2` (SAM3058)
- `psykologi-1` (SAM3072)
- `bilde` (MOK3008)

**VG3 fag:**
- `matematikk-r2` (REA3058)
- `historie-vg3` (HIS1010) - OBLIGATORISK

---

### BLOKK 2

**VG2 fag:**
- `matematikk-2p` (MAT1023)
- `matematikk-r1` (REA3056)
- `kjemi-1` (REA3045)
- `entreprenorskap-og-bedriftsutvikling-1` (SAM3063)
- `politikk-og-menneskerettigheter` (SAM3055)
- `rettslare-1` (SAM3057)
- `grafisk-design` (MOK3010)

**VG3 fag:**
- `biologi-2` (REA3036)
- `markedsforing-og-ledelse-2` (SAM3046)
- `psykologi-2` (SAM3073)
- `musikk-fordypning-2` (MUS3008) - Kun Musikk
- `historie-vg3` (HIS1010) - OBLIGATORISK

---

### BLOKK 3

**VG2 fag:**
- `matematikk-2p` (MAT1023)
- `fysikk-1` (REA3038)
- `markedsforing-og-ledelse-1` (SAM3045)
- `sosialkunnskap` (SAM3051)
- `rettslare-1` (SAM3057)
- `musikk-fordypning-1` (MUS3006) - Kun Musikk
- `grafisk-design` (MOK3010)

**VG3 fag:**
- `fysikk-2` (REA3039)
- `entreprenorskap-og-bedriftsutvikling-2` (SAM3064)
- `psykologi-2` (SAM3073)
- `musikk-fordypning-2` (MUS3008) - Kun Musikk
- `spansk-i-ii-vg3` (FSP6226) - BETINGET OBLIGATORISK
- `historie-vg3` (HIS1010) - OBLIGATORISK

---

### BLOKK 4

**VG2 fag:**
- `matematikk-2p` (MAT1023)
- `fysikk-1` (REA3038)
- `biologi-1` (REA3035)
- `okonomi-og-ledelse` (SAM3070)
- `psykologi-1` (SAM3072)

**VG3 fag:**
- `kjemi-2` (REA3046)
- `markedsforing-og-ledelse-2` (SAM3046)
- `sosiologi-og-sosialantropologi` (SAM3054)
- `rettslare-2` (SAM3058)
- `engelsk-1` (SPR3029)
- `historie-vg3` (HIS1010) - OBLIGATORISK

---

## Spesielle fag

### 1. Matematikk 2P
- **Fag-ID**: `matematikk-2p`
- **Fagkode**: MAT1023
- **Type**: Både fellesfag OG valgfritt programfag
- **Tilgjengelig**: Alle 4 blokker (VG2)
- **Merknad**: Kan erstattes av Matematikk R1

### 2. Historie VG3
- **Fag-ID**: `historie-vg3`
- **Fagkode**: HIS1010
- **Type**: Fellesfag
- **Tilgjengelig**: Alle 4 blokker (VG3)
- **Merknad**: OBLIGATORISK for alle programmer, 113 timer

### 3. Spansk I+II VG3
- **Fag-ID**: `spansk-i-ii-vg3`
- **Fagkode**: FSP6226
- **Type**: Fremmedspråk (betinget obligatorisk)
- **Tilgjengelig**: Kun Blokk 3 (VG3)
- **Merknad**: Obligatorisk for elever uten fremmedspråk fra ungdomsskolen

### 4. Musikk fordypning 1 og 2
- **Fag-ID**: `musikk-fordypning-1` (MUS3006), `musikk-fordypning-2` (MUS3008)
- **Type**: Valgfritt programfag (kun for Musikk-elever)
- **Tilgjengelig**:
  - Nivå 1: Kun Blokk 3 (VG2)
  - Nivå 2: Blokk 2 OG Blokk 3 (VG3)

---

## Neste steg

✅ **Alle fag validert og matched med fag-ID**

⏭️ **Neste**: Oppdater blokkskjema_v2.yml med korrekt fagtilbud per blokk
