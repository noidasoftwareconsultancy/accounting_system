import { useAuth } from '../contexts/AuthContext';

/**
 * Utility functions for checking user permissions
 */

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object from auth context
 * @param {Array|string} roles - Role or array of roles to check
 * @returns {boolean} - True if user has any of the specified roles
 */
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};

/**
 * Check if user can perform banking operations (admin or accountant)
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if user can perform banking operations
 */
export const canManageBanking = (user) => {
  return hasRole(user, ['admin', 'accountant']);
};

/**
 * Check if user can perform accounting operations (admin or accountant)
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if user can perform accounting operations
 */
export const canManageAccounting = (user) => {
  return hasRole(user, ['admin', 'accountant']);
};

/**
 * Check if user is admin
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user can view financial data (all authenticated users)
 * @param {Object} user - User object from auth context
 * @returns {boolean} - True if user can view financial data
 */
export const canViewFinancials = (user) => {
  return !!user; // Any authenticated user can view
};

/**
 * Get user role display name
 * @param {Object} user - User object from auth context
 * @returns {string} - Formatted role name
 */
export const getRoleDisplayName = (user) => {
  if (!user || !user.role) return 'User';
  
  const roleNames = {
    'admin': 'Administrator',
    'accountant': 'Accountant',
    'user': 'User',
    'employee': 'Employee'
  };
  
  return roleNames[user.role] || user.role;
};

/**
 * Get role color for UI display
 * @param {Object} user - User object from auth context
 * @returns {string} - MUI color name
 */
export const getRoleColor = (user) => {
  if (!user || !user.role) return 'default';
  
  const roleColors = {
    'admin': 'error',
    'accountant': 'primary',
    'user': 'default',
    'employee': 'info'
  };
  
  return roleColors[user.role] || 'default';
};

/**
 * Hook to get permission functions with current user context
 * @returns {Object} - Object containing permission check functions
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    user,
    hasRole: (roles) => hasRole(user, roles),
    canManage: canManageAccounting(user), // For general management operations
    canManageBanking: canManageBanking(user),
    canManageAccounting: canManageAccounting(user),
    isAdmin: isAdmin(user),
    canViewFinancials: canViewFinancials(user),
    getRoleDisplayName: () => getRoleDisplayName(user),
    getRoleColor: () => getRoleColor(user)
  };
};