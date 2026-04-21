import fs from 'fs';
function list(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const path = `${dir}/${file}`;
    if (fs.statSync(path).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        list(path);
      }
    } else {
      console.log(path);
    }
  }
}
list('.');
