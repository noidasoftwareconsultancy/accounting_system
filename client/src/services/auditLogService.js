import api from './api';

const auditLogService = {
    // Get all audit logs (admin/manager only)
    async getAll(page = 1, limit = 50, filters = {}) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null))
        });

        const response = await api.get(`/audit-logs?${params}`);
        return response.data;
    },

    // Get my audit logs
    async getMyAuditLogs(page = 1, limit = 50) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        const response = await api.get(`/audit-logs/my?${params}`);
        return response.data;
    },

    // Get audit log by ID
    async getById(id) {
        const response = await api.get(`/audit-logs/${id}`);
        return response.data;
    },

    // Get audit logs by entity
    async getByEntity(entityType, entityId, params = {}) {
        const response = await api.get(`/audit-logs/entity/${entityType}/${entityId}`, { params });
        return response.data;
    },

    // Get audit logs by user (admin/manager only)
    async getByUser(userId, params = {}) {
        const response = await api.get(`/audit-logs/user/${userId}`, { params });
        return response.data;
    },

    // Get audit log statistics (admin/manager only)
    async getStats(filters = {}) {
        const response = await api.get('/audit-logs/stats', { params: filters });
        return response.data;
    },

    // Create audit log (internal use)
    async createLog(logData) {
        const response = await api.post('/audit-logs/log', logData);
        return response.data;
    },

    // Cleanup old logs (admin only)
    async cleanup(daysToKeep = 90) {
        const response = await api.delete('/audit-logs/cleanup', {
            params: { days: daysToKeep }
        });
        return response.data;
    },

    // Export audit logs (admin only)
    async exportLogs(filters = {}) {
        const response = await api.get('/audit-logs/export', {
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    }
};

export default auditLogService;
