# Oppfølging: Prosjektgjennomgang school-data

**Dato:** 2025-12-01
**Status:** Venter på svar fra bruker

---

## Opprinnelig forespørsel

> Hei Claude, kan du bruke @agent-project-lead og ta en grundig gjennomgang av hele school-data prosjektmappen?
>
> **MÅL:** Rydde, restrukturere og legge til rette for et komplett datasett. Skal legge inn ALLE fag som KAN tilbys, men i bedre grad definere hvilke fag skolene FAKTISK tilbyr, men ønsker å ha datagrunnlaget komplett. Skal også gå i gang med å legge til data på Metis VGS, så er viktig at strukturen er 100% solid.
>
> **KRITERIE:** Ingenting må endres slik at appene som henter data slutter å fungere.

---

## Gjennomført analyse - Hovedfunn

### Nåværende status
- Prosjektet er **velstrukturert** med god kildehenvisning til UDIR
- Fungerende build-pipeline og API-versjonering (2025-01)
- Bergen Private Gymnas er komplett
- **Metis VGS er kun placeholder-data** (kopiert fra BPG)

### Identifiserte problemer

1. **Ufullstendig fagkatalog**
   - Mangler: IT2, Geofag 1/2/X, Teknologi og forskningslære, S-matte, flere fremmedspråk-varianter

2. **Inkonsistente ID-er og filnavn**
   - Noen bruker komma (`Historie,_vg3.md`)
   - Andre ikke (`Biologi_1.md`)
   - ID-er matcher ikke alltid filnavn

3. **Duplikater**
   - `Matematikk_2P.md` finnes i både fellesfag/ og valgfrie-programfag/
   - `Spansk_I+II.md` finnes på to steder

4. **Ingen skille mellom "finnes nasjonalt" og "tilbys av skole"**
   - Gjør det vanskelig å legge til nye skoler
   - Uklart hva som er komplett fagkatalog

### Anbefalt handlingsplan

| Fase | Beskrivelse | Risiko |
|------|-------------|--------|
| 1 | Stabilisering - fiks duplikater, standardiser ID-er | Lav |
| 2 | Komplettering - hent alle fag fra UDIR | Moderat |
| 3 | Metis VGS - implementer med reelle data | Avhenger av input |
| 4 | Arkitekturoppgradering - skill fagkatalog fra skoletilbud | Høyere |

---

## Spørsmål som venter på svar

### 1. Metis VGS data
Har du reelle data for Metis VGS?
- Hvilke programmer tilbys?
- Hvilke fag tilbys?
- Blokkskjema/fagorganisering?
- Kontaktinfo og branding?

### 2. Omfang av fagkatalog
Skal fagkatalogen inkludere:
- **Alt:** ALLE norske VGS-fag (100+ fag)
- **Relevant:** Kun fag relevante for privatgymnastype skoler (studiespesialisering, MDD, MOK)

### 3. Fremtidige skoler
Er det planlagt flere skoler som skal legges til etter Metis VGS?

---

## Neste steg

Når du er tilbake, svar på spørsmålene over så kan vi:

1. Starte med fase 1 (stabilisering) umiddelbart - dette er trygt
2. Planlegge fase 2-3 basert på svarene dine
3. Vurdere om fase 4 (arkitekturoppgradering) er nødvendig nå eller kan vente

---

## Fullstendig rapport

Se chat-historikk for komplett rapport fra project-lead agenten med:
- Detaljert mappestruktur
- Datamodell-analyse
- Konkrete anbefalinger
- Risikovurdering for bakoverkompatibilitet
