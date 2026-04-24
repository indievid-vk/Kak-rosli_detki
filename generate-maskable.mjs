import sharp from 'sharp';
import fs from 'fs';

async function generateMaskableIcon() {
  const size = 512;
  const bgColor = '#F9ECE1';

  // Восстанавливаем оригинальное изображение из бэкапа
  const txt = fs.readFileSync('icon-base64.txt', 'utf8');
  const base64Data = txt.replace(/^data:image\/png;base64,/, "");
  const originalBuffer = Buffer.from(base64Data, 'base64');

  // Для maskable иконки контент должен быть в центре (80% размера)
  // 512 * 0.8 = 409. Мы сделаем контент 380px для дополнительного "воздуха"
  const contentSize = 380;

  const content = await sharp(originalBuffer)
    .resize(contentSize, contentSize, { fit: 'contain', background: { r: 249, g: 236, b: 225, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: bgColor
    }
  })
  .composite([{
    input: content,
    gravity: 'center'
  }])
  .png()
  .toFile('public/maskable-icon-512.png');

  console.log('Generated public/maskable-icon-512.png for Android adaptive icons');
}

generateMaskableIcon().catch(console.error);
