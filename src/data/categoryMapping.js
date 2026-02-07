/**
 * Maps the 8 broad product categories (from fertilizers_data.category_name / categories collection)
 * into the 3 UI categories: Seeds, Fertilizers, Insecticide details.
 */

/** Broad category names as stored in DB (categories.name / fertilizers_data.category_name) */
export const BROAD_CATEGORIES = [
  'Insecticide',
  'Herbicide',
  'Fungicide',
  'Water Sol Fertilizer',
  'Bio-stimulants',
  'Bio-Fertilizers',
  'Fruit Vegetable Crop',
  'Micronutrients',
];

/** UI category ids used in the app */
export const UI_CATEGORY_SEEDS = 'seeds';
export const UI_CATEGORY_FERTILIZERS = 'fertilizers';
export const UI_CATEGORY_INSECTICIDE = 'insecticide';

/**
 * Map from UI category (seeds | fertilizers | insecticide) to list of broad category names.
 * Use this to query fertilizers_data: { category_name: { $in: getBroadCategoriesForUi('seeds') } }
 */
export const UI_TO_BROAD_CATEGORIES = {
  [UI_CATEGORY_SEEDS]: ['Fruit Vegetable Crop'],
  [UI_CATEGORY_FERTILIZERS]: [
    'Water Sol Fertilizer',
    'Bio-stimulants',
    'Bio-Fertilizers',
    'Micronutrients',
  ],
  [UI_CATEGORY_INSECTICIDE]: ['Insecticide', 'Herbicide', 'Fungicide'],
};

export function getBroadCategoriesForUi(uiCategory) {
  return UI_TO_BROAD_CATEGORIES[uiCategory] || [];
}

export function isValidUiCategory(uiCategory) {
  return Object.keys(UI_TO_BROAD_CATEGORIES).includes(uiCategory);
}
