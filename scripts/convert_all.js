const fs = require('fs');
const path = require('path');
const PDFParser = require("pdf2json");

const docsDir = path.join(__dirname, '../docs');
const outputDir = path.join(__dirname, '../app/public/data/articles');
const indexFile = path.join(__dirname, '../app/public/data/index.json');

// Ensure output directories exist
if (!fs.existsSync(path.join(__dirname, '../app/public/data'))) {
    fs.mkdirSync(path.join(__dirname, '../app/public/data'), { recursive: true });
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let allFiles = [];

// Recursive function to get all PDFs
function getFiles(dir) {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            getFiles(res);
        } else if (dirent.name.toLowerCase().endsWith('.pdf')) {
            allFiles.push(res);
        }
    }
}

getFiles(docsDir);
console.log(`Found ${allFiles.length} PDF files.`);

const indexData = [];
const CHUNK_SIZE = 4000; // ~800 words per chunk

async function processPdf(filePath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        
        pdfParser.on("pdfParser_dataError", errData => {
            console.error(`Error parsing ${filePath}:`, errData.parserError);
            resolve();
        });
        
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            const lines = rawText.split(/\r?\n/).map(l => l.trim());
            
            if (lines.length === 0) {
                resolve();
                return;
            }

            const fileName = path.basename(filePath, '.pdf');
            const folderName = path.basename(path.dirname(filePath));
            
            const adKeywords = ['subscribe', 'advertisement', 'click here', 'read more', 'all rights reserved', 'page (', 'break---'];
            
            let paragraphs = [];
            let currentP = "";
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.length === 0) {
                    if (currentP) { paragraphs.push(currentP); currentP = ""; }
                    continue;
                }
                
                const lowerLine = line.toLowerCase();
                if (adKeywords.some(k => lowerLine.includes(k))) continue;
                if (line.length < 10 && !line.match(/[a-zA-Z]/)) continue; // skip page numbers/junk
                
                let pLine = line;
                if (currentP.endsWith('-')) {
                    currentP = currentP.slice(0, -1) + pLine; // Fix hyphenation
                } else if (currentP) {
                    currentP += " " + pLine;
                } else {
                    currentP = pLine;
                }
                
                const isEndOfSentence = currentP.match(/[.!?]$/);
                const nextLine = (i + 1 < lines.length) ? lines[i+1].trim() : "";
                
                if (isEndOfSentence || nextLine === "") {
                    paragraphs.push(currentP);
                    currentP = "";
                }
            }
            if (currentP) paragraphs.push(currentP);
            
            let articles = [];
            let currentArticle = [];
            
            for (let i = 0; i < paragraphs.length; i++) {
                const p = paragraphs[i];
                // Heuristic for title: short, no ending punctuation
                const isTitle = p.length > 5 && p.length < 150 && !p.match(/[.!?]$/);
                
                if (isTitle && currentArticle.length > 3) {
                    articles.push(currentArticle);
                    currentArticle = [p];
                } else {
                    currentArticle.push(p);
                }
            }
            if (currentArticle.length > 0) articles.push(currentArticle);
            
            articles.forEach((art, idx) => {
                if (art.join(' ').length < 300) return; // Skip tiny articles/junk
                
                const isTitleLike = art[0].length < 150 && !art[0].match(/[.!?]$/);
                const title = isTitleLike ? art[0].replace(/[^a-zA-Z0-9\s-]/g, '').trim() : `${fileName} - Article ${idx + 1}`;
                const id = `${folderName.replace(/\s+/g, '_')}_${fileName.replace(/\s+/g, '_')}_art${idx + 1}`;
                
                const articleData = {
                    id,
                    title: title || `Article ${idx + 1}`,
                    source: folderName,
                    issue: fileName,
                    difficulty: idx % 3 === 0 ? "Advanced" : idx % 2 === 0 ? "Intermediate" : "Beginner",
                    date: new Date().toISOString(),
                    content: art.join('\n\n')
                };
                
                fs.writeFileSync(path.join(outputDir, `${id}.json`), JSON.stringify(articleData, null, 2));
                
                indexData.push({
                    id,
                    title: articleData.title,
                    source: folderName,
                    issue: fileName,
                    difficulty: articleData.difficulty,
                    date: articleData.date,
                    fileUrl: `/data/articles/${id}.json`
                });
            });
            resolve();
        });
        
        console.log(`Processing: ${filePath}`);
        pdfParser.loadPDF(filePath);
    });
}

async function run() {
    console.log(`Processing ${allFiles.length} files...`);
    
    for (const file of allFiles) {
        await processPdf(file);
    }
    
    fs.writeFileSync(indexFile, JSON.stringify({ articles: indexData }, null, 2));
    console.log(`Done! Wrote index.json with ${indexData.length} articles.`);
}

run();
