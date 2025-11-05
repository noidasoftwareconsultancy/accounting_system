-- Initialize database with sample data

-- Create admin user
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
VALUES 
('admin@example.com', '$2a$10$xVqYLGUuJ1Ub/QxI5Zp3/.8Vwx9KZ9gF4U5hQQrC7Lnmj0bNGEdVe', 'Admin', 'User', 'admin', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create expense categories
INSERT INTO expense_categories (name, description)
VALUES 
('Office Supplies', 'Stationery, paper, ink, etc.'),
('Software & Subscriptions', 'Software licenses, SaaS subscriptions'),
('Hardware', 'Computers, servers, equipment'),
('Travel', 'Business travel expenses'),
('Utilities', 'Electricity, water, internet'),
('Rent', 'Office rent and related expenses'),
('Salaries', 'Employee salaries and benefits'),
('Marketing', 'Advertising and marketing expenses'),
('Professional Services', 'Legal, accounting, consulting'),
('Miscellaneous', 'Other expenses')
ON CONFLICT (name) DO NOTHING;

-- Create vendors
INSERT INTO vendors (name, contact_person, email, phone, address, website, notes)
VALUES 
('Office Depot', 'John Smith', 'john@officedepot.com', '555-1234', '123 Supply St', 'www.officedepot.com', 'Office supplies vendor'),
('Adobe', 'Support Team', 'support@adobe.com', '555-2345', '456 Software Ave', 'www.adobe.com', 'Software subscriptions'),
('Dell', 'Sales Team', 'sales@dell.com', '555-3456', '789 Hardware Blvd', 'www.dell.com', 'Computer hardware'),
('Verizon', 'Customer Service', 'service@verizon.com', '555-4567', '101 Network Rd', 'www.verizon.com', 'Internet service provider')
ON CONFLICT (name) DO NOTHING;

-- Create sample clients
INSERT INTO clients (name, contact_person, email, phone, address, website, notes)
VALUES 
('Acme Corporation', 'Jane Doe', 'jane@acme.com', '555-5678', '123 Client St', 'www.acme.com', 'Large enterprise client'),
('Startup Inc', 'Bob Johnson', 'bob@startup.com', '555-6789', '456 Innovation Ave', 'www.startup.com', 'Startup client'),
('Tech Solutions', 'Alice Brown', 'alice@techsolutions.com', '555-7890', '789 Tech Blvd', 'www.techsolutions.com', 'IT consulting client')
ON CONFLICT (name) DO NOTHING;

-- Create sample invoices
INSERT INTO invoices (client_id, invoice_number, issue_date, due_date, status, subtotal, tax_amount, discount_amount, total_amount, notes)
VALUES 
(1, 'INV-2023-001', '2023-01-15', '2023-02-15', 'paid', 5000.00, 500.00, 0.00, 5500.00, 'January services'),
(2, 'INV-2023-002', '2023-02-01', '2023-03-01', 'pending', 3000.00, 300.00, 150.00, 3150.00, 'February services'),
(3, 'INV-2023-003', '2023-03-10', '2023-04-10', 'overdue', 7500.00, 750.00, 0.00, 8250.00, 'March services')
ON CONFLICT (invoice_number) DO NOTHING;

-- Create sample expenses
INSERT INTO expenses (description, amount, date, category_id, vendor_id, payment_method, reference_number, notes, status, user_id)
VALUES 
('Office supplies quarterly stock', 450.75, '2023-01-10', 1, 1, 'credit_card', 'CC-12345', 'Quarterly office supply restock', 'approved', 1),
('Adobe Creative Cloud annual subscription', 599.99, '2023-02-15', 2, 2, 'bank_transfer', 'BT-67890', 'Annual subscription renewal', 'approved', 1),
('Dell XPS laptops (3)', 4500.00, '2023-03-05', 3, 3, 'check', 'CHK-11223', 'New laptops for development team', 'pending', 1),
('Internet service - Q1', 899.97, '2023-03-31', 5, 4, 'direct_debit', 'DD-44556', 'Quarterly internet service payment', 'approved', 1)
ON CONFLICT DO NOTHING;