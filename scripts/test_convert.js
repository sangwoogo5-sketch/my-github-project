const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const file = "docs/practical english usage.pdf";
const outPath = "md/practical english usage.md";

try {
    console.log("Testing conversion with node child_process...");
    execSync(`npx kordoc "${file}" -o "${outPath}"`, { stdio: 'inherit' });
    console.log("Success!");
} catch (e) {
    console.error("Failed.");
}
