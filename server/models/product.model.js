const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productModel = {
  /**
   * Get all products
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { is_active: true };

    if (filters.category_id) where.category_id = parseInt(filters.category_id);
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          creator: {
            select: { id: true, username: true, email: true }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get product by ID
   */
  async getById(id) {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        creator: {
          select: { id: true, username: true, email: true }
        },
        inventory_items: {
          include: {
            warehouse: true
          }
        },
        product_suppliers: {
          include: {
            vendor: true
          }
        }
      }
    });
  },

  /**
   * Get product by SKU
   */
  async getBySKU(sku) {
    return await prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        inventory_items: {
          include: {
            warehouse: true
          }
        }
      }
    });
  },

  /**
   * Create product
   */
  async create(data) {
    return await prisma.product.create({
      data,
      include: {
        category: true,
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });
  },

  /**
   * Update product
   */
  async update(id, data) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data,
      include: {
        category: true
      }
    });
  },

  /**
   * Delete product (soft delete)
   */
  async delete(id) {
    return await prisma.product.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });
  },

  /**
   * Get product categories
   */
  async getCategories() {
    return await prisma.productCategory.findMany({
      where: { is_active: true },
      include: {
        parent_category: true,
        sub_categories: true
      },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Create product category
   */
  async createCategory(data) {
    return await prisma.productCategory.create({
      data,
      include: {
        parent_category: true
      }
    });
  },

  /**
   * Update product category
   */
  async updateCategory(id, data) {
    return await prisma.productCategory.update({
      where: { id: parseInt(id) },
      data
    });
  },

  /**
   * Delete product category
   */
  async deleteCategory(id) {
    return await prisma.productCategory.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });
  },

  /**
   * Get product suppliers
   */
  async getSuppliers(productId) {
    return await prisma.productSupplier.findMany({
      where: { product_id: parseInt(productId) },
      include: {
        vendor: true
      },
      orderBy: { is_preferred: 'desc' }
    });
  },

  /**
   * Add product supplier
   */
  async addSupplier(data) {
    return await prisma.productSupplier.create({
      data,
      include: {
        vendor: true
      }
    });
  },

  /**
   * Update product supplier
   */
  async updateSupplier(productId, vendorId, data) {
    return await prisma.productSupplier.update({
      where: {
        product_id_vendor_id: {
          product_id: parseInt(productId),
          vendor_id: parseInt(vendorId)
        }
      },
      data
    });
  },

  /**
   * Remove product supplier
   */
  async removeSupplier(productId, vendorId) {
    return await prisma.productSupplier.delete({
      where: {
        product_id_vendor_id: {
          product_id: parseInt(productId),
          vendor_id: parseInt(vendorId)
        }
      }
    });
  },

  /**
   * Get serial numbers for product
   */
  async getSerialNumbers(productId, status = null) {
    const where = { product_id: parseInt(productId) };
    if (status) where.status = status;

    return await prisma.serialNumber.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Add serial number
   */
  async addSerialNumber(data) {
    return await prisma.serialNumber.create({
      data
    });
  },

  /**
   * Update serial number
   */
  async updateSerialNumber(id, data) {
    return await prisma.serialNumber.update({
      where: { id: parseInt(id) },
      data
    });
  },

  /**
   * Get batch numbers for product
   */
  async getBatchNumbers(productId) {
    return await prisma.batchNumber.findMany({
      where: { product_id: parseInt(productId) },
      orderBy: { created_at: 'desc' }
    });
  },

  /**
   * Add batch number
   */
  async addBatchNumber(data) {
    return await prisma.batchNumber.create({
      data
    });
  },

  /**
   * Update batch number
   */
  async updateBatchNumber(productId, batchNo, data) {
    return await prisma.batchNumber.update({
      where: {
        product_id_batch_no: {
          product_id: parseInt(productId),
          batch_no: batchNo
        }
      },
      data
    });
  }
};

module.exports = productModel;
