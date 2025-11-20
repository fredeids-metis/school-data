#!/usr/bin/env node

/**
 * Build API - Generates JSON API from markdown and YAML files
 *
 * Output structure:
 * docs/api/v1/
 * ├── curriculum/
 * │   └── all-programfag.json
 * └── schools/
 *     └── {school-id}/
 *         ├── config.json
 *         ├── programfag.json
 *         ├── blokkskjema.json
 *         ├── full.json
 *         └── assets/ (copied from data/)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { marked } = require('marked');

// Paths
const DATA_DIR = path.join(__dirname, '../data');
const CURRICULUM_PROGRAMFAG_DIR = path.join(DATA_DIR, 'curriculum/programfag');
const CURRICULUM_FELLESFAG_DIR = path.join(DATA_DIR, 'curriculum/fellesfag');
const SCHOOLS_DIR = path.join(DATA_DIR, 'schools');
const OUTPUT_DIR = path.join(__dirname, '../docs/api/v1');

// GitHub Pages base URL
const GITHUB_USER = 'fredeids-metis';
const REPO_NAME = 'school-data';
const BASE_URL = `https://${GITHUB_USER}.github.io/${REPO_NAME}/api/v1`;

console.log('🚀 Building API...\n');

// Create output directories
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Extract plain text from markdown section
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
      break; // Next section
    }
    if (inOmFaget && line.trim()) {
      omFagetLines.push(line.trim());
    }
  }

  return omFagetLines.join(' ');
}

// Read markdown files from a directory
function loadMarkdownFiles(directory, type = 'fag') {
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
      fagkode: frontmatter.fagkode,
      lareplan: frontmatter.lareplan,
      beskrivelse: markdown.trim(),
      beskrivelseHTML: marked(markdown.trim()),
      omFaget: extractOmFaget(markdown),
      generert: frontmatter.generert,
      type: type // 'programfag' or 'fellesfag'
    };
  });
}

// Read all curriculum markdown files (both programfag and fellesfag)
function loadCurriculumData() {
  console.log('📚 Loading curriculum data...');

  // Load programfag
  const programfag = loadMarkdownFiles(CURRICULUM_PROGRAMFAG_DIR, 'programfag');
  console.log(`  ✅ Loaded ${programfag.length} programfag`);

  // Load fellesfag
  const fellesfag = loadMarkdownFiles(CURRICULUM_FELLESFAG_DIR, 'fellesfag');
  if (fellesfag.length > 0) {
    console.log(`  ✅ Loaded ${fellesfag.length} fellesfag`);
  }

  // Combine all curriculum data for processing
  const allFag = [...programfag, ...fellesfag];

  // Build læreplan mapping for related subjects (across both types)
  const lareplanMapping = new Map();
  allFag.forEach(fag => {
    if (fag.lareplan) {
      if (!lareplanMapping.has(fag.lareplan)) {
        lareplanMapping.set(fag.lareplan, []);
      }
      lareplanMapping.get(fag.lareplan).push(fag.title);
    }
  });

  // Add related subjects to all fag
  allFag.forEach(fag => {
    if (fag.lareplan && lareplanMapping.has(fag.lareplan)) {
      const related = lareplanMapping.get(fag.lareplan)
        .filter(title => title !== fag.title);
      fag.related = related.length > 0 ? related : [];
    } else {
      fag.related = [];
    }
  });

  return allFag;
}

// Load YAML config file
function loadYAML(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

// Copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Build curriculum API (shared by all schools)
function buildCurriculumAPI(programfag) {
  console.log('🏗️  Building curriculum API...');
  const outputDir = path.join(OUTPUT_DIR, 'curriculum');
  ensureDir(outputDir);

  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      count: programfag.length,
      version: 'v1'
    },
    programfag
  };

  fs.writeFileSync(
    path.join(outputDir, 'all-programfag.json'),
    JSON.stringify(output, null, 2)
  );

  console.log(`  ✅ Created curriculum/all-programfag.json\n`);
}

// Build school-specific API
function buildSchoolAPI(schoolId, programfag) {
  console.log(`🏫 Building API for school: ${schoolId}...`);

  const schoolDataDir = path.join(SCHOOLS_DIR, schoolId);
  const schoolOutputDir = path.join(OUTPUT_DIR, 'schools', schoolId);
  ensureDir(schoolOutputDir);

  // Load school configs
  const schoolConfig = loadYAML(path.join(schoolDataDir, 'school-config.yml'));
  const tilbud = loadYAML(path.join(schoolDataDir, 'tilbud.yml'));
  const blokkskjema = loadYAML(path.join(schoolDataDir, 'blokkskjema.yml'));

  if (!schoolConfig) {
    console.log(`  ⚠️  No school-config.yml found for ${schoolId}, skipping...\n`);
    return;
  }

  // 1. School config
  fs.writeFileSync(
    path.join(schoolOutputDir, 'config.json'),
    JSON.stringify(schoolConfig, null, 2)
  );
  console.log(`  ✅ Created config.json`);

  // Helper function to enrich fag data
  const enrichFag = (fagTilbud, fagType = 'programfag') => {
    const curriculumData = programfag.find(f => f.id === fagTilbud.fagId);

    if (!curriculumData) {
      console.log(`  ⚠️  Warning: ${fagType} '${fagTilbud.fagId}' not found in curriculum data`);
      return null;
    }

    // Build asset URLs
    const assetBaseUrl = `${BASE_URL}/schools/${schoolId}/assets`;

    return {
      ...curriculumData,
      vimeo: fagTilbud.vimeo || null,
      bilde: fagTilbud.bilde ? `${assetBaseUrl}/${fagTilbud.bilde}` : null,
      kategori: fagTilbud.kategori || null
    };
  };

  // 2. Programfag (enrich with school-specific data)
  if (tilbud && tilbud.programfag) {
    const enrichedProgramfag = tilbud.programfag
      .map(fag => enrichFag(fag, 'programfag'))
      .filter(Boolean);

    const programfagOutput = {
      metadata: {
        school: schoolId,
        generatedAt: new Date().toISOString(),
        count: enrichedProgramfag.length,
        version: 'v1'
      },
      programfag: enrichedProgramfag
    };

    fs.writeFileSync(
      path.join(schoolOutputDir, 'programfag.json'),
      JSON.stringify(programfagOutput, null, 2)
    );
    console.log(`  ✅ Created programfag.json (${enrichedProgramfag.length} fag)`);
  }

  // 2b. Fellesfag (enrich with school-specific data)
  if (tilbud && tilbud.fellesfag && tilbud.fellesfag.length > 0) {
    const enrichedFellesfag = tilbud.fellesfag
      .map(fag => enrichFag(fag, 'fellesfag'))
      .filter(Boolean);

    const fellesfagOutput = {
      metadata: {
        school: schoolId,
        generatedAt: new Date().toISOString(),
        count: enrichedFellesfag.length,
        version: 'v1'
      },
      fellesfag: enrichedFellesfag
    };

    fs.writeFileSync(
      path.join(schoolOutputDir, 'fellesfag.json'),
      JSON.stringify(fellesfagOutput, null, 2)
    );
    console.log(`  ✅ Created fellesfag.json (${enrichedFellesfag.length} fag)`);
  }

  // 3. Blokkskjema (enrich with kategori from tilbud)
  if (blokkskjema) {
    // Create a lookup map for kategori (from both programfag and fellesfag)
    const kategoriMap = new Map();
    if (tilbud) {
      // Add programfag categories
      if (tilbud.programfag) {
        tilbud.programfag.forEach(fag => {
          if (fag.kategori) {
            kategoriMap.set(fag.fagId, fag.kategori);
          }
        });
      }
      // Add fellesfag categories
      if (tilbud.fellesfag) {
        tilbud.fellesfag.forEach(fag => {
          if (fag.kategori) {
            kategoriMap.set(fag.fagId, fag.kategori);
          }
        });
      }
    }

    // Enrich blokkskjema with kategori
    const enrichedBlokkskjema = JSON.parse(JSON.stringify(blokkskjema));
    if (enrichedBlokkskjema.blokker) {
      Object.keys(enrichedBlokkskjema.blokker).forEach(blokkKey => {
        const blokk = enrichedBlokkskjema.blokker[blokkKey];
        if (blokk.fag && Array.isArray(blokk.fag)) {
          blokk.fag = blokk.fag.map(fag => ({
            ...fag,
            kategori: kategoriMap.get(fag.id) || null
          }));
        }
      });
    }

    fs.writeFileSync(
      path.join(schoolOutputDir, 'blokkskjema.json'),
      JSON.stringify(enrichedBlokkskjema, null, 2)
    );
    console.log(`  ✅ Created blokkskjema.json`);
  }

  // 4. Full combined data
  const fullOutput = {
    school: schoolConfig,
    tilbud: tilbud ? {
      programfag: tilbud.programfag ? tilbud.programfag.map(t => t.fagId) : [],
      fellesfag: tilbud.fellesfag ? tilbud.fellesfag.map(t => t.fagId) : [],
      metadata: tilbud.metadata
    } : null,
    blokkskjema
  };

  fs.writeFileSync(
    path.join(schoolOutputDir, 'full.json'),
    JSON.stringify(fullOutput, null, 2)
  );
  console.log(`  ✅ Created full.json`);

  // 6. Copy assets
  const assetsDir = path.join(schoolDataDir, 'assets');
  const assetsOutputDir = path.join(schoolOutputDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    copyDir(assetsDir, assetsOutputDir);
    console.log(`  ✅ Copied assets/`);
  }

  console.log();
}

// Main build process
function build() {
  // Load curriculum data (both programfag and fellesfag)
  const allCurriculumFag = loadCurriculumData();

  // Build curriculum API
  buildCurriculumAPI(allCurriculumFag);

  // Build school-specific APIs
  const schools = fs.readdirSync(SCHOOLS_DIR).filter(f => {
    return fs.statSync(path.join(SCHOOLS_DIR, f)).isDirectory();
  });

  schools.forEach(schoolId => {
    buildSchoolAPI(schoolId, allCurriculumFag);
  });

  console.log('✨ Build complete!\n');
  console.log(`📍 API available at: ${BASE_URL}/`);
  console.log(`   - Curriculum: ${BASE_URL}/curriculum/all-programfag.json`);
  schools.forEach(schoolId => {
    console.log(`   - ${schoolId}: ${BASE_URL}/schools/${schoolId}/programfag.json`);
  });
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
