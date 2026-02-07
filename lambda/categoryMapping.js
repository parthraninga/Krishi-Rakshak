/**
 * Category mapping: seeds (Fruit Vegetable Crop only), fertilizers, insecticide.
 */
const UI_TO_BROAD_CATEGORIES = {
  seeds: ['Fruit Vegetable Crop'],
  fertilizers: [
    'Water Sol Fertilizer',
    'Bio-Fertilizers',
    'Micronutrients',
  ],
  insecticide: ['Insecticide', 'Herbicide', 'Fungicide', 'Bio-stimulants'],
};

function getBroadCategoriesForUi(uiCategory) {
  return UI_TO_BROAD_CATEGORIES[uiCategory] || [];
}

module.exports = { getBroadCategoriesForUi };
module.exports.UI_TO_BROAD_CATEGORIES = UI_TO_BROAD_CATEGORIES;
