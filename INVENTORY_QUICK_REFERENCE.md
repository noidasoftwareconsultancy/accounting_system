# Inventory Management System - Quick Reference

## 🚀 Quick Start

### 1. Apply Database Migration
```bash
cd server
npm run db:generate
npx prisma migrate dev --name complete_inventory_system
npm run dev
```

### 2. Test the System
```bash
# Get inventory stats
curl http://localhost:5001/api/inventory/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Key API Endpoints

### Invoice-Inventory Integration
```bash
# Check if invoice has sufficient stock
GET /api/invoices/:id/inventory-availability?warehouse_id=1

# Reserve inventory for pending invoice
POST /api/invoices/:id/reserve-inventory
Body: { "warehouse_id": 1 }

# Mark as paid and deduct inventory
POST /api/invoices/:id/mark-paid-with-inventory
Body: { "warehouse_id": 1 }

# Release reserved inventory
POST /api/invoices/:id/release-inventory
Body: { "warehouse_id": 1 }

# Get invoice with inventory status
GET /api/invoices/:id/inventory-status?warehouse_id=1
```

### Inventory Reports
```bash
# Stock movement report
GET /api/inventory-reports/stock-movement?start_date=2024-01-01&end_date=2024-12-31

# Inventory aging report
GET /api/inventory-reports/inventory-aging?warehouse_id=1

# Stock turnover report
GET /api/inventory-reports/stock-turnover?start_date=2024-01-01&end_date=2024-12-31

# Reorder report (items below reorder level)
GET /api/inventory-reports/reorder

# Dead stock report (no movement for X days)
GET /api/inventory-reports/dead-stock?days_threshold=180

# Inventory variance report
GET /api/inventory-reports/inventory-variance?start_date=2024-01-01&end_date=2024-12-31
```

### Core Inventory Operations
```bash
# Get inventory stats
GET /api/inventory/stats

# Get low stock items
GET /api/inventory/low-stock

# Get inventory valuation
GET /api/inventory/valuation?warehouse_id=1

# Update inventory quantity
POST /api/inventory/update-quantity
Body: {
  "productId": 1,
  "warehouseId": 1,
  "quantityChange": 10,
  "movementType": "adjustment"
}
```

## 🔄 Common Workflows

### Workflow 1: Create Invoice with Inventory Deduction
```javascript
// 1. Create invoice with product_id
POST /api/invoices
{
  "invoice_number": "INV-001",
  "client_id": 1,
  "issue_date": "2024-01-20",
  "due_date": "2024-02-20",
  "items": [
    {
      "product_id": 1,  // Link to inventory
      "description": "Product Name",
      "quantity": 5,
      "unit_price": 100,
      "amount": 500
    }
  ]
}

// 2. Check availability
GET /api/invoices/1/inventory-availability?warehouse_id=1

// 3. Reserve inventory (optional)
POST /api/invoices/1/reserve-inventory
{ "warehouse_id": 1 }

// 4. Mark as paid (deducts inventory)
POST /api/invoices/1/mark-paid-with-inventory
{ "warehouse_id": 1 }
```

### Workflow 2: Purchase and Restock
```javascript
// 1. Create purchase order
POST /api/purchase-orders
{
  "po_number": "PO-001",
  "vendor_id": 1,
  "order_date": "2024-01-15",
  "items": [...]
}

// 2. Receive goods (adds to inventory)
POST /api/purchase-orders/1/receive
{
  "warehouse_id": 1,
  "received_items": [
    {
      "item_id": 1,
      "product_id": 1,
      "quantity_received": 100,
      "unit_cost": 60
    }
  ]
}
```

### Workflow 3: Stock Transfer
```javascript
// 1. Create transfer
POST /api/stock-transfers
{
  "transfer_number": "ST-001",
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "transfer_date": "2024-01-15",
  "items": [...]
}

// 2. Process (deduct from source)
POST /api/stock-transfers/1/process

// 3. Complete (add to destination)
POST /api/stock-transfers/1/complete
{
  "received_items": [...]
}
```

## 📊 Report Examples

### Stock Movement Report
```javascript
GET /api/inventory-reports/stock-movement?product_id=1&movement_type=sale&start_date=2024-01-01&end_date=2024-12-31

Response:
{
  "movements": [...],
  "summary": {
    "total_movements": 150,
    "by_type": {
      "sale": 80,
      "purchase": 50,
      "adjustment": 20
    },
    "total_value": 125000
  }
}
```

### Reorder Report
```javascript
GET /api/inventory-reports/reorder

Response:
{
  "items": [
    {
      "product_name": "Product A",
      "current_stock": 3,
      "reorder_level": 10,
      "reorder_quantity": 50,
      "shortage": 7,
      "preferred_supplier": {
        "vendor_name": "Supplier Inc",
        "unit_price": 60,
        "estimated_cost": 3000
      }
    }
  ],
  "summary": {
    "total_items_to_reorder": 12,
    "total_estimated_cost": 45000
  }
}
```

## 🔍 Key Features

### Automatic Inventory Deduction
- ✅ Triggered on invoice payment
- ✅ Validates stock availability
- ✅ Creates audit trail
- ✅ Transaction-safe

### Inventory Reservation
- ✅ Reserve for pending orders
- ✅ Separate available vs reserved tracking
- ✅ Auto-release on cancellation

### Multi-Warehouse
- ✅ Track across locations
- ✅ Inter-warehouse transfers
- ✅ Location-specific reports

### Advanced Reports
- ✅ Stock movement analysis
- ✅ Aging analysis
- ✅ Turnover ratios
- ✅ Reorder suggestions
- ✅ Dead stock identification
- ✅ Variance tracking

## 🔒 Security

All endpoints require:
- ✅ JWT authentication
- ✅ Valid user session
- ✅ Proper permissions

## 📝 Database Schema

### Key Relations
```
Invoice → InvoiceItem → Product → InventoryItem
PurchaseOrder → PurchaseOrderItem → Product → InventoryItem
Product → ProductSupplier → Vendor
StockMovement → Product + Warehouse
```

## 🎯 Quick Tips

1. **Always check availability** before finalizing invoices
2. **Use reservations** for pending orders
3. **Set reorder levels** for automatic alerts
4. **Review reports regularly** for insights
5. **Track serial numbers** for high-value items
6. **Use batch tracking** for expirable products
7. **Approve adjustments** before applying
8. **Monitor dead stock** to reduce waste

## 📞 Support

For detailed documentation, see:
- `INVENTORY_SYSTEM_COMPLETE.md` - Complete system documentation
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- `INVENTORY_API_EXAMPLES.md` - Detailed API examples

## ✅ Status

**System Status**: Production Ready ✅
**All Tests**: Passing ✅
**Documentation**: Complete ✅
**Integration**: Full ✅
