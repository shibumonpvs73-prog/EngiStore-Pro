const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(file, 'utf8');

// Tolerant/idempotent v2.5.3 build patch.
// It works with the current GitHub index.html formatting and can safely run again.

// Remove the separate User Management navigation item if present.
html = html.replace(/\s*<button id="navUsersBtn"[\s\S]*?<\/button>\s*/m, '\n');

// Remove the clickable company badge from the top bar if present.
html = html.replace(/\s*<span id="companyTopBadge"[\s\S]*?<span id="topCompNameSpan">[\s\S]*?<\/span>\s*<\/span>\s*/m, '\n');

const usersMarker = '<!-- MULTI-USER MANAGEMENT -->';
const companyStart = html.indexOf('<section id="company"');
if (companyStart === -1) throw new Error('Company section not found');

// Move the old User Management section inside Company & Security.
const usersSectionStart = html.indexOf('<section id="users"');
if (usersSectionStart !== -1 && !html.includes('id="companyUserManagement"')) {
  const usersSectionEnd = html.indexOf('</section>', usersSectionStart);
  if (usersSectionEnd === -1) throw new Error('User Management section closing tag not found');

  const blockStart = html.lastIndexOf(usersMarker, usersSectionStart);
  const usersBlock = html.slice(blockStart >= 0 ? blockStart : usersSectionStart, usersSectionEnd + '</section>'.length);
  html = html.slice(0, blockStart >= 0 ? blockStart : usersSectionStart) + html.slice(usersSectionEnd + '</section>'.length);

  const companyStart2 = html.indexOf('<section id="company"');
  const companyClose2 = html.indexOf('</section>', companyStart2);
  if (companyStart2 === -1 || companyClose2 === -1) throw new Error('Company section boundary not found');

  const cleanUsersBlock = usersBlock
    .replace(usersMarker, '')
    .replace(/^\s*<section id="users"[^>]*>/, '')
    .replace(/<\/section>\s*$/, '');

  const wrappedUsers = `\n\n<!-- 6. USER MANAGEMENT (INSIDE COMPANY & SECURITY) -->\n<div id="companyUserManagement" class="panel" style="margin-top:18px;border:2px solid #d8b4fe;background:#faf5ff">\n${cleanUsersBlock}\n</div>\n`;
  html = html.slice(0, companyClose2) + wrappedUsers + html.slice(companyClose2);
}

// Protect both Company & Security and its User Management contents with the same admin gate.
if (!html.includes("if(id === 'users') id = 'company';")) {
  const guard = "if(id === 'company' && !isCompanyAuthUnlocked){";
  if (html.includes(guard)) {
    html = html.replace(guard, "// User Management is now part of the Admin-protected Company & Security page.\nif(id === 'users') id = 'company';\n" + guard);
  } else {
    throw new Error('Company navigation guard not found');
  }
}

// Remove old standalone Users page title entry.
html = html.replace(/\s*users:\s*['"]Multi-User Management['"],?/g, '');

// Render User Management whenever Company & Security is opened.
if (!html.includes("if(id === 'company'){ applyCompanyProfile(); renderUsersTable(); }")) {
  const oldRender = "if(id === 'company') applyCompanyProfile();";
  if (html.includes(oldRender)) {
    html = html.replace(oldRender, "if(id === 'company'){ applyCompanyProfile(); renderUsersTable(); }");
  }
}

// Release/build version shown in the UI.
html = html.replace(/v2\.5\.[0-9]+/g, 'v2.5.3');
html = html.replace(/2\.5\.[0-9]+/g, '2.5.3');

fs.writeFileSync(file, html, 'utf8');
console.log('Company & Security / User Management patch applied successfully.');
