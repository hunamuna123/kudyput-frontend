const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          if (file.includes('node_modules') || file.includes('.nuxt') || file.includes('.git') || file.includes('.output')) {
            next();
          } else {
            walk(file, (err, res) => {
              results = results.concat(res);
              next();
            });
          }
        } else {
          if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.css')) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

walk('/Users/mark/Desktop/кудыпуть', (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // In main.css, remove cream variables and set body bg to white
    if (file.endsWith('main.css')) {
      content = content.replace(/\s*--color-cream.*?:.*?;/g, '');
      content = content.replace(/background-color:\s*var\(--color-cream-light\);/g, 'background-color: #ffffff;');
      content = content.replace(/color:\s*var\(--color-cream-light\);/g, 'color: #ffffff;');
    } else {
      // Replace cream classes
      content = content.replace(/bg-cream-light/g, 'bg-white');
      content = content.replace(/bg-cream-dark/g, 'bg-zinc-100');
      content = content.replace(/bg-cream/g, 'bg-white');
      
      content = content.replace(/text-cream-light/g, 'text-white');
      content = content.replace(/text-cream-dark/g, 'text-zinc-500');
      content = content.replace(/text-cream/g, 'text-white');
      
      content = content.replace(/border-cream-light/g, 'border-white');
      content = content.replace(/border-cream-dark/g, 'border-zinc-200');
      content = content.replace(/border-cream/g, 'border-white');
      
      content = content.replace(/ring-cream-light/g, 'ring-white');
      content = content.replace(/ring-cream-dark/g, 'ring-zinc-200');
      content = content.replace(/ring-cream/g, 'ring-white');
      
      content = content.replace(/from-cream-light/g, 'from-white');
      content = content.replace(/from-cream-dark/g, 'from-zinc-100');
      content = content.replace(/from-cream/g, 'from-white');
      
      content = content.replace(/to-cream-light/g, 'to-white');
      content = content.replace(/to-cream-dark/g, 'to-zinc-100');
      content = content.replace(/to-cream/g, 'to-white');
      
      content = content.replace(/via-cream-light/g, 'via-white');
      content = content.replace(/via-cream-dark/g, 'via-zinc-100');
      content = content.replace(/via-cream/g, 'via-white');
    }
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', file);
    }
  });
});
