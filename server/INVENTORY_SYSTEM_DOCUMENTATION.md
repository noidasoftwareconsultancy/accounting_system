# Inventory Management System Documentation

## Overview
Complete inventory management system integrated with the existing financial management system, including products, warehouses, stock movements, purchase orders, and stock transfers.

## Database Schema

### New Models Added

#### 1. Warehouse
Manages warehouse/location information
- Fields: name, code, address, city, state, country, postal_code, phone, email, manager_id, is_active
- Relations: inventory_items, stock_movements, stock_transfers

#### 2. ProductCategory
Hierarchical product categorization
- Fields: name, description, parent_id, is_active
- Relations: parent_category, sub_categories, products
- Supports nested categories

#### 3. Product
Product master data
- Fields: sku, name, description, category_id, unit_of_measure, unit_price, cost_price, reorder_level, reorder_quantity, tax_rate, barcode, image_url, is_active, is_serialized, is_batch_tracked
- Relations: category, inventory_items, purchase_order_items, stock_movements, product_suppliers, serial_numbers, batch_numbers

#### 4. InventoryItem
Current stock levels per product per warehouse
- Fields: product_id, warehouse_id, quantity_on_hand, quantity_reserved, quantity_available, last_stock_date
- Relations: product, warehouse
- Unique constraint: (product_id, warehouse_id)

#### 5. StockMovement
Audit trail of all inventory movements
- Fields: product_id, warehouse_id, movement_type, reference_type, reference_id, quantity, unit_cost, notes, movement_date
- Movement types: purchase, sale, adjustment, transfer, return
- Relations: product, warehouse, creator

#### 6. StockTransfer
Inter-warehouse stock transfers
- Fields: transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, expected_date, status, notes
- Status: pending, in_transit, completed, cancelled
- Relations: from_warehouse, to_warehouse, creator, items

#### 7. StockTransferItem
Line items for stock transfers
- Fields: transfer_id, product_id, quantity, quantity_received, notes
- Relations: transfer

#### 8. PurchaseOrder
Purchase orders to vendors
- Fields: po_number, vendor_id, warehouse_id, order_date, expected_date, received_date, status, subtotal, tax_amount, shipping_cost, total_amount, currency, payment_terms, notes
- Status: draft, sent, confirmed, received, cancelled
- Relations: vendor, creator, items

#### 9. PurchaseOrderItem
Line items for purchase orders
- Fields: purchase_order_id, product_id, quantity, quantity_received, unit_price, tax_rate, tax_amount, total_amount, notes
- Relations: purchase_order, product

#### 10. ProductSupplier
Product-vendor relationships with pricing
- Fields: product_id, vendor_id, supplier_sku, unit_price, minimum_order_qty, lead_time_days, is_preferred
- Relations: product, vendor
- Unique constraint: (product_id, vendor_id)

#### 11. SerialNumber
Serial number tracking for serialized products
- Fields: product_id, serial_no, status, purchase_date, sale_date, warranty_expiry, notes
- Status: available, sold, defective, returned
- Relations: product

#### 12. BatchNumber
Batch/lot tracking for batch-tracked products
- Fields: product_id, batch_no, manufacturing_date, expiry_date, quantity, notes
- Relations: product
- Unique constraint: (product_id, batch_no)

#### 13. StockAdjustment
Manual inventory adjustments
- Fields: adjustment_number, warehouse_id, adjustment_date, reason, notes, status
- Status: draft, approved, cancelled
- Relations: creator, items

#### 14. StockAdjustmentItem
Line items for stock adjustments
- Fields: adjustment_id, product_id, quantity_before, quantity_after, quantity_change, notes
- Relations: adjustment

## API Endpoints

### Products API (`/api/products`)
- `GET /` - Get all products (with pagination and filters)
- `GET /:id` - Get product by ID
- `GET /sku/:sku` - Get product by SKU
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product (soft delete)

### Product Categories API (`/api/products/categories`)
- `GET /all` - Get all categories
- `POST /` - Create category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

### Product Suppliers API (`/api/products/suppliers`)
- `GET /:id/suppliers` - Get suppliers for product
- `POST /` - Add supplier to product
- `PUT /:productId/suppliers/:vendorId` - Update supplier info
- `DELETE /:productId/suppliers/:vendorId` - Remove supplier

### Serial Numbers API (`/api/products/serial-numbers`)
- `GET /:id/serial-numbers` - Get serial numbers for product
- `POST /` - Add serial number
- `PUT /:serialId` - Update serial number

### Batch Numbers API (`/api/products/batch-numbers`)
- `GET /:id/batch-numbers` - Get batch numbers for product
- `POST /` - Add batch number
- `PUT /:productId/batch-numbers/:batchNo` - Update batch number

### Warehouses API (`/api/warehouses`)
- `GET /` - Get all warehouses
- `GET /:id` - Get warehouse by ID
- `GET /:id/inventory-summary` - Get inventory summary for warehouse
- `POST /` - Create warehouse
- `PUT /:id` - Update warehouse
- `DELETE /:id` - Delete warehouse

### Inventory API (`/api/inventory`)
- `GET /` - Get all inventory items
- `GET /stats` - Get inventory statistics
- `GET /low-stock` - Get low stock items
- `GET /valuation` - Get inventory valuation
- `GET /product/:productId` - Get inventory for product across all warehouses
- `GET /warehouse/:warehouseId` - Get inventory for warehouse
- `GET /product/:productId/warehouse/:warehouseId` - Get specific inventory item
- `POST /update-quantity` - Update inventory quantity
- `POST /reserve` - Reserve inventory
- `POST /release` - Release reserved inventory

