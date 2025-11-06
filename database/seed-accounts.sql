-- Seed script for Chart of Accounts
-- This script creates default account types and a basic chart of accounts structure

-- Ensure account types exist
INSERT INTO account_types (id, name, description) VALUES 
(1, 'Asset', 'Resources owned by the company'),
(2, 'Liability', 'Debts and obligations'),
(3, 'Equity', 'Owner''s equity and retained earnings'),
(4, 'Revenue', 'Income from business operations'),
(5, 'Expense', 'Costs of doing business')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Reset sequence to ensure proper auto-increment
SELECT setval('account_types_id_seq', (SELECT MAX(id) FROM account_types));

-- Create default chart of accounts
-- Note: created_by = 1 assumes admin user exists with id = 1

-- ASSETS
INSERT INTO accounts (account_number, name, type_id, parent_account_id, description, is_active, created_by) VALUES 
-- Current Assets
('1000', 'Current Assets', 1, NULL, 'Short-term assets', true, 1),
('1010', 'Cash and Cash Equivalents', 1, (SELECT id FROM accounts WHERE account_number = '1000'), 'Cash accounts', true, 1),
('1011', 'Petty Cash', 1, (SELECT id FROM accounts WHERE account_number = '1010'), 'Small cash fund for minor expenses', true, 1),
('1012', 'Cash in Bank - Checking', 1, (SELECT id FROM accounts WHERE account_number = '1010'), 'Primary checking account', true, 1),
('1013', 'Cash in Bank - Savings', 1, (SELECT id FROM accounts WHERE account_number = '1010'), 'Savings account', true, 1),

('1020', 'Accounts Receivable', 1, (SELECT id FROM accounts WHERE account_number = '1000'), 'Money owed by customers', true, 1),
('1021', 'Trade Receivables', 1, (SELECT id FROM accounts WHERE account_number = '1020'), 'Receivables from normal business operations', true, 1),
('1022', 'Allowance for Doubtful Accounts', 1, (SELECT id FROM accounts WHERE account_number = '1020'), 'Estimated uncollectible receivables', true, 1),

('1030', 'Inventory', 1, (SELECT id FROM accounts WHERE account_number = '1000'), 'Goods held for sale', true, 1),
('1031', 'Raw Materials', 1, (SELECT id FROM accounts WHERE account_number = '1030'), 'Materials used in production', true, 1),
('1032', 'Work in Process', 1, (SELECT id FROM accounts WHERE account_number = '1030'), 'Partially completed goods', true, 1),
('1033', 'Finished Goods', 1, (SELECT id FROM accounts WHERE account_number = '1030'), 'Completed products ready for sale', true, 1),

('1040', 'Prepaid Expenses', 1, (SELECT id FROM accounts WHERE account_number = '1000'), 'Expenses paid in advance', true, 1),
('1041', 'Prepaid Insurance', 1, (SELECT id FROM accounts WHERE account_number = '1040'), 'Insurance premiums paid in advance', true, 1),
('1042', 'Prepaid Rent', 1, (SELECT id FROM accounts WHERE account_number = '1040'), 'Rent paid in advance', true, 1),

-- Fixed Assets
('1500', 'Fixed Assets', 1, NULL, 'Long-term assets', true, 1),
('1510', 'Property, Plant & Equipment', 1, (SELECT id FROM accounts WHERE account_number = '1500'), 'Tangible fixed assets', true, 1),
('1511', 'Land', 1, (SELECT id FROM accounts WHERE account_number = '1510'), 'Real estate owned', true, 1),
('1512', 'Buildings', 1, (SELECT id FROM accounts WHERE account_number = '1510'), 'Building structures', true, 1),
('1513', 'Equipment', 1, (SELECT id FROM accounts WHERE account_number = '1510'), 'Machinery and equipment', true, 1),
('1514', 'Furniture & Fixtures', 1, (SELECT id FROM accounts WHERE account_number = '1510'), 'Office furniture and fixtures', true, 1),
('1515', 'Vehicles', 1, (SELECT id FROM accounts WHERE account_number = '1510'), 'Company vehicles', true, 1),

