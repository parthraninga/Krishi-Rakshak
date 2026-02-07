# Krishi-Rakshak MongoDB Data Structure

This document describes the MongoDB database structure for the Krishi-Rakshak agricultural support system.

## Database Information

- **Database Name**: `krishi-rakshak`
- **Total Collections**: 5
- **Source**: DeHaat scraped product data

---

## Collections Overview

### 1. `brands` Collection

Stores unique agricultural product brands.

**Document Count**: 15

**Schema**:
```javascript
{
  id: Number,              // Unique brand identifier
  name: String,            // Brand name (e.g., "GAPL", "NUTRI ONE")
  image_url: String,       // Brand logo/image URL
  product_count: Number,   // Number of products for this brand
  createdAt: Date,         // Record creation timestamp
  updatedAt: Date,         // Last update timestamp
  isActive: Boolean        // Active status flag
}
```

**Indexes**:
- `name` (unique)
- `product_count` (descending)

**Sample Data**:
```json
{
  "id": 36,
  "name": "GAPL",
  "image_url": "https://kheti-cdn.agrevolution.in/GAPL.jpg",
  "product_count": 65,
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T...",
  "isActive": true
}
```

**Top Brands**:
1. GAPL - 65 products
2. NUTRI ONE - 13 products
3. PI INDUSTRIES - 8 products
4. CHAMBAL FERTILIZER - 6 products
5. DHANUKA - 4 products

---

### 2. `categories` Collection

Stores product categories for agricultural inputs.

**Document Count**: 8

**Schema**:
```javascript
{
  id: Number,              // Unique category identifier
  name: String,            // Category name (e.g., "Insecticide", "Fungicide")
  image_url: String,       // Category icon/image URL
  product_count: Number,   // Number of products in this category
  createdAt: Date,         // Record creation timestamp
  updatedAt: Date,         // Last update timestamp
  isActive: Boolean        // Active status flag
}
```

**Indexes**:
- `name` (unique)
- `product_count` (descending)

**Sample Data**:
```json
{
  "id": 1,
  "name": "Insecticide",
  "image_url": "https://kheti-cdn.agrevolution.in/hyperlocal/...",
  "product_count": 44,
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T...",
  "isActive": true
}
```

**Categories List**:
1. Insecticide - 44 products
2. Herbicide - 35 products
3. Fungicide - 16 products
4. Water Sol Fertilizer - 7 products
5. Bio-stimulants - 5 products
6. Bio-Fertilizers - 5 products
7. Fruit Vegetable Crop - 4 products
8. Micronutrients - 3 products

---

### 3. `crops` Collection

Stores information about agricultural crops with categorization.

**Document Count**: 178

**Schema**:
```javascript
{
  id: Number,              // Unique crop identifier
  name: String,            // Crop name (e.g., "Paddy", "Cotton", "Wheat")
  image_url: String,       // Crop image URL
  product_count: Number,   // Number of products applicable to this crop
  category: String,        // Crop category classification
  createdAt: Date,         // Record creation timestamp
  updatedAt: Date,         // Last update timestamp
  isActive: Boolean        // Active status flag
}
```

**Indexes**:
- `id` (unique)
- `name`
- `product_count` (descending)

**Sample Data**:
```json
{
  "id": 22,
  "name": "Paddy",
  "image_url": "https://s3-ap-south-1.amazonaws.com/aeros-production/advisory/...",
  "product_count": 56,
  "category": "cereals",
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T...",
  "isActive": true
}
```

**Crop Categories**:
- `vegetables` - 49 crops (e.g., Tomato, Onion, Potato, Cabbage)
- `fruits` - 36 crops (e.g., Mango, Banana, Apple, Grapes)
- `pulses` - 18 crops (e.g., Arhar, Gram, Lentil, Green gram)
- `spice crop` - 17 crops (e.g., Chilli, Turmeric, Ginger, Coriander)
- `cereals` - 15 crops (e.g., Paddy, Wheat, Maize, Bajra)
- `oil seed` - 13 crops (e.g., Groundnut, Mustard, Soybean)
- `cash` - 10 crops (e.g., Cotton, Sugarcane, Tobacco)
- `medicinal` - 10 crops (e.g., Mentha, Spearmint, Safed musli)
- `flowers` - 5 crops (e.g., Rose, Marigold, Carnation)
- `dry fruits` - 5 crops (e.g., Almond, Cashewnut, Raisin)

**Top Crops by Product Count**:
1. Paddy - 56 products
2. Cotton - 48 products
3. Sugarcane - 44 products
4. Soybean - 40 products
5. Chilli - 36 products

