const warehouseModel = require('../models/warehouse.model');
const { validationResult } = require('express-validator');

const warehouseController = {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await warehouseModel.getAll(page, limit);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Get warehouses error:', error);
      res.status(500).json({ success: false, message: 'Error fetching warehouses' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const warehouse = await warehouseModel.getById(id);
      if (!warehouse) {
        return res.status(404).json({ success: false, message: 'Warehouse not found' });
      }
      res.json({ success: true, data: warehouse });
    } catch (error) {
      console.error('Get warehouse error:', error);
      res.status(500).json({ success: false, message: 'Error fetching warehouse' });
    }
  },

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const warehouseData = { ...req.body, created_by: req.user.id };
      const warehouse = await warehouseModel.create(warehouseData);
      res.status(201).json({ success: true, message: 'Warehouse created successfully', data: warehouse });
    } catch (error) {
      console.error('Create warehouse error:', error);
      res.status(500).json({ success: false, message: 'Error creating warehouse' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const warehouse = await warehouseModel.update(id, req.body);
      res.json({ success: true, message: 'Warehouse updated successfully', data: warehouse });
    } catch (error) {
      console.error('Update warehouse error:', error);
      res.status(500).json({ success: false, message: 'Error updating warehouse' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      await warehouseModel.delete(id);
      res.json({ success: true, message: 'Warehouse deleted successfully' });
    } catch (error) {
      console.error('Delete warehouse error:', error);
      res.status(500).json({ success: false, message: 'Error deleting warehouse' });
    }
  },

  async getInventorySummary(req, res) {
    try {
      const { id } = req.params;
      const summary = await warehouseModel.getInventorySummary(id);
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Get inventory summary error:', error);
      res.status(500).json({ success: false, message: 'Error fetching inventory summary' });
    }
  }
};

module.exports = warehouseController;
