#!/usr/bin/env node

/**
 * Build API v2 - Generates JSON API for Studieplanlegger
 *
 * This is a SEPARATE build script that does NOT touch v1 API.
 *
 * FEATURES:
 * - Multi-version blokkskjema support (reads from school-config.yml)
 * - Full markdown section extraction (omFaget, hvordanArbeiderMan, fagetsRelevans, kjerneelementer)
 * - Curriculum enrichment with related subjects
 *
 * Output structure:
 * docs/api/v2/
 * └── schools/
 *     └── {school-id}/
 *         └── studieplanlegger.json   # Everything in one endpoint
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { marked } = require('marked');

// Paths - Updated for new structure
const DATA_DIR = path.join(__dirname, '../data');
const UDIR_DIR = path.join(DATA_DIR, 'udir');
const CURRICULUM_DIR = path.join(UDIR_DIR, 'fag');  // New: data/udir/fag/
const VALGFRIE_PROGRAMFAG_DIR = path.join(CURRICULUM_DIR, 'valgfrie-programfag');
const OBLIGATORISKE_PROGRAMFAG_DIR = path.join(CURRICULUM_DIR, 'obligatoriske-programfag');
const FELLESFAG_DIR = path.join(CURRICULUM_DIR, 'fellesfag');
const SCHOOLS_DIR = path.join(DATA_DIR, 'skoler');  // Renamed from 'schools' to 'skoler'
const OUTPUT_DIR = path.join(__dirname, '../docs/api/v2');

// GitHub Pages base URL
const GITHUB_USER = 'fredeids-metis';
const REPO_NAME = 'school-data';
const BASE_URL = `https://${GITHUB_USER}.github.io/${REPO_NAME}/api/v2`;

/**
 * Format a fag ID to a readable title (fallback when curriculum data missing)
 * E.g., "norsk-vg1" -> "Norsk VG1", "matematikk-1p" -> "Matematikk 1P"
 */
function formatFagId(id) {
  if (!id) return '';
  return id
    .split('-')
    .map(part => {
      // Handle special cases like "vg1", "vg2", "vg3", "1p", "1t", "2p"
      if (/^vg\d$/.test(part)) return part.toUpperCase();
      if (/^\d[a-z]$/.test(part)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

console.log('🚀 Building API v2 (Studieplanlegger) with multi-version support...\n');

// Create output directories
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Extract plain text from markdown section "Om faget"
function extractOmFaget(markdown) {
  const lines = markdown.split('\n');
  let inOmFaget = false;
  const omFagetLines = [];

  for (const line of lines) {
    if (line.startsWith('## Om faget')) {
      inOmFaget = true;
      continue;
    }
    if (inOmFaget && line.startsWith('##')) {
      break;
    }
    if (inOmFaget && line.trim()) {
      omFagetLines.push(line.trim());
    }
  }

  return omFagetLines.join(' ');
}

// Extract a named section from markdown
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
    if (inSection) {
      if (line.trim() && !line.startsWith('<!--')) {
        sectionLines.push(line);
      }
    }
  }

  const content = sectionLines.join('\n').trim();
  return content || null;
}

// Remove a section from markdown (used to exclude "Om faget - fra læreplan" from HTML)
function removeSection(markdown, sectionName) {
  const lines = markdown.split('\n');
  const result = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith(`## ${sectionName}`)) {
      inSection = true;
      continue;
    }
    if (inSection && line.startsWith('## ')) {
      inSection = false;
    }
    if (!inSection) {
      result.push(line);
    }
  }

  return result.join('\n');
}

// Extract kjerneelementer as structured array
function extractKjerneelementer(markdown) {
  const lines = markdown.split('\n');
  let inKjerneelementer = false;
  let currentElement = null;
  const elementer = [];

  for (const line of lines) {
    if (line.startsWith('## Kjerneelementer')) {
      inKjerneelementer = true;
      continue;
    }
    if (inKjerneelementer && line.startsWith('## ') && !line.startsWith('### ')) {
      break;
    }
    if (inKjerneelementer && line.startsWith('### ')) {
      if (currentElement) elementer.push(currentElement);
      currentElement = { title: line.replace('### ', '').trim(), content: '' };
    } else if (inKjerneelementer && currentElement && line.trim() && !line.startsWith('<!--')) {
      currentElement.content += (currentElement.content ? '\n' : '') + line.trim();
    }
  }
  if (currentElement) elementer.push(currentElement);

  return elementer.length > 0 ? elementer : null;
}

