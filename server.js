const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'engistore.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STORE = {
  version: '2.5',
  company: {
    name: 'BML Parenteral Drugs',
    subtitle: 'Engineering Purchase & Inventory',
    address: 'Lakeshwari, Raipur, Bhagwanpur Roorkee-(UKh)-247661',
    phone: '+91 98765 43210',
    email: 'purchase@bml.example.com',
    gstin: '05AAAAA0000A1Z5'
  },
  users: [
    {
      username: 'admin',
      name: 'System Administrator',
      role: 'admin',
      password: 'admin',
      createdAt: '2026-01-01'
    },
    {
      username: 'purchase',
      name: 'Purchase Officer',
      role: 'manager',
      password: 'purchase123',
      createdAt: '2026-01-01'
    },
    {
      username: 'store',
      name: 'Store Keeper',
      role: 'store',
      password: 'store123',
      createdAt: '2026-01-01'
    },
    {
      username: 'engineer',
      name: 'Plant Engineer',
      role: 'engineer',
      password: 'engineer123',
      createdAt: '2026-01-01'
    }
  ],
  prs: [
    {
      id: 1,
      indent: 'IND-2026-001',
      date: '2026-09-01',
      dept: 'Engineering',
      spec: 'Centrifugal Pump Impeller SS 316 150mm',
      qty: 2,
      unit: 'Nos.',
      delivery: 'Most Urgent',
      required: '2026-09-10',
      remarks: 'Required for main boiler water feed line',
      requestedBy: 'Plant Engineer',
      status: 'Approved'
    },
    {
      id: 2,
      indent: 'IND-2026-001',
      date: '2026-09-01',
      dept: 'Maintenance',
      spec: 'Mechanical Shaft Seal 35mm Carbon/Silicon',
      qty: 4,
      unit: 'Nos.',
      delivery: 'Standard',
      required: '2026-09-15',
      remarks: 'Stock replenishment for annual maintenance',
      requestedBy: 'Plant Engineer',
      status: 'Approved'
    }
  ],
  pos: [
    {
      id: 1,
      poNo: 'PO-2026-001',
      indent: 'IND-2026-001',
      srNo: 1,
      date: '2026-09-02',
      supplier: 'Apex Industrial Spares Ltd',
      category: 'Mechanical',
      material: 'Centrifugal Pump Impeller SS 316 150mm',
      qty: 2,
      receivedQty: 0,
      unit: 'Nos.',
      rate: 8500,
      discount: 5,
      gst: 18,
      total: 19139,
      status: 'Approved',
      createdBy: 'Purchase Officer'
    }
  ],
  stock: [
    {
      code: 'ENG-MEC-001',
      name: 'Centrifugal Pump Impeller SS 316',
      unit: 'Nos.',
      qty: 1,
      min: 2
    },
    {
      code: 'ENG-ELC-002',
      name: 'Induction Motor 5HP 3-Phase 1440RPM',
      unit: 'Nos.',
      qty: 3,
      min: 1
    },
    {
      code: 'ENG-PNE-003',
      name: 'Pneumatic Solenoid Valve 24V DC',
      unit: 'Nos.',
      qty: 8,
      min: 4
    },
    {
      code: 'ENG-OIL-004',
      name: 'Hydraulic Oil ISO VG 68',
      unit: 'Ltr',
      qty: 180,
      min: 50
    }
  ],
  sup: [
    {
      name: 'Apex Industrial Spares Ltd',
      category: 'Mechanical',
      address: 'Plot 42, Sector 8, Industrial Estate, Haridwar, Uttarakhand - 249403',
      gst: '05AAACA1234F1Z8',
      contact: 'Rajesh Sharma',
      phone: '+91 98234 11223',
      email: 'sales@apexindustrial.com'
    },
    {
      name: 'Sterling Electro Controls',
      category: 'Electrical',
      address: 'B-14 Industrial Area, Mohan Nagar, Ghaziabad, UP - 201007',
      gst: '09AABCS5432G1Z2',
      contact: 'Anil Gupta',
      phone: '+91 94123 77889',
      email: 'support@sterlingelectro.com'
    },
    {
      name: 'National Pneumatics & Valves',
      category: 'Instrumentation',
      address: 'Shop 12-14, Phase-2, Transport Nagar, Dehradun, UK - 248001',
      gst: '05AABCN9876H1Z5',
      contact: 'Vikram Singh',
      phone: '+91 98970 44556',
      email: 'orders@nationalvalves.in'
    }
  ],
  issued: [
    {
      date: '2026-09-03',
      material: 'Hydraulic Oil ISO VG 68',
      qty: 20,
      unit: 'Ltr',
      to: 'Boiler House - Line 2',
      remarks: 'Scheduled monthly oil top-up',
      user: 'Store Keeper'
    }
  ]
};

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
      return JSON.parse(JSON.stringify(DEFAULT_STORE));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.company) parsed.company = DEFAULT_STORE.company;
    if (!Array.isArray(parsed.users)) parsed.users = DEFAULT_STORE.users;
    if (!Array.isArray(parsed.prs)) parsed.prs = [];
    if (!Array.isArray(parsed.pos)) parsed.pos = [];
    if (!Array.isArray(parsed.stock)) parsed.stock = [];
    if (!Array.isArray(parsed.sup)) parsed.sup = [];
    if (!Array.isArray(parsed.issued)) parsed.issued = [];
    if (!parsed.systemUpdate) {
      parsed.systemUpdate = {
        version: parsed.version || '2.5.0',
        releaseTimestamp: Date.now(),
        notes: 'System initialized with latest updates.',
        publishedBy: 'System Administrator'
      };
    }
    return parsed;
  } catch (err) {
    console.error('Error reading data store:', err);
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing data store:', err);
    return false;
  }
}

// 1. Get complete app data (safe users list for UI)
app.get('/api/data', (req, res) => {
  const store = readStore();
  const safeUsers = store.users.map(u => ({
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt
  }));
  res.json({
    success: true,
    company: store.company,
    users: safeUsers,
    prs: store.prs,
    pos: store.pos,
    stock: store.stock,
    sup: store.sup,
    issued: store.issued,
    version: store.version || '2.5.0',
    systemUpdate: store.systemUpdate || {
      version: store.version || '2.5.0',
      releaseTimestamp: Date.now(),
      notes: 'Standard release'
    }
  });
});

// 1b. Check Auto Update status endpoint (polled by clients)
app.get('/api/system/update-status', (req, res) => {
  const store = readStore();
  const sysUpdate = store.systemUpdate || {
    version: store.version || '2.5.0',
    releaseTimestamp: 1772790000000,
    notes: 'Standard release',
    publishedBy: 'System Administrator'
  };
  res.json({
    success: true,
    version: sysUpdate.version,
    currentVersion: sysUpdate.version,
    releaseTimestamp: sysUpdate.releaseTimestamp,
    updatedAt: sysUpdate.releaseTimestamp,
    notes: sysUpdate.notes || '',
    publishedBy: sysUpdate.publishedBy || 'Admin',
    companyName: store.company?.name || 'Company'
  });
});

// 1c. Admin publishes a new auto-update
app.post('/api/admin/publish-update', (req, res) => {
  const { adminPassword, version, notes, forceAll } = req.body || {};
  const store = readStore();
  const adminUser = store.users.find(u => u.username.toLowerCase() === 'admin' || u.role === 'admin');
  const validAdminPassword = adminUser ? adminUser.password : 'admin';

  if (adminPassword !== validAdminPassword) {
    return res.status(403).json({
      success: false,
      error: 'Incorrect Admin Password. You must provide the valid admin password to publish a system update.'
    });
  }

  const newVersion = (version && String(version).trim()) ? String(version).trim() : `v${(Date.now() % 1000000).toString()}`;
  const updateNotes = (notes && String(notes).trim()) ? String(notes).trim() : 'Admin has released enhancements and database updates.';

  store.version = newVersion;
  store.systemUpdate = {
    version: newVersion,
    releaseTimestamp: Date.now(),
    updatedAt: Date.now(),
    notes: updateNotes,
    publishedBy: adminUser?.name || 'System Administrator',
    forceAll: !!forceAll
  };

  writeStore(store);
  console.log(`[EngiStore] New system update published: Version ${newVersion} at ${new Date().toISOString()}`);

  res.json({
    success: true,
    message: `Update ${newVersion} published successfully! Users will immediately receive the Auto Update prompt to Install & Restart.`,
    update: store.systemUpdate,
    systemUpdate: store.systemUpdate
  });
});

// 2. Multi-user login verification
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }
  const store = readStore();
  const user = store.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
  res.json({
    success: true,
    user: {
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// 2b. Verify Admin Password (for unlocking Company & Security settings)
app.post('/api/admin/verify', (req, res) => {
  const { password, adminPassword } = req.body || {};
  const pass = password || adminPassword;
  if (!pass) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }
  const store = readStore();
  const adminUser = store.users.find(u => u.username.toLowerCase() === 'admin' || u.role === 'admin');
  const validAdminPassword = adminUser ? adminUser.password : 'admin';

  if (pass === validAdminPassword) {
    return res.json({ success: true, message: 'Admin verified successfully' });
  } else {
    return res.status(403).json({ success: false, error: 'Incorrect Admin Password' });
  }
});

// 3. Change Company Name & Details - REQUIRES ADMIN PASSWORD VERIFICATION
app.post('/api/admin/company', (req, res) => {
  const { adminPassword, company } = req.body || {};
  if (!adminPassword) {
    return res.status(400).json({
      success: false,
      error: 'Admin password is required to change company details.'
    });
  }
  if (!company || !company.name || !company.name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Company name cannot be empty.'
    });
  }

  const store = readStore();
  const adminUser = store.users.find(u => u.username.toLowerCase() === 'admin' || u.role === 'admin');
  const validAdminPassword = adminUser ? adminUser.password : 'admin';

  if (adminPassword !== validAdminPassword) {
    return res.status(403).json({
      success: false,
      error: 'Incorrect Admin Password. You must provide the valid admin password to update the company name.'
    });
  }

  store.company = {
    name: company.name.trim(),
    subtitle: (company.subtitle || 'Engineering Purchase & Inventory').trim(),
    address: (company.address || '').trim(),
    phone: (company.phone || '').trim(),
    email: (company.email || '').trim(),
    gstin: (company.gstin || '').trim()
  };

  writeStore(store);
  console.log(`[EngiStore] Company updated to: "${store.company.name}" authorized by admin password`);

  res.json({
    success: true,
    message: 'Company name and profile updated successfully.',
    company: store.company
  });
});

// 4. Change Admin Password
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current and new passwords are required.' });
  }
  const store = readStore();
  const adminUser = store.users.find(u => u.username.toLowerCase() === 'admin' || u.role === 'admin');
  if (!adminUser || adminUser.password !== currentPassword) {
    return res.status(403).json({ success: false, error: 'Current admin password does not match.' });
  }
  adminUser.password = newPassword;
  writeStore(store);
  res.json({ success: true, message: 'Admin password successfully updated.' });
});

// 5. Add / Delete / Reset User by Admin
app.post('/api/admin/users', (req, res) => {
  const { adminPassword, action, user, username, newPassword } = req.body || {};
  const store = readStore();
  const adminUser = store.users.find(u => u.username.toLowerCase() === 'admin' || u.role === 'admin');
  const validAdminPassword = adminUser ? adminUser.password : 'admin';

  if (adminPassword !== validAdminPassword) {
    return res.status(403).json({ success: false, error: 'Invalid admin password authorization.' });
  }

  if (action === 'add') {
    if (!user || !user.username || !user.password || !user.name) {
      return res.status(400).json({ success: false, error: 'Username, name, role and password are required.' });
    }
    const uname = user.username.trim().toLowerCase();
    if (store.users.some(u => u.username.toLowerCase() === uname)) {
      return res.status(400).json({ success: false, error: 'Username already exists.' });
    }
    store.users.push({
      username: uname,
      name: user.name.trim(),
      role: user.role || 'staff',
      password: user.password,
      createdAt: new Date().toISOString().split('T')[0]
    });
    writeStore(store);
    return res.json({ success: true, message: `User "${uname}" created successfully.` });
  }

  if (action === 'delete') {
    if (!username) return res.status(400).json({ success: false, error: 'Username required.' });
    if (username.toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot delete default admin user.' });
    }
    const initialLen = store.users.length;
    store.users = store.users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    if (store.users.length === initialLen) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    writeStore(store);
    return res.json({ success: true, message: `User "${username}" deleted.` });
  }

  if (action === 'reset-password') {
    if (!username || !newPassword) return res.status(400).json({ success: false, error: 'Username and new password required.' });
    const target = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!target) return res.status(404).json({ success: false, error: 'User not found.' });
    target.password = newPassword;
    writeStore(store);
    return res.json({ success: true, message: `Password reset for user "${username}".` });
  }

  res.status(400).json({ success: false, error: 'Unknown action.' });
});

// 6. Save operational data (PRs, POs, Stock, Suppliers, Issued)
app.post('/api/data', (req, res) => {
  const { prs, pos, stock, sup, issued } = req.body || {};
  const store = readStore();
  if (Array.isArray(prs)) store.prs = prs;
  if (Array.isArray(pos)) store.pos = pos;
  if (Array.isArray(stock)) store.stock = stock;
  if (Array.isArray(sup)) store.sup = sup;
  if (Array.isArray(issued)) store.issued = issued;
  writeStore(store);
  res.json({ success: true, message: 'Data saved successfully.' });
});

// 7. Download Project ZIP package
app.get('/download-zip', (req, res) => {
  const { execSync } = require('child_process');
  try {
    execSync(`python3 -c "
import os, zipfile
zip_path = 'engistore-pro.zip'
exclude_dirs = {'.git', 'node_modules', '.aistudio', '__pycache__', 'dist'}
exclude_files = {'engistore-pro.zip', '.DS_Store'}
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file in exclude_files or file.endswith('.tmp'):
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, '.')
            zipf.write(full_path, arcname)
"`);
  } catch (err) {
    console.error('Error bundling zip:', err);
  }

  const zipFile = path.join(__dirname, 'engistore-pro.zip');
  if (fs.existsSync(zipFile)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="engistore-pro.zip"');
    res.sendFile(zipFile);
  } else {
    res.status(500).send('ZIP file could not be generated.');
  }
});

// 8. Direct Download for App Icon files
app.get('/download-icon-ico', (req, res) => {
  const file = path.join(__dirname, 'icon.ico');
  if (fs.existsSync(file)) {
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Content-Disposition', 'attachment; filename="engistore-icon.ico"');
    res.sendFile(file);
  } else {
    res.status(404).send('Icon file not found.');
  }
});

app.get('/download-icon-png', (req, res) => {
  const file = path.join(__dirname, 'icon-512.png');
  if (fs.existsSync(file)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="engistore-app-icon.png"');
    res.sendFile(file);
  } else {
    res.status(404).send('Icon file not found.');
  }
});

// Serve static assets from the current directory
app.use(express.static(path.join(__dirname)));

// Single Page Application fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EngiStore Pro server running on http://0.0.0.0:${PORT}`);
});

