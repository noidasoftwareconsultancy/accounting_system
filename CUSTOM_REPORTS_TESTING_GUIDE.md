# Custom Reports System - Testing Guide

## Quick Start Testing

### 1. Access the Custom Reports Page
1. Navigate to the application
2. Login with admin or accountant credentials:
   - **Email**: admin@example.com or accountant@example.com
   - **Password**: admin123
3. Go to Reports → Custom Reports (`/reports/custom`)

### 2. Expected Initial State
- **Empty State**: If no templates exist, you should see:
  - "No Report Templates Found" message
  - "Create First Template" button (for admin/accountant)
  - "Create Sample Template" button (for testing)
- **Debug Info**: In development mode, you'll see debug information showing:
  - Number of templates and types loaded
  - Current user email
  - Permission status

### 3. Test Template Creation

#### Method 1: Create Sample Template (Quick Test)
1. Click "Create Sample Template" button
2. Should create a "Sample Financial Summary" template
3. Verify success message appears
4. Template should appear in the grid

#### Method 2: Manual Template Creation
1. Click "Create First Template" or "Create Template"
2. Fill in the form:
   - **Name**: "Test Monthly Report"
   - **Report Type**: Select "Financial Summary"
   - **Description**: "Test report for monthly analysis"
3. Click "Create"
4. Verify template appears in the grid

### 4. Test Template Execution
1. Click "Execute" on any template
2. Fill in required parameters (if any):
   - For Financial Summary: Start Date and End Date are optional
   - For Income Statement: Start Date and End Date are required
3. Optionally check "Save this report execution"
4. Click "Execute"
5. Verify report results appear in dialog

### 5. Test CRUD Operations

#### View Templates
- Templates should display in card format
- Each card shows: Name, Description, Type, Creator
- Action buttons: Execute, More options (admin/accountant only)

#### Edit Template (Admin/Accountant only)
1. Click three-dots menu on a template
2. Select "Edit"
3. Modify template details
4. Click "Update"
5. Verify changes are saved

#### Delete Template (Admin/Accountant only)
1. Click three-dots menu on a template
2. Select "Delete"
3. Confirm deletion
4. Verify template is removed

### 6. Test Saved Reports
1. Switch to "Saved Reports" tab
2. If no saved reports exist, should see empty state
3. Execute a report with "Save this report execution" checked
4. Switch back to Saved Reports tab
5. Verify saved report appears in table

### 7. Test Role-Based Access

#### As Admin/Accountant
- ✅ Can see "Create Template" button
- ✅ Can see edit/delete options in template menu
- ✅ Can create, edit, delete templates
- ✅ Can execute all reports

#### As Regular User
- ❌ No "Create Template" button
- ❌ No edit/delete options in template menu
- ✅ Can execute existing templates
- ✅ Can view and manage own saved reports

## Troubleshooting Common Issues

### 1. "Failed to load data" Error
**Possible Causes:**
- Server not running
- Authentication token expired
- API endpoints not registered

**Solutions:**
- Check server is running on port 5001
- Re-login to refresh authentication token
- Verify `/api/reports` routes are registered in server

### 2. "No Report Templates Found"
**Expected Behavior:**
- This is normal for a fresh installation
- Use "Create Sample Template" for quick testing
- Or create templates manually

### 3. Template Creation Fails
**Check:**
- User has admin or accountant role
- All required fields are filled
- Server logs for validation errors

### 4. Report Execution Fails
**Common Issues:**
- Missing required parameters
- Invalid date ranges
- Database connection issues

**Solutions:**
- Fill all required parameters
- Use valid date ranges (start date before end date)
- Check server logs for database errors

### 5. Permission Denied Errors
**Check:**
- User role (admin/accountant required for template management)
- Authentication status
- JWT token validity

## API Testing with Browser DevTools

### 1. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to Custom Reports page
4. Look for API calls to `/api/reports/`
5. Check response status and data

