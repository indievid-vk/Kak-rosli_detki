import sharp from 'sharp';

async function analyze() {
  const image = sharp('public/icon-512.png');
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const bgColor = { r: 249, g: 236, b: 225 }; // #F9ECE1
  const threshold = 30;

  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];

      const diff = Math.sqrt(
        Math.pow(r - bgColor.r, 2) +
        Math.pow(g - bgColor.g, 2) +
        Math.pow(b - bgColor.b, 2)
      );

      if (diff > threshold) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) {
    console.log('Content not found');
    return;
  }

  const contentWidth = maxX - minX + 1;
  const contentHeight = maxY - minY + 1;
  const paddingX = minX; // Assuming symmetrical for simplicity in report
  const paddingY = minY;

  console.log(JSON.stringify({
    imageWidth: info.width,
    imageHeight: info.height,
    contentBox: { minX, minY, maxX, maxY, width: contentWidth, height: contentHeight },
    currentPadding: { x: paddingX, y: paddingY }
  }, null, 2));
}

analyze();
