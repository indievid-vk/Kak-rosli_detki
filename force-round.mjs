import sharp from 'sharp';
import fs from 'fs';

async function generateRounded() {
  const size = 512;
  const radius = 115; // standard ~22.5% rounding for app icons
  
  // We want to clear the corners explicitly. So let's create a solid image with a transparent cutout of a rounded rectangle?
  // No, the easiest way to round corners in sharp is to generate an svg with a shape, and use `composite` with blend `dest-in`.
  // BUT the svg needs to be generated with `{ background: { r: 0, g: 0, b: 0, alpha: 0 } }` to ensure the outside is fully transparent.
  
  const roundedRect = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff" stroke="none"/></svg>`
  );

  // Read the original icon-512.png (maybe from the base64 backup)
  const txt = fs.readFileSync('icon-base64.txt', 'utf8');
  const base64Data = txt.replace(/^data:image\/png;base64,/, "");
  const originalBuffer = Buffer.from(base64Data, 'base64');
  
  await sharp(originalBuffer)
    .resize(size, size) // just in case
    .composite([{
      input: roundedRect,
      blend: 'dest-in'
    }])
    .png()
    .toFile('public/icon-512.png');
    
  console.log('Done rounding.');
}

generateRounded();
