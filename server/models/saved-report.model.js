const prisma = require('../lib/prisma');

const savedReportModel = {
  /**
   * Get all saved reports with pagination
   */
  async getAll(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (filters.template_id) where.template_id = parseInt(filters.template_id);
    if (filters.created_by) where.created_by = parseInt(filters.created_by);
    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const [reports, total] = await Promise.all([
      prisma.savedReport.findMany({
        where,
        include: {
          template: {
            select: { id: true, name: true, report_type: true }
          },
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedReport.count({ where })
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get saved report by ID
   */
  async getById(id) {
    return prisma.savedReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        template: true,
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Create new saved report
   */
  async create(data) {
    return prisma.savedReport.create({
      data: {
        template_id: parseInt(data.template_id),
        name: data.name,
        parameters: data.parameters || {},
        result_data: data.result_data || {},
        created_by: parseInt(data.created_by)
      },
      include: {
        template: {
          select: { id: true, name: true, report_type: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Update saved report
   */
  async update(id, data) {
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.parameters !== undefined) updateData.parameters = data.parameters;
    if (data.result_data !== undefined) updateData.result_data = data.result_data;

    return prisma.savedReport.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        template: {
          select: { id: true, name: true, report_type: true }
        },
        creator: {
          select: { id: true, first_name: true, last_name: true }
        }
      }
    });
  },

  /**
   * Delete saved report
   */
  async delete(id) {
    return prisma.savedReport.delete({
      where: { id: parseInt(id) }
    });
  },

  /**
   * Get reports by template
   */
  async getByTemplate(templateId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      prisma.savedReport.findMany({
        where: { template_id: parseInt(templateId) },
        include: {
          creator: {
            select: { id: true, first_name: true, last_name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedReport.count({ where: { template_id: parseInt(templateId) } })
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get reports by user
   */
  async getByUser(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [reports, total] = await Promise.all([
      prisma.savedReport.findMany({
        where: { created_by: parseInt(userId) },
        include: {
          template: {
            select: { id: true, name: true, report_type: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.savedReport.count({ where: { created_by: parseInt(userId) } })
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Execute and save report
   */
  async executeAndSave(templateId, parameters, name, createdBy) {
    const reportTemplateModel = require('./report-template.model');
    
    try {
      // Execute the template
      const executionResult = await reportTemplateModel.executeTemplate(templateId, parameters);
      
      // Save the report
      const savedReport = await this.create({
        template_id: templateId,
        name: name,
        parameters: parameters,
        result_data: {
          data: executionResult.data,
          executedAt: executionResult.executedAt,
          rowCount: Array.isArray(executionResult.data) ? executionResult.data.length : 0
        },
        created_by: createdBy
      });

      return savedReport;
    } catch (error) {
      throw new Error(`Failed to execute and save report: ${error.message}`);
    }
  },

  /**
   * Regenerate report data
   */
  async regenerate(id) {
    const savedReport = await this.getById(id);
    if (!savedReport) {
      throw new Error('Saved report not found');
    }

    const reportTemplateModel = require('./report-template.model');
    
    try {
      // Re-execute the template with saved parameters
      const executionResult = await reportTemplateModel.executeTemplate(
        savedReport.template_id, 
        savedReport.parameters
      );
      
      // Update the saved report with new data
      const updatedReport = await this.update(id, {
        result_data: {
          data: executionResult.data,
          executedAt: executionResult.executedAt,
          rowCount: Array.isArray(executionResult.data) ? executionResult.data.length : 0,
          regeneratedAt: new Date()
        }
      });

      return updatedReport;
    } catch (error) {
      throw new Error(`Failed to regenerate report: ${error.message}`);
    }
  },

  /**
   * Export report data
   */
  async exportData(id, format = 'json') {
    const savedReport = await this.getById(id);
    if (!savedReport) {
      throw new Error('Saved report not found');
    }

    const data = savedReport.result_data?.data || [];
    
    switch (format.toLowerCase()) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'xlsx':
        // This would require a library like xlsx
        throw new Error('XLSX export not implemented yet');
      default:
        throw new Error('Unsupported export format');
    }
  },

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  },

  /**
   * Get saved report statistics
   */
  async getStats() {
    const [totalReports, reportsThisMonth] = await Promise.all([
      prisma.savedReport.count(),
      prisma.savedReport.count({
        where: {
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    const reportsByTemplate = await prisma.savedReport.groupBy({
      by: ['template_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const reportsByUser = await prisma.savedReport.groupBy({
      by: ['created_by'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    return {
      totalReports,
      reportsThisMonth,
      topTemplates: reportsByTemplate,
      topUsers: reportsByUser
    };
  }
};

module.exports = savedReportModel;