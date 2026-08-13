const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname);
const sourceDir = path.resolve(rootDir, '../kuaa/kuaa/commands');
const outputFile = path.join(rootDir, 'commands.json');

function walk(dir) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const commandEntries = [];
for (const filePath of walk(sourceDir)) {
  try {
    const exported = require(filePath);
    const config = exported && exported.configuration;

    if (!config || !config.name || !config.module) continue;
    if (config.module.toLowerCase() === 'developer') continue;
    if (String(config.name).includes(' ')) continue;

    commandEntries.push({
      name: config.name,
      aliases: Array.isArray(config.aliases) ? config.aliases : [],
      description: config.description || 'No description provided.',
      module: config.module,
      syntax: config.syntax || '',
      example: config.example || '',
    });
  } catch (error) {
    // Ignore files that cannot load cleanly during generation.
  }
}

const grouped = {};
for (const command of commandEntries) {
  if (!grouped[command.module]) grouped[command.module] = [];
  grouped[command.module].push(command);
}

const modules = Object.keys(grouped).sort().map(name => ({
  name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
  commands: grouped[name].sort((a, b) => a.name.localeCompare(b.name)),
}));

const payload = {
  generatedAt: new Date().toISOString(),
  totalCommands: commandEntries.length,
  modules,
};

fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
console.log(`Generated ${commandEntries.length} commands across ${modules.length} modules.`);
