const moduleGrid = document.getElementById('module-grid');
const commandList = document.getElementById('command-list');
const searchInput = document.getElementById('search');
const resultCount = document.getElementById('result-count');
const commandHeading = document.getElementById('command-heading');

let allData = { modules: [], totalCommands: 0 };
let activeModule = 'all';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getVisibleCommands() {
  if (activeModule === 'all') return allData.modules.flatMap(module => module.commands);
  return allData.modules.find(module => module.name === activeModule)?.commands || [];
}

function renderModules() {
  const items = [
    { name: 'all', label: 'All commands', commands: allData.totalCommands },
    ...allData.modules.map(module => ({ name: module.name, label: module.label, commands: module.commands.length })),
  ];

  moduleGrid.innerHTML = items.map(item => `
    <button class="module-btn ${activeModule === item.name ? 'active' : ''}" data-module="${escapeHtml(item.name)}">
      <span class="module-name">${escapeHtml(item.label)}</span>
      <span class="module-count">${item.commands}</span>
    </button>
  `).join('');

  moduleGrid.querySelectorAll('.module-btn').forEach(button => {
    button.addEventListener('click', () => {
      activeModule = button.dataset.module;
      renderModules();
      renderCommands();
    });
  });
}

function renderCommands() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = getVisibleCommands().filter(command => {
    const content = [command.name, command.description, ...(command.aliases || [])].join(' ').toLowerCase();
    return content.includes(query);
  });

  const moduleLabel = activeModule === 'all' ? 'All commands' : allData.modules.find(module => module.name === activeModule)?.label || 'Commands';
  commandHeading.textContent = moduleLabel;
  resultCount.textContent = `${filtered.length} command${filtered.length === 1 ? '' : 's'}`;

  if (!filtered.length) {
    commandList.innerHTML = '<div class="empty-state">No commands match your search.</div>';
    return;
  }

  commandList.innerHTML = filtered.map((command, index) => {
    const description = command.description || 'No description provided.';
    const syntax = command.syntax || command.name;
    const permissions = Array.isArray(command.permissions) ? command.permissions.join(', ') || 'None' : command.permissions || 'None';

    return `
      <article class="command-item" id="command-${index}">
        <button class="command-toggle" type="button" aria-expanded="false">
          <span>
            <span class="command-title">${escapeHtml(command.name)}</span>
            <span class="command-description"> - ${escapeHtml(description)}</span>
          </span>
          <span class="command-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="command-details">
          <strong>Usage</strong><br />
          <code>${escapeHtml(syntax)}</code><br />
          <strong>Permissions:</strong> ${escapeHtml(permissions)}
        </div>
      </article>
    `;
  }).join('');

  commandList.querySelectorAll('.command-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.command-item');
      const open = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  });
}

async function loadCommands() {
  const response = await fetch('commands.json?v=20260812c');
  if (!response.ok) throw new Error('Could not load commands.json');
  allData = await response.json();
  renderModules();
  renderCommands();
}

searchInput.addEventListener('input', renderCommands);

loadCommands().catch(error => {
  commandList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
});
