-- Tax Reports System - Sample Data
-- This script creates sample tax rates and records for testing

-- Insert sample tax rates
INSERT INTO tax_rates (name, rate, type, is_active, created_by, created_at, updated_at) VALUES
('GST 5%', 5.0, 'GST', true, 1, NOW(), NOW()),
('GST 12%', 12.0, 'GST', true, 1, NOW(), NOW()),
('GST 18%', 18.0, 'GST', true, 1, NOW(), NOW()),
('GST 28%', 28.0, 'GST', true, 1, NOW(), NOW()),
('TDS 10%', 10.0, 'TDS', true, 1, NOW(), NOW()),
('TCS 1%', 1.0, 'TCS', true, 1, NOW(), NOW()),
('VAT 15%', 15.0, 'VAT', true, 1, NOW(), NOW()),
('Income Tax 30%', 30.0, 'INCOME_TAX', true, 1, NOW(), NOW()),
('Sales Tax 8%', 8.0, 'SALES_TAX', true, 1, NOW(), NOW()),
('Excise Duty 12%', 12.0, 'EXCISE', true, 1, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert sample tax records for the current year
-- Note: Adjust transaction_ids based on your actual data

-- Sample invoice tax records
INSERT INTO tax_records (tax_rate_id, transaction_type, transaction_id, amount, tax_amount, date, created_at, updated_at) VALUES
-- GST 18% on invoices
(3, 'invoice', 1, 10000.00, 1800.00, '2024-01-15', NOW(), NOW()),
(3, 'invoice', 2, 15000.00, 2700.00, '2024-02-20', NOW(), NOW()),
(3, 'invoice', 3, 8000.00, 1440.00, '2024-03-10', NOW(), NOW()),

-- GST 12% on invoices
(2, 'invoice', 4, 5000.00, 600.00, '2024-01-25', NOW(), NOW()),
(2, 'invoice', 5, 12000.00, 1440.00, '2024-02-15', NOW(), NOW()),

-- GST 5% on invoices
(1, 'invoice', 6, 20000.00, 1000.00, '2024-03-05', NOW(), NOW()),
(1, 'invoice', 7, 25000.00, 1250.00, '2024-04-12', NOW(), NOW()),

-- Sample expense tax records
-- TDS on expenses
(5, 'expense', 1, 50000.00, 5000.00, '2024-01-30', NOW(), NOW()),
(5, 'expense', 2, 30000.00, 3000.00, '2024-02-28', NOW(), NOW()),
(5, 'expense', 3, 40000.00, 4000.00, '2024-03-31', NOW(), NOW()),

-- GST on expenses
(3, 'expense', 4, 8000.00, 1440.00, '2024-01-20', NOW(), NOW()),
(2, 'expense', 5, 6000.00, 720.00, '2024-02-10', NOW(), NOW()),

-- Sample payroll tax records
-- Income tax deductions
(8, 'payroll', 1, 100000.00, 30000.00, '2024-01-31', NOW(), NOW()),
(8, 'payroll', 2, 80000.00, 24000.00, '2024-02-29', NOW(), NOW()),
(8, 'payroll', 3, 90000.00, 27000.00, '2024-03-31', NOW(), NOW()),
(8, 'payroll', 4, 95000.00, 28500.00, '2024-04-30', NOW(), NOW()),

-- TDS on contractor payments
(5, 'payroll', 5, 25000.00, 2500.00, '2024-01-15', NOW(), NOW()),
(5, 'payroll', 6, 30000.00, 3000.00, '2024-02-15', NOW(), NOW()),
(5, 'payroll', 7, 28000.00, 2800.00, '2024-03-15', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- Create some additional records for better reporting
-- Quarterly data spread
INSERT INTO tax_records (tax_rate_id, transaction_type, transaction_id, amount, tax_amount, date, created_at, updated_at) VALUES
-- Q2 2024
(3, 'invoice', 8, 22000.00, 3960.00, '2024-05-15', NOW(), NOW()),
(3, 'invoice', 9, 18000.00, 3240.00, '2024-06-20', NOW(), NOW()),
(2, 'invoice', 10, 14000.00, 1680.00, '2024-05-25', NOW(), NOW()),
(1, 'invoice', 11, 30000.00, 1500.00, '2024-06-10', NOW(), NOW()),

-- Q3 2024
(3, 'invoice', 12, 25000.00, 4500.00, '2024-07-15', NOW(), NOW()),
(3, 'invoice', 13, 20000.00, 3600.00, '2024-08-20', NOW(), NOW()),
(2, 'invoice', 14, 16000.00, 1920.00, '2024-09-25', NOW(), NOW()),
(1, 'invoice', 15, 35000.00, 1750.00, '2024-08-10', NOW(), NOW()),

-- Q4 2024
(3, 'invoice', 16, 28000.00, 5040.00, '2024-10-15', NOW(), NOW()),
(3, 'invoice', 17, 32000.00, 5760.00, '2024-11-20', NOW(), NOW()),
(2, 'invoice', 18, 18000.00, 2160.00, '2024-12-25', NOW(), NOW()),
(1, 'invoice', 19, 40000.00, 2000.00, '2024-11-10', NOW(), NOW())

ON CONFLICT DO NOTHING;

-- Summary query to verify data
SELECT 
    'Tax Rates Created' as description,
    COUNT(*) as count
FROM tax_rates
WHERE created_at >= CURRENT_DATE

UNION ALL

SELECT 
    'Tax Records Created' as description,
    COUNT(*) as count
FROM tax_records
WHERE created_at >= CURRENT_DATE

UNION ALL

SELECT 
    'Total Tax Amount' as description,
    ROUND(SUM(tax_amount), 2) as count
FROM tax_records
WHERE created_at >= CURRENT_DATE;

-- Display tax summary by type
SELECT 
    tr.type as tax_type,
    COUNT(rec.id) as record_count,
    ROUND(SUM(rec.amount), 2) as total_amount,
    ROUND(SUM(rec.tax_amount), 2) as total_tax
FROM tax_rates tr
LEFT JOIN tax_records rec ON tr.id = rec.tax_rate_id
WHERE tr.created_at >= CURRENT_DATE
GROUP BY tr.type
ORDER BY total_tax DESC;