import sharp from 'sharp';

async function roundCorners() {
  const size = 512;
  const radius = 115; // standard ~22.5% rounding for app icons
  
  // Create an SVG mask with a rounded rectangle
  const svgMask = Buffer.from(
    `<svg width="${size}" height="${size}">
       <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white" />
     </svg>`
  );

  const imgBuffer = await sharp('public/icon-512.png')
    .composite([{
      input: svgMask,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  await sharp(imgBuffer).toFile('public/icon-512.png');
  console.log('Rounded corners applied to icon-512.png');
}

roundCorners().catch(console.error);