// Read markdown files from a directory
function loadMarkdownFiles(directory, defaultType = 'programfag') {
  if (!fs.existsSync(directory)) {
    console.log(`  ⚠️  Directory ${directory} does not exist, skipping...`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);

    return {
      id: frontmatter.id,
      title: frontmatter.title,
      shortTitle: frontmatter.shortTitle || null,
      fagkode: frontmatter.fagkode,
      lareplan: frontmatter.lareplan,
      type: frontmatter.type || defaultType,
      program: frontmatter.program || null,
      obligatorisk: frontmatter.obligatorisk || false,
      erstatbar: frontmatter.erstatbar || false,
      trinn: frontmatter.trinn || null,
      bilde: frontmatter.bilde || null,
      vimeo: frontmatter.vimeo || null,
      beskrivelse: removeSection(markdown, 'Om faget - fra læreplan').trim(),
      beskrivelseHTML: marked(removeSection(markdown, 'Om faget - fra læreplan').trim()),
      omFaget: extractOmFaget(markdown),
      hvordanArbeiderMan: extractSection(markdown, 'Hvordan arbeider man i faget'),
      fagetsRelevans: extractSection(markdown, 'Fagets relevans'),
      kjerneelementer: extractKjerneelementer(markdown),
      generert: frontmatter.generert
    };
  });
}

// Load all curriculum data
function loadCurriculumData() {
  console.log('📚 Loading curriculum data...');

  const valgfrieProgramfag = loadMarkdownFiles(VALGFRIE_PROGRAMFAG_DIR, 'programfag');
  console.log(`  ✅ Loaded ${valgfrieProgramfag.length} valgfrie programfag`);

  const obligatoriskeProgramfag = loadMarkdownFiles(OBLIGATORISKE_PROGRAMFAG_DIR, 'obligatorisk-programfag');
  console.log(`  ✅ Loaded ${obligatoriskeProgramfag.length} obligatoriske programfag`);

  const fellesfag = loadMarkdownFiles(FELLESFAG_DIR, 'fellesfag');
  console.log(`  ✅ Loaded ${fellesfag.length} fellesfag`);

  // Combine all for lookups
  const allFag = [...valgfrieProgramfag, ...obligatoriskeProgramfag, ...fellesfag];

  // Build læreplan mapping for related subjects
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
      const related = lareplanMapping.get(fag.lareplan).filter(title => title !== fag.title);
      fag.related = related.length > 0 ? related : [];
    } else {
      fag.related = [];
    }
  });

  return { valgfrieProgramfag, obligatoriskeProgramfag, fellesfag, allFag };
}

