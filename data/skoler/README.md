# Schools Data

Denne mappen inneholder data for individuelle videregående skoler.

## Struktur

Hver skole har sin egen mappe med følgende struktur:

```
skolenavn/
├── school-config.yml              # Skolekonfigurasjon og versjonsstyring
├── blokkskjema.yml                # Blokkskjema (valgfrie programfag)
├── tilbud.yml                     # Fagtilbud med metadata
├── assets/                        # Bilder og andre ressurser
└── dokumentasjon/                 # Valgfri dokumentasjon
```

## Skoler

### Bergen Private Gymnas

**Status**: Aktiv
**Programmer**: Studiespesialisering, Musikk dans og drama, Medier og kommunikasjon
**Blokkskjema**: Versjonsstyrt (v1 aktiv, v2 klar)

Se [bergen-private-gymnas/README.md](bergen-private-gymnas/README.md) for detaljer.

### Metis Videregående

**Status**: Placeholder (tom)
**Programmer**: TBD

---

## Legge til ny skole

1. Opprett ny mappe: `data/schools/skolenavn/`
2. Kopier `school-config.yml` fra eksisterende skole som mal
3. Opprett `blokkskjema.yml` og `tilbud.yml`
4. Kjør `npm run build` for å generere API
5. Commit og push for å deploye til GitHub Pages

---

## Versjonsstyring av blokkskjema

Fra og med 2025-11-20 støttes versjonsstyring av blokkskjema via `school-config.yml`.

**Eksempel**:
```yaml
blokkskjema:
  activeVersion: "v1"
  versions:
    v1: "blokkskjema.yml"
    v2: "blokkskjema_v2.yml"
```

For å bytte versjon: Endre `activeVersion`, kjør `npm run build`, commit og push.

Se [bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md](bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md) for detaljert guide.

---

**Sist oppdatert**: 2025-11-20
