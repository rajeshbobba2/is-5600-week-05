const path = require('path');
const Products = require('./products');
const Orders = require('./orders');
const autoCatch = require('./lib/auto-catch');

/**
 * Handle the root route
 * @param {object} req
 * @param {object} res
 */
function handleRoot(req, res) {
  try {
    res.sendFile(path.join(__dirname, 'index.html')); // Removed redundant forward slash
  } catch (err) {
    console.error('Error serving the root file:', err.message);
    res.status(500).send('Internal Server Error');
  }
}

/**
 * List all products
 * @param {object} req
 * @param {object} res
 */
async function listProducts(req, res, next) {
  try {
    const { offset = 0, limit = 25, tag } = req.query;

    const products = await Products.list({
      offset: Number(offset),
      limit: Number(limit),
      tag,
    });

    res.json(products);
  } catch (err) {
    console.error('Error listing products:', err.message);
    next(err); // Pass error to error-handling middleware
  }
}

/**
 * Get a single product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await Products.get(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(`Error fetching product with ID ${req.params.id}:`, err.message);
    next(err);
  }
}

/**
 * Create a product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function createProduct(req, res, next) {
  try {
    const product = await Products.create(req.body);
    res.status(201).json(product); // Use 201 for successful creation
  } catch (err) {
    console.error('Error creating product:', err.message);
    next(err);
  }
}

/**
 * Edit a product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function editProduct(req, res, next) {
  try {
    const changes = req.body;
    const product = await Products.edit(req.params.id, changes);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(`Error editing product with ID ${req.params.id}:`, err.message);
    next(err);
  }
}

/**
 * Delete a product
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
async function deleteProduct(req, res, next) {
  try {
    const response = await Products.destroy(req.params.id);

    if (!response) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send(); // Use 204 No Content for successful deletion
  } catch (err) {
    console.error(`Error deleting product with ID ${req.params.id}:`, err.message);
    next(err);
  }
}

async function createOrder (req, res, next) {
  const order = await Orders.create(req.body)
  res.json(orders)
}

async function editOrder(req, res, next) {
  const change = req.body
  const order = await Orders.edit(req.params.id, change)
  res.json(order)
}

/**
 * Delete an order
 * @param {object} req
 * @param {object} res
 */
async function deleteOrder(req, res, next) {
  await Orders.destroy(req.params.id)
  res.json({ success: true })
}


async function listOrders (req, res, next) {
  const { offset = 0, limit = 25, productId, status } = req.query

  const orders = await Orders.list({ 
    offset: Number(offset), 
    limit: Number(limit),
    productId, 
    status 
  })

  res.json(orders)
}

module.exports = autoCatch({
  handleRoot,
  listProducts,
  getProduct,
  createProduct,
  editProduct,
  deleteProduct,
  listOrders,
  createOrder,
  editOrder,
  deleteOrder,
});
