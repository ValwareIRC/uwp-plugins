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
  'appearance'
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
  'on_page_load'
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
  
  // Required fields
  const required = ['id', 'name', 'version', 'author', 'description', 'category', 'license', 'entry_point'];
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
    if (manifest.id.length < 3 || manifest.id.length > 50) {
      errors.push(`ID must be between 3 and 50 characters`);
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
    if (manifest.description.length > 200) {
      errors.push(`Description too long (maximum 200 characters)`);
    }
  }
  
  // Entry point exists
  if (manifest.entry_point) {
    const entryPath = path.join(pluginDir, manifest.entry_point);
    if (!fs.existsSync(entryPath)) {
      errors.push(`Entry point file '${manifest.entry_point}' not found`);
    }
  }
  
  // Hooks validation
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
      errors.push(`'tags' must be an array`);
    } else if (manifest.tags.length > 10) {
      errors.push(`Too many tags (maximum 10)`);
    }
  }
  
  // Strict mode additional checks
  if (isStrict) {
    // README.md recommended
    if (!fs.existsSync(path.join(pluginDir, 'README.md'))) {
      warnings.push(`Missing README.md - documentation is recommended`);
    }
    
    // LICENSE recommended
    if (!fs.existsSync(path.join(pluginDir, 'LICENSE'))) {
      warnings.push(`Missing LICENSE file - including a license file is recommended`);
    }
    
    // Repository URL format
    if (manifest.repository && !manifest.repository.startsWith('https://')) {
      warnings.push(`Repository URL should use HTTPS`);
    }
  }
  
  return { errors, warnings };
}

function main() {
  console.log(`🔍 Validating plugins${isStrict ? ' (strict mode)' : ''}...\n`);
  
  if (!fs.existsSync(PLUGINS_DIR)) {
    console.log('📁 No plugins directory found');
    return;
  }
  
  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
  let hasErrors = false;
  let totalPlugins = 0;
  let validPlugins = 0;
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    
    totalPlugins++;
    const pluginDir = path.join(PLUGINS_DIR, entry.name);
    const { errors, warnings } = validatePlugin(pluginDir, entry.name);
    
    if (errors.length > 0) {
      hasErrors = true;
      console.log(`❌ ${entry.name}:`);
      errors.forEach(err => console.log(`   ❌ ${err}`));
      warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
    } else if (warnings.length > 0) {
      validPlugins++;
      console.log(`⚠️  ${entry.name}:`);
      warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
    } else {
      validPlugins++;
      console.log(`✅ ${entry.name}`);
    }
  }
  
  console.log(`\n📊 Results: ${validPlugins}/${totalPlugins} plugins valid`);
  
  if (hasErrors) {
    console.log('\n❌ Validation failed - please fix errors above');
    process.exit(1);
  } else {
    console.log('\n✅ All plugins passed validation');
  }
}

main();
