import sharp from 'sharp';

async function fix() {
  const bgColor = '#F9ECE1';
  // Content box from analysis: { left: 89, top: 84, width: 332, height: 348 }
  const contentLeft = 89;
  const contentTop = 84;
  const contentWidth = 332;
  const contentHeight = 348;

  // New padding calculation:
  // Original padding (avg) was ~86px on 512px image (16.8%).
  // Half is 8.4% -> approx 16px on 192px image.
  const targetSize = 192;
  const targetPadding = 16;
  const maxContentInTarget = targetSize - (targetPadding * 2); // 160px

  console.log(`Extracting content: ${contentWidth}x${contentHeight}`);
  console.log(`Fitting into: ${maxContentInTarget}x${maxContentInTarget} with ${targetPadding}px padding`);

  const contentBuffer = await sharp('public/icon-512.png')
    .extract({ left: contentLeft, top: contentTop, width: contentWidth, height: contentHeight })
    .toBuffer();

  await sharp({
    create: {
      width: targetSize,
      height: targetSize,
      channels: 3,
      background: bgColor
    }
  })
  .composite([{
    input: await sharp(contentBuffer)
      .resize(maxContentInTarget, maxContentInTarget, { fit: 'contain', background: { r: 249, g: 236, b: 225, alpha: 0 } })
      .toBuffer(),
    gravity: 'center'
  }])
  .toFile('public/apple-icon.png');

  console.log('Successfully updated public/apple-icon.png with reduced borders.');
}

fix().catch(console.error);
