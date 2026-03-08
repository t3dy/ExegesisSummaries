import fs from 'fs';
import path from 'path';

const SUMMARIES_DIR = path.resolve('../summaries/chunks');
const OUTPUT_FILE = path.resolve('./public/summaries.json');

const files = fs.readdirSync(SUMMARIES_DIR);
const summaries = [];

for (const file of files) {
  if (!file.endsWith('.md')) continue;

  const content = fs.readFileSync(path.join(SUMMARIES_DIR, file), 'utf-8');
  
  // Extract Chunk ID
  const chunkIdMatch = content.match(/- \*\*Chunk ID\*\*: (.*)/);
  const sectionIdMatch = content.match(/- \*\*Section ID\*\*: (.*)/);
  const themesMatch = content.match(/- \*\*Themes\*\*: (.*)/);
  const keyEntitiesMatch = content.match(/- \*\*Key Entities\*\*: (.*)/);

  // Extract date from chunk ID (e.g. 1981-04-16_Pat_181 -> 1981-04-16)
  let date = "Unknown";
  let year = "Unknown";
  if (chunkIdMatch && chunkIdMatch[1]) {
    const dMatch = chunkIdMatch[1].match(/^(\d{4}-\d{2}-\d{2})/);
    if (dMatch) {
      date = dMatch[1];
      year = date.split('-')[0];
    } else {
        const dMatch2 = chunkIdMatch[1].match(/^(\d{4})/);
        if (dMatch2) {
            year = dMatch2[1];
        }
    }
  }

  // Extract excerpt: first line under Key Claims
  let excerpt = "";
  const claimsParts = content.split('## Key Claims');
  if (claimsParts.length > 1) {
    const claimsText = claimsParts[1].split('## ')[0].trim();
    const firstClaim = claimsText.split('\n')[0].replace(/^- /, '').trim();
    excerpt = firstClaim;
  }

  summaries.push({
    id: chunkIdMatch ? chunkIdMatch[1].trim() : file,
    section: sectionIdMatch ? sectionIdMatch[1].trim() : "Unknown",
    themes: themesMatch ? themesMatch[1].split(',').map(s => s.trim()) : [],
    entities: keyEntitiesMatch ? keyEntitiesMatch[1].split(',').map(s => s.trim()) : [],
    date: date,
    year: year,
    excerpt: excerpt,
    content: content,
  });
}

// Sort chronologically
summaries.sort((a, b) => {
  if (a.date !== b.date) {
    if (a.date === "Unknown") return 1;
    if (b.date === "Unknown") return -1;
    return a.date.localeCompare(b.date);
  }
  return a.id.localeCompare(b.id);
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summaries, null, 2));
console.log(`Parsed ${summaries.length} summaries and wrote to ${OUTPUT_FILE}`);
