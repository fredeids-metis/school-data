/**
 * sync-sections.js
 *
 * Synkroniserer "Hvordan arbeider man i faget" og "Fagets relevans"
 * seksjoner fra studieplanlegger til school-data markdown-filer.
 */

const fs = require('fs');
const path = require('path');

// Paths
const STUDIEPLANLEGGER_BASE = '/Users/fredrik/Documents/studieplanlegger/data/curriculum/markdown';
const SCHOOL_DATA_BASE = '/Users/fredrik/Documents/school-data/data/curriculum';

// Directories to sync
const DIRECTORIES = [
    'valgfrie-programfag',
    'obligatoriske-programfag'
];

/**
 * Extract sections from markdown content
 */
function extractSections(content) {
    const sections = {
        hvordanArbeiderMan: null,
        fagetsRelevans: null
    };

    // Extract "Hvordan arbeider man i faget"
    const hvordanMatch = content.match(/## Hvordan arbeider man i faget\s*\n+([\s\S]*?)(?=\n## |$)/i);
    if (hvordanMatch) {
        sections.hvordanArbeiderMan = hvordanMatch[1].trim();
    }

    // Extract "Fagets relevans"
    const relevansMatch = content.match(/## Fagets relevans\s*\n+([\s\S]*?)(?=\n## |$)/i);
    if (relevansMatch) {
        sections.fagetsRelevans = relevansMatch[1].trim();
    }

    return sections;
}

/**
 * Insert sections into school-data markdown
 */
function insertSections(content, sections) {
    // Find the position after "## Om faget" section
    const omFagetMatch = content.match(/(## Om faget\s*\n+[\s\S]*?)(\n## Kompetansemål)/i);

    if (!omFagetMatch) {
        console.log('  Could not find Om faget or Kompetansemål section');
        return null;
    }

    // Check if sections already exist
    if (content.includes('## Hvordan arbeider man i faget') || content.includes('## Fagets relevans')) {
        console.log('  Sections already exist');
        return null;
    }

    let newSections = '';

    if (sections.hvordanArbeiderMan) {
        newSections += `\n## Hvordan arbeider man i faget\n\n${sections.hvordanArbeiderMan}\n`;
    }

    if (sections.fagetsRelevans) {
        newSections += `\n## Fagets relevans\n\n${sections.fagetsRelevans}\n`;
    }

    if (!newSections) {
        return null;
    }

    // Insert after Om faget, before Kompetansemål
    const newContent = content.replace(
        omFagetMatch[0],
        omFagetMatch[1] + newSections + omFagetMatch[2]
    );

    return newContent;
}

/**
 * Process a single directory
 */
function processDirectory(dirName) {
    const sourceDir = path.join(STUDIEPLANLEGGER_BASE, dirName);
    const targetDir = path.join(SCHOOL_DATA_BASE, dirName);

    if (!fs.existsSync(sourceDir)) {
        console.log(`Source directory not found: ${sourceDir}`);
        return { synced: 0, skipped: 0, errors: 0 };
    }

    if (!fs.existsSync(targetDir)) {
        console.log(`Target directory not found: ${targetDir}`);
        return { synced: 0, skipped: 0, errors: 0 };
    }

    const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    for (const filename of sourceFiles) {
        const sourceFile = path.join(sourceDir, filename);
        const targetFile = path.join(targetDir, filename);

        console.log(`Processing: ${filename}`);

        if (!fs.existsSync(targetFile)) {
            console.log(`  Target file not found, skipping`);
            skipped++;
            continue;
        }

        try {
            const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
            const targetContent = fs.readFileSync(targetFile, 'utf-8');

            const sections = extractSections(sourceContent);

            if (!sections.hvordanArbeiderMan && !sections.fagetsRelevans) {
                console.log(`  No sections to sync`);
                skipped++;
                continue;
            }

            const newContent = insertSections(targetContent, sections);

            if (!newContent) {
                skipped++;
                continue;
            }

            fs.writeFileSync(targetFile, newContent, 'utf-8');
            console.log(`  Synced: hvordan=${sections.hvordanArbeiderMan ? 'yes' : 'no'}, relevans=${sections.fagetsRelevans ? 'yes' : 'no'}`);
            synced++;

        } catch (err) {
            console.log(`  Error: ${err.message}`);
            errors++;
        }
    }

    return { synced, skipped, errors };
}

// Main
console.log('=== Syncing sections from studieplanlegger to school-data ===\n');

let totalSynced = 0;
let totalSkipped = 0;
let totalErrors = 0;

for (const dir of DIRECTORIES) {
    console.log(`\n--- Processing ${dir} ---\n`);
    const result = processDirectory(dir);
    totalSynced += result.synced;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
}

console.log('\n=== Summary ===');
console.log(`Synced: ${totalSynced}`);
console.log(`Skipped: ${totalSkipped}`);
console.log(`Errors: ${totalErrors}`);
