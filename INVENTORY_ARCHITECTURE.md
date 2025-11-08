# Inventory Management System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATION                           │
│                    (React Frontend)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST API
                         │ JWT Authentication
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS SERVER                               │
│                    (Node.js Backend)                             │
├─────────────────────────────────────────────────────────────────┤
│  Authentication Middleware  │  Validation Middleware             │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   ROUTES     │  │  CONTROLLERS │  │    MODELS    │
│              │  │              │  │              │
│ • Products   │  │ • Products   │  │ • Products   │
│ • Warehouses │  │ • Warehouses │  │ • Warehouses │
│ • Inventory  │  │ • Inventory  │  │ • Inventory  │
│ • POs        │  │ • POs        │  │ • POs        │
│ • Transfers  │  │ • Transfers  │  │ • Transfers  │
│ • Adjustments│  │ • Adjustments│  │ • Adjustments│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  PRISMA ORM     │
                │  (Data Layer)   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   POSTGRESQL    │
                │    DATABASE     │
                └─────────────────┘
```

## Database Schema Relationships

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │ created_by
       │
       ├─────────────────────────────────────────────┐
       │                                             │
       ▼                                             ▼
┌──────────────┐                              ┌──────────────┐
│  Warehouse   │◄─────────────────────────────│   Product    │
└──────┬───────┘                              └──────┬───────┘
       │                                             │
       │ warehouse_id                    product_id  │
       │                                             │
       ▼                                             ▼
┌──────────────────────────────────────────────────────────┐
│                   InventoryItem                          │
│  • quantity_on_hand                                      │
│  • quantity_reserved                                     │
│  • quantity_available                                    │
└──────────────────────────────────────────────────────────┘
       │
       │ Tracked by
       │
       ▼
┌──────────────┐
│StockMovement │
│ • purchase   │
│ • sale       │
│ • adjustment │
│ • transfer   │
│ • return     │
└──────────────┘
```

## Inventory Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY LIFECYCLE                       │
└─────────────────────────────────────────────────────────────┘

1. PROCUREMENT
   ┌──────────────┐
   │Create Product│
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐      ┌──────────────┐
   │Add Supplier  │─────►│Create PO     │
   └──────────────┘      └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │Receive PO    │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │Update        │
                         │Inventory     │
                         └──────┬───────┘

2. STORAGE & MOVEMENT
                                │
                                ▼
                         ┌──────────────┐
                         │Store in      │
                         │Warehouse     │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │                       │
                    ▼                       ▼
             ┌──────────────┐      ┌──────────────┐
             │Transfer to   │      │Adjust        │
             │Other WH      │      │Inventory     │
             └──────────────┘      └──────────────┘

3. FULFILLMENT
                                │
                                ▼
                         ┌──────────────┐
                         │Reserve for   │
                         │Order         │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │Ship/Sell     │
                         └──────┬───────┘
                                │
                                ▼
                         ┌──────────────┐
                         │Update        │
                         │Inventory     │
                         └──────────────┘
```

## Purchase Order Workflow

```
┌─────────┐
│  DRAFT  │ ◄─── Create PO
└────┬────┘
     │ Send to Vendor
     ▼
┌─────────┐
│  SENT   │
└────┬────┘
     │ Vendor Confirms
     ▼
┌──────────┐
│CONFIRMED │
└────┬─────┘
     │ Receive Goods
     ▼
┌──────────┐      ┌─────────────────┐
│RECEIVED  │─────►│Update Inventory │
└──────────┘      └─────────────────┘
```

## Stock Transfer Workflow

```
┌─────────┐
│ PENDING │ ◄─── Create Transfer
└────┬────┘
     │ Process Transfer
     ▼
┌───────────┐      ┌──────────────────────┐
│IN_TRANSIT │─────►│Deduct from Source WH │
└────┬──────┘      └──────────────────────┘
     │ Complete Transfer
     ▼
┌───────────┐      ┌──────────────────────┐
│ COMPLETED │─────►│Add to Destination WH │
└───────────┘      └──────────────────────┘
```

## Data Model Hierarchy

```
User
├── Warehouse
│   ├── InventoryItem
│   │   └── Product
│   │       ├── ProductCategory
│   │       ├── ProductSupplier (Vendor)
│   │       ├── SerialNumber
│   │       └── BatchNumber
│   ├── StockMovement
│   └── StockTransfer
│       └── StockTransferItem
├── PurchaseOrder
│   ├── Vendor
│   └── PurchaseOrderItem
│       └── Product
└── StockAdjustment
    └── StockAdjustmentItem
        └── Product
