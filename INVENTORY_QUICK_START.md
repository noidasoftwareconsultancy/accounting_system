# Inventory Management System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Apply Database Migration
```bash
cd server
npm run db:generate
npx prisma migrate dev --name add_inventory_management
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Verify Installation
```bash
curl http://localhost:5001/
```

You should see the new inventory endpoints listed.

## 📦 Quick Test (2 Minutes)

### 1. Login
```bash
TOKEN=$(curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}' \
  | jq -r '.token')
```

### 2. Create a Warehouse
```bash
curl -X POST http://localhost:5001/api/warehouses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Warehouse",
    "code": "WH-001"
  }'
```

### 3. Create a Product
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Test Product",
    "unit_of_measure": "pcs",
    "unit_price": 100,
    "cost_price": 60
  }'
```

### 4. Check Inventory Stats
```bash
curl http://localhost:5001/api/inventory/stats \
  -H "Authorization: Bearer $TOKEN"
```

## 📚 Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/products` | Product management |
| `/api/warehouses` | Warehouse management |
| `/api/inventory` | Inventory tracking |
| `/api/purchase-orders` | Purchase orders |
| `/api/stock-transfers` | Stock transfers |
| `/api/stock-adjustments` | Inventory adjustments |

## 🔑 Common Operations

### Add Inventory via Purchase Order
1. Create vendor (if needed): `POST /api/vendors`
2. Create product: `POST /api/products`
3. Create warehouse: `POST /api/warehouses`
4. Create PO: `POST /api/purchase-orders`
5. Receive PO: `POST /api/purchase-orders/:id/receive`

### Transfer Stock Between Warehouses
1. Create transfer: `POST /api/stock-transfers`
2. Process transfer: `POST /api/stock-transfers/:id/process`
3. Complete transfer: `POST /api/stock-transfers/:id/complete`

### Adjust Inventory
1. Create adjustment: `POST /api/stock-adjustments`
2. Approve adjustment: `POST /api/stock-adjustments/:id/approve`

## 📖 Full Documentation

- **Complete Guide**: `server/INVENTORY_SYSTEM_DOCUMENTATION.md`
- **API Examples**: `server/INVENTORY_API_EXAMPLES.md`
- **Migration Guide**: `server/INVENTORY_MIGRATION_GUIDE.md`
- **Implementation Summary**: `INVENTORY_IMPLEMENTATION_SUMMARY.md`

## 🆘 Troubleshooting

### Migration Fails
```bash
# Check database connection
npx prisma db pull

# Reset and retry (WARNING: Deletes data)
npx prisma migrate reset
```

### Server Won't Start
```bash
# Check for syntax errors
npm run db:generate

# Check logs
npm run dev
```

### Authentication Issues
Make sure you're including the JWT token:
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

## ✅ Verification Checklist

- [ ] Database migration completed
- [ ] Server starts without errors
- [ ] Can create warehouse
- [ ] Can create product
- [ ] Can view inventory stats
- [ ] Can create purchase order
- [ ] Can receive purchase order
- [ ] Inventory updates correctly

## 🎯 Next Steps

1. Import your product catalog
2. Set up warehouse locations
3. Configure vendor-product relationships
4. Set reorder levels for products
5. Train users on workflows
6. Set up automated alerts

## 💡 Pro Tips

- Use SKU for quick product lookups
- Set reorder levels to get low stock alerts
- Use serial numbers for high-value items
- Use batch numbers for expirable products
- Always approve stock adjustments
- Track all movements for audit trail

## 📞 Support

For detailed information, refer to the comprehensive documentation files in the server directory.
