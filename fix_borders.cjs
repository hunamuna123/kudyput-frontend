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
    // Fix shadow-sm/35 -> /35 shadow-sm but correctly
    content = content.replace(/bg-white border border-accent\/(40|20|30) shadow-sm(.*?\b)/g, function(match, alpha, rest) {
        if (rest && rest.startsWith('/')) {
            // it's something like /35
            return `bg-white${rest} border border-accent/${alpha} shadow-sm`;
        }
        return match;
    });
    content = content.replace(/bg-zinc-100 border border-accent\/(40|20|30) shadow-sm(.*?\b)/g, function(match, alpha, rest) {
        if (rest && rest.startsWith('/')) {
            return `bg-zinc-100${rest} border border-accent/${alpha} shadow-sm`;
        }
        return match;
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed syntax in:', filePath);
    }
  } catch(e) {}
}
