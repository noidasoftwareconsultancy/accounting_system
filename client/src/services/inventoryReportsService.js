import api from './api';

const inventoryReportsService = {
  getStockMovementReport: (params) => api.get('/inventory-reports/stock-movement', { params }),
  getInventoryAgingReport: (warehouseId) => api.get('/inventory-reports/inventory-aging', { params: { warehouse_id: warehouseId } }),
  getStockTurnoverReport: (startDate, endDate, warehouseId) => api.get('/inventory-reports/stock-turnover', { 
    params: { start_date: startDate, end_date: endDate, warehouse_id: warehouseId } 
  }),
  getReorderReport: () => api.get('/inventory-reports/reorder'),
  getDeadStockReport: (daysThreshold, warehouseId) => api.get('/inventory-reports/dead-stock', { 
    params: { days_threshold: daysThreshold, warehouse_id: warehouseId } 
  }),
  getInventoryVarianceReport: (startDate, endDate) => api.get('/inventory-reports/inventory-variance', { 
    params: { start_date: startDate, end_date: endDate } 
  }),
};

export default inventoryReportsService;
