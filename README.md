# School Data API

Multi-school curriculum data API for Norwegian VGS schools. Provides JSON API via GitHub Pages.

## 📊 API Endpoints

**Base URL:** `https://fredeids-metis.github.io/school-data/api/v1`

### Curriculum (shared)
- `GET /curriculum/all-programfag.json` - All programfag from UDIR

### School-specific
- `GET /schools/{school-id}/config.json` - School configuration
- `GET /schools/{school-id}/programfag.json` - Programfag offered by school
- `GET /schools/{school-id}/blokkskjema.json` - Block schedule structure
- `GET /schools/{school-id}/programomraader.json` - Program areas
- `GET /schools/{school-id}/full.json` - All data combined

### Schools
- `bergen-private-gymnas` - Bergen Private Gymnas

## 🚀 Quick Start

### Build API locally

```bash
npm install
npm run build
```

This generates JSON files in `docs/api/v1/`

### Fetch updated curriculum from UDIR

```bash
npm run fetch
```

This updates markdown files in `data/curriculum/programfag/`

## 📁 Directory Structure

```
school-data/
├── data/
│   ├── curriculum/              # Shared curriculum data (from UDIR)
│   │   └── programfag/          # 33 markdown files
│   └── schools/                 # School-specific configs
│       └── bergen-private-gymnas/
│           ├── school-config.yml
│           ├── tilbud.yml
│           ├── blokkskjema.yml
│           ├── programomraader.yml
│           └── assets/
│               ├── bilder/
│               └── dokumenter/
├── scripts/
│   ├── build-api.js             # Build JSON API
│   └── fetch-curriculum.sh      # Fetch from UDIR
└── docs/                        # GitHub Pages (auto-generated)
    └── api/v1/
```

## 🏫 Adding a New School

1. Create directory: `data/schools/{school-id}/`
2. Add `school-config.yml` (see example)
3. Add `tilbud.yml` (which programfag to offer)
4. Add `blokkskjema.yml` (optional)
5. Add `programomraader.yml` (optional)
6. Run `npm run build`
7. Push to GitHub

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
