#!/usr/bin/env node

const { execSync } = require('child_process');

function runCommand(command, returnOutput = false) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: returnOutput ? 'pipe' : 'inherit' 
    });
    return returnOutput ? result.trim() : true;
  } catch (error) {
    if (returnOutput) {
      return null;
    }
    console.error(`❌ Command failed: ${command}`);
    return false;
  }
}

function showDockerStatus() {
  console.log('🐳 FleetOps Docker Status\n');
  
  // Check if Docker is running
  const dockerVersion = runCommand('docker --version', true);
  if (!dockerVersion) {
    console.log('❌ Docker is not running or not installed');
    return;
  }
  
  console.log(`✅ Docker: ${dockerVersion}\n`);
  
  // Show FleetOps containers
  console.log('📦 FleetOps Containers:');
  const containers = runCommand('docker ps -a --filter "name=fleetops" --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', true);
  
  if (containers && containers.includes('fleetops')) {
    console.log(containers);
  } else {
    console.log('   No FleetOps containers found');
  }
  
  console.log('\n🏷️  FleetOps Images:');
  const images = runCommand('docker images --filter "reference=macubex/fleetops*" --format "table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}"', true);
  
  if (images && images.includes('macubex/fleetops')) {
    console.log(images);
  } else {
    console.log('   No FleetOps images found');
  }
  
  // Show Docker Compose status if docker-compose.yml exists
  const fs = require('fs');
  if (fs.existsSync('docker-compose.yml')) {
    console.log('\n🔧 Docker Compose Status:');
    runCommand('docker-compose ps');
  }
  
  console.log('\n💾 Docker System Info:');
  const systemDf = runCommand('docker system df', true);
  if (systemDf) {
    console.log(systemDf);
  }
}

if (require.main === module) {
  showDockerStatus();
}

module.exports = { showDockerStatus };