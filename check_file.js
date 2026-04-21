import fs from 'fs';
try {
  const stats = fs.statSync('public/icon-512.png');
  console.log('File exists, size:', stats.size);
} catch (e) {
  console.log('File does not exist');
}