('1520', 'Accumulated Depreciation', 1, (SELECT id FROM accounts WHERE account_number = '1500'), 'Contra asset for depreciation', true, 1),
('1521', 'Accumulated Depreciation - Buildings', 1, (SELECT id FROM accounts WHERE account_number = '1520'), 'Depreciation on buildings', true, 1),
('1522', 'Accumulated Depreciation - Equipment', 1, (SELECT id FROM accounts WHERE account_number = '1520'), 'Depreciation on equipment', true, 1),
('1523', 'Accumulated Depreciation - Furniture', 1, (SELECT id FROM accounts WHERE account_number = '1520'), 'Depreciation on furniture', true, 1),
('1524', 'Accumulated Depreciation - Vehicles', 1, (SELECT id FROM accounts WHERE account_number = '1520'), 'Depreciation on vehicles', true, 1)

ON CONFLICT (account_number) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- LIABILITIES
INSERT INTO accounts (account_number, name, type_id, parent_account_id, description, is_active, created_by) VALUES 
-- Current Liabilities
('2000', 'Current Liabilities', 2, NULL, 'Short-term obligations', true, 1),
('2010', 'Accounts Payable', 2, (SELECT id FROM accounts WHERE account_number = '2000'), 'Money owed to suppliers', true, 1),
('2011', 'Trade Payables', 2, (SELECT id FROM accounts WHERE account_number = '2010'), 'Payables from normal business operations', true, 1),
('2012', 'Accrued Expenses', 2, (SELECT id FROM accounts WHERE account_number = '2010'), 'Expenses incurred but not yet paid', true, 1),

('2020', 'Short-term Loans', 2, (SELECT id FROM accounts WHERE account_number = '2000'), 'Loans due within one year', true, 1),
('2021', 'Bank Loans - Short Term', 2, (SELECT id FROM accounts WHERE account_number = '2020'), 'Short-term bank financing', true, 1),
('2022', 'Credit Cards Payable', 2, (SELECT id FROM accounts WHERE account_number = '2020'), 'Credit card balances', true, 1),

('2030', 'Payroll Liabilities', 2, (SELECT id FROM accounts WHERE account_number = '2000'), 'Employee-related liabilities', true, 1),
('2031', 'Salaries Payable', 2, (SELECT id FROM accounts WHERE account_number = '2030'), 'Unpaid employee salaries', true, 1),
('2032', 'Payroll Tax Payable', 2, (SELECT id FROM accounts WHERE account_number = '2030'), 'Payroll taxes owed', true, 1),
('2033', 'Employee Benefits Payable', 2, (SELECT id FROM accounts WHERE account_number = '2030'), 'Unpaid employee benefits', true, 1),

('2040', 'Tax Liabilities', 2, (SELECT id FROM accounts WHERE account_number = '2000'), 'Taxes owed', true, 1),
('2041', 'Income Tax Payable', 2, (SELECT id FROM accounts WHERE account_number = '2040'), 'Income taxes owed', true, 1),
('2042', 'Sales Tax Payable', 2, (SELECT id FROM accounts WHERE account_number = '2040'), 'Sales taxes collected', true, 1),
('2043', 'VAT Payable', 2, (SELECT id FROM accounts WHERE account_number = '2040'), 'Value-added tax owed', true, 1),

-- Long-term Liabilities
('2500', 'Long-term Liabilities', 2, NULL, 'Long-term obligations', true, 1),
('2510', 'Long-term Loans', 2, (SELECT id FROM accounts WHERE account_number = '2500'), 'Loans due after one year', true, 1),
('2511', 'Bank Loans - Long Term', 2, (SELECT id FROM accounts WHERE account_number = '2510'), 'Long-term bank financing', true, 1),
('2512', 'Mortgage Payable', 2, (SELECT id FROM accounts WHERE account_number = '2510'), 'Real estate mortgages', true, 1)

ON CONFLICT (account_number) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- EQUITY
INSERT INTO accounts (account_number, name, type_id, parent_account_id, description, is_active, created_by) VALUES 
('3000', 'Owner''s Equity', 3, NULL, 'Owner''s stake in the business', true, 1),
('3010', 'Capital Stock', 3, (SELECT id FROM accounts WHERE account_number = '3000'), 'Issued capital stock', true, 1),
('3011', 'Common Stock', 3, (SELECT id FROM accounts WHERE account_number = '3010'), 'Common shares issued', true, 1),
('3012', 'Preferred Stock', 3, (SELECT id FROM accounts WHERE account_number = '3010'), 'Preferred shares issued', true, 1),

('3020', 'Retained Earnings', 3, (SELECT id FROM accounts WHERE account_number = '3000'), 'Accumulated profits', true, 1),
('3021', 'Current Year Earnings', 3, (SELECT id FROM accounts WHERE account_number = '3020'), 'Current year profit/loss', true, 1),
('3022', 'Prior Year Earnings', 3, (SELECT id FROM accounts WHERE account_number = '3020'), 'Accumulated prior year profits', true, 1),

