const inventoryReportsModel = require('../models/inventory-reports.model');

const inventoryReportsController = {
  async getStockMovementReport(req, res) {
    try {
      const filters = {
        product_id: req.query.product_id,
        warehouse_id: req.query.warehouse_id,
        movement_type: req.query.movement_type,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const report = await inventoryReportsModel.getStockMovementReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get stock movement report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating stock movement report'
      });
    }
  },

  async getInventoryAgingReport(req, res) {
    try {
      const { warehouse_id } = req.query;
      const report = await inventoryReportsModel.getInventoryAgingReport(warehouse_id);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get inventory aging report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating inventory aging report'
      });
    }
  },

  async getStockTurnoverReport(req, res) {
    try {
      const { start_date, end_date, warehouse_id } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await inventoryReportsModel.getStockTurnoverReport(start_date, end_date, warehouse_id);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get stock turnover report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating stock turnover report'
      });
    }
  },

  async getReorderReport(req, res) {
    try {
      const report = await inventoryReportsModel.getReorderReport();

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get reorder report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating reorder report'
      });
    }
  },

  async getDeadStockReport(req, res) {
    try {
      const { days_threshold, warehouse_id } = req.query;
      const daysThreshold = days_threshold ? parseInt(days_threshold) : 180;

      const report = await inventoryReportsModel.getDeadStockReport(daysThreshold, warehouse_id);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get dead stock report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating dead stock report'
      });
    }
  },

  async getInventoryVarianceReport(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const report = await inventoryReportsModel.getInventoryVarianceReport(start_date, end_date);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get inventory variance report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating inventory variance report'
      });
    }
  }
};

module.exports = inventoryReportsController;
