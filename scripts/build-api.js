#!/usr/bin/env node

/**
 * Build API - Generates JSON API from markdown and YAML files
 *
 * Output structure:
 * docs/api/v1/
 * ├── curriculum/
 * │   ├── all-programfag.json (DEPRECATED - flat structure)
 * │   ├── valgfrie-programfag.json
 * │   ├── obligatoriske-programfag.json
 * │   ├── fellesfag.json
 * │   └── all.json (v2 - nested structure)
 * └── schools/
 *     └── {school-id}/
 *         ├── config.json
 *         ├── programfag.json (DEPRECATED)
 *         ├── curriculum.json (v2 - all categories)
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
const CURRICULUM_DIR = path.join(DATA_DIR, 'curriculum');
const VALGFRIE_PROGRAMFAG_DIR = path.join(CURRICULUM_DIR, 'valgfrie-programfag');
const OBLIGATORISKE_PROGRAMFAG_DIR = path.join(CURRICULUM_DIR, 'obligatoriske-programfag');
const FELLESFAG_DIR = path.join(CURRICULUM_DIR, 'fellesfag');
const SCHOOLS_DIR = path.join(DATA_DIR, 'schools');
const OUTPUT_DIR = path.join(__dirname, '../docs/api/v1');

// GitHub Pages base URL
const GITHUB_USER = 'fredeids-metis';
const REPO_NAME = 'school-data';
const BASE_URL = `https://${GITHUB_USER}.github.io/${REPO_NAME}/api/v1`;

console.log('🚀 Building API (v2 with new structure)...\n');

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
      fagkode: frontmatter.fagkode,
      lareplan: frontmatter.lareplan,
      type: frontmatter.type || defaultType, // Use frontmatter type if available
      program: frontmatter.program || null, // For obligatoriske programfag
      obligatorisk: frontmatter.obligatorisk || false,
      erstatbar: frontmatter.erstatbar || false,
      trinn: frontmatter.trinn || null,
      beskrivelse: markdown.trim(),
      beskrivelseHTML: marked(markdown.trim()),
      omFaget: extractOmFaget(markdown),
      generert: frontmatter.generert
    };
  });
}

// Read all curriculum markdown files
function loadCurriculumData() {
  console.log('📚 Loading curriculum data...');

  // Load valgfrie programfag
  const valgfrieProgramfag = loadMarkdownFiles(VALGFRIE_PROGRAMFAG_DIR, 'programfag');
  console.log(`  ✅ Loaded ${valgfrieProgramfag.length} valgfrie programfag`);

  // Load obligatoriske programfag
  const obligatoriskeProgramfag = loadMarkdownFiles(OBLIGATORISKE_PROGRAMFAG_DIR, 'obligatorisk-programfag');
  console.log(`  ✅ Loaded ${obligatoriskeProgramfag.length} obligatoriske programfag`);

  // Load fellesfag
  const fellesfag = loadMarkdownFiles(FELLESFAG_DIR, 'fellesfag');
  console.log(`  ✅ Loaded ${fellesfag.length} fellesfag`);

  // Combine all curriculum data for processing
  const allFag = [...valgfrieProgramfag, ...obligatoriskeProgramfag, ...fellesfag];

  // Build læreplan mapping for related subjects (across all types)
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

  return {
    valgfrieProgramfag,
    obligatoriskeProgramfag,
    fellesfag,
    allFag
  };
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
function buildCurriculumAPI(curriculumData) {
  console.log('🏗️  Building curriculum API...');
  const outputDir = path.join(OUTPUT_DIR, 'curriculum');
  ensureDir(outputDir);

  const { valgfrieProgramfag, obligatoriskeProgramfag, fellesfag, allFag } = curriculumData;

  // v2 API - Nested structure (RECOMMENDED)
  const v2Output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: 'v2',
      counts: {
        valgfrieProgramfag: valgfrieProgramfag.length,
        obligatoriskeProgramfag: obligatoriskeProgramfag.length,
        fellesfag: fellesfag.length,
        total: allFag.length
      }
    },
    curriculum: {
      valgfrieProgramfag,
      obligatoriskeProgramfag,
      fellesfag
    }
  };

  fs.writeFileSync(
    path.join(outputDir, 'all.json'),
    JSON.stringify(v2Output, null, 2)
  );
  console.log(`  ✅ Created curriculum/all.json (v2 - nested)`);

  // Individual category files
  fs.writeFileSync(
    path.join(outputDir, 'valgfrie-programfag.json'),
    JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        count: valgfrieProgramfag.length,
        version: 'v2'
      },
      valgfrieProgramfag
    }, null, 2)
  );
  console.log(`  ✅ Created curriculum/valgfrie-programfag.json`);

  fs.writeFileSync(
    path.join(outputDir, 'obligatoriske-programfag.json'),
    JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        count: obligatoriskeProgramfag.length,
        version: 'v2'
      },
      obligatoriskeProgramfag
    }, null, 2)
  );
  console.log(`  ✅ Created curriculum/obligatoriske-programfag.json`);

  fs.writeFileSync(
    path.join(outputDir, 'fellesfag.json'),
    JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        count: fellesfag.length,
        version: 'v2'
      },
      fellesfag
    }, null, 2)
  );
  console.log(`  ✅ Created curriculum/fellesfag.json`);

  // v1 API - Flat structure (DEPRECATED but kept for backwards compatibility)
  const v1Output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      count: allFag.length,
      version: 'v1',
      deprecated: true,
      message: 'Use curriculum/all.json (v2) for new implementations'
    },
    programfag: allFag // All fag in one flat array
  };

  fs.writeFileSync(
    path.join(outputDir, 'all-programfag.json'),
    JSON.stringify(v1Output, null, 2)
  );
  console.log(`  ⚠️  Created curriculum/all-programfag.json (v1 - DEPRECATED)\n`);
}

// Build school-specific API
function buildSchoolAPI(schoolId, curriculumData) {
  console.log(`🏫 Building API for school: ${schoolId}...`);

  const { valgfrieProgramfag, obligatoriskeProgramfag, fellesfag, allFag } = curriculumData;

  const schoolDataDir = path.join(SCHOOLS_DIR, schoolId);
  const schoolOutputDir = path.join(OUTPUT_DIR, 'schools', schoolId);
  ensureDir(schoolOutputDir);

  // Load school configs
  const schoolConfig = loadYAML(path.join(schoolDataDir, 'school-config.yml'));
  const tilbud = loadYAML(path.join(schoolDataDir, 'tilbud.yml'));

  // Load blokkskjema - use version from config if available
  let blokkskjemaFile = 'blokkskjema.yml'; // default
  if (schoolConfig?.blokkskjema?.activeVersion && schoolConfig?.blokkskjema?.versions) {
    const activeVersion = schoolConfig.blokkskjema.activeVersion;
    const versionFile = schoolConfig.blokkskjema.versions[activeVersion];
    if (versionFile) {
      blokkskjemaFile = versionFile;
      console.log(`  📋 Using blokkskjema version: ${activeVersion} (${versionFile})`);
    } else {
      console.log(`  ⚠️  Version "${activeVersion}" not found in config, using default: blokkskjema.yml`);
    }
  }
  const blokkskjema = loadYAML(path.join(schoolDataDir, blokkskjemaFile));

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
  const enrichFag = (fagTilbud, sourceArray, fagType) => {
    const curriculumData = sourceArray.find(f => f.id === fagTilbud.fagId);

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
      kategori: fagTilbud.kategori || null,
      program: fagTilbud.program || curriculumData.program || null  // Include program from tilbud.yml or curriculumData
    };
  };

  // 2. v2 API - Nested curriculum (RECOMMENDED)
  const v2CurriculumOutput = {
    metadata: {
      school: schoolId,
      generatedAt: new Date().toISOString(),
      version: 'v2'
    },
    curriculum: {
      valgfrieProgramfag: [],
      obligatoriskeProgramfag: [],
      fellesfag: []
    }
  };

  // Enrich valgfrie programfag
  if (tilbud && tilbud.valgfrieProgramfag) {
    v2CurriculumOutput.curriculum.valgfrieProgramfag = tilbud.valgfrieProgramfag
      .map(fag => enrichFag(fag, valgfrieProgramfag, 'valgfri programfag'))
      .filter(Boolean);
  } else if (tilbud && tilbud.programfag) {
    // Backwards compatibility - old structure
    v2CurriculumOutput.curriculum.valgfrieProgramfag = tilbud.programfag
      .map(fag => enrichFag(fag, valgfrieProgramfag, 'programfag'))
      .filter(Boolean);
  }

  // Enrich obligatoriske programfag
  if (tilbud && tilbud.obligatoriskeProgramfag) {
    v2CurriculumOutput.curriculum.obligatoriskeProgramfag = tilbud.obligatoriskeProgramfag
      .map(fag => enrichFag(fag, obligatoriskeProgramfag, 'obligatorisk programfag'))
      .filter(Boolean);
  }

  // Enrich fellesfag
  if (tilbud && tilbud.fellesfag) {
    v2CurriculumOutput.curriculum.fellesfag = tilbud.fellesfag
      .map(fag => enrichFag(fag, fellesfag, 'fellesfag'))
      .filter(Boolean);
  }

  // Add counts to metadata
  v2CurriculumOutput.metadata.counts = {
    valgfrieProgramfag: v2CurriculumOutput.curriculum.valgfrieProgramfag.length,
    obligatoriskeProgramfag: v2CurriculumOutput.curriculum.obligatoriskeProgramfag.length,
    fellesfag: v2CurriculumOutput.curriculum.fellesfag.length,
    total: v2CurriculumOutput.curriculum.valgfrieProgramfag.length +
           v2CurriculumOutput.curriculum.obligatoriskeProgramfag.length +
           v2CurriculumOutput.curriculum.fellesfag.length
  };

  fs.writeFileSync(
    path.join(schoolOutputDir, 'curriculum.json'),
    JSON.stringify(v2CurriculumOutput, null, 2)
  );
  console.log(`  ✅ Created curriculum.json (v2 - nested, ${v2CurriculumOutput.metadata.counts.total} fag)`);

  // 3. v1 API - Flat programfag (DEPRECATED)
  if (tilbud && (tilbud.programfag || tilbud.valgfrieProgramfag)) {
    const fagList = tilbud.valgfrieProgramfag || tilbud.programfag;
    const enrichedProgramfag = fagList
      .map(fag => enrichFag(fag, allFag, 'programfag'))
      .filter(Boolean);

    const v1ProgramfagOutput = {
      metadata: {
        school: schoolId,
        generatedAt: new Date().toISOString(),
        count: enrichedProgramfag.length,
        version: 'v1',
        deprecated: true,
        message: 'Use curriculum.json (v2) for new implementations'
      },
      programfag: enrichedProgramfag
    };

    fs.writeFileSync(
      path.join(schoolOutputDir, 'programfag.json'),
      JSON.stringify(v1ProgramfagOutput, null, 2)
    );
    console.log(`  ⚠️  Created programfag.json (v1 - DEPRECATED)`);
  }

  // 4. Blokkskjema (enrich with kategori from tilbud)
  if (blokkskjema) {
    // Create a lookup map for kategori (from all categories)
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

  // 5. Full combined data
  const fullOutput = {
    school: schoolConfig,
    tilbud: tilbud ? {
      valgfrieProgramfag: (tilbud.valgfrieProgramfag || tilbud.programfag || []).map(t => t.fagId),
      obligatoriskeProgramfag: (tilbud.obligatoriskeProgramfag || []).map(t => t.fagId),
      fellesfag: (tilbud.fellesfag || []).map(t => t.fagId),
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
  // Load curriculum data (all three categories)
  const curriculumData = loadCurriculumData();

  // Build curriculum API
  buildCurriculumAPI(curriculumData);

  // Build school-specific APIs
  const schools = fs.readdirSync(SCHOOLS_DIR).filter(f => {
    return fs.statSync(path.join(SCHOOLS_DIR, f)).isDirectory();
  });

  schools.forEach(schoolId => {
    buildSchoolAPI(schoolId, curriculumData);
  });

  console.log('✨ Build complete!\n');
  console.log(`📍 API available at: ${BASE_URL}/`);
  console.log(`   - Curriculum (v2): ${BASE_URL}/curriculum/all.json`);
  console.log(`   - Curriculum (v1 DEPRECATED): ${BASE_URL}/curriculum/all-programfag.json`);
  schools.forEach(schoolId => {
    console.log(`   - ${schoolId} (v2): ${BASE_URL}/schools/${schoolId}/curriculum.json`);
  });
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
