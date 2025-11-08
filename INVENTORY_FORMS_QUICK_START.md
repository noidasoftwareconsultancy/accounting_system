# Inventory Forms - Quick Start Guide

## 🚀 Getting Started

All inventory management forms are now fully functional! Here's how to use them:

## Creating Records

### 1. Create a Product
1. Navigate to **Inventory → Products**
2. Click **"Add Product"** button
3. Fill in the form:
   - **Required:** Product Name, SKU, Unit Price
   - **Optional:** Description, Category, Cost Price, Reorder Level, Barcode
4. Click **"Save"** to create the product
5. Click **"Cancel"** to discard changes

**Route:** `/inventory/products/new`

### 2. Create a Warehouse
1. Navigate to **Inventory → Warehouses**
2. Click **"Add Warehouse"** button
3. Fill in the form:
   - **Required:** Name, Code, Address, City
   - **Optional:** State, Postal Code, Country, Capacity
   - Toggle **Active** status
4. Click **"Save"** to create the warehouse
5. Click **"Cancel"** to discard changes

**Route:** `/inventory/warehouses/new`

### 3. Create a Purchase Order
1. Navigate to **Inventory → Purchase Orders**
2. Click **"Create Purchase Order"** button
3. Fill in order information:
   - **Required:** Vendor, Order Date, Expected Date
   - **Optional:** Payment Terms, Currency, Notes
4. Add line items:
   - Click **"Add Item"** to add a new row
   - Select product from dropdown
   - Enter quantity, unit price, and tax amount
   - Click **X** to remove an item
5. Review the automatic total calculation
6. Click **"Save"** to create the purchase order

**Route:** `/inventory/purchase-orders/new`

**Validation:**
- At least one line item is required
- All numeric fields must be valid numbers

### 4. Create a Stock Transfer
1. Navigate to **Inventory → Stock Transfers**
2. Click **"Create Transfer"** button
3. Fill in transfer information:
   - **Required:** From Warehouse, To Warehouse, Transfer Date
   - **Note:** Destination warehouse cannot be the same as source
4. Add items to transfer:
   - Click **"Add Item"** to add a new row
   - Select product from dropdown
   - Enter quantity
   - **Available stock** is shown from the source warehouse
   - System validates quantity doesn't exceed available stock
5. Click **"Save"** to create the transfer

**Route:** `/inventory/transfers/new`

**Validation:**
- Source and destination warehouses must be different
- Quantity cannot exceed available stock in source warehouse

### 5. Create a Stock Adjustment
1. Navigate to **Inventory → Stock Adjustments**
2. Click **"New Adjustment"** button
3. Fill in adjustment information:
   - **Required:** Warehouse, Product, Quantity, Reason
   - Select adjustment type: **Add Stock** or **Remove Stock**
4. Review current and new stock levels:
   - Current stock level is displayed
   - New stock level is calculated automatically
5. Click **"Save"** to open confirmation dialog
6. Review the adjustment details
7. Click **"Confirm"** to create the adjustment

**Route:** `/inventory/adjustments/new`

**Validation:**
- Cannot remove more stock than available
- Reason field is required
- New stock level cannot be negative

## Editing Records

### Edit a Product
1. Navigate to **Inventory → Products**
2. Click the **⋮** menu on any product
3. Select **"Edit"**
4. Modify the fields as needed
5. Click **"Save"** to update

**Route:** `/inventory/products/:id/edit`

### Edit a Warehouse
1. Navigate to **Inventory → Warehouses**
2. Click the **⋮** menu on any warehouse
3. Select **"Edit"**
4. Modify the fields as needed
5. Click **"Save"** to update

**Route:** `/inventory/warehouses/:id/edit`

### Edit a Purchase Order
1. Navigate to **Inventory → Purchase Orders**
2. Click the **⋮** menu on any purchase order
3. Select **"Edit"**
4. Modify order details or line items
5. Click **"Save"** to update

**Route:** `/inventory/purchase-orders/:id/edit`

### Edit a Stock Transfer
1. Navigate to **Inventory → Stock Transfers**
2. Click the **⋮** menu on any transfer
3. Select **"Edit"**
4. Modify transfer details or items
5. Click **"Save"** to update

