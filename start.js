#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Financial Management System...\n');

// Start server
console.log('📡 Starting server on port 5001...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start, then start client
setTimeout(() => {
  console.log('🌐 Starting client on port 3000...');
  const client = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  client.on('error', (err) => {
    console.error('❌ Client error:', err);
  });
}, 3000);

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit();
});

console.log('\n✅ Financial Management System is starting up!');
console.log('📊 Dashboard will be available at: http://localhost:3000');
console.log('🔌 API will be available at: http://localhost:5001');
console.log('\n💡 Default login credentials:');
console.log('   Email: admin@example.com');
console.log('   Password: admin123');
console.log('\nPress Ctrl+C to stop the application.\n');