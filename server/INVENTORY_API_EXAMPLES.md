# Inventory Management API - Request Examples

## Authentication
All requests require authentication. First, login to get a token:

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Use the token in all subsequent requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 1. Product Management

### Create Product Category
```bash
POST /api/products/categories
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parent_id": null
}
```

### Create Product
```bash
POST /api/products
{
  "sku": "LAPTOP-001",
  "name": "Dell Latitude 5420",
  "description": "14-inch business laptop",
  "category_id": 1,
  "unit_of_measure": "pcs",
  "unit_price": 1200.00,
  "cost_price": 850.00,
  "reorder_level": 5,
  "reorder_quantity": 20,
  "tax_rate": 18.00,
  "barcode": "1234567890123",
  "is_active": true,
  "is_serialized": true,
  "is_batch_tracked": false
}
```

### Get All Products
```bash
GET /api/products?page=1&limit=10&search=laptop&category_id=1
```

### Get Product by ID
```bash
GET /api/products/1
```

### Get Product by SKU
```bash
GET /api/products/sku/LAPTOP-001
```

### Update Product
```bash
PUT /api/products/1
{
  "unit_price": 1150.00,
  "reorder_level": 10
}
```

### Delete Product (Soft Delete)
```bash
DELETE /api/products/1
```

---

## 2. Warehouse Management

### Create Warehouse
```bash
POST /api/warehouses
{
  "name": "Main Warehouse",
  "code": "WH-MAIN",
  "address": "123 Industrial Ave",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postal_code": "10001",
  "phone": "+1-555-0100",
  "email": "warehouse@company.com",
  "is_active": true
}
```

### Get All Warehouses
```bash
GET /api/warehouses?page=1&limit=10
```

### Get Warehouse by ID
```bash
GET /api/warehouses/1
```

### Get Warehouse Inventory Summary
```bash
GET /api/warehouses/1/inventory-summary
```

### Update Warehouse
```bash
PUT /api/warehouses/1
{
  "phone": "+1-555-0101",
  "manager_id": 2
}
```

---

## 3. Inventory Management

### Get All Inventory
```bash
GET /api/inventory?page=1&limit=10&warehouse_id=1&product_id=1
```

### Get Inventory Statistics
```bash
GET /api/inventory/stats

Response:
{
  "success": true,
  "data": {
    "total_products": 150,
    "total_warehouses": 3,
    "low_stock_items": 12,
    "total_inventory_value": 125000.50
  }
}
```

### Get Low Stock Items
```bash
GET /api/inventory/low-stock

Response:
{
  "success": true,
  "data": [
    {
      "product_id": 1,
      "product_name": "Dell Latitude 5420",
      "sku": "LAPTOP-001",
      "warehouse_name": "Main Warehouse",
      "quantity_available": 3,
      "reorder_level": 5,
      "reorder_quantity": 20
    }
  ]
}
```

### Get Inventory Valuation
```bash
GET /api/inventory/valuation?warehouse_id=1

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "total_value": 125000.50
  }
}
```

### Get Inventory by Product
```bash
GET /api/inventory/product/1

Response:
{
  "success": true,
  "data": [
    {
      "warehouse_id": 1,
      "warehouse_name": "Main Warehouse",
      "quantity_on_hand": 25,
      "quantity_reserved": 5,
      "quantity_available": 20
    },
    {
      "warehouse_id": 2,
      "warehouse_name": "Secondary Warehouse",
      "quantity_on_hand": 15,
      "quantity_reserved": 0,
      "quantity_available": 15
    }
  ]
}
```

### Update Inventory Quantity
```bash
POST /api/inventory/update-quantity
{
  "productId": 1,
  "warehouseId": 1,
  "quantityChange": 10,
  "movementType": "adjustment",
  "referenceType": null,
  "referenceId": null
}
```

### Reserve Inventory
```bash
POST /api/inventory/reserve
{
  "productId": 1,
  "warehouseId": 1,
  "quantity": 5
}
```