('3030', 'Dividends', 3, (SELECT id FROM accounts WHERE account_number = '3000'), 'Distributions to shareholders', true, 1),
('3031', 'Dividends Declared', 3, (SELECT id FROM accounts WHERE account_number = '3030'), 'Dividends declared but not paid', true, 1)

ON CONFLICT (account_number) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- REVENUE
INSERT INTO accounts (account_number, name, type_id, parent_account_id, description, is_active, created_by) VALUES 
('4000', 'Revenue', 4, NULL, 'Income from business operations', true, 1),
('4010', 'Sales Revenue', 4, (SELECT id FROM accounts WHERE account_number = '4000'), 'Revenue from sales', true, 1),
('4011', 'Product Sales', 4, (SELECT id FROM accounts WHERE account_number = '4010'), 'Revenue from product sales', true, 1),
('4012', 'Service Revenue', 4, (SELECT id FROM accounts WHERE account_number = '4010'), 'Revenue from services', true, 1),
('4013', 'Consulting Revenue', 4, (SELECT id FROM accounts WHERE account_number = '4010'), 'Revenue from consulting', true, 1),

('4020', 'Other Revenue', 4, (SELECT id FROM accounts WHERE account_number = '4000'), 'Non-operating revenue', true, 1),
('4021', 'Interest Income', 4, (SELECT id FROM accounts WHERE account_number = '4020'), 'Interest earned on investments', true, 1),
('4022', 'Rental Income', 4, (SELECT id FROM accounts WHERE account_number = '4020'), 'Income from property rentals', true, 1),
('4023', 'Gain on Sale of Assets', 4, (SELECT id FROM accounts WHERE account_number = '4020'), 'Profits from asset sales', true, 1)

ON CONFLICT (account_number) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- EXPENSES
INSERT INTO accounts (account_number, name, type_id, parent_account_id, description, is_active, created_by) VALUES 
('5000', 'Cost of Goods Sold', 5, NULL, 'Direct costs of producing goods', true, 1),
('5010', 'Materials Cost', 5, (SELECT id FROM accounts WHERE account_number = '5000'), 'Cost of raw materials', true, 1),
('5020', 'Labor Cost', 5, (SELECT id FROM accounts WHERE account_number = '5000'), 'Direct labor costs', true, 1),
('5030', 'Manufacturing Overhead', 5, (SELECT id FROM accounts WHERE account_number = '5000'), 'Indirect manufacturing costs', true, 1),