### 2. Console Debugging
1. Open Console tab in DevTools
2. Look for debug messages:
   - "Loading report data..."
   - "Report types loaded:"
   - "Report templates response:"
3. Check for any error messages

### 3. Manual API Testing
```javascript
// Test in browser console (after login)
fetch('/api/reports/types', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

## Expected Data Structures

### Report Types Response
```json
{
  "success": true,
  "data": [
    {
      "id": "financial_summary",
      "name": "Financial Summary",
      "description": "Overview of revenue, expenses, and net income",
      "parameters": [...]
    }
  ]
}
```

### Report Templates Response
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": 1,
        "name": "Monthly Financial Summary",
        "description": "Overview of monthly performance",
        "report_type": "financial_summary",
        "creator": {
          "first_name": "Admin",
          "last_name": "User"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

## Performance Testing

### 1. Large Dataset Testing
1. Create multiple report templates (10+)
2. Execute reports with large date ranges
3. Test pagination and loading performance
4. Monitor browser memory usage

### 2. Concurrent User Testing
1. Login with multiple users simultaneously
2. Execute reports concurrently
3. Verify data consistency
4. Check for race conditions

## Security Testing

### 1. Role-Based Access Control
1. Test with different user roles
2. Verify UI elements show/hide correctly
3. Test API endpoints with different roles
4. Attempt unauthorized operations

### 2. Input Validation
1. Test with invalid report parameters
2. Try SQL injection in custom queries
3. Test with malformed data
4. Verify error handling

## Integration Testing

### 1. Data Consistency
1. Create invoices, expenses, payments
2. Execute financial reports
3. Verify data matches source modules
4. Test real-time data updates

### 2. Export Functionality
1. Execute reports with data
2. Test CSV export
3. Test JSON export
4. Verify file downloads work

## Automated Testing Commands

### Server Tests
```bash
cd server
npm test -- --grep "reports"
```

### Client Tests
```bash
cd client
npm test -- --testNamePattern="CustomReports"
```

## Common Test Scenarios

### Scenario 1: New User Onboarding
1. Fresh database with no templates
2. Admin creates first template
3. Regular user executes template
4. User saves report execution

### Scenario 2: Monthly Reporting Workflow
1. Admin creates monthly report templates
2. Accountant executes monthly reports
3. Reports are saved for historical reference
4. Data is exported for external use

### Scenario 3: Custom Analysis
1. Power user creates custom SQL query template
2. Template is shared with team
3. Multiple users execute with different parameters
4. Results are compared and analyzed

## Success Criteria

### ✅ Basic Functionality
- [ ] Page loads without errors
- [ ] Report types are loaded
- [ ] Templates can be created (admin/accountant)
- [ ] Templates can be executed (all users)
- [ ] Results are displayed correctly

### ✅ CRUD Operations
- [ ] Create templates
- [ ] Read/view templates
- [ ] Update templates
- [ ] Delete templates
- [ ] Manage saved reports

### ✅ Role-Based Access
- [ ] Admin/accountant can manage templates
- [ ] Regular users can execute reports
- [ ] UI adapts to user permissions
- [ ] API enforces role restrictions

### ✅ Data Integration
- [ ] Reports show real financial data
- [ ] Data matches source modules
- [ ] Export functions work correctly
- [ ] Saved reports persist correctly

### ✅ User Experience
- [ ] Intuitive interface
- [ ] Clear error messages
- [ ] Responsive design
- [ ] Fast loading times

## Support and Debugging

### Log Locations
- **Client**: Browser DevTools Console
- **Server**: Server console output
- **Database**: Check Prisma logs

### Common Log Messages
- "Loading report data..." - Normal startup
- "Report types loaded:" - Successful API call
- "Failed to load data:" - API error
- "Template created successfully" - Successful operation

### Getting Help
1. Check this testing guide
2. Review error messages in console
3. Verify user permissions and authentication
4. Check server logs for detailed errors
5. Consult the main documentation