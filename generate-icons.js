const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Use logo.svg from assets as the app icon source
const logoPath = path.join(__dirname, 'assets', 'logo.svg');

// Android icon sizes
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

// Design folder icon sizes (assets/design/icon_*.png)
const designSizes = [
  { size: 48, name: 'icon_48.png' },
  { size: 72, name: 'icon_72.png' },
  { size: 96, name: 'icon_96.png' },
  { size: 144, name: 'icon_144.png' },
  { size: 192, name: 'icon_192.png' },
  { size: 432, name: 'icon_432.png' },
  { size: 1024, name: 'icon_1024.png' },
];

// iOS icon sizes (for AppIcon.appiconset)
const iosSizes = [
  { size: 20, name: 'Icon-20.png' },
  { size: 40, name: 'Icon-20@2x.png' },
  { size: 60, name: 'Icon-20@3x.png' },
  { size: 29, name: 'Icon-29.png' },
  { size: 58, name: 'Icon-29@2x.png' },
  { size: 87, name: 'Icon-29@3x.png' },
  { size: 40, name: 'Icon-40.png' },
  { size: 80, name: 'Icon-40@2x.png' },
  { size: 120, name: 'Icon-40@3x.png' },
  { size: 120, name: 'Icon-60@2x.png' },
  { size: 180, name: 'Icon-60@3x.png' },
  { size: 76, name: 'Icon-76.png' },
  { size: 152, name: 'Icon-76@2x.png' },
  { size: 167, name: 'Icon-83.5@2x.png' },
  { size: 1024, name: 'Icon-1024.png' },
];

async function generateIcons() {
  console.log('🎨 Generating app icons from assets/logo.svg...\n');

  if (!fs.existsSync(logoPath)) {
    throw new Error(`Logo not found at ${logoPath}`);
  }

  const logoSvg = fs.readFileSync(logoPath);

  // Create directories if they don't exist
  const androidBasePath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  const iosBasePath = path.join(__dirname, 'ios', 'KrishiRakshak', 'Images.xcassets', 'AppIcon.appiconset');

  // Generate Android icons
  console.log('📱 Generating Android icons...');
  for (const { size, folder } of androidSizes) {
    const folderPath = path.join(androidBasePath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate both square and round icons
    await sharp(logoSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    await sharp(logoSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    console.log(`  ✓ ${folder} (${size}x${size})`);
  }

  // Android adaptive icon foreground (drawable-xxxhdpi, 108dp @ 4x = 432px)
  const drawableXxxhdpiPath = path.join(androidBasePath, 'drawable-xxxhdpi');
  if (!fs.existsSync(drawableXxxhdpiPath)) {
    fs.mkdirSync(drawableXxxhdpiPath, { recursive: true });
  }
  await sharp(logoSvg)
    .resize(432, 432)
    .png()
    .toFile(path.join(drawableXxxhdpiPath, 'ic_launcher_foreground.png'));
  console.log('  ✓ drawable-xxxhdpi/ic_launcher_foreground.png (432x432)');

  // Generate design folder icons (assets/design/icon_*.png)
  const designBasePath = path.join(__dirname, 'assets', 'design');
  if (!fs.existsSync(designBasePath)) {
    fs.mkdirSync(designBasePath, { recursive: true });
  }
  console.log('\n📐 Generating assets/design icons...');
  for (const { size, name } of designSizes) {
    await sharp(logoSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(designBasePath, name));
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Generate iOS icons
  console.log('\n🍎 Generating iOS icons...');
  if (!fs.existsSync(iosBasePath)) {
    fs.mkdirSync(iosBasePath, { recursive: true });
  }

  for (const { size, name } of iosSizes) {
    await sharp(logoSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(iosBasePath, name));

    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Create Contents.json for iOS
  const contentsJson = {
    images: [
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '20x20', idiom: 'iphone', filename: 'Icon-20@3x.png', scale: '3x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-29@3x.png', scale: '3x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-40@3x.png', scale: '3x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-60@3x.png', scale: '3x' },
      { size: '20x20', idiom: 'ipad', filename: 'Icon-20.png', scale: '1x' },
      { size: '20x20', idiom: 'ipad', filename: 'Icon-20@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'ipad', filename: 'Icon-29.png', scale: '1x' },
      { size: '29x29', idiom: 'ipad', filename: 'Icon-29@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'ipad', filename: 'Icon-40.png', scale: '1x' },
      { size: '40x40', idiom: 'ipad', filename: 'Icon-40@2x.png', scale: '2x' },
      { size: '76x76', idiom: 'ipad', filename: 'Icon-76.png', scale: '1x' },
      { size: '76x76', idiom: 'ipad', filename: 'Icon-76@2x.png', scale: '2x' },
      { size: '83.5x83.5', idiom: 'ipad', filename: 'Icon-83.5@2x.png', scale: '2x' },
      { size: '1024x1024', idiom: 'ios-marketing', filename: 'Icon-1024.png', scale: '1x' },
    ],
    info: {
      version: 1,
      author: 'xcode',
    },
  };

  fs.writeFileSync(
    path.join(iosBasePath, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );

  console.log('\n✅ All icons generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Clean your project: cd android && ./gradlew clean');
  console.log('   2. Rebuild your app: npm run android (or npm run ios)');
  console.log('   3. The new icon should appear on your device!\n');
}

generateIcons().catch(console.error);
