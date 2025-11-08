# Inventory Management System - Migration Guide

## Prerequisites
- Existing financial management system is running
- PostgreSQL database is accessible
- Prisma CLI is installed
- Node.js environment is set up

## Migration Steps

### Step 1: Backup Current Database
```bash
# Create a backup of your current database
pg_dump -U your_username -d your_database > backup_before_inventory.sql
```

### Step 2: Update Prisma Schema
The Prisma schema has been updated with the following new models:
- Warehouse
- ProductCategory
- Product
- InventoryItem
- StockMovement
- StockTransfer
- StockTransferItem
- PurchaseOrder
- PurchaseOrderItem
- ProductSupplier
- SerialNumber
- BatchNumber
- StockAdjustment
- StockAdjustmentItem

### Step 3: Generate Prisma Client
```bash
cd server
npm run db:generate
```

### Step 4: Create and Apply Migration
```bash
# Create a new migration
npx prisma migrate dev --name add_inventory_management

# Or if you want to apply without prompts
npx prisma migrate deploy
```

### Step 5: Verify Migration
```bash
# Open Prisma Studio to verify tables
npm run db:studio
```

### Step 6: Restart Server
```bash
# Development
npm run dev

# Production
npm start
```

## New API Endpoints Available

After migration, the following endpoints will be available:

### Inventory Management
- `/api/products` - Product management
- `/api/warehouses` - Warehouse management
- `/api/inventory` - Inventory tracking
- `/api/purchase-orders` - Purchase order management
- `/api/stock-transfers` - Inter-warehouse transfers
- `/api/stock-adjustments` - Inventory adjustments

## Testing the Migration

### 1. Test Product Creation
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "name": "Test Product",
    "unit_of_measure": "pcs",
    "unit_price": 100,
    "cost_price": 60
  }'
```

### 2. Test Warehouse Creation
```bash
curl -X POST http://localhost:5001/api/warehouses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Warehouse",
    "code": "WH-001"
  }'
```

### 3. Test Inventory Query
```bash
curl -X GET http://localhost:5001/api/inventory/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rollback Procedure

If you need to rollback the migration:

```bash
# Restore from backup
psql -U your_username -d your_database < backup_before_inventory.sql

# Or use Prisma migrate reset (WARNING: This will delete all data)
npx prisma migrate reset
```

## Data Seeding (Optional)

To populate initial data:

### Create Sample Warehouses
```sql
INSERT INTO warehouses (name, code, created_by, created_at, updated_at)
VALUES 
  ('Main Warehouse', 'WH-001', 1, NOW(), NOW()),
  ('Secondary Warehouse', 'WH-002', 1, NOW(), NOW());
```

### Create Sample Product Categories
```sql
INSERT INTO product_categories (name, description, created_by, created_at, updated_at)
VALUES 
  ('Electronics', 'Electronic items', 1, NOW(), NOW()),
  ('Office Supplies', 'Office related items', 1, NOW(), NOW()),
  ('Furniture', 'Office furniture', 1, NOW(), NOW());
```

### Create Sample Products
```sql
INSERT INTO products (sku, name, unit_of_measure, unit_price, cost_price, category_id, created_by, created_at, updated_at)
VALUES 
  ('PROD-001', 'Laptop', 'pcs', 1000.00, 700.00, 1, 1, NOW(), NOW()),
  ('PROD-002', 'Mouse', 'pcs', 20.00, 12.00, 1, 1, NOW(), NOW()),
  ('PROD-003', 'Keyboard', 'pcs', 50.00, 30.00, 1, 1, NOW(), NOW());
```

## Integration with Existing Features

### Invoice Integration
When an invoice is marked as paid, inventory will be automatically deducted:
- The system will check for product references in invoice items
- Inventory will be reduced from the specified warehouse
- Stock movements will be recorded

### Expense Integration
Purchase orders can be linked to expenses:
- Create a purchase order
- Receive the purchase order (updates inventory)
- Link the vendor invoice to the expense module

### Vendor Integration
Existing vendors are now enhanced with:
- Product supplier relationships
- Purchase order history
- Preferred supplier designation

## Performance Considerations

### Indexes
The following indexes are automatically created:
- `product_id_warehouse_id` on inventory_items (unique)
- `product_id_vendor_id` on product_suppliers (unique)
- `product_id_batch_no` on batch_numbers (unique)
- `serial_no` on serial_numbers (unique)
- Various foreign key indexes

### Query Optimization
- Use pagination for large datasets
- Filter by warehouse_id when querying inventory
- Use product SKU for quick lookups

## Monitoring

### Key Metrics to Monitor
1. Low stock items count
2. Total inventory value
3. Stock movement frequency
4. Purchase order processing time
5. Transfer completion rate

### Health Check Endpoint
```bash
curl http://localhost:5001/api/inventory/stats
```

## Troubleshooting

### Issue: Migration Fails
**Solution**: Check database connection and ensure no conflicting table names exist

### Issue: Foreign Key Constraints
**Solution**: Ensure referenced records (users, vendors) exist before creating inventory records

### Issue: Duplicate SKU/Code Errors
**Solution**: Ensure unique values for product SKUs, warehouse codes, and serial numbers

## Support

For issues or questions:
1. Check the INVENTORY_SYSTEM_DOCUMENTATION.md
2. Review API endpoint documentation
3. Check server logs for detailed error messages
4. Verify database schema matches Prisma schema

## Next Steps

After successful migration:
1. Configure warehouse locations
2. Import existing product catalog
3. Set up product categories
4. Configure vendor-product relationships
5. Set reorder levels for products
6. Train users on new inventory features
7. Set up automated low stock alerts
8. Configure inventory reports
