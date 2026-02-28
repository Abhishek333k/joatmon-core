const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const indexPath = path.join(__dirname, 'index.html');

console.log('JOATMON Build Process: Initiating Tool Scan...');

const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.html'));
let injectedCardsHTML = '';

// BULLETPROOF REGEX: Split into strings so it doesn't get corrupted when copied
const metaRegex = new RegExp("<" + "!-- JOATMON_META=(.*?) --" + ">");
const injectRegex = new RegExp("(" + "<" + "!-- INJECT_TOOLS_START --" + ">" + ")([\\s\\S]*?)(" + "<" + "!-- INJECT_TOOLS_END --" + ">" + ")");

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const metaMatch = content.match(metaRegex);
    
    if (metaMatch && metaMatch[1]) {
        try {
            const meta = JSON.parse(metaMatch[1]);
            console.log(`[+] Found Tool: ${meta.title}`);
            
            injectedCardsHTML += `
        <a href="${meta.url}" class="tool-card">
            <h3>${meta.title}</h3>
            <p>${meta.desc}</p>
        </a>\n`;
        } catch (e) {
            console.error(`[!] Failed to parse meta in ${file}`);
        }
    }
});

if (injectedCardsHTML !== '') {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    indexContent = indexContent.replace(injectRegex, `$1\n${injectedCardsHTML}        $3`);
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('JOATMON Build Process: index.html updated successfully.');
} else {
    console.log('No tools with valid metadata found.');
}
