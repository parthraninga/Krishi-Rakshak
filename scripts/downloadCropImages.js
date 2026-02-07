/**
 * Terminal script: download each crop image_url (same logic as app) and save to disk.
 * Run: node scripts/downloadCropImages.js
 * Verifies URLs are reachable and images can be saved.
 */

const fs = require('fs');
const path = require('path');

const placeholderImage = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=8BC34A&color=fff&size=200`;

const CROPS_BY_CATEGORY = [
  { category: 'spice crop', crops: [
    { id: 1, name: 'Cumin' }, { id: 2, name: 'Turmeric' }, { id: 3, name: 'Ginger' },
    { id: 4, name: 'Garlic' }, { id: 5, name: 'Coriander' }, { id: 6, name: 'Chilli' },
  ]},
  { category: 'pulses', crops: [
    { id: 10, name: 'Arhar' }, { id: 11, name: 'Gram' }, { id: 12, name: 'Lentil' },
    { id: 13, name: 'Green gram' }, { id: 14, name: 'Black gram' }, { id: 15, name: 'Soybean' },
  ]},
  { category: 'cereals', crops: [
    { id: 20, name: 'Paddy' }, { id: 21, name: 'Wheat' }, { id: 22, name: 'Maize' },
    { id: 23, name: 'Bajra' }, { id: 24, name: 'Jowar' },
  ]},
  { category: 'vegetables', crops: [
    { id: 30, name: 'Tomato' }, { id: 31, name: 'Onion' }, { id: 32, name: 'Potato' },
    { id: 33, name: 'Cabbage' }, { id: 34, name: 'Brinjal' },
  ]},
  { category: 'fruits', crops: [
    { id: 40, name: 'Mango' }, { id: 41, name: 'Banana' }, { id: 42, name: 'Apple' }, { id: 43, name: 'Grapes' },
  ]},
  { category: 'oil seed', crops: [
    { id: 50, name: 'Groundnut' }, { id: 51, name: 'Mustard' },
  ]},
  { category: 'cash', crops: [
    { id: 60, name: 'Cotton' }, { id: 61, name: 'Sugarcane' }, { id: 62, name: 'Tobacco' },
  ]},
];

const OUT_DIR = path.join(__dirname, '..', 'downloaded_crops');

async function downloadOne(crop) {
  const image_url = crop.image_url || placeholderImage(crop.name);
  const res = await fetch(image_url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = (res.headers.get('content-type') || '').includes('png') ? 'png' : 'jpg';
  const filePath = path.join(OUT_DIR, `crop_${crop.id}.${ext}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(filePath, buf);
  return filePath;
}

async function main() {
  const allCrops = CROPS_BY_CATEGORY.flatMap((cat) =>
    cat.crops.map((c) => ({ ...c, image_url: placeholderImage(c.name) }))
  );
  console.log('Downloading', allCrops.length, 'crop images to', OUT_DIR);
  let ok = 0;
  let fail = 0;
  for (const crop of allCrops) {
    try {
      const out = await downloadOne(crop);
      console.log('  OK crop_%s (%s) -> %s', crop.id, crop.name, path.basename(out));
      ok++;
    } catch (e) {
      console.log('  FAIL crop_%s (%s): %s', crop.id, crop.name, e.message);
      fail++;
    }
  }
  console.log('\nDone: %s ok, %s failed', ok, fail);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
