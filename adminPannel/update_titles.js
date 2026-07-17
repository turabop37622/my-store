const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

function updateTitles(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) return console.error('Unable to scan directory: ' + err); 
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                updateTitles(filePath);
            } else if (filePath.endsWith('.tsx')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // Replace font-black with font-semibold only in h1 and h2 tags
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].includes('<h1') || lines[i].includes('<h2')) {
                        if (lines[i].includes('font-black')) {
                            lines[i] = lines[i].replace(/font-black/g, 'font-semibold');
                            modified = true;
                        }
                    }
                }
                
                if (modified) {
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    console.log(`Updated: ${filePath}`);
                }
            }
        });
    });
}

updateTitles(directoryPath);
