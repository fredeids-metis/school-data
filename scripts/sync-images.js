#!/usr/bin/env node
/**
 * Sync bilde fields from studieplanlegger to school-data
 * Converts paths like /public/images/fag/fysikk-1.jpg to just fysikk-1.jpg
 */

const fs = require('fs');
const path = require('path');

const STUDIEPLANLEGGER_BASE = '/Users/fredrik/Documents/studieplanlegger/data/curriculum/markdown';
const SCHOOL_DATA_BASE = '/Users/fredrik/Documents/school-data/data/curriculum';

const folders = ['valgfrie-programfag', 'fellesfag', 'obligatoriske-programfag'];

let updated = 0;
let skipped = 0;

folders.forEach(folder => {
  const spDir = path.join(STUDIEPLANLEGGER_BASE, folder);
  const sdDir = path.join(SCHOOL_DATA_BASE, folder);
  
  if (!fs.existsSync(spDir) || !fs.existsSync(sdDir)) {
    console.log(`Skipping ${folder} - directory not found`);
    return;
  }
  
  const files = fs.readdirSync(spDir).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    const spPath = path.join(spDir, file);
    const sdPath = path.join(sdDir, file);
    
    if (!fs.existsSync(sdPath)) {
      console.log(`  Skip: ${file} not in school-data`);
      skipped++;
      return;
    }
    
    const spContent = fs.readFileSync(spPath, 'utf8');
    const bildeMatch = spContent.match(/^bilde:\s*(.+)$/m);
    
    if (!bildeMatch) {
      skipped++;
      return;
    }
    
    // Extract just the filename
    const fullPath = bildeMatch[1].trim();
    const filename = path.basename(fullPath);
    
    // Read school-data file
    let sdContent = fs.readFileSync(sdPath, 'utf8');
    
    // Check if bilde already exists
    if (sdContent.match(/^bilde:/m)) {
      console.log(`  Skip: ${file} already has bilde`);
      skipped++;
      return;
    }
    
    // Add bilde after vimeo or generert line
    sdContent = sdContent.replace(
      /^(vimeo:.*$)/m,
      `bilde: ${filename}\n$1`
    );
    
    // If no vimeo, add after generert
    if (!sdContent.match(/^bilde:/m)) {
      sdContent = sdContent.replace(
        /^(generert:.*$)/m,
        `bilde: ${filename}\n$1`
      );
    }
    
    fs.writeFileSync(sdPath, sdContent);
    console.log(`  Updated: ${file} -> ${filename}`);
    updated++;
  });
});

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
