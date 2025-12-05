#!/usr/bin/env node

/**
 * Build API 2025-01 - Datobasert versjonering
 *
 * Output structure:
 * docs/api/2025-01/
 * ├── curriculum/
 * │   ├── fag.json           # Alle fag (for fagkatalog, bot)
 * │   └── regler.json        # Valideringsregler
 * └── skoler/
 *     ├── index.json         # Liste over skoler
 *     ├── bergen-private-gymnas/
 *     │   └── studieplanlegger.json
 *     └── metis-vgs/
 *         └── studieplanlegger.json
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { marked } = require('marked');

// Configuration
const API_VERSION = '2025-01';
const DATA_DIR = path.join(__dirname, '../data');
const UDIR_DIR = path.join(DATA_DIR, 'udir');
const CURRICULUM_DIR = path.join(UDIR_DIR, 'fag');  // New structure: data/udir/fag/
const SCHOOLS_DIR = path.join(DATA_DIR, 'skoler');  // Renamed from 'schools' to 'skoler'
const OUTPUT_DIR = path.join(__dirname, '../docs/api', API_VERSION);

// GitHub Pages base URL
const BASE_URL = `https://fredeids-metis.github.io/school-data/api/${API_VERSION}`;

console.log(`\n${'='.repeat(60)}`);
console.log(`  school-data API Build - Version ${API_VERSION}`);
console.log(`${'='.repeat(60)}\n`);

// Utility functions
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadYAML(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

function extractSection(markdown, sectionName) {
  const lines = markdown.split('\n');
  let inSection = false;
  const sectionLines = [];

  for (const line of lines) {
    if (line.startsWith(`## ${sectionName}`)) {
      inSection = true;
      continue;
    }
    if (inSection && line.startsWith('## ')) {
      break;
    }
    if (inSection && line.trim()) {
      sectionLines.push(line.trim());
    }
  }

  return sectionLines.join(' ');
}

function extractKjerneelementer(markdown) {
  const lines = markdown.split('\n');
  let inKjerneelementer = false;
  let currentElement = null;
  const elements = [];

  for (const line of lines) {
    if (line.startsWith('## Kjerneelementer')) {
      inKjerneelementer = true;
      continue;
    }
    if (inKjerneelementer && line.startsWith('## ')) {
      break;
    }
    if (inKjerneelementer) {
      if (line.startsWith('### ')) {
        if (currentElement) {
          elements.push(currentElement);
        }
        currentElement = {
          title: line.replace('### ', '').trim(),
          content: ''
        };
      } else if (currentElement && line.trim()) {
        currentElement.content += (currentElement.content ? ' ' : '') + line.trim();
      }
    }
  }
  if (currentElement) {
    elements.push(currentElement);
  }

  return elements;
}

function loadMarkdownFiles(directory, defaultType = 'programfag') {
  if (!fs.existsSync(directory)) {
    console.log(`  [!] Directory ${path.basename(directory)} does not exist`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.md') && f !== 'README.md');

  return files.map(file => {
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);

    return {
      id: frontmatter.id,
      title: frontmatter.title,
      shortTitle: frontmatter.shortTitle || frontmatter.title,
      fagkode: frontmatter.fagkode,
      lareplan: frontmatter.lareplan,
      type: frontmatter.type || defaultType,
      program: frontmatter.program || null,
      trinn: frontmatter.trinn || null,
      bilde: frontmatter.bilde || null,
      vimeo: frontmatter.vimeo || null,
      omFaget: extractSection(markdown, 'Om faget'),
      hvordanArbeiderMan: extractSection(markdown, 'Hvordan arbeider man i faget'),
      fagetsRelevans: extractSection(markdown, 'Fagets relevans'),
      kjerneelementer: extractKjerneelementer(markdown),
      beskrivelseHTML: marked(markdown.trim()),
      generert: frontmatter.generert
    };
  });
}

// Load all curriculum data
function loadCurriculumData() {
  console.log('Loading curriculum data...');

  const valgfrieProgramfag = loadMarkdownFiles(
    path.join(CURRICULUM_DIR, 'valgfrie-programfag'),
    'programfag'
  );
  console.log(`  [+] ${valgfrieProgramfag.length} valgfrie programfag`);

  const obligatoriskeProgramfag = loadMarkdownFiles(
    path.join(CURRICULUM_DIR, 'obligatoriske-programfag'),
    'obligatorisk-programfag'
  );
  console.log(`  [+] ${obligatoriskeProgramfag.length} obligatoriske programfag`);

  const fellesfag = loadMarkdownFiles(
    path.join(CURRICULUM_DIR, 'fellesfag'),
    'fellesfag'
  );
  console.log(`  [+] ${fellesfag.length} fellesfag`);

  const allFag = [...valgfrieProgramfag, ...obligatoriskeProgramfag, ...fellesfag];

  // Build lareplan mapping for related subjects
  const lareplanMapping = new Map();
  allFag.forEach(fag => {
    if (fag.lareplan) {
      if (!lareplanMapping.has(fag.lareplan)) {
        lareplanMapping.set(fag.lareplan, []);
      }
      lareplanMapping.get(fag.lareplan).push(fag.title);
    }
  });

  // Add related subjects
  allFag.forEach(fag => {
    if (fag.lareplan && lareplanMapping.has(fag.lareplan)) {
      fag.related = lareplanMapping.get(fag.lareplan).filter(title => title !== fag.title);
    } else {
      fag.related = [];
    }
  });

  return { valgfrieProgramfag, obligatoriskeProgramfag, fellesfag, allFag };
}

// Build curriculum/fag.json
function buildFagJSON(curriculumData) {
  console.log('\nBuilding curriculum/fag.json...');

  const outputDir = path.join(OUTPUT_DIR, 'curriculum');
  ensureDir(outputDir);

  const output = {
    metadata: {
      version: API_VERSION,
      generatedAt: new Date().toISOString(),
      description: 'Alle fag for videregaende opplaring'
    },
    valgfrieProgramfag: curriculumData.valgfrieProgramfag,
    obligatoriskeProgramfag: curriculumData.obligatoriskeProgramfag,
    fellesfag: curriculumData.fellesfag
  };

  fs.writeFileSync(
    path.join(outputDir, 'fag.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`  [+] Created fag.json (${curriculumData.allFag.length} fag)`);
}

// Build curriculum/regler.json
function buildReglerJSON() {
  console.log('Building curriculum/regler.json...');

  const outputDir = path.join(OUTPUT_DIR, 'curriculum');
  ensureDir(outputDir);

  // Load regler from new UDIR structure (split files)
  const eksklusjoner = loadYAML(path.join(UDIR_DIR, 'regler', 'eksklusjoner.yml'));
  const forutsetninger = loadYAML(path.join(UDIR_DIR, 'regler', 'forutsetninger.yml'));
  const fordypning = loadYAML(path.join(UDIR_DIR, 'regler', 'fordypning.yml'));

  const regler = {
    eksklusjoner: eksklusjoner?.eksklusjoner || [],
    forutsetninger: forutsetninger?.forutsetninger || [],
    fordypning: fordypning?.fordypning || {},
    fagomrader: fordypning?.fagomrader || {},
    spesialregler: fordypning?.spesialregler || {}
  };

  if (!eksklusjoner && !forutsetninger && !fordypning) {
    console.log('  [!] No regler found in udir/regler/, creating minimal regler.json');
  }

  const output = {
    metadata: {
      version: API_VERSION,
      generatedAt: new Date().toISOString(),
      description: 'Valideringsregler for curriculum'
    },
    ...regler
  };

  fs.writeFileSync(
    path.join(outputDir, 'regler.json'),
    JSON.stringify(output, null, 2)
  );

  console.log('  [+] Created regler.json');
}

// Build skoler/index.json
function buildSkolerIndex() {
  console.log('\nBuilding skoler/index.json...');

  const outputDir = path.join(OUTPUT_DIR, 'skoler');
  ensureDir(outputDir);

  const schools = fs.readdirSync(SCHOOLS_DIR).filter(f => {
    const schoolDir = path.join(SCHOOLS_DIR, f);
    return fs.statSync(schoolDir).isDirectory() &&
           (fs.existsSync(path.join(schoolDir, 'school-config.yml')) ||
            fs.existsSync(path.join(schoolDir, 'config.yml')));
  });

  const skoleList = schools.map(skoleId => {
    const config = loadYAML(path.join(SCHOOLS_DIR, skoleId, 'school-config.yml')) ||
                   loadYAML(path.join(SCHOOLS_DIR, skoleId, 'config.yml'));
    return {
      id: skoleId,
      name: config?.school?.name || skoleId,
      shortName: config?.school?.shortName || skoleId,
      apiUrl: `${BASE_URL}/skoler/${skoleId}/studieplanlegger.json`
    };
  });

  const output = {
    metadata: {
      version: API_VERSION,
      generatedAt: new Date().toISOString(),
      description: 'Liste over skoler med API-tilgang'
    },
    skoler: skoleList
  };

  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`  [+] Created index.json (${schools.length} skoler)`);

  return schools;
}

// Build studieplanlegger.json for a school
function buildStudieplanleggerJSON(skoleId, curriculumData) {
  console.log(`\nBuilding ${skoleId}/studieplanlegger.json...`);

  const skoleDir = path.join(SCHOOLS_DIR, skoleId);
  const outputDir = path.join(OUTPUT_DIR, 'skoler', skoleId);
  ensureDir(outputDir);

  // Load school config
  const config = loadYAML(path.join(skoleDir, 'school-config.yml')) ||
                 loadYAML(path.join(skoleDir, 'config.yml'));

  if (!config) {
    console.log(`  [!] No config found for ${skoleId}, skipping`);
    return;
  }

  // Load blokkskjema from new structure (blokkskjema/ folder)
  let blokkskjemaFile = null;
  if (config?.blokkskjema?.activeVersion) {
    const activeVersion = config.blokkskjema.activeVersion;
    blokkskjemaFile = path.join(skoleDir, 'blokkskjema', `${activeVersion}.yml`);
  }
  const blokkskjema = loadYAML(blokkskjemaFile) ||
                      loadYAML(path.join(skoleDir, 'blokkskjema', '26-27_flex.yml')) ||
                      loadYAML(path.join(skoleDir, 'blokkskjema', '26-27_standard.yml'));

  if (!blokkskjema) {
    console.log(`  [!] No blokkskjema found for ${skoleId}, skipping`);
    return;
  }

  // Load timefordeling from UDIR (now centralized)
  const timefordeling = loadYAML(path.join(UDIR_DIR, 'programomrader', 'studiespesialisering.yml'));

  // Load tilbud for kategori mapping
  const tilbud = loadYAML(path.join(skoleDir, 'tilbud.yml'));

  // Build kategori map
  const kategoriMap = new Map();
  if (tilbud) {
    ['valgfrieProgramfag', 'programfag', 'obligatoriskeProgramfag', 'fellesfag'].forEach(key => {
      if (tilbud[key]) {
        tilbud[key].forEach(fag => {
          if (fag.kategori) {
            kategoriMap.set(fag.fagId, fag.kategori);
          }
        });
      }
    });
  }

  // Build curriculum lookup
  const curriculumMap = new Map();
  curriculumData.allFag.forEach(fag => {
    curriculumMap.set(fag.id, fag);
  });

  // Enrich blokkskjema
  const enrichedBlokkskjema = JSON.parse(JSON.stringify(blokkskjema));

  if (enrichedBlokkskjema.blokker) {
    Object.keys(enrichedBlokkskjema.blokker).forEach(blokkKey => {
      const blokk = enrichedBlokkskjema.blokker[blokkKey];
      if (blokk.fag && Array.isArray(blokk.fag)) {
        blokk.fag = blokk.fag.map(fag => {
          const curriculum = curriculumMap.get(fag.id);
          return {
            ...fag,
            kategori: kategoriMap.get(fag.id) || null,
            ...(curriculum && {
              title: curriculum.title,
              fagkode: curriculum.fagkode,
              lareplan: curriculum.lareplan,
              omFaget: curriculum.omFaget
            })
          };
        });
      }
    });
  }

  const output = {
    metadata: {
      version: API_VERSION,
      generatedAt: new Date().toISOString(),
      school: skoleId,
      description: 'Komplett data for Studieplanlegger widget'
    },

    school: {
      id: config.school?.id || skoleId,
      name: config.school?.name || skoleId,
      shortName: config.school?.shortName || skoleId,
      programs: config.school?.programs || []
    },

    blokkskjema: {
      versjon: enrichedBlokkskjema.versjon,
      struktur: enrichedBlokkskjema.struktur,
      blokker: enrichedBlokkskjema.blokker
    },

    fellesfag: timefordeling?.fellesfag || {},
    fellesProgramfag: timefordeling?.fellesProgramfag || {},
    vg1Valg: timefordeling?.vg1Valg || {},

    valgregler: blokkskjema.valgregler || {},
    regler: blokkskjema.regler || {},
    timevalidering: blokkskjema.timevalidering || {},

    curriculum: {
      valgfrieProgramfag: curriculumData.valgfrieProgramfag.map(f => ({
        id: f.id,
        title: f.title,
        shortTitle: f.shortTitle,
        fagkode: f.fagkode,
        lareplan: f.lareplan,
        bilde: f.bilde,
        vimeo: f.vimeo,
        omFaget: f.omFaget,
        hvordanArbeiderMan: f.hvordanArbeiderMan,
        fagetsRelevans: f.fagetsRelevans,
        kjerneelementer: f.kjerneelementer,
        beskrivelseHTML: f.beskrivelseHTML,
        related: f.related
      })),
      obligatoriskeProgramfag: curriculumData.obligatoriskeProgramfag.map(f => ({
        id: f.id,
        title: f.title,
        shortTitle: f.shortTitle,
        fagkode: f.fagkode,
        lareplan: f.lareplan,
        program: f.program,
        bilde: f.bilde,
        vimeo: f.vimeo,
        omFaget: f.omFaget,
        hvordanArbeiderMan: f.hvordanArbeiderMan,
        fagetsRelevans: f.fagetsRelevans,
        kjerneelementer: f.kjerneelementer,
        beskrivelseHTML: f.beskrivelseHTML
      })),
      fellesfag: curriculumData.fellesfag.map(f => ({
        id: f.id,
        title: f.title,
        shortTitle: f.shortTitle,
        fagkode: f.fagkode,
        lareplan: f.lareplan,
        trinn: f.trinn,
        bilde: f.bilde,
        vimeo: f.vimeo,
        omFaget: f.omFaget,
        hvordanArbeiderMan: f.hvordanArbeiderMan,
        fagetsRelevans: f.fagetsRelevans,
        kjerneelementer: f.kjerneelementer,
        beskrivelseHTML: f.beskrivelseHTML
      }))
    }
  };

  fs.writeFileSync(
    path.join(outputDir, 'studieplanlegger.json'),
    JSON.stringify(output, null, 2)
  );

  const blokkCount = Object.keys(enrichedBlokkskjema.blokker || {}).length;
  const fagCount = Object.values(enrichedBlokkskjema.blokker || {})
    .reduce((sum, blokk) => sum + (blokk.fag?.length || 0), 0);

  console.log(`  [+] Created studieplanlegger.json`);
  console.log(`      ${blokkCount} blokker, ${fagCount} fag-oppforinger`);
}

// Build tilbudt-fag.json for a school (filtered curriculum based on blokkskjema)
function buildTilbudteFagJSON(skoleId, curriculumData) {
  console.log(`Building ${skoleId}/tilbudt-fag.json...`);

  const skoleDir = path.join(SCHOOLS_DIR, skoleId);
  const outputDir = path.join(OUTPUT_DIR, 'skoler', skoleId);
  ensureDir(outputDir);

  // Load school config to get active blokkskjema version
  const config = loadYAML(path.join(skoleDir, 'school-config.yml')) ||
                 loadYAML(path.join(skoleDir, 'config.yml'));

  // Determine which blokkskjema file to use (new folder structure)
  let blokkskjemaFile = null;
  if (config?.blokkskjema?.activeVersion) {
    const activeVersion = config.blokkskjema.activeVersion;
    blokkskjemaFile = path.join(skoleDir, 'blokkskjema', `${activeVersion}.yml`);
  }

  const blokkskjema = loadYAML(blokkskjemaFile) ||
                      loadYAML(path.join(skoleDir, 'blokkskjema', '26-27_flex.yml')) ||
                      loadYAML(path.join(skoleDir, 'blokkskjema', '26-27_standard.yml'));

  if (!blokkskjema) {
    console.log(`  [!] No blokkskjema found for ${skoleId}, skipping tilbudt-fag`);
    return;
  }

  // Extract unique fag IDs from blokkskjema
  const tilbudteFagIds = new Set();
  if (blokkskjema.blokker) {
    Object.values(blokkskjema.blokker).forEach(blokk => {
      if (blokk.fag && Array.isArray(blokk.fag)) {
        blokk.fag.forEach(fag => tilbudteFagIds.add(fag.id));
      }
    });
  }

  // Build curriculum lookup
  const curriculumMap = new Map();
  curriculumData.valgfrieProgramfag.forEach(fag => curriculumMap.set(fag.id, fag));

  // Create filtered curriculum with full data
  const tilbudteFag = Array.from(tilbudteFagIds)
    .map(id => curriculumMap.get(id))
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, 'nb'));

  // Log any missing fag (in blokkskjema but not in curriculum)
  const missingFag = Array.from(tilbudteFagIds).filter(id => !curriculumMap.has(id));
  if (missingFag.length > 0) {
    console.log(`  [!] Warning: ${missingFag.length} fag in blokkskjema not found in curriculum:`);
    missingFag.forEach(id => console.log(`      - ${id}`));
  }

  const output = {
    metadata: {
      version: API_VERSION,
      generatedAt: new Date().toISOString(),
      school: skoleId,
      blokkskjemaVersion: config?.blokkskjema?.activeVersion || 'default',
      count: tilbudteFag.length,
      description: 'Fag tilbudt ved skolen basert på aktivt blokkskjema'
    },
    valgfrieProgramfag: tilbudteFag
  };

  fs.writeFileSync(
    path.join(outputDir, 'tilbudt-fag.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`  [+] Created tilbudt-fag.json (${tilbudteFag.length} fag fra blokkskjema)`);
}

// Main build
function build() {
  ensureDir(OUTPUT_DIR);

  // Load curriculum
  const curriculumData = loadCurriculumData();

  // Build curriculum endpoints
  buildFagJSON(curriculumData);
  buildReglerJSON();

  // Build school endpoints
  const schools = buildSkolerIndex();

  schools.forEach(skoleId => {
    buildStudieplanleggerJSON(skoleId, curriculumData);
    buildTilbudteFagJSON(skoleId, curriculumData);
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('  Build complete!');
  console.log(`${'='.repeat(60)}`);
  console.log(`\nAPI available at: ${BASE_URL}/`);
  console.log('\nEndpoints:');
  console.log(`  ${BASE_URL}/curriculum/fag.json`);
  console.log(`  ${BASE_URL}/curriculum/regler.json`);
  console.log(`  ${BASE_URL}/skoler/index.json`);
  schools.forEach(skoleId => {
    console.log(`  ${BASE_URL}/skoler/${skoleId}/studieplanlegger.json`);
    console.log(`  ${BASE_URL}/skoler/${skoleId}/tilbudt-fag.json`);
  });
  console.log('');
}

try {
  build();
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