```

## API Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  /api/products          ┌──────────────────┐           │
│  /api/warehouses        │                  │           │
│  /api/inventory    ────►│   Controllers    │           │
│  /api/purchase-orders   │                  │           │
│  /api/stock-transfers   └────────┬─────────┘           │
│  /api/stock-adjustments          │                     │
│                                   │                     │
└───────────────────────────────────┼─────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │                  │
                          │   Models         │
                          │  (Business Logic)│
                          │                  │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │                  │
                          │  Prisma Client   │
                          │  (ORM Layer)     │
                          │                  │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │                  │
                          │   PostgreSQL     │
                          │   Database       │
                          │                  │
                          └──────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT REQUEST                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ JWT Token    │
                  │ Validation   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ User Auth    │
                  │ Middleware   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Role Check   │
                  │ (RBAC)       │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Input        │
                  │ Validation   │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Business     │
                  │ Logic        │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Audit Log    │
                  │ Recording    │
                  └──────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│           EXISTING FINANCIAL SYSTEM                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │ Invoices │◄───│ Products │───►│ Expenses │         │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘         │
│       │               │               │                 │
│       │               │               │                 │
│       ▼               ▼               ▼                 │
│  ┌─────────────────────────────────────────┐           │
│  │         INVENTORY SYSTEM                 │           │
│  │                                          │           │
│  │  • Stock Deduction on Invoice Payment   │           │
│  │  • Cost Tracking via Purchase Orders    │           │
│  │  • Vendor Integration                   │           │
│  │  • Product Catalog                      │           │
│  └─────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Transaction Flow

```
Purchase Order Receipt:
┌─────────────────────────────────────────────────────────┐
│ BEGIN TRANSACTION                                        │
├─────────────────────────────────────────────────────────┤
│ 1. Update PurchaseOrder.status = 'received'             │
│ 2. Update PurchaseOrderItem.quantity_received           │
│ 3. Update/Create InventoryItem.quantity_on_hand         │
│ 4. Create StockMovement record                          │
│ 5. Update Product.cost_price (optional)                 │
├─────────────────────────────────────────────────────────┤
│ COMMIT TRANSACTION                                       │
└─────────────────────────────────────────────────────────┘

Stock Transfer:
┌─────────────────────────────────────────────────────────┐
│ BEGIN TRANSACTION (Process)                              │
├─────────────────────────────────────────────────────────┤
│ 1. Update StockTransfer.status = 'in_transit'           │
│ 2. Decrement InventoryItem (source warehouse)           │
│ 3. Create StockMovement (negative quantity)             │
├─────────────────────────────────────────────────────────┤
│ COMMIT TRANSACTION                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BEGIN TRANSACTION (Complete)                             │
├─────────────────────────────────────────────────────────┤
│ 1. Update StockTransfer.status = 'completed'            │
│ 2. Update StockTransferItem.quantity_received           │
│ 3. Increment InventoryItem (destination warehouse)      │
│ 4. Create StockMovement (positive quantity)             │
├─────────────────────────────────────────────────────────┤
│ COMMIT TRANSACTION                                       │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

```
┌─────────────────────────────────────────────────────────┐
│                  SCALABILITY FEATURES                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  • Pagination on all list endpoints                     │
│  • Database indexes on foreign keys                     │
│  • Efficient Prisma queries with includes               │
│  • Transaction support for data consistency             │
│  • Soft deletes for data retention                      │
│  • Audit trail for compliance                           │
│  • Multi-warehouse support                              │
│  • Horizontal scaling ready                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────┐
│                    MONITORING POINTS                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  • API Response Times                                   │
│  • Database Query Performance                           │
│  • Inventory Valuation                                  │
│  • Low Stock Alerts                                     │
│  • Stock Movement Frequency                             │
│  • Purchase Order Processing Time                       │
│  • Transfer Completion Rate                             │
│  • Error Rates by Endpoint                              │
│  • User Activity Logs                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

```
┌─────────────────────────────────────────────────────────┐
│              POTENTIAL ENHANCEMENTS                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Phase 2:                                               │
│  • Barcode scanning integration                         │
│  • Mobile app for warehouse operations                  │
│  • Advanced reporting & analytics                       │
│  • Automated reorder suggestions                        │
│                                                          │
│  Phase 3:                                               │
│  • Multi-currency support                               │
│  • Supplier performance analytics                       │
│  • Inventory forecasting                                │
│  • Integration with shipping carriers                   │
│                                                          │
│  Phase 4:                                               │
│  • IoT device integration                               │
│  • AI-powered demand prediction                         │
│  • Blockchain for supply chain tracking                 │
│  • Real-time inventory synchronization                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```
