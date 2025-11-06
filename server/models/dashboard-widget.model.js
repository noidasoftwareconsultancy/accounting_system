const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dashboardWidgetModel = {
    // ============================================================================
    // DASHBOARD WIDGET MANAGEMENT
    // ============================================================================

    /**
     * Get all widgets for a user's dashboard
     */
    async getUserWidgets(userId) {
        return await prisma.dashboardWidget.findMany({
            where: { user_id: parseInt(userId) },
            orderBy: [
                { position_x: 'asc' },
                { position_y: 'asc' }
            ]
        });
    },

    /**
     * Get widget by ID
     */
    async getById(id, userId = null) {
        const where = { id: parseInt(id) };
        if (userId) {
            where.user_id = parseInt(userId);
        }

        return await prisma.dashboardWidget.findUnique({
            where
        });
    },

    /**
     * Create new widget
     */
    async create(widgetData) {
        return await prisma.dashboardWidget.create({
            data: widgetData
        });
    },

    /**
     * Update widget
     */
    async update(id, widgetData, userId = null) {
        const where = { id: parseInt(id) };
        if (userId) {
            where.user_id = parseInt(userId);
        }

        return await prisma.dashboardWidget.update({
            where,
            data: widgetData
        });
    },

    /**
     * Delete widget
     */
    async delete(id, userId = null) {
        const where = { id: parseInt(id) };
        if (userId) {
            where.user_id = parseInt(userId);
        }

        return await prisma.dashboardWidget.delete({
            where
        });
    },

    /**
     * Update widget positions (for drag & drop)
     */
    async updatePositions(userId, positions) {
        const updates = positions.map(pos =>
            prisma.dashboardWidget.update({
                where: {
                    id: parseInt(pos.id),
                    user_id: parseInt(userId)
                },
                data: {
                    position_x: pos.x,
                    position_y: pos.y,
                    width: pos.width,
                    height: pos.height
                }
            })
        );

        return await Promise.all(updates);
    },

    /**
     * Get available widget types
     */
    getAvailableTypes() {
        return [
            {
                type: 'chart',
                name: 'Chart Widget',
                description: 'Display charts and graphs',
                defaultConfig: {
                    chartType: 'line',
                    dataSource: null,
                    refreshInterval: 300000 // 5 minutes
                }
            },
            {
                type: 'metric',
                name: 'Metric Widget',
                description: 'Display key metrics and KPIs',
                defaultConfig: {
                    metric: null,
                    format: 'number',
                    refreshInterval: 60000 // 1 minute
                }
            },
            {
                type: 'table',
                name: 'Data Table',
                description: 'Display tabular data',
                defaultConfig: {
                    dataSource: null,
                    columns: [],
                    pageSize: 10,
                    refreshInterval: 300000 // 5 minutes
                }
            },
            {
                type: 'text',
                name: 'Text Widget',
                description: 'Display custom text or HTML',
                defaultConfig: {
                    content: '',
                    allowHtml: false
                }
            },
            {
                type: 'iframe',
                name: 'Embedded Content',
                description: 'Embed external content via iframe',
                defaultConfig: {
                    url: '',
                    allowFullscreen: false
                }
            }
        ];
    },

    /**
     * Reset user dashboard to default
     */
    async resetToDefault(userId) {
        // Delete existing widgets
        await prisma.dashboardWidget.deleteMany({
            where: { user_id: parseInt(userId) }
        });

        // Create default widgets
        const defaultWidgets = [
            {
                user_id: parseInt(userId),
                type: 'metric',
                title: 'Total Users',
                position_x: 0,
                position_y: 0,
                width: 3,
                height: 2,
                config: {
                    metric: 'total_users',
                    format: 'number',
                    refreshInterval: 60000
                }
            },
            {
                user_id: parseInt(userId),
                type: 'chart',
                title: 'Activity Chart',
                position_x: 3,
                position_y: 0,
                width: 6,
                height: 4,
                config: {
                    chartType: 'line',
                    dataSource: 'user_activity',
                    refreshInterval: 300000
                }
            },
            {
                user_id: parseInt(userId),
                type: 'table',
                title: 'Recent Activity',
                position_x: 0,
                position_y: 2,
                width: 9,
                height: 4,
                config: {
                    dataSource: 'recent_activity',
                    columns: ['user', 'action', 'timestamp'],
                    pageSize: 10,
                    refreshInterval: 300000
                }
            }
        ];

        return await Promise.all(
            defaultWidgets.map(widget => this.create(widget))
        );
    },

    /**
     * Duplicate widget
     */
    async duplicate(id, userId) {
        const originalWidget = await this.getById(id, userId);
        if (!originalWidget) {
            throw new Error('Widget not found');
        }

        const { id: _, created_at, updated_at, ...widgetData } = originalWidget;

        // Offset position slightly
        widgetData.position_x += 1;
        widgetData.position_y += 1;
        widgetData.title += ' (Copy)';

        return await this.create(widgetData);
    },

    /**
     * Get widget data based on type and config
     */
    async getWidgetData(widget) {
        switch (widget.type) {
            case 'metric':
                return await this.getMetricData(widget.config);
            case 'chart':
                return await this.getChartData(widget.config);
            case 'table':
                return await this.getTableData(widget.config);
            default:
                return null;
        }
    },

    /**
     * Get metric data
     */
    async getMetricData(config) {
        // This would typically query your database for the specific metric
        // For now, returning mock data structure
        return {
            value: 0,
            change: 0,
            changePercent: 0,
            trend: 'neutral'
        };
    },

    /**
     * Get chart data
     */
    async getChartData(config) {
        // This would typically query your database for chart data
        // For now, returning mock data structure
        return {
            labels: [],
            datasets: []
        };
    },

    /**
     * Get table data
     */
    async getTableData(config) {
        // This would typically query your database for table data
        // For now, returning mock data structure
        return {
            columns: config.columns || [],
            rows: [],
            total: 0
        };
    }
};

module.exports = dashboardWidgetModel;