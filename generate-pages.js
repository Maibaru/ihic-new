const fs = require('fs');
const XLSX = require('xlsx');

// Create dist directory if not exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Function to calculate days remaining
function calculateDaysRemaining(expiryDate) {
  if (!expiryDate || expiryDate === 'NA') return null;
  
  const jsDate = new Date(expiryDate);
  if (isNaN(jsDate.getTime())) return null;
  
  const timeDiff = jsDate - new Date();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Generate item pages
function generateItemPage(item) {
  const daysRemaining = calculateDaysRemaining(item['Certificate Expiry Date']);
  const expiryStatus = daysRemaining <= 0 ? 'expired' : 'valid';
  const expiryText = daysRemaining <= 0 ? 'Expired' : `Valid for ${daysRemaining} days`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iHIC - ${item['Item Name']} Details</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 15px; background-color: #f5f5f5; font-family: Arial, sans-serif; }
        .container { max-width: 100%; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { font-family: "Century Gothic", CenturyGothic, AppleGothic, sans-serif; color: #0066cc; text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 25px; }
        .item-name { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 30px; color: #333; }
        .detail-row { display: flex; flex-wrap: wrap; margin-bottom: 10px; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; width: 40%; color: #7f8c8d; }
        .detail-value { width: 60%; word-break: break-word; }
        .cert-available { color: #27ae60; font-weight: bold; }
        .cert-not-available { color: #e74c3c; font-weight: bold; }
        .expired { color: #e74c3c; font-weight: bold; }
        .valid { color: #27ae60; font-weight: bold; }
        .btn { display: inline-block; padding: 10px 15px; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; text-align: center; font-size: 14px; border: none; cursor: pointer; width: 100%; }
        .btn:hover { opacity: 0.9; }
        .btn-purple { background-color: #9b59b6; }
        .btn-green { background-color: #2ecc71; }
        .btn-green:hover, .btn-green:active { background-color: #27ae60; }
        .btn-blue { background-color: #3498db; }
        .stock-request-box { background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin-top: 20px; }
        .quantity-input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
        .quantity-label { display: block; margin: 10px 0 5px; font-weight: bold; color: #333; }
        .back-btn { display: block; text-align: center; margin-top: 20px; color: #3498db; text-decoration: none; font-weight: bold; }
        @media (min-width: 600px) { .container { max-width: 500px; } .header { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
        <div class="item-name">${item['Item Name']}</div>
        
        <div class="detail-row">
            <div class="detail-label">Item ID:</div>
            <div class="detail-value">${item['Item ID']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Item Name:</div>
            <div class="detail-value">${item['Item Name']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Category:</div>
            <div class="detail-value">${item['Category']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Brand:</div>
            <div class="detail-value">${item['Brand']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Supplier:</div>
            <div class="detail-value">${item['Supplier']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Purchased Date:</div>
            <div class="detail-value">${item['Purchased Date']}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Invoice:</div>
            <div class="detail-value">
                <a href="${item['Invoice']}" class="btn btn-blue">View Invoice</a>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Halal Certificate:</div>
            <div class="detail-value">
                ${item['Halal Certificate'] === 'Available' ? 
                  `<a href="${item['Halal Certificate Link']}" class="btn btn-blue">View Certificate</a>` : 
                  '<span class="cert-not-available">Not Available</span>'}
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Certificate Expiry Date:</div>
            <div class="detail-value">
                <span class="${expiryStatus}">${item['Certificate Expiry Date']} (${expiryText})</span>
            </div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Stock Available:</div>
            <div class="detail-value">${item['Stock Available']}</div>
        </div>
        
        <div class="stock-request-box">
            <button class="btn btn-purple">Stock Request</button>
            <label class="quantity-label">Quantity:</label>
            <input type="text" class="quantity-input" placeholder="Enter quantity">
            <button class="btn btn-green" onclick="sendRequest('${item['Item Name']}')">Send Request</button>
        </div>
        
        <a href="index_main.html" class="back-btn">← Back to Inventory</a>
    </div>

    <script>
        function sendRequest(itemName) {
            const quantityInput = document.querySelector('.quantity-input');
            const quantity = quantityInput.value;
            
            if (!quantity) {
                alert('Please enter a quantity');
                return;
            }
            
            const subject = \`Stock Request - \${itemName}\`;
            const body = \`Hi. I want to request for \${itemName} with a quantity of \${quantity}. Thank you.\`;
            
            window.location.href = \`mailto:mygml021@gmail.com?subject=\${encodeURIComponent(subject)}&body=\${encodeURIComponent(body)}\`;
            quantityInput.value = '';
        }
    </script>
</body>
</html>`;
}

// Generate index_main.html
function generateIndexMain(items) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iHIC - Inventory List</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 15px; background-color: #f5f5f5; font-family: Arial, sans-serif; }
        .header { font-family: "Century Gothic", CenturyGothic, AppleGothic, sans-serif; color: #0066cc; text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 25px; }
        .item-list { max-width: 100%; margin: 0 auto; }
        .item-card { background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .item-name { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
        .item-details { display: flex; flex-wrap: wrap; margin-bottom: 5px; }
        .item-label { font-weight: bold; width: 120px; color: #7f8c8d; }
        .item-value { flex: 1; }
        .view-btn { display: block; text-align: center; padding: 8px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .cert-available { color: #27ae60; font-weight: bold; }
        .cert-not-available { color: #e74c3c; font-weight: bold; }
        .logout-btn { display: block; text-align: center; margin-top: 20px; color: #3498db; text-decoration: none; font-weight: bold; }
        @media (min-width: 600px) { 
            .item-list { max-width: 500px; } 
            .header { font-size: 24px; } 
        }
    </style>
</head>
<body>
    <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
    <div class="item-list">
        ${items.map(item => {
          const daysRemaining = calculateDaysRemaining(item['Certificate Expiry Date']);
          return `
        <div class="item-card">
            <div class="item-name">${item['Item Name']}</div>
            <div class="item-details">
                <div class="item-label">Item ID:</div>
                <div class="item-value">${item['Item ID']}</div>
            </div>
            <div class="item-details">
                <div class="item-label">Category:</div>
                <div class="item-value">${item['Category']}</div>
            </div>
            <div class="item-details">
                <div class="item-label">Stock:</div>
                <div class="item-value">${item['Stock Available']}</div>
            </div>
            <div class="item-details">
                <div class="item-label">Halal Status:</div>
                <div class="item-value ${item['Halal Certificate'] === 'Available' ? 'cert-available' : 'cert-not-available'}">
                    ${item['Halal Certificate']}${daysRemaining !== null && daysRemaining <= 0 ? ' (Expired)' : ''}
                </div>
            </div>
            <a href="item_id${item['Item ID']}.html" class="view-btn">View Details</a>
        </div>`;
        }).join('')}
    </div>
    <a href="index.html" class="logout-btn">← Logout</a>
</body>
</html>`;
}

// Generate index.html
function generateIndexPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>iHIC - Login</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 15px; background-color: #f5f5f5; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .login-container { max-width: 400px; width: 100%; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .header { font-family: "Century Gothic", CenturyGothic, AppleGothic, sans-serif; color: #0066cc; font-size: 24px; font-weight: bold; margin-bottom: 30px; }
        .passkey-input { width: 100%; padding: 12px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; text-align: center; }
        .login-btn { width: 100%; padding: 12px; background-color: #3498db; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        .login-btn:hover { background-color: #2980b9; }
        .error-message { color: #e74c3c; margin-top: 10px; display: none; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="header">INSTANT HALAL & INVENTORY CHECKER (iHIC)</div>
        <input type="password" class="passkey-input" id="passkey">
        <button class="login-btn" onclick="checkPasskey()">Login</button>
        <div class="error-message" id="errorMessage">Invalid passkey. Please try again.</div>
    </div>

    <script>
        function checkPasskey() {
            const passkey = document.getElementById('passkey').value;
            const errorMessage = document.getElementById('errorMessage');
            
            errorMessage.style.display = 'none';
            
            if (!/^\\d+$/.test(passkey)) {
                errorMessage.style.display = 'block';
                document.getElementById('passkey').value = '';
                return;
            }
            
            if (passkey === '0') {
                window.location.href = 'index_main.html';
                return;
            }
            
            window.location.href = \`item_id\${passkey}.html\`;
        }
        
        document.getElementById('passkey').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkPasskey();
            }
        });
    </script>
</body>
</html>`;
}

// Main function to process Excel and generate files
function generatePages() {
  try {
    const workbook = XLSX.readFile('Halal Inf.xlsx');
    const sheetName = workbook.SheetNames[0];
    const items = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Generate individual item pages
    items.forEach(item => {
      const filename = `dist/item_id${item['Item ID']}.html`;
      fs.writeFileSync(filename, generateItemPage(item));
      console.log(`Generated: ${filename}`);
    });

    // Generate index_main.html
    fs.writeFileSync('dist/index_main.html', generateIndexMain(items));
    console.log('Generated: dist/index_main.html');

    // Generate index.html
    fs.writeFileSync('dist/index.html', generateIndexPage());
    console.log('Generated: dist/index.html');

    console.log('All files generated successfully in dist/ directory');
  } catch (error) {
    console.error('Error processing Excel file:', error);
    process.exit(1);
  }
}

// Run the generation
generatePages();