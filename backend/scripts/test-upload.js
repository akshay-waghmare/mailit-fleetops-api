#!/usr/bin/env node
/**
 * Test bulk order upload endpoint
 * Usage: node scripts/test-upload.js [excel-file]
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:8080';
const ENDPOINT = '/api/v1/bulk/orders';

async function testUpload(filename = 'test-orders.xlsx') {
  // Support both absolute and relative paths
  let filePath;
  if (path.isAbsolute(filename)) {
    filePath = filename;
  } else if (filename.includes('/') || filename.includes('\\')) {
    filePath = path.resolve(process.cwd(), filename);
  } else {
    // Default to test-data directory for simple filenames
    filePath = path.resolve(__dirname, '..', 'test-data', filename);
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.error('💡 Generate test file first:');
    console.error('   npm run generate-test-excel\n');
    process.exit(1);
  }

  console.log('🚀 Testing bulk order upload...\n');
  console.log(`📁 File: ${filePath}`);
  console.log(`📊 Size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
  console.log(`🌐 URL: ${API_URL}${ENDPOINT}\n`);

  try {
    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    // Make request
    console.log('⏳ Uploading...');
    const startTime = Date.now();
    
    const response = await axios.post(`${API_URL}${ENDPOINT}`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Upload successful! (${duration}ms)\n`);

    // Display response
    const data = response.data;
    
    console.log('📦 Response Summary:');
    console.log(`   Batch ID: ${data.batchId}`);
    console.log(`   Total Rows: ${data.totalRows}`);
    console.log(`   Created: ${data.created}`);
    console.log(`   Failed: ${data.failed}`);
    console.log(`   Skipped (Duplicate): ${data.skippedDuplicate}`);
    console.log(`   Processing Time: ${data.processingDurationMs}ms\n`);

    console.log('📋 Row Details:');
    data.rows.forEach((row) => {
      const icon = row.status === 'CREATED' ? '✅' : 
                   row.status === 'SKIPPED_DUPLICATE' ? '🔁' : '❌';
      console.log(`   ${icon} Row ${row.rowIndex}: ${row.status} (${row.idempotencyBasis}) - OrderID: ${row.orderId}`);
    });

    console.log('\n📊 Full Response:');
    console.log(JSON.stringify(data, null, 2));

    // Success indicators
    console.log('\n✨ Test Results:');
    if (data.created > 0) {
      console.log(`   ✅ Created ${data.created} orders`);
    }
    if (data.skippedDuplicate > 0) {
      console.log(`   🔁 Skipped ${data.skippedDuplicate} duplicates`);
    }
    if (data.failed > 0) {
      console.log(`   ❌ Failed ${data.failed} rows`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Upload failed!');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status} ${error.response.statusText}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('   No response from server');
      console.error('   Make sure backend is running: ./gradlew bootRun');
    } else {
      console.error(`   Error: ${error.message}`);
    }

    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const filename = process.argv[2] || 'test-orders.xlsx';
  testUpload(filename);
}

module.exports = { testUpload };
