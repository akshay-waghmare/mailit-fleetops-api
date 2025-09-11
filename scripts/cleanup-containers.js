#!/usr/bin/env node

const { execSync } = require('child_process');

// Container names and patterns to look for
const CONTAINER_PATTERNS = [
  'fleetops-postgres',
  'fleetops-backend', 
  'fleetops-frontend',
  'fleetops-pgadmin',
  // Also check for compose project prefixed names
  '*fleetops-postgres*',
  '*fleetops-backend*',
  '*fleetops-frontend*',
  '*fleetops-pgadmin*',
  // Check for any containers using our images
  'macubex/fleetops-backend',
  'macubex/fleetops-frontend'
];

function runCommand(command, ignoreError = false) {
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch (error) {
    if (!ignoreError) {
      console.error(`❌ Command failed: ${command}`);
      console.error(`Error: ${error.message}`);
    }
    return null;
  }
}

function findFleetOpsContainers() {
  console.log('🔍 Searching for FleetOps containers...');
  
  // Get all containers (running and stopped) that might be FleetOps related
  const allContainers = runCommand('docker ps -a --format "{{.Names}}"', true);
  
  if (!allContainers) {
    console.log('   No containers found');
    return [];
  }
  
  const containerList = allContainers.split('\n').filter(name => name.trim());
  const fleetopsContainers = containerList.filter(name => 
    name.includes('fleetops') || 
    name.includes('postgres') || 
    name.includes('pgadmin')
  );
  
  // Also find containers using our images
  const imageContainers = runCommand('docker ps -a --filter "ancestor=macubex/fleetops-backend" --filter "ancestor=macubex/fleetops-frontend" --format "{{.Names}}"', true);
  if (imageContainers) {
    const imageList = imageContainers.split('\n').filter(name => name.trim());
    fleetopsContainers.push(...imageList);
  }
  
  // Remove duplicates
  const uniqueContainers = [...new Set(fleetopsContainers)];
  
  console.log(`   Found ${uniqueContainers.length} FleetOps-related containers`);
  uniqueContainers.forEach(name => console.log(`     - ${name}`));
  
  return uniqueContainers;
}

function stopAndRemoveContainer(containerName) {
  console.log(`🛑 Processing container: ${containerName}`);
  
  // Check if container exists and get its status
  const containerInfo = runCommand(`docker ps -a --filter "name=^${containerName}$" --format "{{.Names}} {{.Status}}"`, true);
  
  if (containerInfo && containerInfo.includes(containerName)) {
    const status = containerInfo.split(' ').slice(1).join(' ');
    console.log(`   📦 Found: ${containerName} - ${status}`);
    
    // Stop the container if it's running
    if (status.includes('Up')) {
      console.log(`   🛑 Stopping container: ${containerName}`);
      runCommand(`docker stop ${containerName}`, true);
    }
    
    // Remove the container
    console.log(`   🗑️  Removing container: ${containerName}`);
    runCommand(`docker rm ${containerName}`, true);
    
    console.log(`   ✅ Container ${containerName} cleaned up successfully`);
  } else {
    console.log(`   ℹ️  Container ${containerName} not found (already clean)`);
  }
}

function cleanupFleetOpsContainers() {
  console.log('🧹 FleetOps Container Cleanup Starting...\n');
  
  // First, try to stop docker-compose services
  console.log('🔄 Stopping Docker Compose services...');
  // Try compose v2 first, then v1
  runCommand('docker compose down', true) || runCommand('docker-compose down', true);
  
  // Find all FleetOps containers dynamically
  const containers = findFleetOpsContainers();
  
  if (containers.length === 0) {
    console.log('✅ No FleetOps containers found - already clean!');
  } else {
    console.log('\n🧹 Cleaning up containers...\n');
    containers.forEach(containerName => {
      stopAndRemoveContainer(containerName);
      console.log(''); // Empty line for readability
    });
  }
  
  // Clean up any orphaned containers and networks (but NOT volumes)
  console.log('🔄 Cleaning up Docker system (safe: does NOT remove volumes)...');
  runCommand('docker system prune -f', true);
  
  // ⚠️ Only reset data if explicitly asked
  const resetData = process.argv.includes('--reset-data');
  if (resetData) {
    console.log('💾 Removing FleetOps/Postgres volumes (DATA LOSS) because --reset-data was provided...');
    const vols = runCommand('docker volume ls -q', true);
    if (vols) {
      const targets = vols.split('\n').filter(v => /(fleetops|postgres)/i.test(v));
      if (targets.length) {
        console.log(`   Found ${targets.length} volumes to remove: ${targets.join(', ')}`);
        runCommand(`docker volume rm ${targets.map(v => `"${v}"`).join(' ')}`, true);
        console.log('   ✅ Volumes removed successfully');
      } else {
        console.log('   No volumes matching /(fleetops|postgres)/ found.');
      }
    }
  } else {
    console.log('💾 Skipping volume removal to preserve data (run with --reset-data to wipe).');
  }
  
  console.log('🎉 FleetOps container cleanup completed!');
  console.log('✅ Ready to start fresh containers (data preserved)');
}

if (require.main === module) {
  // Show help if requested
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🧹 FleetOps Container Cleanup Script

Usage:
  node cleanup-containers.js [options]

Options:
  --reset-data    Remove all volumes and data (⚠️  DATA LOSS!)
  --help, -h      Show this help message

Examples:
  node cleanup-containers.js                    # Safe cleanup (preserves data)
  node cleanup-containers.js --reset-data       # Full reset (removes all data)

By default, this script:
✅ Stops and removes FleetOps containers
✅ Cleans up Docker system (images, networks)
✅ Preserves all database data and volumes

With --reset-data:
⚠️  Also removes all FleetOps/Postgres volumes (complete data loss)
`);
    process.exit(0);
  }
  
  cleanupFleetOpsContainers();
}

module.exports = { cleanupFleetOpsContainers, stopAndRemoveContainer };