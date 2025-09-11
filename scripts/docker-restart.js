#!/usr/bin/env node

const { execSync } = require('child_process');
const { cleanupFleetOpsContainers } = require('./cleanup-containers');

function runCommand(command) {
  try {
    console.log(`⚡ Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

function dockerDevRestart() {
  console.log('🚀 FleetOps Development Restart\n');
  
  // Step 1: Clean up existing containers
  console.log('📋 Step 1: Cleaning up existing containers...');
  cleanupFleetOpsContainers();
  
  console.log('\n📋 Step 2: Starting fresh Docker Compose...');
  
  // Step 2: Start Docker Compose with build
  const success = runCommand('docker-compose up --build -d');
  
  if (success) {
    console.log('\n🎉 FleetOps started successfully!');
    console.log('\n📊 Container Status:');
    runCommand('docker-compose ps');
    
    console.log('\n🌐 Service URLs:');
    console.log('   Frontend:  http://localhost:5001');
    console.log('   Backend:   http://localhost:8081');
    console.log('   Health:    http://localhost:8081/actuator/health');
    console.log('   Database:  localhost:5432');
    console.log('   PgAdmin:   http://localhost:5050 (run: npm run docker:admin)');
    
    console.log('\n📋 Useful Commands:');
    console.log('   npm run docker:logs     - View all logs');
    console.log('   npm run docker:status   - Check container status');
    console.log('   npm run docker:down     - Stop all services');
  } else {
    console.log('\n❌ Failed to start FleetOps. Check the error messages above.');
    process.exit(1);
  }
}

if (require.main === module) {
  dockerDevRestart();
}

module.exports = { dockerDevRestart };