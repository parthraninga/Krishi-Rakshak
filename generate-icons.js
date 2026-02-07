const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG content for the app icon (simplified, no text)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#FFFFFF"/>
  <circle cx="512" cy="512" r="460" fill="#2D7D3E" opacity="0.1"/>
  
  <!-- Shield Base -->
  <path d="M512 230 L692 305 L692 505 C692 650 615 765 512 865 C409 765 332 650 332 505 L332 305 L512 230 Z" 
        fill="#2D7D3E" stroke="#1A5526" stroke-width="12"/>
  
  <!-- Inner Shield Highlight -->
  <path d="M512 280 L652 340 L652 490 C652 605 595 695 512 770 C429 695 372 605 372 490 L372 340 L512 280 Z" 
        fill="#3AA34A" opacity="0.3"/>
  
  <!-- Center Leaf -->
  <ellipse cx="512" cy="485" rx="70" ry="150" fill="#8BC34A"/>
  <path d="M 512 335 Q 530 410, 512 635 M 512 335 Q 494 410, 512 635" 
        stroke="#6BA839" stroke-width="8" fill="none"/>
  
  <!-- Left Leaf -->
  <g transform="translate(420, 505) rotate(-35, 0, 0)">
    <ellipse cx="0" cy="50" rx="55" ry="115" fill="#9CCC65"/>
    <path d="M 0 -65 Q 15 0, 0 165" stroke="#7BA856" stroke-width="6" fill="none"/>
  </g>
  
  <!-- Right Leaf -->
  <g transform="translate(604, 505) rotate(35, 0, 0)">
    <ellipse cx="0" cy="50" rx="55" ry="115" fill="#9CCC65"/>
    <path d="M 0 -65 Q -15 0, 0 165" stroke="#7BA856" stroke-width="6" fill="none"/>
  </g>
  
  <!-- Bottom Left Leaf -->
  <g transform="translate(450, 585) rotate(-25, 0, 0)">
    <ellipse cx="0" cy="40" rx="45" ry="95" fill="#AED581"/>
    <path d="M 0 -55 Q 10 0, 0 135" stroke="#8DB86A" stroke-width="5" fill="none"/>
  </g>
  
  <!-- Bottom Right Leaf -->
  <g transform="translate(574, 585) rotate(25, 0, 0)">
    <ellipse cx="0" cy="40" rx="45" ry="95" fill="#AED581"/>
    <path d="M 0 -55 Q -10 0, 0 135" stroke="#8DB86A" stroke-width="5" fill="none"/>
  </g>
  
  <!-- Stem -->
  <path d="M 512 360 L 512 680" stroke="#6BA839" stroke-width="16" stroke-linecap="round"/>
  
  <!-- Root -->
  <ellipse cx="512" cy="680" rx="45" ry="22" fill="#5E8C4F" opacity="0.6"/>
  
  <!-- Decorative Dots -->
  <circle cx="445" cy="640" r="14" fill="#DCEDC8"/>
  <circle cx="579" cy="640" r="14" fill="#DCEDC8"/>
  <circle cx="470" cy="695" r="12" fill="#DCEDC8"/>
  <circle cx="554" cy="695" r="12" fill="#DCEDC8"/>
  <circle cx="512" cy="730" r="10" fill="#DCEDC8" opacity="0.7"/>
</svg>
`;

// Android icon sizes
const androidSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
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
  console.log('🎨 Generating app icons...\n');

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
    await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher.png'));

    await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(folderPath, 'ic_launcher_round.png'));

    console.log(`  ✓ ${folder} (${size}x${size})`);
  }

  // Generate iOS icons
  console.log('\n🍎 Generating iOS icons...');
  if (!fs.existsSync(iosBasePath)) {
    fs.mkdirSync(iosBasePath, { recursive: true });
  }

  for (const { size, name } of iosSizes) {
    await sharp(Buffer.from(iconSvg))
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
