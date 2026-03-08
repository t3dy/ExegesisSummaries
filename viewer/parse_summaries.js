import fs from 'fs';
import path from 'path';

const SUMMARIES_DIR = path.resolve('../summaries/chunks');
const OUTPUT_FILE = path.resolve('./public/summaries.json');

const files = fs.readdirSync(SUMMARIES_DIR);
const summaries = [];

for (const file of files) {
  if (!file.endsWith('.md')) continue;

  const content = fs.readFileSync(path.join(SUMMARIES_DIR, file), 'utf-8');

  // Try to parse format 1 (later sections)
  const chunkIdMatchV1 = content.match(/- \*\*Chunk ID\*\*: (.*)/);
  const sectionIdMatchV1 = content.match(/- \*\*Section ID\*\*: (.*)/);
  const themesMatchV1 = content.match(/- \*\*Themes\*\*: (.*)/);
  const keyEntitiesMatchV1 = content.match(/- \*\*Key Entities\*\*: (.*)/);

  // Try to parse format 2 (earlier sections)
  const chunkIdMatchV2 = content.match(/^# (.*?)\r?\n/);
  const sectionIdMatchV2 = content.match(/^# (SECTION_\d+)\r?\n/m);

  let id = file.replace('.txt.md', '').replace('.md', '');
  if (chunkIdMatchV1 && chunkIdMatchV1[1]) {
    id = chunkIdMatchV1[1].trim();
  } else if (chunkIdMatchV2 && chunkIdMatchV2[1]) {
    id = chunkIdMatchV2[1].trim();
  }

  let section = "Unknown";
  if (sectionIdMatchV1 && sectionIdMatchV1[1]) {
    section = sectionIdMatchV1[1].trim();
  } else if (sectionIdMatchV2 && sectionIdMatchV2[1]) {
    section = sectionIdMatchV2[1].trim();
  }

  // Extract date from chunk ID (e.g. 1981-04-16_Pat_181 -> 1981-04-16)
  let date = "Unknown";
  let year = "Unknown";
  const dMatch = id.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dMatch) {
    date = dMatch[1];
    year = date.split('-')[0];
  } else {
    const dMatch2 = id.match(/^(\d{4})/);
    if (dMatch2) {
      year = dMatch2[1];
    }
  }

  let excerpt = "";
  // Check for 'Key Claims' or 'key_claims'
  const claimsRegex = /## [Kk]ey_?[Cc]laims?\r?\n(.*?)(\r?\n## |$)/s;
  const claimsMatch = content.match(claimsRegex);
  if (claimsMatch && claimsMatch[1]) {
    const claimsText = claimsMatch[1].trim();
    const firstClaim = claimsText.split('\n')[0].replace(/^- /, '').trim();
    excerpt = firstClaim;
  }

  // Extract themes
  let themes = [];
  if (themesMatchV1 && themesMatchV1[1]) {
    themes = themesMatchV1[1].split(',').map(s => s.trim());
  } else {
    const themesRegex = /## (recurring_concepts|themes)\r?\n(.*?)(\r?\n## |$)/s;
    const tMatch = content.match(themesRegex);
    if (tMatch && tMatch[2]) {
      themes = tMatch[2].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^- /, '').trim());
    }
  }

  // Extract entities
  let entities = [];
  if (keyEntitiesMatchV1 && keyEntitiesMatchV1[1]) {
    entities = keyEntitiesMatchV1[1].split(',').map(s => s.trim());
  } else {
    const entitiesRegex = /## (people_entities|entities)\r?\n(.*?)(\r?\n## |$)/s;
    const eMatch = content.match(entitiesRegex);
    if (eMatch && eMatch[2]) {
      entities = eMatch[2].split('\n').filter(s => s.trim().startsWith('-')).map(s => s.replace(/^- /, '').trim());
    }
  }

  summaries.push({
    id,
    section,
    themes,
    entities,
    date,
    year,
    excerpt,
    content,
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
