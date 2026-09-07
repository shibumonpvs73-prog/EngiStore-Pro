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

// Remove the clickable company badge from the top bar.
html = html.replace(/\n\s*<span id="companyTopBadge"[\s\S]*?<\/span>\n/, '\n');

// Move the complete User Management page inside the protected Company & Security page.
const usersMarker = '<!-- MULTI-USER MANAGEMENT -->';
const usersStart = html.indexOf(usersMarker);
if (usersStart === -1) throw new Error('User Management section not found');
const usersSectionStart = html.indexOf('<section id="users"', usersStart);
const usersSectionEnd = html.indexOf('</section>', usersSectionStart);
if (usersSectionStart === -1 || usersSectionEnd === -1) throw new Error('User Management section boundaries not found');
const usersBlock = html.slice(usersStart, usersSectionEnd + '</section>'.length);
html = html.slice(0, usersStart) + html.slice(usersSectionEnd + '</section>'.length);

const companyInsertMarker = '\n</section>\n\n\n<!-- MULTI-USER MANAGEMENT -->';
if (!html.includes(companyInsertMarker)) throw new Error('Company/User insertion marker not found');
const wrappedUsers = `\n\n<!-- 6. USER MANAGEMENT (INSIDE COMPANY & SECURITY) -->\n<div id="companyUserManagement" class="panel" style="margin-top:18px;border:2px solid #d8b4fe;background:#faf5ff">\n${usersBlock.replace(usersMarker + '\n', '')}\n</div>\n`;
html = html.replace(companyInsertMarker, wrappedUsers + '\n</section>');

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
