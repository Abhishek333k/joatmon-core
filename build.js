const fs = require('fs');
const path = require('path');
const toolsDir = path.join(__dirname, 'tools');
const indexPath = path.join(__dirname, 'index.html');

console.log('Starting JOATMON Build...');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));
let generatedCards = '';

const searchTag = "<" + "!-- JOATMON_META=";

files.forEach(file => {
    const content = fs.readFileSync(path.join(toolsDir, file), 'utf8');
    if (content.includes(searchTag)) {
        const rawJson = content.split(searchTag)[1].split("--" + ">")[0];
        try {
            const meta = JSON.parse(rawJson);
            generatedCards += `\n<a href="${meta.url}" class="tool-card"><h3>${meta.title}</h3><p>${meta.desc}</p></a>\n`;
            console.log('Found tool: ' + meta.title);
        } catch(e) {}
    }
});

if (generatedCards !== '') {
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    const startMarker = "<" + "!-- INJECT_TOOLS_START --" + ">";
    const endMarker = "<" + "!-- INJECT_TOOLS_END --" + ">";
    
    const parts = indexHtml.split(startMarker);
    if(parts.length > 1) {
        const bottomHalf = parts[1].split(endMarker)[1];
        const finalHtml = parts[0] + startMarker + generatedCards + endMarker + bottomHalf;
        fs.writeFileSync(indexPath, finalHtml);
        console.log('Successfully injected tools into index.html');
    }
}
