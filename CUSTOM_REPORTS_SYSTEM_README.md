# Custom Reports System - Complete Implementation

## Overview

The Custom Reports system provides comprehensive reporting capabilities for the Financial Management System. It allows users to create, execute, and manage custom reports with various data sources and export options.

## Features Implemented

### 1. Report Template Management
- **Template Creation**: Create reusable report templates with parameters
- **Template Types**: 11 predefined report types plus custom SQL queries
- **Parameter Configuration**: Dynamic parameters for flexible reporting
- **Template Sharing**: Templates can be shared across users
- **Version Control**: Track template modifications and creators

### 2. Report Execution
- **Dynamic Parameters**: Runtime parameter input for flexible reports
- **Real-time Execution**: Execute reports with current data
- **Save Results**: Option to save report executions for future reference
- **Export Options**: CSV and JSON export formats
- **Performance Optimization**: Efficient query execution and result caching

### 3. Saved Reports Management
- **Report History**: Track all executed and saved reports
- **Quick Access**: Easy access to previously generated reports
- **Report Sharing**: Share saved reports with team members
- **Data Persistence**: Saved report data for historical analysis

### 4. Advanced Features
- **Custom SQL Queries**: Execute custom SELECT queries with parameters
- **Data Visualization**: Structured data presentation with summaries
- **Export Capabilities**: Multiple export formats (CSV, JSON)
- **Role-based Access**: Different permissions for different user roles
- **Integration**: Seamless integration with all system modules

## Database Schema