// Load YAML config file
function loadYAML(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

/**
 * Enrich a blokkskjema with curriculum data
 * @param {Object} blokkskjema - Raw blokkskjema data
 * @param {Map} curriculumMap - Map of fag id to curriculum data
 * @param {Map} kategoriMap - Map of fag id to kategori
 * @returns {Object} Enriched blokkskjema
 */
function enrichBlokkskjema(blokkskjema, curriculumMap, kategoriMap) {
  const enriched = JSON.parse(JSON.stringify(blokkskjema));

  if (enriched.blokker) {
    Object.keys(enriched.blokker).forEach(blokkKey => {
      const blokk = enriched.blokker[blokkKey];
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

  return enriched;
}

// Build studieplanlegger.json for a school
function buildStudieplanleggerAPI(schoolId, curriculumData) {
  console.log(`\n🏫 Building Studieplanlegger API for: ${schoolId}...`);

  const { valgfrieProgramfag, obligatoriskeProgramfag, fellesfag, allFag } = curriculumData;

  const schoolDataDir = path.join(SCHOOLS_DIR, schoolId);
  const schoolOutputDir = path.join(OUTPUT_DIR, 'schools', schoolId);
  ensureDir(schoolOutputDir);

  // Load school config
  const schoolConfig = loadYAML(path.join(schoolDataDir, 'school-config.yml'));
  if (!schoolConfig) {
    console.log(`  ⚠️  No school-config.yml found for ${schoolId}, skipping...`);
    return;
  }

  // Get blokkskjema versions from school config (new folder structure)
  const blokkskjemaConfig = schoolConfig.blokkskjema || {};
  const availableVersions = blokkskjemaConfig.versions || { '26-27_flex': 'blokkskjema/26-27_flex.yml' };
  let activeVersion = blokkskjemaConfig.activeVersion || '26-27_flex';

  // Validate that activeVersion exists in availableVersions
  if (!availableVersions[activeVersion]) {
    const availableKeys = Object.keys(availableVersions);
    console.log(`  ⚠️  activeVersion "${activeVersion}" not found. Available: ${availableKeys.join(', ')}`);

    if (availableKeys.length > 0) {
      activeVersion = availableKeys[0];
      console.log(`  ⚠️  Falling back to: ${activeVersion}`);
    } else {
      console.log(`  ⚠️  No blokkskjema versions defined, skipping...`);
      return;
    }
  }

  console.log(`  📋 Active blokkskjema version: ${activeVersion}`);
  console.log(`  📋 Available versions: ${Object.keys(availableVersions).join(', ')}`);

  // Load all available blokkskjema versions
  const blokkskjemaVersions = {};
  let primaryBlokkskjema = null;

  for (const [versionId, filename] of Object.entries(availableVersions)) {
    const blokkskjemaPath = path.join(schoolDataDir, filename);
    const blokkskjema = loadYAML(blokkskjemaPath);

    if (blokkskjema) {
      blokkskjemaVersions[versionId] = blokkskjema;
      console.log(`  ✅ Loaded ${filename} as "${versionId}"`);

      if (versionId === activeVersion) {
        primaryBlokkskjema = blokkskjema;
      }
    } else {
      console.log(`  ⚠️  Could not load ${filename} for version "${versionId}"`);
    }
  }

  if (Object.keys(blokkskjemaVersions).length === 0) {
    console.log(`  ⚠️  No blokkskjema files found, skipping...`);
    return;
  }

  if (!primaryBlokkskjema) {
    const firstVersion = Object.keys(blokkskjemaVersions)[0];
    primaryBlokkskjema = blokkskjemaVersions[firstVersion];
    activeVersion = firstVersion;
    console.log(`  ⚠️  Active version not found, using "${firstVersion}"`);
  }

  // Load ALL programområder from UDIR
  const programomraderDir = path.join(UDIR_DIR, 'programomrader');
  const programomrader = {};

  if (fs.existsSync(programomraderDir)) {
    const programFiles = fs.readdirSync(programomraderDir).filter(f => f.endsWith('.yml'));
    for (const file of programFiles) {
      const programId = file.replace('.yml', '');
      const programData = loadYAML(path.join(programomraderDir, file));
      if (programData) {
        programomrader[programId] = programData;
      }
    }
    console.log(`  📋 Loaded ${Object.keys(programomrader).length} programområder from UDIR`);
  }

  // Use studiespesialisering as primary for backwards compatibility
  const timefordeling = programomrader['studiespesialisering'] || {};

  // Load tilbud for enrichment
  const tilbud = loadYAML(path.join(schoolDataDir, 'tilbud.yml'));

  // Build kategori lookup map
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

  // Create curriculum lookup map
  const curriculumMap = new Map();
  allFag.forEach(fag => {
    curriculumMap.set(fag.id, fag);
  });

  // Enrich all blokkskjema versions
  const enrichedVersions = {};
  for (const [versionId, blokkskjema] of Object.entries(blokkskjemaVersions)) {
    enrichedVersions[versionId] = enrichBlokkskjema(blokkskjema, curriculumMap, kategoriMap);
  }

  // Get enriched primary for valgregler etc.
  const enrichedPrimary = enrichedVersions[activeVersion];

  // Build the complete studieplanlegger.json
  const studieplanleggerOutput = {
    metadata: {
      version: 'v2',
      generatedAt: new Date().toISOString(),
      school: schoolId,
      description: 'Complete data for Studieplanlegger widget',
      blokkskjemaVersions: Object.keys(enrichedVersions)
    },

    // School configuration
    school: {
      id: schoolConfig.school.id,
      name: schoolConfig.school.name,
      shortName: schoolConfig.school.shortName,
      programs: schoolConfig.school.programs
    },

    // Blokkskjema structure with multi-version support
    blokkskjema: {
      activeVersion: activeVersion,
      descriptions: blokkskjemaConfig.descriptions || {},
      versions: Object.fromEntries(
        Object.entries(enrichedVersions).map(([versionId, enriched]) => [
          versionId,
          {
            versjon: enriched.versjon,
            struktur: enriched.struktur,
            blokker: enriched.blokker
          }
        ])
      )
    },

    // Fellesfag per trinn per programområde (enriched with titles from curriculum)
    fellesfag: (() => {
      const result = {};
      // Build fellesfag for each program the school offers
      const schoolPrograms = (schoolConfig.school.programs || []).map(p => p.id);

      for (const programId of schoolPrograms) {
        const programData = programomrader[programId];
        if (!programData?.fellesfag) continue;

        result[programId] = {};
        for (const [trinn, trinnData] of Object.entries(programData.fellesfag)) {
          if (!trinnData?.fag) continue;

          result[programId][trinn] = {
            totalt: trinnData.totalt || 0,
            fag: trinnData.fag.map(fag => {
              // Try to find title from curriculum (prefer shortTitle)
              const curriculumFag = curriculumMap.get(fag.id);
              return {
                id: fag.id,
                title: curriculumFag?.shortTitle || curriculumFag?.title || formatFagId(fag.id),
                fullTitle: curriculumFag?.title || null,
                timer: fag.timer,
                fagkode: fag.fagkode,
                merknad: fag.merknad || null,
                alternativer: fag.alternativer || null
              };
            })
          };
        }
      }
      return result;
    })(),

    // Felles programfag per program (obligatoriske programfag)
    fellesProgramfag: (() => {
      const result = {};
      const schoolPrograms = (schoolConfig.school.programs || []).map(p => p.id);

      for (const programId of schoolPrograms) {
        const programData = programomrader[programId];
        if (!programData?.fellesProgramfag) continue;

        result[programId] = {};
        for (const [trinn, trinnData] of Object.entries(programData.fellesProgramfag)) {
          if (!trinnData?.fag) continue;

          result[programId][trinn] = {
            totalt: trinnData.totalt || 0,
            fag: trinnData.fag.map(fag => {
              const curriculumFag = curriculumMap.get(fag.id);
              return {
                id: fag.id,
                title: curriculumFag?.title || formatFagId(fag.id),
                timer: fag.timer,
                fagkode: fag.fagkode
              };
            })
          };
        }
      }
      return result;
    })(),

    // VG1 valg (matematikk og fremmedspråk som elever velger)
    // Fremmedspråk filtreres basert på skolens tilbud (tilbud.yml -> fremmedsprakTilbud)
    vg1Valg: (() => {
      const udirVg1Valg = timefordeling?.vg1Valg || {};
      const skoleTilbud = tilbud?.fremmedsprakTilbud;

      // If school has fremmedsprakTilbud, filter UDIR data
      if (skoleTilbud && udirVg1Valg.fremmedsprak) {
        const filteredFremmedsprak = {
          harFremmedsprak: (udirVg1Valg.fremmedsprak.harFremmedsprak || [])
            .filter(fag => !skoleTilbud.harFremmedsprak || skoleTilbud.harFremmedsprak.includes(fag.id)),
          ikkeHarFremmedsprak: (udirVg1Valg.fremmedsprak.ikkeHarFremmedsprak || [])
            .filter(fag => !skoleTilbud.ikkeHarFremmedsprak || skoleTilbud.ikkeHarFremmedsprak.includes(fag.id))
        };

        return {
          ...udirVg1Valg,
          fremmedsprak: filteredFremmedsprak
        };
      }

      // No school-specific filter - return all UDIR options
      return udirVg1Valg;
    })(),

    // Validation rules per program (from primary blokkskjema)
    valgregler: primaryBlokkskjema.valgregler || {},

    // Prerequisites and exclusions (from udir/regler/ - split files)
    regler: (() => {
      const eksklusjoner = loadYAML(path.join(UDIR_DIR, 'regler', 'eksklusjoner.yml'));
      const forutsetninger = loadYAML(path.join(UDIR_DIR, 'regler', 'forutsetninger.yml'));
      const fordypning = loadYAML(path.join(UDIR_DIR, 'regler', 'fordypning.yml'));
      return {
        eksklusjoner: eksklusjoner?.eksklusjoner || [],
        forutsetninger: forutsetninger?.forutsetninger || [],
        fordypning: fordypning?.fordypning || {},
        fagomrader: fordypning?.fagomrader || {},
        spesialregler: fordypning?.spesialregler || {}
      };
    })(),

    // Time validation per program and grade (from primary blokkskjema)
    timevalidering: primaryBlokkskjema.timevalidering || {},

    // Curriculum data (with all markdown sections for fagkatalog compatibility)
    curriculum: {
      valgfrieProgramfag: valgfrieProgramfag.map(f => ({
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
        beskrivelseHTML: f.beskrivelseHTML,
        kjerneelementer: f.kjerneelementer,
        related: f.related
      })),
      obligatoriskeProgramfag: obligatoriskeProgramfag.map(f => ({
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
        beskrivelseHTML: f.beskrivelseHTML,
        kjerneelementer: f.kjerneelementer
      })),
      fellesfag: fellesfag.map(f => ({
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
        beskrivelseHTML: f.beskrivelseHTML,
        kjerneelementer: f.kjerneelementer
      }))
    }
  };

  // Write studieplanlegger.json
  fs.writeFileSync(
    path.join(schoolOutputDir, 'studieplanlegger.json'),
    JSON.stringify(studieplanleggerOutput, null, 2)
  );

  // Calculate stats
  const versionCount = Object.keys(enrichedVersions).length;
  const blokkCount = Object.keys(enrichedPrimary.blokker || {}).length;
  const fagCount = Object.values(enrichedPrimary.blokker || {})
    .reduce((sum, blokk) => sum + (blokk.fag?.length || 0), 0);
  const programCount = Object.keys(primaryBlokkskjema.valgregler || {}).length;

  console.log(`  ✅ Created studieplanlegger.json`);
  console.log(`     - ${versionCount} blokkskjema-versjon(er): ${Object.keys(enrichedVersions).join(', ')}`);
  console.log(`     - ${blokkCount} blokker (i aktiv versjon "${activeVersion}")`);
  console.log(`     - ${fagCount} fag-oppføringer`);
  console.log(`     - ${programCount} programområder med valgregler`);
}

// Main build process
function build() {
  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);

  // Load curriculum data
  const curriculumData = loadCurriculumData();

  // Find all schools with school-config.yml
  const schools = fs.readdirSync(SCHOOLS_DIR).filter(f => {
    const schoolDir = path.join(SCHOOLS_DIR, f);
    return fs.statSync(schoolDir).isDirectory() &&
           fs.existsSync(path.join(schoolDir, 'school-config.yml'));
  });

  if (schools.length === 0) {
    console.log('\n⚠️  No schools with school-config.yml found!');
    return;
  }

  console.log(`\n📍 Found ${schools.length} school(s) with school-config.yml`);

  // Build API for each school
  schools.forEach(schoolId => {
    buildStudieplanleggerAPI(schoolId, curriculumData);
  });

  console.log('\n✨ Build complete!\n');
  console.log(`📍 API v2 available at: ${BASE_URL}/`);
  schools.forEach(schoolId => {
    console.log(`   - ${schoolId}: ${BASE_URL}/schools/${schoolId}/studieplanlegger.json`);
  });
  console.log('\n💡 For local testing, serve from: docs/api/v2/');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
