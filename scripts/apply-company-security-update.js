const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');

function mustReplace(label, from, to) {
  if (!html.includes(from)) throw new Error(`Patch target not found: ${label}`);
  html = html.replace(from, to);
}

// Remove the separate User Management navigation item.
html = html.replace(/\n<button id="navUsersBtn"[\s\S]*?<\/button>\n/, '\n');

// Remove the clickable company badge from the top bar, including its nested name span.
html = html.replace(/\n\s*<span id="companyTopBadge"[\s\S]*?<span id="topCompNameSpan"[\s\S]*?<\/span>\s*<\/span>\n/, '\n');

// Capture the existing User Management page and remember the Company section boundary.
const companyStart = html.indexOf('<section id="company"');
const usersMarker = '<!-- MULTI-USER MANAGEMENT -->';
const usersStart = html.indexOf(usersMarker);
if (companyStart === -1 || usersStart === -1) throw new Error('Company or User Management section not found');
const companyClose = html.indexOf('</section>', companyStart);
const usersSectionStart = html.indexOf('<section id="users"', usersStart);
const usersSectionEnd = html.indexOf('</section>', usersSectionStart);
if (companyClose === -1 || usersSectionStart === -1 || usersSectionEnd === -1) throw new Error('Section boundaries not found');

const usersBlock = html.slice(usersStart, usersSectionEnd + '</section>'.length);
html = html.slice(0, usersStart) + html.slice(usersSectionEnd + '</section>'.length);

// Re-find Company close after removing the old User Management page and insert it inside Company.
const companyStart2 = html.indexOf('<section id="company"');
const companyClose2 = html.indexOf('</section>', companyStart2);
if (companyStart2 === -1 || companyClose2 === -1) throw new Error('Company section boundary not found after move');
const wrappedUsers = `\n\n<!-- 6. USER MANAGEMENT (INSIDE COMPANY & SECURITY) -->\n<div id="companyUserManagement" class="panel" style="margin-top:18px;border:2px solid #d8b4fe;background:#faf5ff">\n${usersBlock.replace(usersMarker + '\n', '')}\n</div>\n`;
html = html.slice(0, companyClose2) + wrappedUsers + html.slice(companyClose2);

// Ensure Company & Security remains the only admin-protected settings entry.
mustReplace(
  'showPage company guard',
  "function showPage(id,btn){\n\nif(id === 'company' && !isCompanyAuthUnlocked){",
  "function showPage(id,btn){\n\n// User Management is now part of the Admin-protected Company & Security page.\nif(id === 'users') id = 'company';\nif(id === 'company' && !isCompanyAuthUnlocked){"
);
mustReplace('users title', "reports:'Reports',\nusers:'Multi-User Management',\ncompany:'Company & Security Settings'", "reports:'Reports',\ncompany:'Company & Security Settings'");
mustReplace('company render', "if(id === 'users') renderUsersTable();\nif(id === 'company') applyCompanyProfile();", "if(id === 'company'){ applyCompanyProfile(); renderUsersTable(); }");

// Release/build version shown in the UI.
html = html.replace(/v2\.5\.[0-9]+/g, 'v2.5.3');
html = html.replace(/2\.5\.[0-9]+/g, '2.5.3');

fs.writeFileSync(file, html, 'utf8');
console.log('Company & Security / User Management patch applied successfully.');