### Purchase Orders API (`/api/purchase-orders`)
- `GET /` - Get all purchase orders
- `GET /stats` - Get purchase order statistics
- `GET /generate-po-number` - Generate new PO number
- `GET /:id` - Get purchase order by ID
- `GET /vendor/:vendorId` - Get purchase orders by vendor
- `POST /` - Create purchase order
- `PUT /:id` - Update purchase order
- `DELETE /:id` - Delete purchase order
- `POST /:id/receive` - Receive purchase order (update inventory)

### Stock Transfers API (`/api/stock-transfers`)
- `GET /` - Get all stock transfers
- `GET /generate-transfer-number` - Generate new transfer number
- `GET /:id` - Get stock transfer by ID
- `POST /` - Create stock transfer
- `PUT /:id` - Update stock transfer
- `DELETE /:id` - Delete stock transfer
- `POST /:id/process` - Process transfer (deduct from source)
- `POST /:id/complete` - Complete transfer (add to destination)
- `POST /:id/cancel` - Cancel transfer

### Stock Adjustments API (`/api/stock-adjustments`)
- `GET /` - Get all stock adjustments
- `GET /generate-adjustment-number` - Generate new adjustment number
- `GET /:id` - Get stock adjustment by ID
- `POST /` - Create stock adjustment
- `POST /:id/approve` - Approve and apply adjustment
- `POST /:id/cancel` - Cancel adjustment

## Integration with Existing System

### Enhanced Vendor Model
- Added relations: `purchase_orders`, `product_suppliers`
- Vendors can now be linked to products as suppliers
- Purchase orders reference vendors

### Enhanced User Model
- Added relations for all inventory-related entities
- Tracks who created/modified inventory records

### Invoice Integration
- Invoice items can reference products
- Automatic inventory deduction when invoices are marked as paid
- Reserved inventory for pending invoices

### Expense Integration
- Expenses can be linked to purchase orders
- Track product costs through purchase orders

## Key Features

### 1. Multi-Warehouse Support
- Track inventory across multiple locations
- Inter-warehouse transfers
- Warehouse-specific inventory levels

### 2. Stock Movement Tracking
- Complete audit trail of all inventory changes
- Reference to source transactions (PO, invoice, transfer, etc.)
- Movement types: purchase, sale, adjustment, transfer, return

### 3. Purchase Order Management
- Create and manage purchase orders
- Track received quantities
- Automatic inventory updates on receipt
- Vendor management integration

### 4. Stock Transfers
- Transfer inventory between warehouses
- Three-stage process: pending → in_transit → completed
- Track expected vs received quantities

### 5. Inventory Reservations
- Reserve inventory for pending orders
- Separate tracking of on-hand vs available quantities
- Automatic release on order cancellation

### 6. Low Stock Alerts
- Configurable reorder levels per product
- Automatic low stock detection
- Reorder quantity suggestions

### 7. Inventory Valuation
- Real-time inventory value calculation
- Cost price tracking
- Warehouse-specific valuations

### 8. Serial Number Tracking
- Track individual items by serial number
- Warranty management
- Status tracking (available, sold, defective, returned)

### 9. Batch/Lot Tracking
- Track products by batch/lot number
- Manufacturing and expiry date tracking
- Quantity per batch

### 10. Stock Adjustments
- Manual inventory corrections
- Approval workflow
- Reason tracking and audit trail

## Usage Examples

### Creating a Product
```javascript
POST /api/products
{
  "sku": "PROD-001",
  "name": "Sample Product",
  "description": "Product description",
  "category_id": 1,
  "unit_of_measure": "pcs",
  "unit_price": 100.00,
  "cost_price": 60.00,
  "reorder_level": 10,
  "reorder_quantity": 50,
  "tax_rate": 18.00,
  "is_active": true
}
```

### Creating a Purchase Order
```javascript
POST /api/purchase-orders
{
  "po_number": "PO-0001",
  "vendor_id": 1,
  "warehouse_id": 1,
  "order_date": "2024-01-01",
  "expected_date": "2024-01-15",
  "subtotal": 1000.00,
  "tax_amount": 180.00,
  "total_amount": 1180.00,
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "unit_price": 10.00,
      "tax_rate": 18.00,
      "tax_amount": 180.00,
      "total_amount": 1180.00
    }
  ]
}
```

### Receiving a Purchase Order
```javascript
POST /api/purchase-orders/:id/receive
{
  "warehouse_id": 1,
  "received_items": [
    {
      "item_id": 1,
      "product_id": 1,
      "quantity_received": 100,
      "unit_cost": 10.00
    }
  ]
}
```

### Creating a Stock Transfer
```javascript
POST /api/stock-transfers
{
  "transfer_number": "ST-0001",
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "transfer_date": "2024-01-01",
  "expected_date": "2024-01-03",
  "items": [
    {
      "product_id": 1,
      "quantity": 50
    }
  ]
}
```

## Database Migration

To apply the inventory management schema:

```bash
cd server
npm run db:generate
npm run db:migrate
```

## Testing

All endpoints require authentication. Use the existing auth system:
- Login: `POST /api/auth/login`
- Include JWT token in Authorization header: `Bearer <token>`

## Security & Permissions

- All inventory operations require authentication
- Delete operations restricted to admin/manager roles
- Audit logging for all inventory changes
- User tracking for all create/update operations

## Future Enhancements

1. Barcode scanning integration
2. Automated reorder point calculations
3. Inventory forecasting
4. Multi-currency support for international purchases
5. Supplier performance analytics
6. Inventory aging reports
7. Cycle counting management
8. Integration with shipping carriers
9. Mobile app for warehouse operations
10. Advanced reporting and analytics
