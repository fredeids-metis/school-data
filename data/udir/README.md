# UDIR - Nasjonale data

Dette er **nasjonale data fra Utdanningsdirektoratet (UDIR)** som gjelder for alle videregående skoler i Norge.

## Struktur

```
udir/
├── metadata.yml              # Versjon, kilder, sist oppdatert
├── README.md                 # Denne filen
│
├── programomrader/           # Timefordeling per programområde
│   ├── studiespesialisering.yml
│   ├── musikk-dans-drama.yml
│   └── medier-kommunikasjon.yml
│
├── fag/                      # Fagdefinisjoner
│   ├── fellesfag/            # Norsk, Historie, etc.
│   ├── obligatoriske-programfag/
│   └── valgfrie-programfag/  # Realfag, språk, samfunnsfag
│
├── regler/                   # Valideringsregler
│   ├── eksklusjoner.yml      # Fag som ikke kan kombineres
│   ├── forutsetninger.yml    # Fag som krever andre fag
│   └── fordypning.yml        # Fordypningskrav per program
│
└── kilder/
    └── lk20/                 # Master-lister fra UDIR
        ├── fellesfag_lk20.txt
        ├── obligatoriske-programfag_lk20.txt
        └── valgfrie-programfag_lk20.txt
```

## Separasjon fra skolemapper

Denne mappen inneholder **kun nasjonale regler** som gjelder alle skoler:
- Timefordeling
- Fagdefinisjoner
- Valideringsregler (eksklusjoner, forutsetninger, fordypning)

**Skolespesifikke data** ligger i `data/skoler/`:
- Hvilke programområder skolen tilbyr
- Blokkskjema (hvilke fag i hvilke blokker)
- Skolelogo og kontaktinfo

## Kilder

All data er basert på offisielle dokumenter fra UDIR:
- [Vitnemålsregler 2025](https://www.udir.no/eksamen-og-prover/dokumentasjon/vitnemal-og-kompetansebevis/foring-vitnemal-kompetansebevis-vgs-25/)
- [Udir-1-2025](https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/udir-1-2025/)
- [GREP API](https://www.udir.no/om-udir/data/kl06-grep/)

---
*Sist oppdatert: 2025-12-05*
