# Troubleshooting Guide

## Common Issues and Solutions

### 1. Compilation Errors

#### "Module not found" errors
```bash
# Install missing dependencies
cd client && npm install
cd ../server && npm install
```

#### "showPassword is not defined" error
This has been fixed. If you still see it, make sure you have the latest version of the Login.js file.

#### ESLint warnings about unused variables
These are warnings and won't prevent the app from running. They have been cleaned up in the latest version.

### 2. Database Issues

#### "DATABASE_URL is not defined"
Make sure you have a `.env` file in the server directory with:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/financial_db"
DIRECT_URL="postgresql://username:password@localhost:5432/financial_db"
JWT_SECRET="your-jwt-secret-key"
PORT=5001
NODE_ENV="development"
```

#### Migration errors
```bash
# Reset and recreate database
npm run db:reset
npm run db:migrate
npm run db:seed
```

### 3. Server Issues

#### Port 5001 already in use
```bash
# Find and kill the process using port 5001
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

#### CORS errors
The server is configured with CORS enabled. If you still see CORS errors, check that the client proxy is set to `http://localhost:5001` in `client/package.json`.

### 4. Client Issues

#### "Cannot resolve module" errors
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

#### Blank page or loading forever
1. Check browser console for errors
2. Verify server is running on port 5001
3. Check network tab for failed API calls

### 5. Authentication Issues

#### Cannot login with admin credentials
Default credentials:
- Email: `admin@example.com`
- Password: `admin123`

If this doesn't work, check that the database was seeded properly:
```bash
npm run db:seed
```

### 6. Development Setup

#### Starting the application
```bash
# Option 1: Start both client and server together
npm run dev

# Option 2: Start with the custom script
npm start

# Option 3: Start individually
npm run server  # Terminal 1
npm run client  # Terminal 2
```

### 7. Build Issues

#### Client build fails
```bash
cd client
npm run build
```

Check for any TypeScript or ESLint errors and fix them.

### 8. Performance Issues

#### Slow loading
1. Check if you're running in development mode
2. Verify database connection is stable
3. Check browser network tab for slow requests

### 9. Getting Help

If you're still having issues:

1. **Check the console**: Look for error messages in both browser console and terminal
2. **Verify versions**: Make sure you're using Node.js 16+ and npm 8+
3. **Clean install**: Delete `node_modules` and reinstall dependencies
4. **Check ports**: Ensure ports 3000 and 5001 are available
5. **Database connection**: Verify your PostgreSQL database is running and accessible

### 10. Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5001

# View server logs
cd server && npm run dev

# View client logs
cd client && npm start

# Reset everything
npm run db:reset && npm run setup
```

## Environment Verification

Before starting, verify your environment:

```bash
# Check Node.js (should be 16+)
node --version

# Check npm (should be 8+)
npm --version

# Check if PostgreSQL is running
pg_isready

# Verify database connection
psql -h localhost -p 5432 -U your_username -d financial_db
```

## Quick Fix Checklist

- [ ] Node.js 16+ installed
- [ ] PostgreSQL running
- [ ] Environment variables set in server/.env
- [ ] Dependencies installed (npm run install-deps)
- [ ] Database migrated (npm run db:migrate)
- [ ] Database seeded (npm run db:seed)
- [ ] Ports 3000 and 5001 available
- [ ] No compilation errors in terminal