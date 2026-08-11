const sharp = require('sharp');
const path = require('path');

const sizes = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
};

const makeSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#FFB800"/>

  <!-- Building body -->
  <rect x="${size*0.2}" y="${size*0.28}" width="${size*0.6}" height="${size*0.52}" rx="${size*0.04}" fill="white"/>

  <!-- Roof triangle -->
  <polygon points="${size*0.5},${size*0.12} ${size*0.18},${size*0.32} ${size*0.82},${size*0.32}" fill="white"/>

  <!-- Door -->
  <rect x="${size*0.41}" y="${size*0.58}" width="${size*0.18}" height="${size*0.22}" rx="${size*0.03}" fill="#FFB800"/>

  <!-- Windows row 1 -->
  <rect x="${size*0.26}" y="${size*0.36}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="#FFB800"/>
  <rect x="${size*0.60}" y="${size*0.36}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="#FFB800"/>

  <!-- Windows row 2 -->
  <rect x="${size*0.26}" y="${size*0.52}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="#FFB800"/>
  <rect x="${size*0.60}" y="${size*0.52}" width="${size*0.14}" height="${size*0.12}" rx="${size*0.02}" fill="#FFB800"/>
</svg>`;

const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

(async () => {
  for (const [folder, size] of Object.entries(sizes)) {
    const svg = Buffer.from(makeSvg(size));
    const outPath = path.join(resDir, folder, 'ic_launcher.png');
    const outRound = path.join(resDir, folder, 'ic_launcher_round.png');

    await sharp(svg).png().toFile(outPath);
    await sharp(svg).png().toFile(outRound);
    console.log(`✓ ${folder} (${size}x${size})`);
  }
  console.log('\nDone! Rebuild the app to see the new icon.');
})();
