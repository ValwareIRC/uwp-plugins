/**
 * Build Plugin Index
 * 
 * Scans the plugins directory and generates plugins.json with metadata
 * from all valid plugin manifests.
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const OUTPUT_FILE = path.join(__dirname, '..', 'plugins.json');

const VALID_CATEGORIES = [
  'security',
  'integration', 
  'monitoring',
  'management',
  'utilities',
  'appearance',
  'fun'
];

function readPluginManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, 'plugin.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.warn(`⚠️  No plugin.json found in ${path.basename(pluginDir)}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`❌ Error reading ${manifestPath}: ${err.message}`);
    return null;
  }
}

function validateManifest(manifest, pluginId) {
  const errors = [];
  
  // Required fields - only the essentials
  const required = ['id', 'name', 'version', 'author', 'description'];
  for (const field of required) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // ID must match directory name
  if (manifest.id && manifest.id !== pluginId) {
    errors.push(`Plugin ID '${manifest.id}' doesn't match directory name '${pluginId}'`);
  }
  
  // Valid category (if provided)
  if (manifest.category && !VALID_CATEGORIES.includes(manifest.category)) {
    errors.push(`Invalid category '${manifest.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  // Version format (semver-ish)
  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    errors.push(`Invalid version format '${manifest.version}'. Use semantic versioning (e.g., 1.0.0)`);
  }
  
  // ID format
  if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
    errors.push(`Invalid ID format '${manifest.id}'. Use lowercase letters, numbers, and hyphens only`);
  }
  
  return errors;
}

function getPluginStats(pluginDir) {
  // Get last modified time from git or file system
  const manifestPath = path.join(pluginDir, 'plugin.json');
  const stats = fs.statSync(manifestPath);
  
  return {
    last_updated: stats.mtime.toISOString()
  };
}

function hasReadme(pluginDir) {
  return fs.existsSync(path.join(pluginDir, 'README.md'));
}

function hasIcon(pluginDir) {
  return fs.existsSync(path.join(pluginDir, 'assets', 'icon.png'));
}

function buildIndex() {
  console.log('🔍 Scanning plugins directory...\n');
  
  if (!fs.existsSync(PLUGINS_DIR)) {
    console.log('📁 Creating plugins directory...');
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }
  
  const plugins = [];
  const errors = [];
  
  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    
    const pluginDir = path.join(PLUGINS_DIR, entry.name);
    const manifest = readPluginManifest(pluginDir);
    
    if (!manifest) continue;
    
    const validationErrors = validateManifest(manifest, entry.name);
    
    if (validationErrors.length > 0) {
      errors.push({
        plugin: entry.name,
        errors: validationErrors
      });
      console.error(`❌ ${entry.name}:`);
      validationErrors.forEach(err => console.error(`   - ${err}`));
      continue;
    }
    
    const stats = getPluginStats(pluginDir);
    
    // Build plugin entry for index
    const pluginEntry = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      author: manifest.author,
      description: manifest.description,
      category: manifest.category || 'utilities',
      license: manifest.license || 'MIT',
      tags: manifest.tags || [],
      repository: manifest.repository || manifest.homepage || null,
      homepage: manifest.homepage || null,
      min_panel_version: manifest.min_panel_version || "2.0.0",
      hooks: manifest.hooks || [],
      nav_items: manifest.nav_items || [],
      dashboard_cards: manifest.dashboard_cards || [],
      frontend_scripts: manifest.frontend_scripts || [],
      settings_schema: manifest.settings_schema || null,
      has_readme: hasReadme(pluginDir),
      has_icon: hasIcon(pluginDir),
      last_updated: stats.last_updated,
      // These would be tracked separately (not in git)
      downloads: 0,
      rating: 0,
      rating_count: 0
    };
    
    plugins.push(pluginEntry);
    console.log(`✅ ${manifest.name} v${manifest.version}`);
  }
  
  // Sort by name
  plugins.sort((a, b) => a.name.localeCompare(b.name));
  
  // Build final index with category metadata
  const categories = VALID_CATEGORIES.map(id => {
    const names = {
      'security': 'Security',
      'integration': 'Integrations',
      'monitoring': 'Monitoring',
      'management': 'Management',
      'utilities': 'Utilities',
      'appearance': 'Appearance',
      'fun': 'Fun'
    };
    const descriptions = {
      'security': 'Security-related features and tools',
      'integration': 'Third-party service integrations',
      'monitoring': 'Monitoring and alerting tools',
      'management': 'Server and user management',
      'utilities': 'General utility plugins',
      'appearance': 'Visual customizations and themes',
      'fun': 'Fun and entertainment features'
    };
    return {
      id,
      name: names[id] || id,
      description: descriptions[id] || ''
    };
  });
  
  const index = {
    version: 2,
    generated_at: new Date().toISOString(),
    plugin_count: plugins.length,
    categories: categories,
    plugins: plugins
  };
  
  // Write index file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  
  console.log(`\n📦 Generated plugins.json with ${plugins.length} plugin(s)`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} plugin(s) had validation errors and were skipped`);
    process.exit(1);
  }
  
  return index;
}

// Run
buildIndex();
