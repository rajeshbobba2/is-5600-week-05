const path = require('path');
const cuid = require('cuid');
const db = require('./db');

const productsFile = path.join(__dirname, 'data/full-products.json');

// Define our Product Model
const Product = db.model('Product', {
  _id: { type: String, default: cuid },
  description: { type: String },
  alt_description: { type: String },
  likes: { type: Number, required: true },
  urls: {
    regular: { type: String, required: true },
    small: { type: String, required: true },
    thumb: { type: String, required: true },
  },
  links: {
    self: { type: String, required: true },
    html: { type: String, required: true },
  },
  user: {
    id: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String },
    portfolio_url: { type: String },
    username: { type: String, required: true },
  },
  tags: [
    {
      title: { type: String, required: true },
    },
  ],
});

/**
 * List products
 * @param {Object} options - Query options including offset, limit, and tag.
 * @returns {Promise<Object[]>} - List of products matching the query.
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, tag } = options;

  try {
    const query = tag
      ? {
          tags: {
            $elemMatch: {
              title: tag,
            },
          },
        }
      : {};

    const products = await Product.find(query)
      .sort({ _id: 1 }) // Sort by ID in ascending order
      .skip(Number(offset)) // Ensure offset is a number
      .limit(Number(limit)); // Ensure limit is a number

    return products;
  } catch (err) {
    console.error('Error listing products:', err.message);
    throw err;
  }
}

/**
 * Get a single product
 * @param {string} id - The ID of the product to fetch.
 * @returns {Promise<Object|null>} - The product if found, or null.
 */
async function get(_id) {
  try {
    const product = await Product.findById(_id);
    return product || null; // Explicitly return null if not found
  } catch (err) {
    console.error(`Error fetching product with ID ${_id}:`, err.message);
    throw err;
  }
}

/**
 * Create a new product
 * @param {Object} fields - Fields for the new product.
 * @returns {Promise<Object>} - The created product.
 */
async function create(fields) {
  try {
    const product = await new Product(fields).save();
    return product;
  } catch (err) {
    console.error('Error creating product:', err.message);
    throw err;
  }
}

/**
 * Edit an existing product
 * @param {string} _id - The ID of the product to edit.
 * @param {Object} change - Fields to update.
 * @returns {Promise<Object|null>} - The updated product or null if not found.
 */
async function edit(_id, change) {
  try {
    const product = await get(_id);

    if (!product) {
      return null; // Explicitly return null if product not found
    }

    // Update fields dynamically
    Object.assign(product, change);

    await product.save();
    return product;
  } catch (err) {
    console.error(`Error editing product with ID ${_id}:`, err.message);
    throw err;
  }
}

/**
 * Delete a product
 * @param {string} _id - The ID of the product to delete.
 * @returns {Promise<Object>} - The result of the delete operation.
 */
async function destroy(_id) {
  try {
    const result = await Product.deleteOne({ _id });
    return result;
  } catch (err) {
    console.error(`Error deleting product with ID ${_id}:`, err.message);
    throw err;
  }
}

module.exports = {
  list,
  get,
  create,
  edit,
  destroy,
};
