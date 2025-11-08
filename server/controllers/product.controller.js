const productModel = require('../models/product.model');
const { validationResult } = require('express-validator');

const productController = {
  /**
   * Get all products
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        category_id: req.query.category_id,
        search: req.query.search
      };

      const result = await productModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products'
      });
    }
  },

  /**
   * Get product by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product'
      });
    }
  },

  /**
   * Get product by SKU
   */
  async getBySKU(req, res) {
    try {
      const { sku } = req.params;
      const product = await productModel.getBySKU(sku);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Get product by SKU error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching product'
      });
    }
  },

  /**
   * Create product
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const productData = {
        ...req.body,
        created_by: req.user.id
      };

      const product = await productModel.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating product'
      });
    }
  },

  /**
   * Update product
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const product = await productModel.update(id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating product'
      });
    }
  },

  /**
   * Delete product
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await productModel.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting product'
      });
    }
  },

  /**
   * Get product categories
   */
  async getCategories(req, res) {
    try {
      const categories = await productModel.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories'
      });
    }
  },

  /**
   * Create product category
   */
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const categoryData = {
        ...req.body,
        created_by: req.user.id
      };

      const category = await productModel.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category'
      });
    }
  },

  /**
   * Update product category
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const category = await productModel.updateCategory(id, req.body);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category'
      });
    }
  },

  /**
   * Delete product category
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      await productModel.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category'
      });
    }
  },

  /**
   * Get product suppliers
   */
  async getSuppliers(req, res) {
    try {
      const { id } = req.params;
      const suppliers = await productModel.getSuppliers(id);

      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      console.error('Get suppliers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching suppliers'
      });
    }
  },

  /**
   * Add product supplier
   */
  async addSupplier(req, res) {
    try {
      const supplier = await productModel.addSupplier(req.body);

      res.status(201).json({
        success: true,
        message: 'Supplier added successfully',
        data: supplier
      });
    } catch (error) {
      console.error('Add supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding supplier'
      });
    }
  },

  /**
   * Update product supplier
   */
  async updateSupplier(req, res) {
    try {
      const { productId, vendorId } = req.params;
      const supplier = await productModel.updateSupplier(productId, vendorId, req.body);

      res.json({
        success: true,
        message: 'Supplier updated successfully',
        data: supplier
      });
    } catch (error) {
      console.error('Update supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating supplier'
      });
    }
  },

  /**
   * Remove product supplier
   */
  async removeSupplier(req, res) {
    try {
      const { productId, vendorId } = req.params;
      await productModel.removeSupplier(productId, vendorId);

      res.json({
        success: true,
        message: 'Supplier removed successfully'
      });
    } catch (error) {
      console.error('Remove supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing supplier'
      });
    }
  },

  /**
   * Get serial numbers
   */
  async getSerialNumbers(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const serialNumbers = await productModel.getSerialNumbers(id, status);

      res.json({
        success: true,
        data: serialNumbers
      });
    } catch (error) {
      console.error('Get serial numbers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching serial numbers'
      });
    }
  },

  /**
   * Add serial number
   */
  async addSerialNumber(req, res) {
    try {
      const serialNumber = await productModel.addSerialNumber(req.body);

      res.status(201).json({
        success: true,
        message: 'Serial number added successfully',
        data: serialNumber
      });
    } catch (error) {
      console.error('Add serial number error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding serial number'
      });
    }
  },

  /**
   * Update serial number
   */
  async updateSerialNumber(req, res) {
    try {
      const { serialId } = req.params;
      const serialNumber = await productModel.updateSerialNumber(serialId, req.body);

      res.json({
        success: true,
        message: 'Serial number updated successfully',
        data: serialNumber
      });
    } catch (error) {
      console.error('Update serial number error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating serial number'
      });
    }
  },

  /**
   * Get batch numbers
   */
  async getBatchNumbers(req, res) {
    try {
      const { id } = req.params;
      const batchNumbers = await productModel.getBatchNumbers(id);

      res.json({
        success: true,
        data: batchNumbers
      });
    } catch (error) {
      console.error('Get batch numbers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching batch numbers'
      });
    }
  },

  /**
   * Add batch number
   */
  async addBatchNumber(req, res) {
    try {
      const batchNumber = await productModel.addBatchNumber(req.body);

      res.status(201).json({
        success: true,
        message: 'Batch number added successfully',
        data: batchNumber
      });
    } catch (error) {
      console.error('Add batch number error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding batch number'
      });
    }
  },

  /**
   * Update batch number
   */
  async updateBatchNumber(req, res) {
    try {
      const { productId, batchNo } = req.params;
      const batchNumber = await productModel.updateBatchNumber(productId, batchNo, req.body);

      res.json({
        success: true,
        message: 'Batch number updated successfully',
        data: batchNumber
      });
    } catch (error) {
      console.error('Update batch number error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating batch number'
      });
    }
  }
};

module.exports = productController;
