# Oppryddingsplan - School-data migrering

**Dato:** 2025-12-02
**Status:** Venter på fullført migrering

## Bakgrunn

Studieplanlegger og fagkatalog skal bruke school-data som single source of truth.
Denne planen beskriver oppryddingen som skal gjøres ETTER at migreringen er verifisert.

---

## Fase 1: Umiddelbar opprydding (lav risiko)

### Studieplanlegger (`/Users/fredrik/Documents/studieplanlegger`)

**SLETT:**
```
/data/curriculum/master-lists/fellesfag_lk20.txt
/data/curriculum/master-lists/obligatoriske-programfag_lk20.txt
/data/curriculum/master-lists/valgfrie-programfag_lk20.txt
```
*Grunn: Kun brukt av fetch-script, ikke av build eller runtime*

**ARKIVER (flytt til /docs/archive/):**
```
/docs/ALTERNATIVE-BLOKKSKJEMA-ANALYSE.md
/docs/SESJON-2024-11-25-KATALOG-MODAL.md
/docs/PDF-EKSPORT-ANALYSE.md
/docs/UX-REVIEW-CATALOG-MODAL.md
```
*Grunn: Historiske sesjonsdokumenter, ikke aktiv dokumentasjon*

### Fagkatalog (`/Users/fredrik/Documents/fagkatalog`)

**OPPRETT:**
- `README.md` - Prosjektdokumentasjon
- `.gitignore` - Standard ignoreringer

*Grunn: Mangler helt, viktig for vedlikehold*

### School-data (`/Users/fredrik/Documents/school-data`)

**FLYTT til /docs/schools/bergen-private-gymnas/:**
```
/data/schools/bergen-private-gymnas/BLOKKSKJEMA_V2_FAGMATCHING.md
/data/schools/bergen-private-gymnas/BLOKKSKJEMA_V2_FAGTILBUD_FRA_BILDE.md
/data/schools/bergen-private-gymnas/BLOKKSKJEMA_V2_OPPDATERING.md
/data/schools/bergen-private-gymnas/BLOKKSKJEMA_V2_VALIDERING.md
/data/schools/bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md
```
*Grunn: Dokumentasjon bør ligge i /docs/, ikke blandet med data*

**ARKIVER (flytt til /docs/archive/):**
```
/MIGRATION_PLAN.md
/OPPFOLGING-2025-12-01.md
```
*Grunn: Historiske arbeidsdokumenter*

---

## Fase 2: Etter vellykket migrering (moderat risiko)

### Studieplanlegger - SLETT duplikater

**SLETT hele mapper:**
```
/data/curriculum/markdown/          # ~80 markdown-filer
/data/curriculum/regler.yml
/data/schools/bergen-private-gymnas/  # blokkskjema, timefordeling, etc.
/dist/api/                          # generert API (~850 KB)
```

**SLETT scripts:**
```
/scripts/build-api.cjs              # Ikke lenger nødvendig
/scripts/fetch-curriculum.sh        # Flyttes til school-data
```

**Estimert besparelse:** ~1.5 MB

### Studieplanlegger - OPPDATER

**package.json:**
```json
{
  "scripts": {
    "dev": "python3 -m http.server 8000",
    "test": "echo \"No tests configured\""
  }
}
```
*Fjern: build, fetch:all*

---

## Fase 3: Dokumentasjonsoppdatering

### Studieplanlegger README.md

Oppdater med:
- Arkitektur: Henter data fra school-data API
- Ingen lokal build nødvendig
- Link til school-data for dataendringer

### Fagkatalog README.md

Opprett med:
- Prosjektbeskrivelse
- API-kilde (school-data)
- Embedding-instruksjoner
- Filstruktur

### School-data README.md

Oppdater med:
- API-versjonstabell (v1, v2, 2025-01)
- Hvilke apper som bruker hvilken API
- Changelog-seksjon

---

## Verifiseringsliste

Før Fase 2 kan starte, må følgende være bekreftet:

- [ ] Studieplanlegger fungerer på bergenprivategymnas.no/planlegger
- [ ] Versjonsveksler (?admin=true) fungerer med alle 3 versjoner
- [ ] Fagkatalog fungerer på bergenprivategymnas.no/katalog
- [ ] Alle accordions i fagkatalog har innhold
- [ ] Bilder lastes korrekt
- [ ] Ingen console errors i browser

---

## Rollback-plan

Hvis noe går galt etter migrering:

1. **Studieplanlegger:** `git revert` på embed.html endringen
2. **School-data:** `git revert` på API-endringer
3. Vent på GitHub Pages redeploy (~2 min)
4. Verifiser at alt fungerer igjen

---

## Tidsestimat

| Fase | Tid | Risiko |
|------|-----|--------|
| Fase 1 | 15 min | Lav |
| Fase 2 | 30 min | Moderat |
| Fase 3 | 45 min | Lav |
| **Total** | **~1.5 timer** | |

---

## Notater

- Studieplanlegger har TILPASSET markdown-innhold som allerede er synkronisert til school-data
- Fagkatalog er allerede 100% migrert (bruker school-data API)
- School-data har 3 build-scripts som alle er i bruk (v1, v2, 2025-01)

---

*Denne planen ble generert 2025-12-02 og skal oppdateres etter hver fase.*
