# Philip K. Dick's Exegesis Summaries

A comprehensive, searchable, and systematically classified portal into the mind of Philip K. Dick, based on his late-life metaphysical journal, *The Exegesis*.

🔗 **[View the Live Exegesis Summaries Portal here!](https://t3dy.github.io/ExegesisSummaries/)**

---

## 📖 About the Project

*The Exegesis* is thousands of pages of Philip K. Dick's handwritten and typewritten notes concerning his visionary 1974 ("2-3-74") experiences. The raw source material, meticulously transcribed by the Zebrapedia project, consists of massive, unformatted text files. Because of the density, repetition, and sheer volume of PKD's philosophical and theological explorations, reading the raw texts cover-to-cover is a monumental task.

This project aimed to solve that problem by systematically breaking down, analyzing, and surfacing the key insights from the raw Exegesis texts. 

## ⚙️ The Process

Transforming massive walls of erratic 1970s theological text into an organized, navigable Rare Books Room portal required a strict, multi-stage pipeline:

### 1. Cleaning & Segmentation
The raw Zebrapedia text dumps were first collected and cleaned of basic OCR errors, erratic formatting, and disjointed page breaks to create continuous thought segments ("Sections"). We used the transcriber notation (e.g., `1978-10-10_SECTION_016`) to maintain chronological and structural integrity.

### 2. Chunking
Because AI context limits and human readability both struggle with 10,000+ line files, each major Section was systematically "chunked" into manageable files.
- Each chunk was calibrated to represent approximately one cohesive "thought" or reading block (typically preserving the natural paragraph breaks PKD used).
- Files were named sequentially (e.g., `1978-10-10_SECTION_016_01.txt`, `_02`, etc.) to perfectly preserve the chronological reading order.

### 3. Systematic Summarization
Each individual chunk was then read and analyzed to extract the core philosophical payload. For every chunk, an expansive Markdown summary file was generated containing:
- **Metadata:** Section ID, Chunk ID, and the date the material was written.
- **Themes:** Broad categorical tags (e.g., *Soteriology*, *Gnosticism*, *The Fall*).
- **Key Entities:** Recurring figures in his schema (e.g., *YHWH*, *Thomas*, *Ma'at*, *The AI Voice*, *Zebra*).
- **Key Claims:** A synthesized, bulleted breakdown of what PKD is actually arguing or realizing in that specific chunk.
- **Recurring Concepts / Theological Motifs:** Identifying where his active thinking dovetails with established philosophy (e.g., *Spinoza*, *Malebranche*) or his own internal vernacular.

### 4. The Data Pipeline
All of the ~1,100 resulting `.md` summary files are processed by a custom Node.js script. This script strips the Markdown, parses the YAML/list metadata, and complies the entire repository down into a single, highly-optimized `summaries.json` database.

### 5. The Viewer Interface
The frontend is a static React Single Page Application (SPA) built with Vite. It consumes the lightweight `summaries.json` payload, allowing instant, client-side filtering and full-text search across thousands of pages of summaries without a backend server.
- The UI was specifically designed to resemble a "Rare Books Room," utilizing parchment textures, serif typography, and chronological timeline pagination.

---

## 🚀 Running Locally

If you'd like to run the Viewer UI locally to make modifications:

```bash
# Navigate to the viewer directory
cd viewer

# Install Dependencies
npm install

# (Optional) Re-build the JSON database if you change the markdown summaries
node parse_summaries.js

# Start the dev server
npm run dev
```
