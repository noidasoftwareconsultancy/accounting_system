# Financial Management System

A comprehensive financial management system built with React.js frontend and Node.js backend, featuring invoice management, expense tracking, payroll, accounting, and banking modules.

## 🚀 Features

### 📊 Dashboard & Analytics
- Real-time financial overview
- Revenue vs expenses charts
- Key performance indicators
- Recent activities tracking

### 💰 Revenue & Billing Management
- **Invoices**: Create, edit, and track invoices
- **Payments**: Record and manage payments
- **Clients**: Comprehensive client management
- **Projects**: Project-based billing and tracking

### 💳 Expense Management
- **Expenses**: Track and categorize expenses
- **Categories**: Organize expenses by categories
- **Vendors**: Manage vendor relationships
- **Approval Workflow**: Multi-level expense approval

### 👥 HR & Payroll
- **Employees**: Employee information management
- **Payroll**: Automated payroll processing
- **Attendance**: Time tracking and attendance
- **Salary Structures**: Flexible compensation management

### 📚 Accounting
- **Chart of Accounts**: Complete accounting structure
- **Journal Entries**: Double-entry bookkeeping
- **Trial Balance**: Financial position reporting
- **General Ledger**: Transaction history

### 🏦 Banking & Payments
- **Bank Accounts**: Multi-account management
- **Transactions**: Transaction recording and tracking
- **Reconciliation**: Bank statement reconciliation
- **Payment Gateways**: Integration support

### 📈 Reports & Analytics
- **Financial Reports**: P&L, Balance Sheet, Cash Flow
- **Tax Reports**: Tax compliance reporting
- **Custom Reports**: Flexible report generation

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Formik & Yup** - Form handling and validation
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd financial-management-system
```

### 2. Install dependencies
```bash
npm run install-deps
```

### 3. Environment Setup

#### Server Environment (.env in server directory)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/financial_db"
DIRECT_URL="postgresql://username:password@localhost:5432/financial_db"
JWT_SECRET="your-jwt-secret-key"
PORT=5001
NODE_ENV="development"
```

#### Client Environment (.env in client directory - optional)
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start the application
```bash
# Start both client and server
npm run dev

# Or start individually
npm run server  # Backend on http://localhost:5001
npm run client  # Frontend on http://localhost:3000
```

## 📁 Project Structure

```
financial-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── prisma/            # Database schema & migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
├── database/              # SQL schema files
└── package.json          # Root package.json
```

## 🔐 Authentication & Authorization

The system includes role-based access control with the following roles:
- **Admin**: Full system access
- **Manager**: Management-level access
- **Accountant**: Accounting and financial access
- **HR**: Human resources access
- **User**: Basic user access

## 📊 Database Schema

The system uses a comprehensive database schema with the following main entities:
- Users & Authentication
- Clients & Projects
- Invoices & Payments
- Expenses & Categories
- Employees & Payroll
- Accounts & Journal Entries
- Bank Accounts & Transactions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/categories` - List categories
- `GET /api/expenses/vendors` - List vendors

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details

[Additional endpoints for all modules...]

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy the build folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0** - Initial release with core modules
  - Dashboard and analytics
  - Invoice and payment management
  - Expense tracking
  - Client and project management
  - Basic accounting features
  - User authentication and authorization

## 🎯 Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Third-party integrations (QuickBooks, Xero)
- [ ] Multi-currency support
- [ ] Advanced workflow automation
- [ ] Document management
- [ ] API rate limiting and caching
- [ ] Advanced security features

---

Built with ❤️ for modern financial management needs.