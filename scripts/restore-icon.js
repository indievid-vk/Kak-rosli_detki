import fs from 'fs';
import path from 'path';

const b64Path = path.resolve('icon-base64.txt');
const pngPath = path.resolve('public/icon-512.png');

if (fs.existsSync(b64Path)) {
  const data = fs.readFileSync(b64Path, 'utf8');
  const b64Data = data.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(pngPath, Buffer.from(b64Data, 'base64'));
  console.log('Successfully restored public/icon-512.png from base64 string.');
} else {
  console.log('icon-base64.txt not found. Skipping restore.');
}

const appleB64Path = path.resolve('apple-icon-base64.txt');
const applePngPath = path.resolve('public/apple-icon.png');

if (fs.existsSync(appleB64Path)) {
  const appleData = fs.readFileSync(appleB64Path, 'utf8');
  const appleB64Data = appleData.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(applePngPath, Buffer.from(appleB64Data, 'base64'));
  console.log('Successfully restored public/apple-icon.png from base64 string.');
} else {
  console.log('apple-icon-base64.txt not found. Skipping apple-icon restore.');
}
