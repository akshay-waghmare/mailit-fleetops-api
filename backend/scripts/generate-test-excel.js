#!/usr/bin/env node
/**
 * Generate test Excel file for bulk order upload testing
 * Usage: node scripts/generate-test-excel.js [output-filename]
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateTestExcel(filename = 'test-orders.xlsx') {
  console.log('🚀 Generating test Excel file...\n');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Orders');

  // Define headers (27 columns)
  const headers = [
    'clientReference', 'clientName', 'clientCompany', 'contactNumber',
    'senderName', 'senderAddress', 'senderContact', 'senderEmail',
    'receiverName', 'receiverAddress', 'receiverContact', 'receiverEmail',
    'receiverPincode', 'receiverCity', 'receiverState',
    'itemCount', 'totalWeight', 'lengthCm', 'widthCm', 'heightCm',
    'itemDescription', 'declaredValue', 'serviceType', 'carrierName',
    'carrierId', 'codAmount', 'specialInstructions'
  ];

  // Add header row with styling
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Sample test data (3 rows)
  const testData = [
    // Row 1: With client reference (for idempotency test)
    [
      'REF-001', 'ABC Corp', 'ABC Industries', '+91-9876543210',
      'John Doe', '123 Main Street, Mumbai, Maharashtra', '+91-9876543210', 'john@example.com',
      'Jane Smith', '456 Park Avenue, Delhi', '+91-9123456789', 'jane@example.com',
      '110001', 'Delhi', 'Delhi',
      1, 2.5, 30, 20, 15,
      'Samsung Galaxy Smartphone', 25000, 'express', 'Blue Dart',
      'BD001', 0, 'Handle with care'
    ],
    // Row 2: Different client reference
    [
      'REF-002', 'XYZ Ltd', 'XYZ Enterprises', '+91-9998887777',
      'Alice Brown', '789 Market Street, Bangalore, Karnataka', '+91-9998887777', 'alice@example.com',
      'Bob Green', '321 Hill Road, Bangalore', '+91-9887766655', 'bob@example.com',
      '560001', 'Bangalore', 'Karnataka',
      2, 5.0, 40, 30, 25,
      'Electronics Package', 50000, 'standard', 'DTDC',
      'DTDC001', 0, 'Fragile items'
    ],
    // Row 3: No client reference (will use hash-based idempotency)
    [
      '', 'LMN Pvt Ltd', 'LMN Group', '+91-9556677888',
      'Charlie Wilson', '555 Garden Road, Chennai, Tamil Nadu', '+91-9556677888', 'charlie@example.com',
      'Diana Prince', '777 Lake View, Hyderabad', '+91-9445566777', 'diana@example.com',
      '500001', 'Hyderabad', 'Telangana',
      1, 1.5, 25, 15, 10,
      'Books and Documents', 5000, 'economy', 'India Post',
      'IP001', 0, 'Keep dry'
    ]
  ];

  // Add data rows
  testData.forEach((rowData) => {
    worksheet.addRow(rowData);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = headers[index].length;
    worksheet.getColumn(index + 1).eachCell({ includeEmpty: false }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Save file
  const outputDir = path.join(__dirname, '..', 'test-data');
  const outputPath = path.join(outputDir, filename);
  
  // Ensure test-data directory exists
  const fs = require('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  await workbook.xlsx.writeFile(outputPath);

  console.log('✅ Test Excel file created successfully!');
  console.log(`📁 File: ${outputPath}`);
  console.log(`📊 Rows: ${testData.length} test orders\n`);

  console.log('📝 Test Scenarios:');
  console.log('  Row 1: REF-001 → CLIENT_REFERENCE idempotency');
  console.log('  Row 2: REF-002 → CLIENT_REFERENCE idempotency');
  console.log('  Row 3: (no ref) → HASH-based idempotency\n');

  console.log('🧪 Testing Instructions:');
  console.log('  1. First upload: All 3 orders should be CREATED');
  console.log('  2. Second upload: All 3 should be SKIPPED_DUPLICATE\n');

  console.log('🚀 Ready to upload!');
  console.log(`   curl -X POST http://localhost:8080/api/v1/bulk/orders \\`);
  console.log(`     -F "file=@${filename}" | jq\n`);
}

// Main execution
if (require.main === module) {
  const filename = process.argv[2] || 'test-orders.xlsx';
  
  generateTestExcel(filename)
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error generating Excel file:', error.message);
      console.error('\n💡 Make sure to install dependencies first:');
      console.error('   npm install\n');
      process.exit(1);
    });
}

module.exports = { generateTestExcel };