('6000', 'Operating Expenses', 5, NULL, 'Regular business operating costs', true, 1),
('6010', 'Salaries and Wages', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Employee compensation', true, 1),
('6011', 'Management Salaries', 5, (SELECT id FROM accounts WHERE account_number = '6010'), 'Management compensation', true, 1),
('6012', 'Staff Salaries', 5, (SELECT id FROM accounts WHERE account_number = '6010'), 'Staff compensation', true, 1),
('6013', 'Overtime Pay', 5, (SELECT id FROM accounts WHERE account_number = '6010'), 'Overtime compensation', true, 1),

('6020', 'Employee Benefits', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Employee benefit costs', true, 1),
('6021', 'Health Insurance', 5, (SELECT id FROM accounts WHERE account_number = '6020'), 'Employee health insurance', true, 1),
('6022', 'Retirement Benefits', 5, (SELECT id FROM accounts WHERE account_number = '6020'), 'Retirement plan contributions', true, 1),
('6023', 'Payroll Taxes', 5, (SELECT id FROM accounts WHERE account_number = '6020'), 'Employer payroll taxes', true, 1),

('6030', 'Office Expenses', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'General office costs', true, 1),
('6031', 'Office Supplies', 5, (SELECT id FROM accounts WHERE account_number = '6030'), 'Office supplies and materials', true, 1),
('6032', 'Postage and Shipping', 5, (SELECT id FROM accounts WHERE account_number = '6030'), 'Mailing and shipping costs', true, 1),
('6033', 'Telephone and Internet', 5, (SELECT id FROM accounts WHERE account_number = '6030'), 'Communication expenses', true, 1),

('6040', 'Rent and Utilities', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Facility costs', true, 1),
('6041', 'Rent Expense', 5, (SELECT id FROM accounts WHERE account_number = '6040'), 'Office and facility rent', true, 1),
('6042', 'Electricity', 5, (SELECT id FROM accounts WHERE account_number = '6040'), 'Electrical utility costs', true, 1),
('6043', 'Water and Sewer', 5, (SELECT id FROM accounts WHERE account_number = '6040'), 'Water utility costs', true, 1),
('6044', 'Gas', 5, (SELECT id FROM accounts WHERE account_number = '6040'), 'Gas utility costs', true, 1),

('6050', 'Professional Services', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'External professional services', true, 1),
('6051', 'Legal Fees', 5, (SELECT id FROM accounts WHERE account_number = '6050'), 'Legal and attorney fees', true, 1),
('6052', 'Accounting Fees', 5, (SELECT id FROM accounts WHERE account_number = '6050'), 'Accounting and audit fees', true, 1),
('6053', 'Consulting Fees', 5, (SELECT id FROM accounts WHERE account_number = '6050'), 'Business consulting fees', true, 1),

('6060', 'Marketing and Advertising', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Marketing costs', true, 1),
('6061', 'Advertising Expense', 5, (SELECT id FROM accounts WHERE account_number = '6060'), 'Advertising and promotion', true, 1),
('6062', 'Website and Digital Marketing', 5, (SELECT id FROM accounts WHERE account_number = '6060'), 'Online marketing costs', true, 1),
('6063', 'Trade Shows and Events', 5, (SELECT id FROM accounts WHERE account_number = '6060'), 'Event and trade show costs', true, 1),

('6070', 'Travel and Entertainment', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Business travel costs', true, 1),
('6071', 'Travel Expense', 5, (SELECT id FROM accounts WHERE account_number = '6070'), 'Business travel costs', true, 1),
('6072', 'Meals and Entertainment', 5, (SELECT id FROM accounts WHERE account_number = '6070'), 'Business meals and entertainment', true, 1),

('6080', 'Insurance', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Insurance premiums', true, 1),
('6081', 'General Liability Insurance', 5, (SELECT id FROM accounts WHERE account_number = '6080'), 'General business insurance', true, 1),
('6082', 'Property Insurance', 5, (SELECT id FROM accounts WHERE account_number = '6080'), 'Property and equipment insurance', true, 1),
('6083', 'Workers Compensation', 5, (SELECT id FROM accounts WHERE account_number = '6080'), 'Workers compensation insurance', true, 1),

('6090', 'Depreciation and Amortization', 5, (SELECT id FROM accounts WHERE account_number = '6000'), 'Asset depreciation', true, 1),
('6091', 'Depreciation Expense', 5, (SELECT id FROM accounts WHERE account_number = '6090'), 'Depreciation of fixed assets', true, 1),
('6092', 'Amortization Expense', 5, (SELECT id FROM accounts WHERE account_number = '6090'), 'Amortization of intangible assets', true, 1),

('7000', 'Other Expenses', 5, NULL, 'Non-operating expenses', true, 1),
('7010', 'Interest Expense', 5, (SELECT id FROM accounts WHERE account_number = '7000'), 'Interest on loans and debt', true, 1),
('7020', 'Bank Fees', 5, (SELECT id FROM accounts WHERE account_number = '7000'), 'Banking and financial fees', true, 1),
('7030', 'Loss on Sale of Assets', 5, (SELECT id FROM accounts WHERE account_number = '7000'), 'Losses from asset sales', true, 1),
('7040', 'Bad Debt Expense', 5, (SELECT id FROM accounts WHERE account_number = '7000'), 'Uncollectible receivables', true, 1)

ON CONFLICT (account_number) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Update parent account relationships for accounts that were created before their parents
UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE account_number = '1000') 
WHERE account_number IN ('1010', '1020', '1030', '1040') AND parent_account_id IS NULL;

UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE account_number = '1010') 
WHERE account_number IN ('1011', '1012', '1013') AND parent_account_id IS NULL;

UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE account_number = '1020') 
WHERE account_number IN ('1021', '1022') AND parent_account_id IS NULL;

UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE account_number = '1030') 
WHERE account_number IN ('1031', '1032', '1033') AND parent_account_id IS NULL;

UPDATE accounts SET parent_account_id = (SELECT id FROM accounts WHERE account_number = '1040') 
WHERE account_number IN ('1041', '1042') AND parent_account_id IS NULL;

-- Continue for other account hierarchies...
-- (Similar updates for all parent-child relationships)

COMMIT;