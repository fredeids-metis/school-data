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
 *         ├── programomraader.json
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
const CURRICULUM_DIR = path.join(DATA_DIR, 'curriculum/programfag');
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

// Read all programfag markdown files
function loadCurriculumData() {
  console.log('📚 Loading curriculum data...');
  const files = fs.readdirSync(CURRICULUM_DIR).filter(f => f.endsWith('.md'));

  const programfag = files.map(file => {
    const filePath = path.join(CURRICULUM_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content: markdown } = matter(content);

    return {
      id: frontmatter.id,
      title: frontmatter.title,
      fagkode: frontmatter.fagkode,
      lareplan: frontmatter.lareplan,
      beskrivelse: markdown.trim(),
      beskrivelseHTML: marked(markdown.trim()),
      generert: frontmatter.generert
    };
  });

  console.log(`  ✅ Loaded ${programfag.length} programfag\n`);
  return programfag;
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
  const programomraader = loadYAML(path.join(schoolDataDir, 'programomraader.yml'));

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

  // 2. Programfag (enrich with school-specific data)
  if (tilbud && tilbud.programfag) {
    const enrichedProgramfag = tilbud.programfag.map(fagTilbud => {
      const curriculumData = programfag.find(f => f.id === fagTilbud.fagId);

      if (!curriculumData) {
        console.log(`  ⚠️  Warning: Fag '${fagTilbud.fagId}' not found in curriculum data`);
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
    }).filter(Boolean); // Remove null entries

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

  // 3. Blokkskjema
  if (blokkskjema) {
    fs.writeFileSync(
      path.join(schoolOutputDir, 'blokkskjema.json'),
      JSON.stringify(blokkskjema, null, 2)
    );
    console.log(`  ✅ Created blokkskjema.json`);
  }

  // 4. Programområder
  if (programomraader) {
    fs.writeFileSync(
      path.join(schoolOutputDir, 'programomraader.json'),
      JSON.stringify(programomraader, null, 2)
    );
    console.log(`  ✅ Created programomraader.json`);
  }

  // 5. Full combined data
  const fullOutput = {
    school: schoolConfig,
    tilbud: tilbud ? {
      programfag: tilbud.programfag.map(t => t.fagId),
      metadata: tilbud.metadata
    } : null,
    blokkskjema,
    programomraader
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
  // Load curriculum data
  const programfag = loadCurriculumData();

  // Build curriculum API
  buildCurriculumAPI(programfag);

  // Build school-specific APIs
  const schools = fs.readdirSync(SCHOOLS_DIR).filter(f => {
    return fs.statSync(path.join(SCHOOLS_DIR, f)).isDirectory();
  });

  schools.forEach(schoolId => {
    buildSchoolAPI(schoolId, programfag);
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
