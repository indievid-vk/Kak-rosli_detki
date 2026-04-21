import fs from 'fs';
import path from 'path';

const imagePath = path.join(process.cwd(), 'public/icon-512.png');
const imageData = fs.readFileSync(imagePath);
const base64Image = imageData.toString('base64');
const dataUrl = `data:image/png;base64,${base64Image}`;

fs.writeFileSync('icon-base64.txt', dataUrl);
console.log('Base64 generated correctly');
