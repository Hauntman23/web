const moduleGrid = document.getElementById('module-grid');
const commandList = document.getElementById('command-list');
const searchInput = document.getElementById('search');

let allData = { modules: [], totalCommands: 0 };
let activeModule = 'all';

function clampText(text, max = 150) {
  if (!text) return 'No description provided.';
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function renderModules() {
  const buttons = [
    { name: 'all', label: 'All', commands: allData.totalCommands || 0 },
    ...allData.modules.map(module => ({
      name: module.name,
      label: module.label,
      commands: module.commands.length,
    }))
  ];

  moduleGrid.innerHTML = buttons.map(item => `
    <button class="module-btn ${activeModule === item.name ? 'active' : ''}" data-module="${item.name}">
      <span class="module-name">${item.label}</span>
      <span class="module-count">${item.commands} command${item.commands === 1 ? '' : 's'}</span>
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
  const term = searchInput.value.trim().toLowerCase();

  let visible = [];

  if (activeModule === 'all') {
    visible = allData.modules.flatMap(module => module.commands);
  } else {
    const target = allData.modules.find(module => module.name === activeModule);
    visible = target ? target.commands : [];
  }

  const filtered = visible.filter(command => {
    const haystack = [command.name, command.description, ...(command.aliases || [])].join(' ').toLowerCase();
    return haystack.includes(term);
  });

  if (!filtered.length) {
    commandList.innerHTML = '<div class="empty-state">No commands match your search.</div>';
    return;
  }

  commandList.innerHTML = filtered.map(command => `
    <article class="command-card">
      <div class="meta">${command.module}</div>
      <h4>${command.name}</h4>
      <p>${clampText(command.description)}</p>
      ${command.aliases && command.aliases.length ? `<code>Aliases: ${command.aliases.join(', ')}</code>` : ''}
      ${command.syntax ? `<div><code>${command.syntax}</code></div>` : ''}
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

searchInput.addEventListener('input', renderCommands);

loadCommands().catch(error => {
  commandList.innerHTML = `<div class="empty-state">${error.message}</div>`;
});
