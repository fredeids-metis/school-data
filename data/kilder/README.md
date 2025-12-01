# Kilder - Offisielle dokumenter og datagrunnlag

Dette direktoryet inneholder metadata og referanser til alle offisielle kilder som school-data API er basert på.

## Kildehierarki

Dataene i school-data er strukturert etter fire autoritetsnivåer:

### Nivå 1: Lovverk (kan ikke endres)
- **Privatskoleforskriften** - Forskrift til privatskolelova
- Primærkilde for private videregående skoler

### Nivå 2: UDIR Rundskriv (offisielle tolkninger)
- **Udir-1-2025** - Fag- og timefordeling
- **Vitnemålsregler 2025** - Føring av vitnemål og kompetansebevis

### Nivå 3: UDIR Tekniske data (fra API)
- **Grep API** - Fagkoder, kompetansemål, læreplaner
- Hentes automatisk fra data.udir.no

### Nivå 4: Lokal skoledata (kan endres av skole)
- Fagbeskrivelser: "Fagets relevans", "Hvordan arbeider man i faget"
- Bilder og videoer
- Skole-spesifikke konfigurasjoner

## Mappestruktur

```
kilder/
├── README.md                      # Denne filen
├── versjon.yml                    # Sentralt kilderegister
├── udir-1-2025/
│   ├── metadata.yml               # Versjon, URL, dato
│   └── utdrag.md                  # Relevante seksjoner
├── vitnemalsregler-2025/
│   ├── metadata.yml
│   └── utdrag.md
├── privatskoleforskriften/
│   ├── metadata.yml
│   └── utdrag.md
└── grep-api/
    ├── metadata.yml
    └── fagkoder.md                # Oversikt over brukte fagkoder
```

## Hvordan bruke kildehenvisninger

Alle regler og data i school-data har en `kilde`-referanse som peker til dokumentene her:

```yaml
# Eksempel fra regler.yml
eksklusjoner:
  - id: math-s-r-conflict
    kilde:
      dokument: vitnemalsregler-2025
      seksjon: "3.8"
      url: "https://www.udir.no/..."
```

## Oppdateringsrutine

1. UDIR publiserer nye rundskriv årlig (vanligvis august)
2. Sjekk `versjon.yml` for sist verifiserte dato
3. Oppdater `metadata.yml` og `utdrag.md` ved endringer
4. Oppdater `regler.yml` hvis regler er endret

## Viktig

**IKKE rediger data direkte i curriculum-filer basert på UDIR-kilder.**

Endringer skal gjøres i:
1. `regler.yml` - for valideringsregler
2. `kilder/` - for kildehenvisninger
3. Bruk `npm run fetch` for å oppdatere fagdata fra Grep API