**Route:** `/inventory/transfers/:id/edit`

## Quick Actions from Dashboard

The **Inventory Dashboard** provides quick access to all forms:

1. Navigate to **Inventory → Dashboard**
2. Use the quick action buttons:
   - **"New Purchase Order"** → Create PO
   - **"Stock Transfer"** → Create Transfer
   - **"Stock Adjustment"** → Create Adjustment

## Form Features

### Validation
- **Real-time validation** as you type
- **Error messages** appear below invalid fields
- **Required fields** are marked with *
- **Submit button** is disabled until form is valid

### Unsaved Changes Protection
- Browser warns you if you try to leave with unsaved changes
- **Cancel button** shows confirmation dialog if changes exist
- Prevents accidental data loss

### Auto-calculations
- **Purchase Orders:** Subtotal and total are calculated automatically
- **Stock Transfers:** Available stock is shown for each product
- **Stock Adjustments:** New stock level is previewed before saving

### Loading States
- **Loading spinners** appear during data fetching
- **Save button** shows "Saving..." during submission
- **Buttons are disabled** during operations to prevent double-submission

## Keyboard Shortcuts

- **Tab** - Move to next field
- **Shift + Tab** - Move to previous field
- **Enter** - Submit form (when focused on submit button)
- **Escape** - Close dialogs

## Mobile Support

All forms are fully responsive and work on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones (iOS and Android)

## Common Workflows

### Workflow 1: Receive Inventory
1. Create a **Purchase Order** for items to order
2. When items arrive, create a **Stock Adjustment** to add stock
3. View updated stock levels in **Stock Levels** page

### Workflow 2: Transfer Between Warehouses
1. Go to **Stock Transfers** page
2. Create a new transfer
3. Select source and destination warehouses
4. Add items with quantities
5. System validates available stock
6. Submit to process the transfer

### Workflow 3: Correct Stock Discrepancies
1. Go to **Stock Adjustments** page
2. Create a new adjustment
3. Select warehouse and product
4. Choose **Add** or **Remove**
5. Enter quantity and reason
6. Review new stock level
7. Confirm the adjustment

## Tips & Best Practices

### Products
- Use unique, meaningful SKUs
- Set reorder levels to automate restocking alerts
- Add barcodes for faster scanning
- Categorize products for better organization

### Warehouses
- Use short, memorable warehouse codes
- Keep warehouse information up to date
- Mark inactive warehouses instead of deleting

### Purchase Orders
- Always add notes for special instructions
- Set realistic expected dates
- Review totals before submitting
- Use consistent payment terms

### Stock Transfers
- Double-check source and destination warehouses
- Verify available stock before creating transfer
- Add notes explaining the reason for transfer
- Process transfers promptly

### Stock Adjustments
- Always provide a clear reason
- Use "Add" for receiving inventory
- Use "Remove" for damaged/lost items
- Review the new stock level before confirming

## Troubleshooting

### Form won't submit
- Check for red error messages below fields
- Ensure all required fields are filled
- Verify numeric fields contain valid numbers
- For POs and Transfers, ensure at least one item is added

### Can't find a product/warehouse
- Ensure the product/warehouse exists in the system
- Check if it's marked as inactive
- Try refreshing the page to reload data

### Stock transfer validation error
- Verify quantity doesn't exceed available stock
- Check that source and destination are different
- Ensure the source warehouse has the product in stock

### Unsaved changes warning
- Click "Save" to keep your changes
- Click "Cancel" and confirm to discard changes
- Don't close the browser tab without saving

## Support

For issues or questions:
1. Check this guide first
2. Review the validation error messages
3. Check the browser console for technical errors
4. Contact your system administrator

## What's Next?

Coming in future updates:
- **Bulk operations** for mass updates
- **CSV import/export** for products and stock
- **Barcode scanning** for faster data entry
- **Advanced filtering** and search
- **Automated reordering** based on stock levels
- **Invoice-inventory integration** for automatic stock deduction

---

**Last Updated:** November 8, 2025
**Version:** 1.0.0
