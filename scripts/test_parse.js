const fs = require('fs');
const pdfParse = require('pdf-parse');

const dataBuffer = fs.readFileSync('../docs/Economist/The Economist UK 02 May 2026.pdf');

pdfParse(dataBuffer).then(function(data) {
    // number of pages
    console.log("Pages:", data.numpages);
    // extract first 1000 characters
    console.log(data.text.substring(0, 1000));
}).catch(err => {
    console.error("Error:", err);
});
