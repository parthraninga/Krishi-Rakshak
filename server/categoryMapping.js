/**
 * Same 8→3 mapping as app: seeds, fertilizers, insecticide.
 * Used by products API to filter fertilizers_data by category_name.
 */
const UI_TO_BROAD_CATEGORIES = {
  seeds: ['Fruit Vegetable Crop'],
  fertilizers: [
    'Water Sol Fertilizer',
    'Bio-stimulants',
    'Bio-Fertilizers',
    'Micronutrients',
  ],
  insecticide: ['Insecticide', 'Herbicide', 'Fungicide'],
};

function getBroadCategoriesForUi(uiCategory) {
  return UI_TO_BROAD_CATEGORIES[uiCategory] || [];
}

module.exports = { getBroadCategoriesForUi };
module.exports.UI_TO_BROAD_CATEGORIES = UI_TO_BROAD_CATEGORIES;
