const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const indexPath = path.join(__dirname, 'index.html');

console.log('JOATMON Build Process: Initiating Tool Scan...');

// 1. Scan the /tools/ directory
const files = fs.readdirSync(toolsDir).filter(file => file.endsWith('.html'));
let injectedCardsHTML = '';

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 2. Extract the hidden JOATMON_META payload
    const metaMatch = content.match(//);
    
    if (metaMatch && metaMatch[1]) {
        try {
            const meta = JSON.parse(metaMatch[1]);
            console.log(`[+] Found Tool: ${meta.title}`);
            
            // 3. Construct the Liquid Glass HTML Card
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

// 4. Inject into index.html
if (injectedCardsHTML !== '') {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const regex = /()([\s\S]*?)()/;
    indexContent = indexContent.replace(regex, `$1\n${injectedCardsHTML}        $3`);
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('JOATMON Build Process: index.html updated successfully.');
} else {
    console.log('No tools with valid metadata found.');
}
