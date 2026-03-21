const fs = require('fs');
const diff = fs.readFileSync('cream_diff.patch', 'utf8');
const files = diff.split(/^diff --git a\/(.*?) b\/(.*?)$/gm);
const uniqueFiles = new Set();
for (let i = 1; i < files.length; i += 3) {
  uniqueFiles.add(files[i]);
}

for (const filePath of uniqueFiles) {
  if (!filePath.endsWith('.vue') && !filePath.endsWith('.ts')) continue;
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    // If a line has "border border-accent/", remove "border border-primary/\d+" and "border-primary/\d+" in the same string
    const lines = content.split('\n');
    for (let j = 0; j < lines.length; j++) {
        if (lines[j].includes('border-accent/')) {
            lines[j] = lines[j].replace(/border border-primary\/\d+\s+/, '');
            lines[j] = lines[j].replace(/border-primary\/\d+\s+/, '');
        }
    }
    content = lines.join('\n');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned redundant borders in:', filePath);
    }
  } catch(e) {}
}
