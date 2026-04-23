import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function adjust() {
  const b64Path = path.resolve('apple-icon-base64.txt');
  if (!fs.existsSync(b64Path)) {
    console.error('apple-icon-base64.txt not found');
    return;
  }
  
  const data = fs.readFileSync(b64Path, 'utf8');
  const b64Data = data.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(b64Data, 'base64');

  // We want to add a tiny bit of padding (about 1mm).
  // 180px is the standard apple-touch-icon size.
  // 1mm at high PPI is roughly 4-6 pixels. 
  // Let's shrink the image slightly and fill with white.
  
  const adjustedBuffer = await sharp(buffer)
    .resize(172, 172, { // Was 180, now 172 (adding ~4px padding on each side)
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .extend({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();

  const adjustedBase64 = `data:image/png;base64,${adjustedBuffer.toString('base64')}`;
  
  // Save files
  fs.writeFileSync('apple-icon-base64.txt', adjustedBase64);
  fs.writeFileSync('public/apple-icon.png', adjustedBuffer);
  
  console.log('Successfully adjusted apple-icon with ~1mm padding.');
}

adjust().catch(console.error);