### Release Reserved Inventory
```bash
POST /api/inventory/release
{
  "productId": 1,
  "warehouseId": 1,
  "quantity": 5
}
```

---

## 4. Purchase Order Management

### Generate PO Number
```bash
GET /api/purchase-orders/generate-po-number

Response:
{
  "success": true,
  "data": {
    "po_number": "PO-0001"
  }
}
```

### Create Purchase Order
```bash
POST /api/purchase-orders
{
  "po_number": "PO-0001",
  "vendor_id": 1,
  "warehouse_id": 1,
  "order_date": "2024-01-15",
  "expected_date": "2024-01-30",
  "subtotal": 17000.00,
  "tax_amount": 3060.00,
  "shipping_cost": 200.00,
  "total_amount": 20260.00,
  "currency": "USD",
  "payment_terms": 30,
  "notes": "Urgent order for Q1 inventory",
  "items": [
    {
      "product_id": 1,
      "quantity": 20,
      "unit_price": 850.00,
      "tax_rate": 18.00,
      "tax_amount": 3060.00,
      "total_amount": 20060.00
    }
  ]
}
```

### Get All Purchase Orders
```bash
GET /api/purchase-orders?page=1&limit=10&vendor_id=1&status=confirmed
```

### Get Purchase Order by ID
```bash
GET /api/purchase-orders/1
```

### Get Purchase Orders by Vendor
```bash
GET /api/purchase-orders/vendor/1?page=1&limit=10
```

### Update Purchase Order
```bash
PUT /api/purchase-orders/1
{
  "status": "confirmed",
  "expected_date": "2024-01-28"
}
```

### Receive Purchase Order
```bash
POST /api/purchase-orders/1/receive
{
  "warehouse_id": 1,
  "received_items": [
    {
      "item_id": 1,
      "product_id": 1,
      "quantity_received": 20,
      "unit_cost": 850.00
    }
  ]
}
```

### Get Purchase Order Statistics
```bash
GET /api/purchase-orders/stats

Response:
{
  "success": true,
  "data": {
    "total_orders": 45,
    "pending_orders": 8,
    "total_value": 250000.00
  }
}
```

---

## 5. Stock Transfer Management

### Generate Transfer Number
```bash
GET /api/stock-transfers/generate-transfer-number

Response:
{
  "success": true,
  "data": {
    "transfer_number": "ST-0001"
  }
}
```

### Create Stock Transfer
```bash
POST /api/stock-transfers
{
  "transfer_number": "ST-0001",
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "transfer_date": "2024-01-15",
  "expected_date": "2024-01-17",
  "notes": "Rebalancing inventory",
  "items": [
    {
      "product_id": 1,
      "quantity": 10
    },
    {
      "product_id": 2,
      "quantity": 25
    }
  ]
}
```

### Get All Stock Transfers
```bash
GET /api/stock-transfers?page=1&limit=10&from_warehouse_id=1&status=pending
```

### Get Stock Transfer by ID
```bash
GET /api/stock-transfers/1
```

### Process Stock Transfer (Deduct from Source)
```bash
POST /api/stock-transfers/1/process
```

### Complete Stock Transfer (Add to Destination)
```bash
POST /api/stock-transfers/1/complete
{
  "received_items": [
    {
      "item_id": 1,
      "product_id": 1,
      "quantity_received": 10
    },
    {
      "item_id": 2,
      "product_id": 2,
      "quantity_received": 25
    }
  ]
}
```

### Cancel Stock Transfer
```bash
POST /api/stock-transfers/1/cancel
```

---

## 6. Stock Adjustment Management

### Generate Adjustment Number
```bash
GET /api/stock-adjustments/generate-adjustment-number

Response:
{
  "success": true,
  "data": {
    "adjustment_number": "ADJ-0001"
  }
}
```