### Report Templates
```sql
report_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL,
  query_template TEXT,
  parameters JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Saved Reports
```sql
saved_reports (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES report_templates(id),
  name VARCHAR(100) NOT NULL,
  parameters JSONB,
  result_data JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## API Endpoints

### Report Templates
- `GET /api/reports/templates` - Get all report templates
- `GET /api/reports/templates/:id` - Get report template by ID
- `POST /api/reports/templates` - Create new report template (admin/accountant)
- `PUT /api/reports/templates/:id` - Update report template (admin/accountant)
- `DELETE /api/reports/templates/:id` - Delete report template (admin/accountant)

### Report Execution
- `POST /api/reports/templates/:id/execute` - Execute report template
- `GET /api/reports/types` - Get available report types
- `GET /api/reports/parameters/:type/options` - Get parameter options

### Saved Reports
- `GET /api/reports/saved` - Get all saved reports
- `GET /api/reports/saved/:id` - Get saved report by ID
- `DELETE /api/reports/saved/:id` - Delete saved report

## Report Types

### 1. Financial Summary
**Purpose**: Overview of revenue, expenses, and net income
**Parameters**:
- Start Date (optional)
- End Date (optional)

**Output**:
- Total Revenue
- Total Expenses
- Net Income
- Total Assets
- Total Liabilities

### 2. Income Statement
**Purpose**: Detailed profit and loss statement
**Parameters**:
- Start Date (required)
- End Date (required)

**Output**:
- Revenue breakdown by status
- Expenses by category
- Net income calculation
- Period comparison

### 3. Balance Sheet
**Purpose**: Assets, liabilities, and equity at a point in time
**Parameters**:
- As of Date (required)

**Output**:
- Current Assets
- Fixed Assets
- Current Liabilities
- Long-term Liabilities
- Equity accounts

### 4. Cash Flow Statement
**Purpose**: Cash inflows and outflows by activity
**Parameters**:
- Start Date (required)
- End Date (required)

**Output**:
- Operating Activities
- Investing Activities
- Financing Activities
- Net Change in Cash

### 5. Accounts Receivable
**Purpose**: Outstanding customer invoices and aging
**Parameters**:
- As of Date (optional)

**Output**:
- Total Receivables
- Aging Analysis (Current, 1-30, 31-60, 61-90, 90+ days)
- Customer breakdown
- Overdue analysis

### 6. Accounts Payable
**Purpose**: Outstanding vendor bills and aging
**Parameters**:
- As of Date (optional)

**Output**:
- Total Payables
- Vendor breakdown
- Due date analysis
- Payment scheduling

### 7. Expense Analysis
**Purpose**: Detailed expense breakdown and trends
**Parameters**:
- Start Date (required)
- End Date (required)
- Category ID (optional)

**Output**:
- Category breakdown
- Monthly trends
- Vendor analysis
- Project allocation

### 8. Revenue Analysis
**Purpose**: Revenue breakdown and trends
**Parameters**:
- Start Date (required)
- End Date (required)

**Output**:
- Client breakdown
- Project revenue
- Monthly trends
- Payment analysis

### 9. Payroll Summary
**Purpose**: Employee payroll costs and breakdown
**Parameters**:
- Start Date (required)
- End Date (required)

**Output**:
- Total payroll costs
- Department breakdown
- Employee analysis
- Deduction summary

### 10. Tax Summary
**Purpose**: Tax calculations and liabilities
**Parameters**:
- Start Date (required)
- End Date (required)

**Output**:
- Tax calculations
- Tax liabilities
- Deduction analysis
- Compliance reporting

### 11. Custom Query
**Purpose**: Execute custom SQL queries
**Parameters**:
- SQL Query Template (required)
- Dynamic parameters as needed

**Output**:
- Query results
- Row count
- Execution metadata

## Client Components

### CustomReports Component (`/reports/custom`)
**Features**:
- Tabbed interface (Templates / Saved Reports)
- Template management (create, edit, delete)
- Report execution with parameter input
- Result visualization and export
- Saved report management

**Key Functionality**:
- Dynamic parameter forms based on report type
- Real-time report execution
- Export to CSV and JSON
- Report result visualization
- Template sharing and management

## Role-Based Access Control

### Admin Users
- ✅ Create, edit, delete report templates
- ✅ Execute all reports
- ✅ View all saved reports
- ✅ Manage system-wide report templates

### Accountant Users
- ✅ Create, edit, delete report templates
- ✅ Execute all reports
- ✅ View all saved reports
- ✅ Manage financial report templates

### Regular Users
- ✅ Execute existing report templates
- ✅ View and manage their own saved reports
- ✅ Export report results
- ❌ Cannot create or modify templates

## Usage Examples

### Creating a Report Template
1. Navigate to `/reports/custom`
2. Click "Create Template"
3. Fill in template details:
   - Name: "Monthly Expense Report"
   - Type: "Expense Analysis"
   - Description: "Monthly breakdown of expenses by category"
4. Save template

### Executing a Report
1. Select a report template
2. Click "Execute"
3. Fill in required parameters:
   - Start Date: "2024-01-01"
   - End Date: "2024-01-31"
4. Choose to save results (optional)
5. Click "Execute"

### Viewing Report Results
1. Review summary data
2. Examine detailed results
3. Export to CSV or JSON
4. Save for future reference

### Managing Saved Reports
1. Switch to "Saved Reports" tab
2. View execution history
3. Re-open previous results
4. Delete old reports

## Integration with Other Modules

### Chart of Accounts Integration
- Balance Sheet reports use account hierarchy
- Income Statement maps to revenue/expense accounts
- Trial Balance data for account balances

### Banking Integration
- Cash Flow reports use bank transaction data
- Bank reconciliation status in reports
- Account balance tracking

### Invoice/Payment Integration
- Accounts Receivable from invoice data
- Revenue analysis from payment data
- Customer payment patterns

### Expense Integration
- Expense analysis from expense records
- Vendor payment analysis
- Category-wise expense tracking

### Payroll Integration
- Payroll summary from payroll data
- Employee cost analysis
- Department-wise payroll costs

## Security Features

### Query Security
- Only SELECT queries allowed for custom reports
- Parameter sanitization to prevent SQL injection
- Query execution limits and timeouts
- Access control based on user roles

### Data Protection
- Role-based data access
- Audit trail for report executions
- Secure parameter handling
- Export permission controls

## Performance Optimization

### Query Optimization
- Indexed database queries
- Result caching for frequently run reports
- Pagination for large result sets
- Efficient data aggregation

### Client-side Performance
- Lazy loading of report results
- Efficient data visualization
- Optimized export functions
- Progressive data loading

## Export Capabilities

### CSV Export
- Tabular data export
- Proper formatting and escaping
- Column headers included
- Large dataset support

### JSON Export
- Complete data structure export
- Nested object support
- Metadata inclusion
- API-friendly format

## Error Handling

### Common Errors
- **Template Not Found**: Invalid template ID
- **Parameter Validation**: Missing or invalid parameters
- **Query Execution**: SQL errors or timeouts
- **Permission Denied**: Insufficient user permissions

### Error Recovery
- Graceful error messages
- Retry mechanisms for transient errors
- Fallback options for failed exports
- User-friendly error descriptions

## Best Practices

### Template Design
1. **Clear Naming**: Use descriptive template names
2. **Documentation**: Provide detailed descriptions
3. **Parameters**: Use appropriate parameter types
4. **Testing**: Test templates with various parameters
5. **Performance**: Optimize queries for large datasets

### Report Execution
1. **Parameter Validation**: Validate all input parameters
2. **Date Ranges**: Use appropriate date ranges
3. **Data Limits**: Consider performance for large datasets
4. **Saving**: Save important reports for future reference
5. **Export**: Choose appropriate export formats

### Security
1. **Access Control**: Implement proper role-based access
2. **Query Safety**: Only allow safe SELECT queries
3. **Parameter Sanitization**: Sanitize all user inputs
4. **Audit Trail**: Log all report executions
5. **Data Privacy**: Respect data privacy requirements

## Troubleshooting

### Template Issues
- **Creation Fails**: Check required fields and permissions
- **Execution Errors**: Validate parameters and query syntax
- **Performance Issues**: Optimize queries and add indexes

### Report Execution Issues
- **Timeout Errors**: Reduce date ranges or add filters
- **No Data**: Check date ranges and filter criteria
- **Permission Errors**: Verify user roles and access rights

### Export Issues
- **Large Files**: Use pagination or filters to reduce size
- **Format Errors**: Ensure data is in correct format
- **Download Fails**: Check browser settings and permissions

## Future Enhancements

1. **Scheduled Reports**: Automatic report generation and delivery
2. **Data Visualization**: Charts and graphs for report data
3. **Report Builder**: Visual query builder interface
4. **Email Integration**: Email reports to stakeholders
5. **Dashboard Integration**: Embed reports in dashboards
6. **Advanced Analytics**: Statistical analysis and forecasting
7. **Multi-format Export**: PDF, Excel, and other formats
8. **Report Collaboration**: Comments and sharing features

## API Documentation

### Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Error Responses
All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

### Success Responses
All endpoints return consistent success responses:
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Success message" // Optional
}
```

## Support

For technical support or questions about the Custom Reports system, please refer to the main project documentation or contact the development team.