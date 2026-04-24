const fs = require('fs');
const sharp = require('sharp');

// Цвета
const bg = { r: 249, g: 236, b: 225, alpha: 1 };
const maskBg = { r: 249, g: 236, b: 225, alpha: 1 };

// Создать скругленный прямоугольник
const makeRounded = (size) => {
    const rx = size * 0.22;
    return `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${rx}" ry="${rx}"/></svg>`;
};

async function createIcons() {
    try {
        console.log("Reading base64 source...");
        const base64Data = fs.readFileSync('./apple-icon-base64.txt', 'utf-8');
        const base64Image = base64Data.split(';base64,').pop();
        const originalBuffer = Buffer.from(base64Image, 'base64');
        
        let coreImage = sharp(originalBuffer).trim();
        const meta = await coreImage.metadata();
        console.log(`Core logo size: ${meta.width}x${meta.height}`);

        const generateSquare = async (size, scale, filename, rounded = false) => {
            const innerSize = Math.round(size * scale);
            const padding = Math.round((size - innerSize) / 2);
            
            let img = coreImage.clone().resize({
                width: innerSize,
                height: innerSize,
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }).extend({
                top: padding,
                bottom: size - innerSize - padding,
                left: padding,
                right: size - innerSize - padding,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            });

            // Для maskable и apple мы делаем их КВАДРАТНЫМИ без закруглений, с персиковым фоном
            if (!rounded) {
                await img
                    .flatten({ background: bg }) // Заливает прозрачные места персиковым
                    .png()
                    .toFile(`./public/${filename}`);
                console.log(`Generated square: ./public/${filename}`);
            } else {
                // Для "any" делаем закругленные края, оставляя вне углов прозрачность
                // Сначала создаем квадратный фон с рисунком:
                const squareBuffer = await img.flatten({ background: bg }).png().toBuffer();
                
                // Потом маскируем его закругленным краем
                await sharp(squareBuffer)
                    .composite([{
                        input: Buffer.from(makeRounded(size)),
                        blend: 'dest-in'
                    }])
                    .png()
                    .toFile(`./public/${filename}`);
                console.log(`Generated rounded: ./public/${filename}`);
            }
        };

        // iOS Apple Touch Icon - 100% square
        console.log("\nGenerating Apple icon (Square, NO borders, filled with logo)...");
        // Мы используем scale 0.9, чтобы логотип немного отступал, пользователь сказал "на 5мм увеличить отступ от границ экрана" для айфона.
        // Wait, border on iPhone was white -> background was white. Flattening with `bg` fixes that!
        await generateSquare(192, 0.85, 'apple-icon.png', false); 

        // Android Maskable (purposes: maskable)
        console.log("\nGenerating Android Maskable icons (Square, padding for adaptive shape)...");
        await generateSquare(192, 0.70, 'icon-192-maskable.png', false);
        await generateSquare(512, 0.70, 'icon-512-maskable.png', false);

        // Android Any (purposes: any) - Users want rounded corners explicitly!
        console.log("\nGenerating Android 'any' icons (Rounded)...");
        await generateSquare(192, 0.90, 'icon-192.png', true);
        await generateSquare(512, 0.90, 'icon-512.png', true);

        console.log("\nAll icons fixed!");

    } catch(err) {
        console.error(err);
    }
}
createIcons();