### Create Stock Adjustment
```bash
POST /api/stock-adjustments
{
  "adjustment_number": "ADJ-0001",
  "warehouse_id": 1,
  "adjustment_date": "2024-01-15",
  "reason": "Physical count discrepancy",
  "notes": "Annual inventory audit",
  "items": [
    {
      "product_id": 1,
      "quantity_before": 25,
      "quantity_after": 23,
      "quantity_change": -2,
      "notes": "2 units damaged"
    }
  ]
}
```

### Get All Stock Adjustments
```bash
GET /api/stock-adjustments?page=1&limit=10&warehouse_id=1&status=draft
```

### Get Stock Adjustment by ID
```bash
GET /api/stock-adjustments/1
```

### Approve Stock Adjustment
```bash
POST /api/stock-adjustments/1/approve
{
  "warehouse_id": 1
}
```

### Cancel Stock Adjustment
```bash
POST /api/stock-adjustments/1/cancel
```

---

## 7. Product Supplier Management

### Add Supplier to Product
```bash
POST /api/products/suppliers
{
  "product_id": 1,
  "vendor_id": 1,
  "supplier_sku": "DELL-LAT-5420",
  "unit_price": 850.00,
  "minimum_order_qty": 10,
  "lead_time_days": 14,
  "is_preferred": true
}
```

### Get Suppliers for Product
```bash
GET /api/products/1/suppliers
```

### Update Product Supplier
```bash
PUT /api/products/1/suppliers/1
{
  "unit_price": 825.00,
  "lead_time_days": 10
}
```

### Remove Supplier from Product
```bash
DELETE /api/products/1/suppliers/1
```

---

## 8. Serial Number Management

### Add Serial Number
```bash
POST /api/products/serial-numbers
{
  "product_id": 1,
  "serial_no": "SN123456789",
  "status": "available",
  "purchase_date": "2024-01-15",
  "warranty_expiry": "2027-01-15"
}
```

### Get Serial Numbers for Product
```bash
GET /api/products/1/serial-numbers?status=available
```

### Update Serial Number
```bash
PUT /api/products/serial-numbers/1
{
  "status": "sold",
  "sale_date": "2024-02-01"
}
```

---

## 9. Batch Number Management

### Add Batch Number
```bash
POST /api/products/batch-numbers
{
  "product_id": 2,
  "batch_no": "BATCH-2024-001",
  "manufacturing_date": "2024-01-01",
  "expiry_date": "2025-01-01",
  "quantity": 100
}
```

### Get Batch Numbers for Product
```bash
GET /api/products/2/batch-numbers
```

### Update Batch Number
```bash
PUT /api/products/2/batch-numbers/BATCH-2024-001
{
  "quantity": 95
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "sku",
      "message": "SKU is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

---

## Testing with cURL

### Example: Complete Purchase Order Flow
```bash
# 1. Create vendor (if not exists)
curl -X POST http://localhost:5001/api/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Supplier Inc","email":"supplier@tech.com"}'

# 2. Create product
curl -X POST http://localhost:5001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sku":"PROD-001","name":"Laptop","unit_of_measure":"pcs","unit_price":1000,"cost_price":700}'

# 3. Create warehouse
curl -X POST http://localhost:5001/api/warehouses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Warehouse","code":"WH-001"}'

# 4. Create purchase order
curl -X POST http://localhost:5001/api/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"po_number":"PO-0001","vendor_id":1,"warehouse_id":1,"order_date":"2024-01-15","subtotal":7000,"total_amount":7000,"items":[{"product_id":1,"quantity":10,"unit_price":700,"total_amount":7000}]}'

# 5. Receive purchase order
curl -X POST http://localhost:5001/api/purchase-orders/1/receive \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"warehouse_id":1,"received_items":[{"item_id":1,"product_id":1,"quantity_received":10,"unit_cost":700}]}'

# 6. Check inventory
curl -X GET http://localhost:5001/api/inventory/product/1 \
  -H "Authorization: Bearer $TOKEN"
```
