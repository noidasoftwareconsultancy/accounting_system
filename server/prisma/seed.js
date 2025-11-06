const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      department: 'Management'
    }
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create accountant user
  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@example.com' },
    update: {},
    create: {
      username: 'accountant',
      email: 'accountant@example.com',
      password: hashedPassword,
      first_name: 'John',
      last_name: 'Accountant',
      role: 'accountant',
      department: 'Finance'
    }
  });

  console.log('✅ Accountant user created:', accountantUser.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      first_name: 'Jane',
      last_name: 'User',
      role: 'user',
      department: 'Operations'
    }
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create account types
  const accountTypes = [
    { name: 'Asset', description: 'Assets owned by the company' },
    { name: 'Liability', description: 'Debts and obligations' },
    { name: 'Equity', description: 'Owner equity and retained earnings' },
    { name: 'Revenue', description: 'Income from business operations' },
    { name: 'Expense', description: 'Costs of doing business' }
  ];

  // Check if account types already exist
  const existingAccountTypes = await prisma.accountType.count();
  if (existingAccountTypes === 0) {
    await prisma.accountType.createMany({
      data: accountTypes
    });
  }

  console.log('✅ Account types created');

  // Create expense categories
  const expenseCategories = [
    { name: 'Office Supplies', description: 'Stationery, paper, ink, etc.', created_by: adminUser.id },
    { name: 'Software & Subscriptions', description: 'Software licenses, SaaS subscriptions', created_by: adminUser.id },
    { name: 'Hardware', description: 'Computers, servers, equipment', created_by: adminUser.id },
    { name: 'Travel', description: 'Business travel expenses', created_by: adminUser.id },
    { name: 'Utilities', description: 'Electricity, water, internet', created_by: adminUser.id },
    { name: 'Rent', description: 'Office rent and related expenses', created_by: adminUser.id },
    { name: 'Salaries', description: 'Employee salaries and benefits', created_by: adminUser.id },
    { name: 'Marketing', description: 'Advertising and marketing expenses', created_by: adminUser.id },
    { name: 'Professional Services', description: 'Legal, accounting, consulting', created_by: adminUser.id },
    { name: 'Miscellaneous', description: 'Other expenses', created_by: adminUser.id }
  ];

  // Check if expense categories already exist
  const existingCategories = await prisma.expenseCategory.count();
  if (existingCategories === 0) {
    await prisma.expenseCategory.createMany({
      data: expenseCategories
    });
  }

  console.log('✅ Expense categories created');

  // Create vendors
  const vendors = [
    {
      name: 'Office Depot',
      email: 'john@officedepot.com',
      phone: '555-1234',
      address: '123 Supply St',
      created_by: adminUser.id
    },
    {
      name: 'Adobe',
      email: 'support@adobe.com',
      phone: '555-2345',
      address: '456 Software Ave',
      created_by: adminUser.id
    },
    {
      name: 'Dell',
      email: 'sales@dell.com',
      phone: '555-3456',
      address: '789 Hardware Blvd',
      created_by: adminUser.id
    },
    {
      name: 'Verizon',
      email: 'service@verizon.com',
      phone: '555-4567',
      address: '101 Network Rd',
      created_by: adminUser.id
    }
  ];

  // Check if vendors already exist
  const existingVendors = await prisma.vendor.count();
  if (existingVendors === 0) {
    await prisma.vendor.createMany({
      data: vendors
    });
  }

  console.log('✅ Vendors created');

  // Create sample clients
  const clients = [
    {
      name: 'Acme Corporation',
      email: 'jane@acme.com',
      phone: '555-5678',
      address: '123 Client St',
      created_by: adminUser.id
    },
    {
      name: 'Startup Inc',
      email: 'bob@startup.com',
      phone: '555-6789',
      address: '456 Innovation Ave',
      created_by: adminUser.id
    },
    {
      name: 'Tech Solutions',
      email: 'alice@techsolutions.com',
      phone: '555-7890',
      address: '789 Tech Blvd',
      created_by: adminUser.id
    }
  ];

  // Check if clients already exist
  const existingClients = await prisma.client.count();
  if (existingClients === 0) {
    await prisma.client.createMany({
      data: clients
    });
  }

  console.log('✅ Clients created');

  // Create tax rates
  const taxRates = [
    { name: 'GST 18%', rate: 18.0, type: 'GST', created_by: adminUser.id },
    { name: 'GST 12%', rate: 12.0, type: 'GST', created_by: adminUser.id },
    { name: 'GST 5%', rate: 5.0, type: 'GST', created_by: adminUser.id },
    { name: 'TDS 10%', rate: 10.0, type: 'TDS', created_by: adminUser.id }
  ];

  // Check if tax rates already exist
  const existingTaxRates = await prisma.taxRate.count();
  if (existingTaxRates === 0) {
    await prisma.taxRate.createMany({
      data: taxRates
    });
  }

  console.log('✅ Tax rates created');

  // Create default report templates
  const reportTemplates = [
    {
      name: 'Monthly Financial Summary',
      description: 'Overview of monthly revenue, expenses, and net income',
      report_type: 'financial_summary',
      parameters: {},
      created_by: adminUser.id
    },
    {
      name: 'Quarterly Income Statement',
      description: 'Detailed profit and loss statement for quarterly reporting',
      report_type: 'income_statement',
      parameters: {},
      created_by: adminUser.id
    },
    {
      name: 'Year-End Balance Sheet',
      description: 'Assets, liabilities, and equity at year end',
      report_type: 'balance_sheet',
      parameters: {},
      created_by: adminUser.id
    },
    {
      name: 'Cash Flow Analysis',
      description: 'Monthly cash inflows and outflows analysis',
      report_type: 'cash_flow',
      parameters: {},
      created_by: adminUser.id
    },
    {
      name: 'Accounts Receivable Aging',
      description: 'Outstanding customer invoices with aging analysis',
      report_type: 'accounts_receivable',
      parameters: {},
      created_by: adminUser.id
    },
    {
      name: 'Expense Category Analysis',
      description: 'Detailed breakdown of expenses by category',
      report_type: 'expense_analysis',
      parameters: {},
      created_by: adminUser.id
    }
  ];

  // Check if report templates already exist
  const existingTemplates = await prisma.reportTemplate.count();
  if (existingTemplates === 0) {
    await prisma.reportTemplate.createMany({
      data: reportTemplates
    });
  }

  console.log('✅ Report templates created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });