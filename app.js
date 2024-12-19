const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// In-memory database
let crates = {}; // Format: { crateCode: { items: [itemCode1, itemCode2], scannedItems: [] } }
let currentCrate = null; // Temporary crate being created

// Home page - Add Crate
app.get('/add-crate', (req, res) => {
    res.render('addCrate', { crates });
});

// API to handle crate creation via scans
app.post('/api/add-crate', (req, res) => {
    const { scanCode } = req.body;

    if (!scanCode) {
        return res.json({ message: "Invalid scan code.", success: false });
    }

    // Start crate creation if no crate is currently active
    if (!currentCrate) {
        currentCrate = { crateCode: scanCode, items: [] };
        return res.json({ message: `Crate "${scanCode}" started. Scan items now.`, success: true });
    }

    // Finalize crate creation
    if (scanCode.toUpperCase() === "F") {
        if (currentCrate.items.length === 0) {
            currentCrate = null;
            return res.json({ message: "No items scanned. Crate creation canceled.", success: false });
        }

        crates[currentCrate.crateCode] = { items: currentCrate.items, scannedItems: [] };
        const crateCode = currentCrate.crateCode;
        currentCrate = null;
        return res.json({ message: `Crate "${crateCode}" created successfully!`, success: true });
    }

    // Add item to the current crate
    if (!currentCrate.items.includes(scanCode)) {
        currentCrate.items.push(scanCode);
        return res.json({ message: `Item "${scanCode}" added to crate "${currentCrate.crateCode}".`, success: true });
    }

    return res.json({ message: `Item "${scanCode}" is already added to crate "${currentCrate.crateCode}".`, success: false });
});



// Page to Scan Crates and Items
app.get('/scan-crate', (req, res) => {
    res.render('scanCrate', { crates });
});

// API to process scanned codes during scanning
app.post('/api/scan', (req, res) => {
    const { scanCode } = req.body;

    for (const crateCode in crates) {
        const crate = crates[crateCode];

        // If scanned code is an item
        if (crate.items.includes(scanCode) && !crate.scannedItems.includes(scanCode)) {
            crate.scannedItems.push(scanCode);
            return res.json({ message: "Item scanned successfully!", success: true });
        }

        // If scanned code is the crate itself
        if (scanCode === crateCode) {
            if (crate.scannedItems.length === crate.items.length) {
                delete crates[crateCode];
                return res.json({ message: "Crate removed successfully!", success: true });
            } else {
                return res.json({
                    message: "All items need to be scanned before removing the crate.",
                    success: false,
                });
            }
        }
    }

    res.json({ message: "Invalid scan or already scanned.", success: false });
});

app.post('/api/remove-crate', (req, res) => {
    const { scanCode } = req.body;

    if (!scanCode) {
        return res.json({ message: "Invalid scan code.", success: false });
    }

    // Check if crate removal is initiated
    if (!currentCrate) {
        if (crates[scanCode]) {
            currentCrate = {
                crateCode: scanCode,
                items: [...crates[scanCode].items], // Copy items to track scanned ones
                scannedItems: [],
            };
            return res.json({ message: `Crate "${scanCode}" removal started. Scan items now.`, success: true });
        } else {
            return res.json({ message: `Crate "${scanCode}" not found.`, success: false });
        }
    }

    // Handle scanning crate ID again to finalize removal
    if (currentCrate.crateCode === scanCode) {
        if (currentCrate.scannedItems.length === currentCrate.items.length) {
            delete crates[scanCode]; // Remove the crate from the system
            currentCrate = null;
            return res.json({ message: `Crate "${scanCode}" removed successfully!`, success: true });
        } else {
            return res.json({
                message: `Not all items scanned. Remaining: ${
                    currentCrate.items.length - currentCrate.scannedItems.length
                }`,
                success: false,
            });
        }
    }

    // Handle item scanning
    if (currentCrate.items.includes(scanCode) && !currentCrate.scannedItems.includes(scanCode)) {
        currentCrate.scannedItems.push(scanCode);
        return res.json({ message: `Item "${scanCode}" scanned successfully.`, success: true });
    }

    return res.json({ message: "Invalid scan or item already scanned.", success: false });
});




// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
