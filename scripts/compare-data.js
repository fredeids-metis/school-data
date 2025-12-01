/**
 * compare-data.js
 *
 * Sammenligner datagrunnlaget mellom studieplanlegger og school-data
 * for å identifisere forskjeller.
 */

const fs = require('fs');
const path = require('path');

const STUDIEPLANLEGGER_BASE = '/Users/fredrik/Documents/studieplanlegger/data/curriculum/markdown';
const SCHOOL_DATA_BASE = '/Users/fredrik/Documents/school-data/data/curriculum';

const DIRECTORIES = ['valgfrie-programfag', 'obligatoriske-programfag'];

function getMarkdownFiles(baseDir, subDir) {
    const dir = path.join(baseDir, subDir);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => f.endsWith('.md'));
}

function extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontmatter = {};
    match[1].split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
    });
    return frontmatter;
}

function extractSections(content) {
    const sections = {};

    // Om faget
    const omMatch = content.match(/## Om faget\s*\n+([\s\S]*?)(?=\n## |$)/i);
    sections.omFaget = omMatch ? omMatch[1].trim().substring(0, 100) : null;

    // Hvordan arbeider man
    const hvordanMatch = content.match(/## Hvordan arbeider man i faget\s*\n+([\s\S]*?)(?=\n## |$)/i);
    sections.hvordanArbeiderMan = hvordanMatch ? 'YES' : 'NO';

    // Fagets relevans
    const relevansMatch = content.match(/## Fagets relevans\s*\n+([\s\S]*?)(?=\n## |$)/i);
    sections.fagetsRelevans = relevansMatch ? 'YES' : 'NO';

    // Kompetansemål
    const kompMatch = content.match(/## Kompetansemål\s*\n+([\s\S]*?)(?=\n## |$)/i);
    sections.kompetansemal = kompMatch ? 'YES' : 'NO';

    // Kjerneelementer
    const kjerneMatch = content.match(/## Kjerneelementer\s*\n+([\s\S]*?)(?=\n## |$)/i);
    sections.kjerneelementer = kjerneMatch ? 'YES' : 'NO';

    return sections;
}

console.log('='.repeat(70));
console.log('  SAMMENLIGNING: Studieplanlegger vs School-data');
console.log('='.repeat(70));

let totalFiles = 0;
let missingInSchoolData = [];
let missingInStudieplanlegger = [];
let differences = [];

for (const dir of DIRECTORIES) {
    console.log(`\n--- ${dir} ---\n`);

    const spFiles = getMarkdownFiles(STUDIEPLANLEGGER_BASE, dir);
    const sdFiles = getMarkdownFiles(SCHOOL_DATA_BASE, dir);

    const spSet = new Set(spFiles);
    const sdSet = new Set(sdFiles);

    // Filer som mangler
    for (const file of spFiles) {
        if (!sdSet.has(file)) {
            missingInSchoolData.push(`${dir}/${file}`);
        }
    }

    for (const file of sdFiles) {
        if (!spSet.has(file)) {
            missingInStudieplanlegger.push(`${dir}/${file}`);
        }
    }

    // Sammenlign felles filer
    const commonFiles = spFiles.filter(f => sdSet.has(f));

    for (const file of commonFiles) {
        totalFiles++;
        const spPath = path.join(STUDIEPLANLEGGER_BASE, dir, file);
        const sdPath = path.join(SCHOOL_DATA_BASE, dir, file);

        const spContent = fs.readFileSync(spPath, 'utf-8');
        const sdContent = fs.readFileSync(sdPath, 'utf-8');

        const spFront = extractFrontmatter(spContent);
        const sdFront = extractFrontmatter(sdContent);

        const spSections = extractSections(spContent);
        const sdSections = extractSections(sdContent);

        const fileDiffs = [];

        // Sjekk frontmatter
        if (spFront.fagkode !== sdFront.fagkode) {
            fileDiffs.push(`fagkode: SP=${spFront.fagkode} vs SD=${sdFront.fagkode}`);
        }
        if (spFront.bilde !== sdFront.bilde) {
            fileDiffs.push(`bilde: SP=${spFront.bilde || 'NONE'} vs SD=${sdFront.bilde || 'NONE'}`);
        }

        // Sjekk seksjoner
        if (spSections.hvordanArbeiderMan !== sdSections.hvordanArbeiderMan) {
            fileDiffs.push(`hvordanArbeiderMan: SP=${spSections.hvordanArbeiderMan} vs SD=${sdSections.hvordanArbeiderMan}`);
        }
        if (spSections.fagetsRelevans !== sdSections.fagetsRelevans) {
            fileDiffs.push(`fagetsRelevans: SP=${spSections.fagetsRelevans} vs SD=${sdSections.fagetsRelevans}`);
        }

        if (fileDiffs.length > 0) {
            differences.push({ file: `${dir}/${file}`, diffs: fileDiffs });
        }
    }
}

// Rapport
console.log('\n' + '='.repeat(70));
console.log('  RAPPORT');
console.log('='.repeat(70));

console.log(`\nTotalt sammenlignet: ${totalFiles} filer`);

if (missingInSchoolData.length > 0) {
    console.log(`\n❌ Mangler i school-data (${missingInSchoolData.length}):`);
    missingInSchoolData.forEach(f => console.log(`   - ${f}`));
}

if (missingInStudieplanlegger.length > 0) {
    console.log(`\n❌ Mangler i studieplanlegger (${missingInStudieplanlegger.length}):`);
    missingInStudieplanlegger.forEach(f => console.log(`   - ${f}`));
}

if (differences.length > 0) {
    console.log(`\n⚠️  Forskjeller funnet (${differences.length} filer):`);
    differences.forEach(d => {
        console.log(`\n   ${d.file}:`);
        d.diffs.forEach(diff => console.log(`      - ${diff}`));
    });
} else {
    console.log('\n✅ Ingen forskjeller i innhold!');
}

if (missingInSchoolData.length === 0 && missingInStudieplanlegger.length === 0 && differences.length === 0) {
    console.log('\n🎉 Datagrunnlaget er 100% synkronisert!');
}

console.log('\n' + '='.repeat(70));
