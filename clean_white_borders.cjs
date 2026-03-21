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
    // Remove conflicting white borders on lines with accent borders
    const lines = content.split('\n');
    for (let j = 0; j < lines.length; j++) {
        if (lines[j].includes('border-accent/')) {
            lines[j] = lines[j].replace(/\bborder border-white\/\d+\s+/g, '');
        }
    }
    content = lines.join('\n');
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Cleaned redundant white borders in:', filePath);
    }
  } catch(e) {}
}
