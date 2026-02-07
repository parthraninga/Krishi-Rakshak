/**
 * Crop data aligned with MongoDB `crops` collection structure.
 * Schema: { id, name, image_url, category }
 * Can be replaced with API fetch from backend later.
 */
const placeholderImage = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0))}&background=8BC34A&color=fff&size=200`;

const CROPS_BY_CATEGORY = [
  {
    category: 'spice crop',
    displayName: 'Spice crop',
    crops: [
      { id: 1, name: 'Cumin', image_url: placeholderImage('Cumin'), category: 'spice crop' },
      { id: 2, name: 'Turmeric', image_url: placeholderImage('Turmeric'), category: 'spice crop' },
      { id: 3, name: 'Ginger', image_url: placeholderImage('Ginger'), category: 'spice crop' },
      { id: 4, name: 'Garlic', image_url: placeholderImage('Garlic'), category: 'spice crop' },
      { id: 5, name: 'Coriander', image_url: placeholderImage('Coriander'), category: 'spice crop' },
      { id: 6, name: 'Chilli', image_url: placeholderImage('Chilli'), category: 'spice crop' },
    ],
  },
  {
    category: 'pulses',
    displayName: 'Pulses',
    crops: [
      { id: 10, name: 'Arhar', image_url: placeholderImage('Arhar'), category: 'pulses' },
      { id: 11, name: 'Gram', image_url: placeholderImage('Gram'), category: 'pulses' },
      { id: 12, name: 'Lentil', image_url: placeholderImage('Lentil'), category: 'pulses' },
      { id: 13, name: 'Green gram', image_url: placeholderImage('Green gram'), category: 'pulses' },
      { id: 14, name: 'Black gram', image_url: placeholderImage('Black gram'), category: 'pulses' },
      { id: 15, name: 'Soybean', image_url: placeholderImage('Soybean'), category: 'pulses' },
    ],
  },
  {
    category: 'cereals',
    displayName: 'Cereals',
    crops: [
      { id: 20, name: 'Paddy', image_url: placeholderImage('Paddy'), category: 'cereals' },
      { id: 21, name: 'Wheat', image_url: placeholderImage('Wheat'), category: 'cereals' },
      { id: 22, name: 'Maize', image_url: placeholderImage('Maize'), category: 'cereals' },
      { id: 23, name: 'Bajra', image_url: placeholderImage('Bajra'), category: 'cereals' },
      { id: 24, name: 'Jowar', image_url: placeholderImage('Jowar'), category: 'cereals' },
    ],
  },
  {
    category: 'vegetables',
    displayName: 'Vegetables',
    crops: [
      { id: 30, name: 'Tomato', image_url: placeholderImage('Tomato'), category: 'vegetables' },
      { id: 31, name: 'Onion', image_url: placeholderImage('Onion'), category: 'vegetables' },
      { id: 32, name: 'Potato', image_url: placeholderImage('Potato'), category: 'vegetables' },
      { id: 33, name: 'Cabbage', image_url: placeholderImage('Cabbage'), category: 'vegetables' },
      { id: 34, name: 'Brinjal', image_url: placeholderImage('Brinjal'), category: 'vegetables' },
    ],
  },
  {
    category: 'fruits',
    displayName: 'Fruits',
    crops: [
      { id: 40, name: 'Mango', image_url: placeholderImage('Mango'), category: 'fruits' },
      { id: 41, name: 'Banana', image_url: placeholderImage('Banana'), category: 'fruits' },
      { id: 42, name: 'Apple', image_url: placeholderImage('Apple'), category: 'fruits' },
      { id: 43, name: 'Grapes', image_url: placeholderImage('Grapes'), category: 'fruits' },
    ],
  },
  {
    category: 'oil seed',
    displayName: 'Oil seed',
    crops: [
      { id: 50, name: 'Groundnut', image_url: placeholderImage('Groundnut'), category: 'oil seed' },
      { id: 51, name: 'Mustard', image_url: placeholderImage('Mustard'), category: 'oil seed' },
    ],
  },
  {
    category: 'cash',
    displayName: 'Cash crops',
    crops: [
      { id: 60, name: 'Cotton', image_url: placeholderImage('Cotton'), category: 'cash' },
      { id: 61, name: 'Sugarcane', image_url: placeholderImage('Sugarcane'), category: 'cash' },
      { id: 62, name: 'Tobacco', image_url: placeholderImage('Tobacco'), category: 'cash' },
    ],
  },
];

export default CROPS_BY_CATEGORY;
