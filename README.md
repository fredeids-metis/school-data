# School Data API

Multi-school curriculum data API for Norwegian VGS schools. Provides JSON API via GitHub Pages.

## 📊 API Endpoints

**Base URL:** `https://fredeids-metis.github.io/school-data/api/v1`

### Curriculum (shared)

**v2 API (RECOMMENDED):**
- `GET /curriculum/all.json` - All curriculum data (nested structure)
- `GET /curriculum/valgfrie-programfag.json` - Elective program subjects (33 fag)
- `GET /curriculum/obligatoriske-programfag.json` - Mandatory program subjects (16 fag)
- `GET /curriculum/fellesfag.json` - Common mandatory subjects (27+ fag)

**v1 API (DEPRECATED):**
- `GET /curriculum/all-programfag.json` - All programfag (flat structure)

### School-specific
- `GET /schools/{school-id}/config.json` - School configuration
- `GET /schools/{school-id}/tilbud.json` - Subjects offered by school (v2 structure)
- `GET /schools/{school-id}/blokkskjema.json` - Block schedule structure
- `GET /schools/{school-id}/full.json` - All data combined

### Schools
- `bergen-private-gymnas` - Bergen Private Gymnas (blokkskjema versjonsstyrt: v1 aktiv, v2 klar)

## 🚀 Quick Start

### Build API locally

```bash
npm install
npm run build
```

This generates JSON files in `docs/api/v1/`

### Fetch updated curriculum from UDIR

```bash
npm run fetch        # Fetches valgfrie programfag
npm run fetch:all    # Fetches all categories (fellesfag + obligatoriske + valgfrie)
```

This updates markdown files in:
- `data/curriculum/valgfrie-programfag/`
- `data/curriculum/obligatoriske-programfag/`
- `data/curriculum/fellesfag/`

## 📁 Directory Structure

```
school-data/
├── data/
│   ├── curriculum/                          # MASTER FILES - Shared curriculum data
│   │   ├── README.md                        # Comprehensive documentation
│   │   ├── REGLER.md                        # Validation rules for subject selection
│   │   ├── TIMEFORDELING.md                 # Time allocation per program
│   │   ├── OVERSIKT.md                      # Master overview of all subjects
│   │   ├── valgfrie-programfag_lk20.txt     # MASTER: 33 elective subjects
│   │   ├── obligatoriske-programfag_lk20.txt # MASTER: 16 mandatory program subjects
│   │   ├── fellesfag_lk20.txt               # MASTER: 27 common subjects
│   │   ├── valgfrie-programfag/             # Detailed curriculum (from UDIR)
│   │   ├── obligatoriske-programfag/        # MUS/MOK subjects (from UDIR)
│   │   └── fellesfag/                       # Common mandatory subjects (from UDIR)
│   └── schools/                             # School-specific configs
│       └── bergen-private-gymnas/
│           ├── school-config.yml            # School info (name, colors, programs, versjonsstyring)
│           ├── tilbud.yml                   # Subjects offered (v2 structure)
│           ├── blokkskjema.yml              # Block schedule v1 (LIVE)
│           ├── blokkskjema_v2.yml           # Block schedule v2 (eksperimentell)
│           ├── BLOKKSKJEMA_VERSJONSSTYRING.md  # Guide for å bytte versjon
│           └── assets/                      # School assets (images, etc.)
├── scripts/
│   ├── build-api.js                         # Build JSON API (v1 + v2)
│   ├── fetch-curriculum.sh                  # Fetch valgfrie programfag
│   └── fetch-curriculum-all.sh              # Fetch all categories from UDIR
└── docs/                                    # GitHub Pages (auto-generated)
    └── api/v1/
```

## 🏫 Adding a New School

1. Create directory: `data/schools/{school-id}/`
2. Add `school-config.yml` (school info, branding, contact, programs offered, versjonsstyring)
3. Add `tilbud.yml` (which subjects from master lists to offer - use v2 structure)
4. Add `blokkskjema.yml` (block schedule, validation rules, program areas)
5. Add assets folder with school images/documents
6. Run `npm run build`
7. Push to GitHub

**Reference files:**
- See [bergen-private-gymnas](data/schools/bergen-private-gymnas/) for example configs
- See [curriculum/README.md](data/curriculum/README.md) for subject categories and IDs
- See [bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md](data/schools/bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md) for blokkskjema versioning

## 🔄 Blokkskjema Versioning (NEW: 2025-11-20)

Schools can now have multiple versions of blokkskjema and switch between them via config.

**How it works:**
1. Define versions in `school-config.yml`:
   ```yaml
   blokkskjema:
     activeVersion: "v1"
     versions:
       v1: "blokkskjema.yml"
       v2: "blokkskjema_v2.yml"
   ```
2. Build script reads `activeVersion` and loads the correct file
3. To switch: change `activeVersion`, run `npm run build`, commit & push

**Benefits:**
- Easy A/B testing of different course structures
- Quick rollback if issues arise
- Multiple versions can coexist safely
- Admin-controlled, not user-facing

See [BLOKKSKJEMA_VERSJONSSTYRING.md](data/schools/bergen-private-gymnas/BLOKKSKJEMA_VERSJONSSTYRING.md) for complete guide.

## 📝 Master Files & Data Flow

### Master Files (3 categories)

**1. Valgfrie programfag** (`valgfrie-programfag_lk20.txt`)
- 33 elective subjects students can choose
- Categories: Matematikk, Naturfag, IT, Økonomi, Bedriftsledelse, Samfunnsfag, Språk, Musikk, Kunst

**2. Obligatoriske programfag** (`obligatoriske-programfag_lk20.txt`)
- 16 mandatory subjects for specific programs
- 10 subjects for Musikk, dans og drama (MUS/MDD codes)
- 6 subjects for Medier og kommunikasjon (MOK codes)

**3. Fellesfag** (`fellesfag_lk20.txt`)
- 27+ common mandatory subjects for all students
- Includes fremmedspråk variants (Spansk, Tysk, Fransk at different levels)
- Core subjects: Historie, Matematikk (1P, 2P), etc.

**Format:** `Fagnavn;Fagkode;Læreplankode`
**Example:** `Matematikk R1;REA3056;MAT03-02`

### Data Flow
1. Three master `.txt` files define all available subjects
2. `fetch-curriculum-all.sh` reads these files and fetches detailed curriculum from UDIR
3. Markdown files generated with frontmatter (id, title, type, program, etc.)
4. Schools reference subject IDs in `tilbud.yml` (v2 structure with categories)
5. `build-api.js` combines everything into JSON API (v1 + v2)

## 📚 Data Sources

- **UDIR Grep API**: https://data.udir.no/kl06/v201906
- **LK20 Curriculum**: Læreplan 2020 for videregående opplæring

## 🔄 Workflow

1. Data updated in `data/` (YAML or markdown)
2. Run `npm run build`
3. JSON API generated in `docs/api/v1/`
4. Commit and push
5. GitHub Pages serves API automatically

## 📄 License

MIT

## 👤 Maintainer

Fredrik (@fredeids-metis)