---

### 4. `products` Collection

Stores basic product information including name, image, brand, and category.

**Document Count**: 119

**Schema**:
```javascript
{
  product_id: Number,                    // Unique product identifier
  name: String,                          // Product name
  image_url: String,                     // Product image URL
  name: String,                          // Product name (e.g., "CUSTODIA", "BLUE COPPER")
  image_url: String,                     // Product image URL
  
  brand: {                               // Brand information object
    name: String,                        // Brand name
    display_name: String,                // Localized brand display name
    image_url: String                    // Brand logo URL
  },
  
  category: {                            // Category information object
    name: String,                        // Category name
    display_name: String,                // Localized category display name
    image_url: String                    // Category icon URL
  },
  
  createdAt: Date,                       // Record creation timestamp
  updatedAt: Date,                       // Last update timestamp
  isActive: Boolean                      // Active status flag
}
```

**Indexes**:
- `product_id` (unique)
- `name`
- `brand.name`
- `category.name`

**Sample Data**:
```json
{
  "product_id": 227,
  "name": "CUSTODIA",
  "image_url": "https://kheti-cdn.agrevolution.in/b2901f2d-543f-46d2-b016-bfba8aaf36b2.jpg",
  "brand": {
    "name": "ADAMA",
    "display_name": "ADAMA",
    "image_url": "https://kheti-cdn.agrevolution.in/ADAMA_1.jpg"
  },
  "category": {
    "name": "Fungicide",
    "display_name": "फफूंदनाशी",
    "image_url": "https://kheti-cdn.agrevolution.in/hyperlocal/category/2024-11-27/1732692400075-Fungicide_1.png"
  },
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T...",
  "isActive": true
}
```

**Use Case**: 
This collection serves as a lightweight product catalog for listing, searching, and displaying products. For detailed information (variants, dosages, descriptions, benefits), reference the `fertilizers_data` collection using `product_id`.

---

### 5. `fertilizers_data` Collection

Comprehensive product information for agricultural inputs (fertilizers, pesticides, seeds, etc.).

**Document Count**: 119

**Schema**:
```javascript
{
  product_id: Number,                    // Unique product identifier
  brand_name: String,                    // Brand name
  brand_display_name: String,            // Localized brand display name
  category_name: String,                 // Product category
  category_display_name: String,         // Localized category display name
  product_name: String,                  // Product name
  product_image_url: String,             // Product image URL
  
  product_variants: [                    // Available product variants
    {
      variant_id: String,                // Variant identifier
      attributes: [                      // Variant attributes (size, weight, etc.)
        {
          name: String,                  // Attribute value (e.g., "500 gm", "1 Liter")
          attribute: String              // Attribute type (e.g., "Weight", "Volume")
        }
      ]
    }
  ],
  
  product_intro: String,                 // Brief product introduction
  description: String,                   // Detailed product description
  product_benefits: Array,               // List of product benefits
  
  target_crops: [                        // Crops this product is suitable for
    {
      name: String,                      // Crop name
      display_name: String               // Localized crop display name
    }
  ],
  
  target_dosages_crop_wise: String,      // Dosage recommendations per crop
  how_to_use: String,                    // Usage instructions
  technical_content_name: String,        // Technical specification details
  
  createdAt: Date,                       // Record creation timestamp
  updatedAt: Date,                       // Last update timestamp
  isActive: Boolean                      // Active status flag
}
```

**Indexes**:
- `product_id` (unique)
- `brand_name`
- `category_name`
- `product_name`

**Sample Data**:
```json
{name": "BLUE COPPER",
  "image_url": "https://kheti-cdn.agrevolution.in/fea41ca9-c830-4198-a865-87e3d3dfce5e.jpg",
  "
  "product_id": 1057,
  "brand_name": "CRYSTAL",
  "brand_display_name": "CRYSTAL",
  "category_name": "Fungicide",
  "category_display_name": "फफूंदनाशी",
  "product_name": "BLUE COPPER",
  "product_image_url": "https://kheti-cdn.agrevolution.in/...",
  "product_variants": [
    {
      "variant_id": "706",
      "attributes": [
        {
          "name": "500 gm",
          "attribute": "Weight"
        }
      ]
    },
    {
      "variant_id": "1374",
      "attributes": [
        {
          "name": "100 gm",
          "attribute": "Weight"
        }
      ]
    }
  ],
  "product_intro": "...",
  "description": "Blue Copper is a fungicide...",
  "product_benefits": ["Prevents fungal diseases", "..."],
  "target_crops": [
    {
      "name": "Tomato",
      "display_name": "टमाटर"
    },
    {
      "name": "Potato",
      "display_name": "आलू"
    }
  ],
  "target_dosages_crop_wise": "2-3 grams per liter of water",
  "how_to_use": "Mix with water and spray...",
  "technical_content_name": "Copper Oxychloride 50% WP",
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T...",
  "isActive": true
}
```

