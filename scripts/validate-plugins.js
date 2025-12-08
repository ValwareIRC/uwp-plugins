/**
 * Validate Plugins
 * 
 * Validates all plugin manifests and optionally runs strict checks for PRs.
 */

const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');
const isStrict = process.argv.includes('--strict');

const VALID_CATEGORIES = [
  'security',
  'integration', 
  'monitoring',
  'management',
  'utilities',
  'appearance',
  'fun'
];

const VALID_HOOKS = [
  'on_user_connect',
  'on_user_disconnect',
  'on_user_nick_change',
  'on_user_quit',
  'on_channel_join',
  'on_channel_part',
  'on_channel_message',
  'on_channel_mode',
  'on_server_link',
  'on_server_split',
  'on_rehash',
  'on_oper_up',
  'on_ban_add',
  'on_ban_remove',
  'on_panel_startup',
  'on_api_request',
  'on_page_load',
  'OnStartup',
  'OnShutdown',
  'OnUserListRequest',
  'OnChannelListRequest'
];

function validatePlugin(pluginDir, pluginId) {
  const errors = [];
  const warnings = [];
  
  const manifestPath = path.join(pluginDir, 'plugin.json');
  
  // Check plugin.json exists
  if (!fs.existsSync(manifestPath)) {
    errors.push('Missing plugin.json');
    return { errors, warnings };
  }
  
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    errors.push(`Invalid JSON in plugin.json: ${err.message}`);
    return { errors, warnings };
  }
  
  // Required fields - only the essentials (entry_point is optional for frontend-only plugins)
  const required = ['id', 'name', 'version', 'author', 'description'];
  for (const field of required) {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // ID validation
  if (manifest.id) {
    if (manifest.id !== pluginId) {
      errors.push(`Plugin ID '${manifest.id}' must match directory name '${pluginId}'`);
    }
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push(`Invalid ID format. Use lowercase letters, numbers, and hyphens only`);
    }
    if (manifest.id.length < 2 || manifest.id.length > 50) {
      errors.push(`ID must be between 2 and 50 characters`);
    }
  }
  
  // Version validation
  if (manifest.version && !/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(manifest.version)) {
    errors.push(`Invalid version format. Use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)`);
  }
  
  // Category validation
  if (manifest.category && !VALID_CATEGORIES.includes(manifest.category)) {
    errors.push(`Invalid category '${manifest.category}'. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  // Description length
  if (manifest.description) {
    if (manifest.description.length < 10) {
      errors.push(`Description too short (minimum 10 characters)`);
    }
    if (manifest.description.length > 500) {
      errors.push(`Description too long (maximum 500 characters)`);
    }
  }
  
  // Entry point exists (only check if specified)
  if (manifest.entry_point) {
    const entryPath = path.join(pluginDir, manifest.entry_point);
    if (!fs.existsSync(entryPath)) {
      errors.push(`Entry point file '${manifest.entry_point}' not found`);
    }
  }
  
  // Frontend scripts exist (check if specified)
  if (manifest.frontend_scripts && Array.isArray(manifest.frontend_scripts)) {
    for (const script of manifest.frontend_scripts) {
      const scriptPath = path.join(pluginDir, 'assets', script);
      if (!fs.existsSync(scriptPath)) {
        errors.push(`Frontend script 'assets/${script}' not found`);
      }
    }
  }
  
  // Hooks validation (just warn, don't error)
  if (manifest.hooks && Array.isArray(manifest.hooks)) {
    for (const hook of manifest.hooks) {
      if (!VALID_HOOKS.includes(hook)) {
        warnings.push(`Unknown hook '${hook}' - may not work with current panel version`);
      }
    }
  }
  
  // Tags validation
  if (manifest.tags) {
    if (!Array.isArray(manifest.tags)) {
      errors.push('Tags must be an array');
    } else if (manifest.tags.length > 10) {
      warnings.push('Too many tags (recommended max: 10)');
    }
  }
  
  return { errors, warnings };
}

function main() {
  console.log('🔍 Validating plugins...\n');
  
  if (!fs.existsSync(PLUGINS_DIR)) {
    console.error('❌ Plugins directory not found');
    process.exit(1);
  }
  
  const plugins = fs.readdirSync(PLUGINS_DIR)
    .filter(name => {
      const pluginPath = path.join(PLUGINS_DIR, name);
      return fs.statSync(pluginPath).isDirectory() && !name.startsWith('.');
    });
  
  let validCount = 0;
  let hasErrors = false;
  
  for (const pluginId of plugins) {
    const pluginDir = path.join(PLUGINS_DIR, pluginId);
    const { errors, warnings } = validatePlugin(pluginDir, pluginId);
    
    if (errors.length === 0) {
      console.log(`✅ ${pluginId}`);
      validCount++;
      
      if (warnings.length > 0) {
        warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      }
    } else {
      console.log(`❌ ${pluginId}:`);
      errors.forEach(e => console.log(`   ❌ ${e}`));
      warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      hasErrors = true;
    }
  }
  
  console.log(`\n📊 Results: ${validCount}/${plugins.length} plugins valid`);
  
  if (hasErrors && isStrict) {
    process.exit(1);
  }
}

main();
