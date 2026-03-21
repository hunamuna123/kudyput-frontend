const fs = require('fs');
const diff = fs.readFileSync('cream_diff.patch', 'utf8');

const files = diff.split(/^diff --git a\/(.*?) b\/(.*?)$/gm);
// files[0] is garbage before first diff
// files[1] is a/path, files[2] is b/path, files[3] is the diff content, etc.

for (let i = 1; i < files.length; i += 3) {
  const filePath = files[i];
  const diffContent = files[i + 2];
  
  if (!filePath.endsWith('.vue') && !filePath.endsWith('.ts')) continue;
  
  try {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    const fileLines = fileContent.split('\n');
    let modified = false;

    // Find all additions in the diff that replaced a bg-cream with something else
    const diffLines = diffContent.split('\n');
    let lastDeletedLine = "";
    
    for (let j = 0; j < diffLines.length; j++) {
      const line = diffLines[j];
      
      if (line.startsWith('-') && line.includes('bg-cream')) {
        lastDeletedLine = line;
      } else if (line.startsWith('+') && lastDeletedLine) {
        // This is the replacement line
        const addedLine = line.substring(1); // remove '+'
        
        if (addedLine.includes('bg-white') || addedLine.includes('bg-zinc-100')) {
            // find this exact line in the actual file and replace it
            for (let k = 0; k < fileLines.length; k++) {
                if (fileLines[k] === addedLine) {
                    let newLine = fileLines[k];
                    
                    // If the line already has a border definition, we might want to replace it, but let's just append our new border
                    // Wait, if it has `border-none` or something, we should be careful.
                    // Let's just safely inject `border border-accent/40` after `bg-white` or `bg-zinc-100`
                    if (newLine.includes('bg-white')) {
                       newLine = newLine.replace('bg-white', 'bg-white border border-accent/40 shadow-sm');
                    } else if (newLine.includes('bg-zinc-100')) {
                       newLine = newLine.replace('bg-zinc-100', 'bg-zinc-100 border border-accent/40 shadow-sm');
                    }
                    
                    fileLines[k] = newLine;
                    modified = true;
                    // Reset lastDeletedLine so we don't match again incorrectly
                    lastDeletedLine = "";
                    break;
                }
            }
        }
      } else if (!line.startsWith('-') && !line.startsWith('\\')) {
          lastDeletedLine = ""; // reset if we see context
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, fileLines.join('\n'), 'utf8');
      console.log('Added border in:', filePath);
    }
    
  } catch (e) {
    console.error('Error processing', filePath, e);
  }
}