**Statistics**:
- 119 products with variants (active)
- 87 products with target crop information
- 94 products with documented benefits

**Products by Category**:
- Insecticide: 44 products
- Herbicide: 35 products
- Fungicide: 16 products
- Water Sol Fertilizer: 7 products
- Bio-stimulants: 5 products
- Bio-Fertilizers: 5 products
- Fruit Vegetable Crop: 4 products
- Micronutrients: 3 products

**Products by Brand**:
- GAPL: 65 products
- NUTRI ONE: 13 products
- PI INDUSTRIES: 8 products
- CHAMBAL FERTILIZER: 6 products
- DHANUKA: 4 products
- BAYER: 4 products
- ADAMA: 4 products
- SWAL: 4 products

---Products
- `brands.name` links to `products.brand.name`
- One brand has many products
- `brands.product_count` reflects total products per brand

### Brand → Fertilizers
- `brands.name` links to `fertilizers_data.brand_name`
- One brand has many fertilizer products
- `brands.product_count` reflects total products per brand

### Category → Products
- `categories.name` links to `products.category.name`
- One category contains many products
- `categories.product_count` reflects total products per category

### Category → Fertilizers
- `categories.name` links to `fertilizers_data.category_name`
- One category contains many fertilizer products
- `categories.product_count` reflects total products per category

### Products ↔ Fertilizers
- `products.product_id` links to `fertilizers_data.product_id` (1:1 relationship)
- Products collection: lightweight catalog with basic info
- FertiGet Product Catalog
```javascript
// Get all products with basic info (fast, lightweight)
db.products.find({})

// Get product by ID
db.products.findOne({ product_id: 227 })
```
4. Get Products by Brand
```javascript
// Get all GAPL products (basic info)
db.products.find({
  "brand.name": "GAPL"
})

// Get all GAPL product details
db.fertilizers_data.find({
  brand_name: "GAPL"
})
```

### 5. Filter by Category
```javascript
// Get all insecticides (basic info)
db.products.find({
  "category.name": "Insecticide"
})

// Get all insecticide details
db.fertilizers_data.find({
  category_name: "Insecticide"
})
```

### 7
### Crops → Fertilizers
- `crops.name` links to `fertilizers_data.target_crops[].name`
- Many-to-many relationship
- One fertilizer can target multiple crops
- One crop can be targeted by multiple fertilizers
- `crops.product_count` reflects how many products target each crop

---

## Use Cases

### 1. Find Products by Crop
```javascript
// Find all products suitable for Paddy cultivation
db.fertilizers_data.find({
  "target_crops.name": "Paddy"
})
```

### 2. Get Products by Brand
```javascript
// Get all GAPL products
db.fertilizers_data.find({
  brand_name: "GAPL"
})
```

### 3. Filter by Category
```javascript
// Get all insecticides
db.fertilizers_data.find({
  category_name: "Insecticide"
})
```

### 4. Get Crop Information with Category
```javascript
// Find all vegetable crops
db.crops.find({
  category: "vegetables"
})
```

### 5. Get Products with Variants
```javascript
// Find products that have active variants
db.fertilizers_data.find({
  "product_variants.0": { $exists: true }
})
```

---

## Data Source

All data was scraped from DeHaat platform product pages:
- **Total Products Scraped**: 120
- **Valid Products in DB**: 119
- **Scraping Date**: February 2026
- **Source Files**: `/dehaat_scraper/scraped_products/*.json`

---

## Metadata Fields

All collections include standard metadata:
- `createdAt`: Timestamp when document was inserted
- `updatedAt`: Timestamp of last modification
- `isActive`: Boolean flag for soft deletes/active status

---

## Future Enhancements

Potential additions to the data structure:
1. **User Reviews**: Add ratings and reviews for products
2. **Pricing**: Store variant pricing information
3. **Inventory**: Track product availability
4. **Regional Data**: Localize data by region/state
5. **Weather Integration**: Link crop data with weather patterns
6. **Pest/Disease Database**: Expand with pest identification data
7. **Application Schedule**: Add timing recommendations for product application
8. **Multilingual Support**: Expand localization beyond Hindi
