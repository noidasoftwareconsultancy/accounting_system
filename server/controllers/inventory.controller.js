const inventoryModel = require('../models/inventory.model');
const { validationResult } = require('express-validator');

const inventoryController = {
  /**
   * Get all inventory items
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        product_id: req.query.product_id,
        warehouse_id: req.query.warehouse_id,
        low_stock: req.query.low_stock
      };

      const result = await inventoryModel.getAll(filters, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory'
      });
    }
  },

  /**
   * Get inventory by product and warehouse
   */
  async getByProductAndWarehouse(req, res) {
    try {
      const { productId, warehouseId } = req.params;
      const inventory = await inventoryModel.getByProductAndWarehouse(productId, warehouseId);

      if (!inventory) {
        return res.status(404).json({
          success: false,
          message: 'Inventory not found'
        });
      }

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Get inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory'
      });
    }
  },

  /**
   * Get inventory by product
   */
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const inventory = await inventoryModel.getByProduct(productId);

      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Get inventory by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory'
      });
    }
  },

  /**
   * Get inventory by warehouse
   */
  async getByWarehouse(req, res) {
    try {
      const { warehouseId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await inventoryModel.getByWarehouse(warehouseId, page, limit);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get inventory by warehouse error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory'
      });
    }
  },

  /**
   * Update inventory quantity
   */
  async updateQuantity(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { productId, warehouseId, quantityChange, movementType, referenceType, referenceId } = req.body;

      const inventory = await inventoryModel.updateQuantity(
        productId,
        warehouseId,
        quantityChange,
        movementType,
        referenceType,
        referenceId,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: inventory
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating inventory'
      });
    }
  },

  /**
   * Reserve inventory
   */
  async reserveInventory(req, res) {
    try {
      const { productId, warehouseId, quantity } = req.body;

      const inventory = await inventoryModel.reserveInventory(productId, warehouseId, quantity);

      res.json({
        success: true,
        message: 'Inventory reserved successfully',
        data: inventory
      });
    } catch (error) {
      console.error('Reserve inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Error reserving inventory'
      });
    }
  },

  /**
   * Release reserved inventory
   */
  async releaseReservedInventory(req, res) {
    try {
      const { productId, warehouseId, quantity } = req.body;

      const inventory = await inventoryModel.releaseReservedInventory(productId, warehouseId, quantity);

      res.json({
        success: true,
        message: 'Reserved inventory released successfully',
        data: inventory
      });
    } catch (error) {
      console.error('Release inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Error releasing inventory'
      });
    }
  },

  /**
   * Get low stock items
   */
  async getLowStockItems(req, res) {
    try {
      const items = await inventoryModel.getLowStockItems();

      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Get low stock items error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock items'
      });
    }
  },

  /**
   * Get inventory valuation
   */
  async getInventoryValuation(req, res) {
    try {
      const { warehouseId } = req.query;
      const valuation = await inventoryModel.getInventoryValuation(warehouseId);

      res.json({
        success: true,
        data: valuation
      });
    } catch (error) {
      console.error('Get inventory valuation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory valuation'
      });
    }
  },

  /**
   * Get inventory statistics
   */
  async getStats(req, res) {
    try {
      const stats = await inventoryModel.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get inventory stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching inventory statistics'
      });
    }
  }
};

module.exports = inventoryController;
