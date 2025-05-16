const fs = require('fs');
const XLSX = require('xlsx');

// 1. Create dist directory
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

try {
  // 2. Read Excel file
  const workbook = XLSX.readFile('Halal Inf.xlsx');
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  // 3. Generate item pages
  data.forEach(item => {
    fs.writeFileSync(
      `dist/item_id${item['Item ID']}.html`,
      `<!DOCTYPE html>
      <html>
      <head>
        <title>iHIC - ${item['Item Name']}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .header { color: #0066cc; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
        <h1>${item['Item Name']}</h1>
        <p>Item ID: ${item['Item ID']}</p>
        <p>Category: ${item['Category']}</p>
        <a href="index_main.html">← Back to Inventory</a>
      </body>
      </html>`
    );
  });

  // 4. Generate index_main.html (inventory list)
  const itemList = data.map(item => `
    <div style="border:1px solid #ddd; padding:10px; margin:10px;">
      <h3>${item['Item Name']}</h3>
      <p>ID: ${item['Item ID']} | Stock: ${item['Stock Available']}</p>
      <a href="item_id${item['Item ID']}.html">View Details</a>
    </div>
  `).join('');

  fs.writeFileSync(
    'dist/index_main.html',
    `<!DOCTYPE html>
    <html>
    <head>
      <title>iHIC - Inventory List</title>
      <style>
        body { font-family: Arial; max-width: 800px; margin:0 auto; padding:20px; }
        .header { color: #0066cc; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
      <h2>Inventory List</h2>
      ${itemList}
      <div style="margin-top:20px;">
        <a href="index.html">← Logout</a>
      </div>
    </body>
    </html>`
  );

  // 5. Generate index.html (login page)
  fs.writeFileSync(
    'dist/index.html',
    `<!DOCTYPE html>
    <html>
    <head>
      <title>iHIC - Login</title>
      <style>
        body { font-family: Arial; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
        .login-box { border:1px solid #ddd; padding:30px; text-align:center; }
        .header { color: #0066cc; margin-bottom:20px; }
        input { padding:10px; margin:10px 0; width:100%; }
        button { background:#3498db; color:white; border:none; padding:10px 20px; cursor:pointer; }
      </style>
    </head>
    <body>
      <div class="login-box">
        <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
        <input type="password" id="passkey" placeholder="Enter passkey">
        <button onclick="login()">Login</button>
        <p id="error" style="color:red; display:none;">Invalid passkey</p>
      </div>
      <script>
        function login() {
          const passkey = document.getElementById('passkey').value;
          if (passkey === '0') {
            window.location.href = 'index_main.html';
          } else if (passkey >= 1 && passkey <= ${data.length}) {
            window.location.href = 'item_id' + passkey + '.html';
          } else {
            document.getElementById('error').style.display = 'block';
          }
        }
      </script>
    </body>
    </html>`
  );

  console.log(`Generated: ${data.length} item pages + index_main.html + index.html`);
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
}