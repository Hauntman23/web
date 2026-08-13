const moduleGrid = document.getElementById('module-grid');
const commandList = document.getElementById('command-list');
const searchInput = document.getElementById('search');

let allData = { modules: [], totalCommands: 0 };
let activeModule = 'all';

function clampText(text, max = 120) {
  if (!text) return 'No Description';
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function renderModules() {
  const buttons = [
    { name: 'all', label: 'all', commands: allData.totalCommands || 0 },
    ...allData.modules.map(module => ({
      name: module.name,
      label: module.label,
      commands: module.commands.length,
    }))
  ];

  moduleGrid.innerHTML = buttons.map(item => `
    <button class="module-btn ${activeModule === item.name ? 'active' : ''}" data-module="${item.name}">
      <span class="module-name">${item.label}</span>
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
  let visible = [];

  if (activeModule === 'all') {
    visible = allData.modules.flatMap(module => module.commands);
  } else {
    const target = allData.modules.find(module => module.name === activeModule);
    visible = target ? target.commands : [];
  }

  const filtered = visible.filter(command => {
    const haystack = [command.name, command.description, ...(command.aliases || [])].join(' ').toLowerCase();
    return haystack.includes((searchInput?.value || '').trim().toLowerCase());
  });

  if (!filtered.length) {
    commandList.innerHTML = '<div class="empty-state">No commands match your search.</div>';
    return;
  }

  commandList.innerHTML = filtered.map(command => `
    <article class="command-card">
      <div class="card-top">
        <h4>${command.name}</h4>
        <div class="card-icon">◫</div>
      </div>

      <p class="command-description">${clampText(command.description)}</p>

      <div class="command-section">
        <label>arguments</label>
        <span class="value-box">${command.syntax ? `<code>${command.syntax}</code>` : '[none]'}</span>
      </div>

      <div class="command-section">
        <label>permissions</label>
        <span class="value-box">${Array.isArray(command.permissions) ? (command.permissions.join(', ') || 'None') : (command.permissions || 'None')}</span>
      </div>
    </article>
  `).join('');
}

async function loadCommands() {
  const response = await fetch('commands.json');
  if (!response.ok) throw new Error('Could not load commands.json');
  allData = await response.json();
  renderModules();
  renderCommands();
}

if (searchInput) {
  searchInput.addEventListener('input', renderCommands);
}

loadCommands().catch(error => {
  commandList.innerHTML = `<div class="empty-state">${error.message}</div>`;
});
