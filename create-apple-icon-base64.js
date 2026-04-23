import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const b64Path = path.resolve('icon-base64.txt');
  const data = fs.readFileSync(b64Path, 'utf8');
  const b64Data = data.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(b64Data, 'base64');

  const appleBuffer = await sharp(buffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    // flatten to remove transparency just in case
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toBuffer();

  const appleBase64 = `data:image/png;base64,${appleBuffer.toString('base64')}`;
  fs.writeFileSync('apple-icon-base64.txt', appleBase64);
  console.log('Successfully created apple-icon-base64.txt');
}

generate().catch(console.error);
