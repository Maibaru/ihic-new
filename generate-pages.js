const fs = require('fs');
const XLSX = require('xlsx');

// 1. Create dist directory
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

// 2. Process Excel
try {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile('Halal Inf.xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // 3. Generate HTML files
  data.forEach(item => {
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <title>iHIC - ${item['Item Name']}</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { color: #0066cc; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
      <h1>${item['Item Name']}</h1>
      <p>Item ID: ${item['Item ID']}</p>
      <p>Category: ${item['Category']}</p>
    </body>
    </html>`;

    fs.writeFileSync(`dist/item_id${item['Item ID']}.html`, html);
  });

  // 4. Generate index.html
  const indexHtml = `<!DOCTYPE html>
  <html>
  <body>
    <div class="header">iHIC Login</div>
    <p>All items processed successfully!</p>
  </body>
  </html>`;
  
  fs.writeFileSync('dist/index.html', indexHtml);
  
  console.log('Success! Generated', data.length, 'item pages');
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1); // Fail the build explicitly
}