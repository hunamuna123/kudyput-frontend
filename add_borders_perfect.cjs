const fs = require('fs');

const patch = fs.readFileSync('cream_diff.patch', 'utf8');
const files = patch.split(/^diff --git a\/(.*?) b\/(.*?)$/gm);

for (let i = 1; i < files.length; i += 3) {
  const filePath = files[i];
  const diffContent = files[i + 2];
  
  if (!filePath.endsWith('.vue') && !filePath.endsWith('.ts')) continue;
  
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    const fileLines = fileContent.split('\n');
    let modified = false;

    const diffLines = diffContent.split('\n');
    let lastDeletedLine = "";
    
    for (let j = 0; j < diffLines.length; j++) {
      const line = diffLines[j];
      
      if (line.startsWith('-') && line.includes('bg-cream')) {
        lastDeletedLine = line;
      } else if (line.startsWith('+') && lastDeletedLine) {
        const addedLine = line.substring(1); 
        
        if (addedLine.includes('bg-white') || addedLine.includes('bg-zinc-100')) {
            for (let k = 0; k < fileLines.length; k++) {
                if (fileLines[k] === addedLine) {
                    let newLine = fileLines[k];
                    
                    // Match bg-white or bg-white/XX
                    newLine = newLine.replace(/bg-white(?:\/\d+)?/, match => `${match} border border-accent/40`);
                    // Match bg-zinc-100 or bg-zinc-100/XX
                    newLine = newLine.replace(/bg-zinc-100(?:\/\d+)?/, match => `${match} border border-accent/40`);
                    
                    fileLines[k] = newLine;
                    modified = true;
                    lastDeletedLine = "";
                    break;
                }
            }
        }
      } else if (!line.startsWith('-') && !line.startsWith('\\')) {
          lastDeletedLine = "";
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, fileLines.join('\n'), 'utf8');
      console.log('Added border perfectly in:', filePath);
    }
  } catch(e) {}
}
