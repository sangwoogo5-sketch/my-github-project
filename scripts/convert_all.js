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
            resolve(); // Resolve anyway to continue with next file
        });
        
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            // Split by any newline, removing carriage returns
            const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            
            if (lines.length === 0) {
                resolve();
                return;
            }

            const fileName = path.basename(filePath, '.pdf');
            const folderName = path.basename(path.dirname(filePath));
            
            let currentChunk = [];
            let currentLen = 0;
            let partNumber = 1;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Skip page breaks and useless lines
                if (line.includes('Page (') && line.includes('Break---')) continue;
                if (line.length < 20 && !line.endsWith('.')) continue; // Skip very short header/footer/ads
                
                // Try to build paragraphs by joining lines that don't end in punctuation
                let p = line;
                while (i + 1 < lines.length && !p.match(/[.!?]$/) && lines[i+1].length > 0) {
                    i++;
                    const nextLine = lines[i];
                    if (nextLine.includes('Page (') && nextLine.includes('Break---')) continue;
                    p += " " + nextLine;
                }
                
                currentChunk.push(p);
                currentLen += p.length;
                
                if (currentLen > CHUNK_SIZE || i === lines.length - 1) {
                    if (currentChunk.length === 0) continue;
                    
                    const id = `${folderName.replace(/\s+/g, '_')}_${fileName.replace(/\s+/g, '_')}_pt${partNumber}`;
                    const title = `${fileName} - Part ${partNumber}`;
                    
                    const articleData = {
                        id,
                        title,
                        source: folderName,
                        difficulty: partNumber % 3 === 0 ? "Advanced" : partNumber % 2 === 0 ? "Intermediate" : "Beginner",
                        date: new Date().toISOString(),
                        coverImg: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&q=80",
                        content: currentChunk.join('\n\n')
                    };
                    
                    fs.writeFileSync(path.join(outputDir, `${id}.json`), JSON.stringify(articleData, null, 2));
                    
                    indexData.push({
                        id,
                        title,
                        source: folderName,
                        difficulty: articleData.difficulty,
                        date: articleData.date,
                        coverImg: articleData.coverImg,
                        fileUrl: `/data/articles/${id}.json`
                    });
                    
                    partNumber++;
                    currentChunk = [];
                    currentLen = 0;
                }
            }
            
            resolve();
        });
        
        console.log(`Processing: ${filePath}`);
        pdfParser.loadPDF(filePath);
    });
}

async function run() {
    // Process first 5 files for now to avoid freezing the system for 10 minutes
    const filesToProcess = allFiles.slice(0, 5); 
    console.log(`Processing ${filesToProcess.length} files as a batch...`);
    
    for (const file of filesToProcess) {
        await processPdf(file);
    }
    
    fs.writeFileSync(indexFile, JSON.stringify({ articles: indexData }, null, 2));
    console.log(`Done! Wrote index.json with ${indexData.length} parts.`);
}

run();
