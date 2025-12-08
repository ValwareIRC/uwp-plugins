/**
 * Runa - Responsive UnrealIRCd Network Agent
 * An AI-powered assistant for the UnrealIRCd Web Panel
 * 
 * @version 1.0.0
 * @author ValwareIRC
 * @license MIT
 */
(function() {
  'use strict';

  // ========================================
  // Constants & Configuration
  // ========================================
  
  const PLUGIN_ID = 'runa';
  const PLUGIN_NAME = 'Runa';
  const STORAGE_KEY = 'runa_config';
  const HISTORY_KEY = 'runa_history';

  // Default configuration
  const DEFAULT_CONFIG = {
    api_provider: 'openai',
    api_key: '',
    api_endpoint: '',
    model: 'gpt-4o-mini',
    keyboard_shortcut: 'r',
    auto_fetch_context: true,
    max_history: 50
  };

  // API endpoints for different providers
  const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    anthropic: 'https://api.anthropic.com/v1/messages'
  };

  // ========================================
  // System Prompt - Runa's Personality & Knowledge
  // ========================================

  const SYSTEM_PROMPT = `You are Runa (Responsive UnrealIRCd Network Agent), a friendly and knowledgeable AI assistant for the UnrealIRCd Web Panel. You help IRC network administrators manage their servers through natural conversation.

## Your Personality
- Friendly, helpful, and professional
- Concise but thorough in explanations
- Use occasional emoji to be approachable (but not excessively)
- Refer to yourself as "Runa" when appropriate
- Be proactive in suggesting related actions or information

## Your Knowledge Domain
You are an expert in:
1. **UnrealIRCd** - The IRC server software, its configuration, modules, and features
2. **IRC Protocol** - RFC 1459, RFC 2812, and modern IRC extensions
3. **Network Administration** - Managing users, channels, bans, and server links
4. **Security** - Best practices for IRC network security, spam prevention, DDoS mitigation

## Key UnrealIRCd Concepts

### User Modes
- +o = IRC Operator
- +i = Invisible (hidden from WHO/NAMES)
- +w = Receives wallops
- +s = Receives server notices
- +x = Cloaked hostname
- +B = Bot flag
- +G = Message filtering (stripcolor/block)
- +Z = Connected via TLS/SSL

### Channel Modes
- +n = No external messages
- +t = Topic lock (ops only)
- +s = Secret channel
- +p = Private channel
- +m = Moderated
- +i = Invite-only
- +k = Key/password required
- +l = User limit
- +b = Ban mask
- +e = Ban exception
- +I = Invite exception
- +o/+v = Op/voice a user

### Server Bans (TKLs)
- **G-Line**: Global ban by user@host mask
- **K-Line**: Local ban (server-specific)
- **Z-Line**: Ban by IP address
- **Gline on nick**: Ban specific nickname
- **Shun**: Silently ignore a user's commands
- **Spamfilter**: Pattern-based message filtering

### Common IRC Terminology
- **Nick**: User's display name
- **Ident**: Username portion of user@host
- **Vhost**: Virtual hostname (cloak)
- **Oper/IRCOp**: Server administrator
- **Services**: NickServ, ChanServ, etc.
- **CTCP**: Client-to-client protocol
- **WHOIS/WHOWAS**: User information queries

## Available Data Sources
You have access to the following information about the user's IRC network:
- List of connected users (nick, hostname, IP, channels, modes, connection time)
- List of channels (name, topic, modes, user count, ban lists)
- Server bans (G-Lines, K-Lines, Z-Lines, Shuns)
- Name bans (Q-Lines)
- Ban exceptions (E-Lines)
- Spamfilters
- Server information and statistics
- Network topology

## Response Guidelines

1. **For informational queries**: Provide clear, formatted answers using the network data
2. **For action requests**: Explain what action would be needed and any relevant considerations
3. **For troubleshooting**: Ask clarifying questions if needed, then provide step-by-step guidance
4. **For security concerns**: Prioritize safety and recommend best practices

## Formatting
- Use **bold** for important terms
- Use \`code\` for IRC commands, modes, and technical values
- Use bullet points for lists
- Keep responses concise but complete
- Break complex information into sections

## Current Network Context
The following context will be provided with each conversation:
- Network statistics (users online, channels, servers)
- Recent relevant data based on the user's query

Remember: You're helping real IRC administrators. Be accurate, helpful, and security-conscious.`;

  // ========================================
  // State
  // ========================================

  let config = { ...DEFAULT_CONFIG };
  let conversationHistory = [];
  let networkContext = null;
  let isVisible = false;
  let isSettingsVisible = false;
  let isLoading = false;
  let containerElement = null;
  let fabElement = null;

  // ========================================
  // Utility Functions
  // ========================================

  function loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[Runa] Failed to load config:', e);
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('[Runa] Failed to save config:', e);
    }
  }

  function loadHistory() {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) {
        conversationHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[Runa] Failed to load history:', e);
    }
  }

  function saveHistory() {
    try {
      // Trim history if too long
      if (conversationHistory.length > config.max_history) {
        conversationHistory = conversationHistory.slice(-config.max_history);
      }
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    } catch (e) {
      console.warn('[Runa] Failed to save history:', e);
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatMarkdown(text) {
    // Simple markdown formatting
    return text
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Lists (basic)
      .replace(/^- (.+)$/gm, '• $1');
  }

  // ========================================
  // API Functions
  // ========================================

  async function fetchNetworkContext() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('[Runa] No auth token found');
      return null;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const [statsRes, usersRes, channelsRes] = await Promise.all([
        fetch('/api/stats', { headers }),
        fetch('/api/users?detail=basic', { headers }),
        fetch('/api/channels?detail=basic', { headers })
      ]);

      const stats = await statsRes.json();
      const users = await usersRes.json();
      const channels = await channelsRes.json();

      return {
        stats,
        userCount: Array.isArray(users) ? users.length : 0,
        channelCount: Array.isArray(channels) ? channels.length : 0,
        users: Array.isArray(users) ? users.slice(0, 50) : [], // Limit for context
        channels: Array.isArray(channels) ? channels.slice(0, 50) : [],
        timestamp: new Date().toISOString()
      };
    } catch (e) {
      console.error('[Runa] Failed to fetch network context:', e);
      return null;
    }
  }

  async function fetchSpecificData(type, query = '') {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      let endpoint = '';
      switch (type) {
        case 'users':
          endpoint = '/api/users?detail=full';
          break;
        case 'user':
          endpoint = `/api/users/${encodeURIComponent(query)}`;
          break;
        case 'channels':
          endpoint = '/api/channels?detail=members';
          break;
        case 'channel':
          endpoint = `/api/channels/${encodeURIComponent(query)}`;
          break;
        case 'bans':
          endpoint = '/api/bans/server';
          break;
        case 'namebans':
          endpoint = '/api/bans/name';
          break;
        case 'exceptions':
          endpoint = '/api/bans/exceptions';
          break;
        case 'spamfilters':
          endpoint = '/api/bans/spamfilter';
          break;
        case 'servers':
          endpoint = '/api/servers';
          break;
        case 'stats':
          endpoint = '/api/stats';
          break;
        default:
          return null;
      }

      const res = await fetch(endpoint, { headers });
      return await res.json();
    } catch (e) {
      console.error(`[Runa] Failed to fetch ${type}:`, e);
      return null;
    }
  }

  async function sendToAI(message) {
    if (!config.api_key && config.api_provider !== 'ollama') {
      throw new Error('API key not configured. Please open settings and enter your API key.');
    }

    // Build context message
    let contextMessage = '';
    if (networkContext) {
      contextMessage = `\n\n## Current Network Status\n`;
      contextMessage += `- **Users Online**: ${networkContext.userCount}\n`;
      contextMessage += `- **Active Channels**: ${networkContext.channelCount}\n`;
      if (networkContext.stats) {
        if (networkContext.stats.operators) {
          contextMessage += `- **IRC Operators**: ${networkContext.stats.operators}\n`;
        }
        if (networkContext.stats.servers) {
          contextMessage += `- **Linked Servers**: ${networkContext.stats.servers}\n`;
        }
      }
      contextMessage += `\nData refreshed: ${new Date(networkContext.timestamp).toLocaleString()}`;
    }

    // Build messages array
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + contextMessage }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call appropriate API
    let response;
    switch (config.api_provider) {
      case 'openai':
        response = await callOpenAI(messages);
        break;
      case 'anthropic':
        response = await callAnthropic(messages);
        break;
      case 'ollama':
        response = await callOllama(messages);
        break;
      case 'custom':
        response = await callCustomAPI(messages);
        break;
      default:
        throw new Error('Unknown API provider');
    }

    // Store in history
    conversationHistory.push({ role: 'user', content: message });
    conversationHistory.push({ role: 'assistant', content: response });
    saveHistory();

    return response;
  }

  async function callOpenAI(messages) {
    const res = await fetch(API_ENDPOINTS.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }

  async function callAnthropic(messages) {
    // Convert OpenAI format to Anthropic format
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system');

    const res = await fetch(API_ENDPOINTS.anthropic, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.api_key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemMsg?.content || SYSTEM_PROMPT,
        messages: chatMessages
      })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await res.json();
    return data.content[0].text;
  }

  async function callOllama(messages) {
    const endpoint = config.api_endpoint || 'http://localhost:11434';
    
    const res = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'llama3',
        messages: messages,
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error('Ollama API request failed. Is Ollama running?');
    }

    const data = await res.json();
    return data.message.content;
  }

  async function callCustomAPI(messages) {
    if (!config.api_endpoint) {
      throw new Error('Custom API endpoint not configured');
    }

    const res = await fetch(config.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.api_key}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        max_tokens: 2048
      })
    });

    if (!res.ok) {
      throw new Error('Custom API request failed');
    }

    const data = await res.json();
    // Try to handle both OpenAI and custom response formats
    return data.choices?.[0]?.message?.content || data.content || data.response || data.message;
  }

  // ========================================
  // UI Functions
  // ========================================

  function createUI() {
    // Create FAB (floating action button)
    fabElement = document.createElement('button');
    fabElement.className = 'runa-fab';
    fabElement.innerHTML = '🤖';
    fabElement.title = 'Open Runa AI Assistant (Ctrl+Shift+R)';
    fabElement.addEventListener('click', toggleChat);
    document.body.appendChild(fabElement);

    // Create chat container
    containerElement = document.createElement('div');
    containerElement.className = 'runa-container';
    containerElement.innerHTML = `
      <div class="runa-header">
        <div class="runa-header-left">
          <div class="runa-avatar">🤖</div>
          <div>
            <div class="runa-title">Runa</div>
            <div class="runa-subtitle">AI Network Assistant</div>
          </div>
        </div>
        <div class="runa-header-actions">
          <button class="runa-header-btn" data-action="refresh" title="Refresh network data">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          </button>
          <button class="runa-header-btn" data-action="clear" title="Clear conversation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          <button class="runa-header-btn" data-action="settings" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="runa-header-btn" data-action="minimize" title="Minimize">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          </button>
          <button class="runa-header-btn" data-action="close" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
      
      <div class="runa-messages" id="runa-messages">
        <div class="runa-welcome">
          <div class="runa-welcome-avatar">🤖</div>
          <h3>Hi, I'm Runa! 👋</h3>
          <p>I'm your AI assistant for managing this IRC network. Ask me anything about users, channels, bans, or server configuration!</p>
          <div class="runa-suggestions">
            <button class="runa-suggestion" data-query="How many users are connected right now?">📊 How many users are online?</button>
            <button class="runa-suggestion" data-query="Show me a summary of the network status">🌐 Network status summary</button>
            <button class="runa-suggestion" data-query="What channels have the most users?">📢 Popular channels</button>
            <button class="runa-suggestion" data-query="Are there any active G-Lines?">🛡️ Check active bans</button>
          </div>
        </div>
      </div>
      
      <div class="runa-settings" id="runa-settings">
        <h3>⚙️ Settings</h3>
        
        <div class="runa-setting-group">
          <label class="runa-setting-label">AI Provider</label>
          <select class="runa-setting-select" id="runa-provider">
            <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="ollama">Ollama (Local)</option>
            <option value="custom">Custom Endpoint</option>
          </select>
        </div>
        
        <div class="runa-setting-group">
          <label class="runa-setting-label">API Key</label>
          <div class="runa-setting-help">Your API key is stored locally in your browser</div>
          <input type="password" class="runa-setting-input" id="runa-apikey" placeholder="sk-... or your API key">
        </div>
        
        <div class="runa-setting-group" id="runa-endpoint-group" style="display: none;">
          <label class="runa-setting-label">API Endpoint</label>
          <div class="runa-setting-help">For Ollama: http://localhost:11434</div>
          <input type="text" class="runa-setting-input" id="runa-endpoint" placeholder="http://localhost:11434">
        </div>
        
        <div class="runa-setting-group">
          <label class="runa-setting-label">Model</label>
          <input type="text" class="runa-setting-input" id="runa-model" placeholder="gpt-4o-mini">
        </div>
        
        <div class="runa-setting-group">
          <label class="runa-setting-checkbox">
            <input type="checkbox" id="runa-autofetch">
            <span>Auto-fetch network data on startup</span>
          </label>
        </div>
        
        <div class="runa-settings-actions">
          <button class="runa-btn runa-btn-secondary" id="runa-settings-cancel">Cancel</button>
          <button class="runa-btn runa-btn-primary" id="runa-settings-save">Save Settings</button>
        </div>
      </div>
      
      <div class="runa-input-area">
        <div class="runa-input-wrapper">
          <textarea class="runa-input" id="runa-input" placeholder="Ask Runa anything..." rows="1"></textarea>
          <button class="runa-send-btn" id="runa-send" title="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(containerElement);

    // Bind events
    bindEvents();
  }

  function bindEvents() {
    // Header actions
    containerElement.querySelectorAll('.runa-header-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        switch (action) {
          case 'close':
            hideChat();
            break;
          case 'minimize':
            containerElement.classList.toggle('minimized');
            break;
          case 'settings':
            toggleSettings();
            break;
          case 'clear':
            clearConversation();
            break;
          case 'refresh':
            refreshContext();
            break;
        }
      });
    });

    // Suggestions
    containerElement.querySelectorAll('.runa-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        sendMessage(query);
      });
    });

    // Send button
    document.getElementById('runa-send').addEventListener('click', () => {
      const input = document.getElementById('runa-input');
      if (input.value.trim()) {
        sendMessage(input.value.trim());
        input.value = '';
        autoResizeInput(input);
      }
    });

    // Input handling
    const input = document.getElementById('runa-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim() && !isLoading) {
          sendMessage(input.value.trim());
          input.value = '';
          autoResizeInput(input);
        }
      }
    });
    input.addEventListener('input', () => autoResizeInput(input));

    // Settings
    document.getElementById('runa-provider').addEventListener('change', (e) => {
      const showEndpoint = ['ollama', 'custom'].includes(e.target.value);
      document.getElementById('runa-endpoint-group').style.display = showEndpoint ? 'block' : 'none';
    });

    document.getElementById('runa-settings-save').addEventListener('click', saveSettings);
    document.getElementById('runa-settings-cancel').addEventListener('click', () => toggleSettings(false));

    // Keyboard shortcut
    document.addEventListener('keydown', handleKeyboardShortcut);
  }

  function autoResizeInput(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  function handleKeyboardShortcut(e) {
    // Check for Ctrl+Shift+[configured key]
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === config.keyboard_shortcut.toLowerCase()) {
      e.preventDefault();
      toggleChat();
    }
    // Escape to close
    if (e.key === 'Escape' && isVisible) {
      if (isSettingsVisible) {
        toggleSettings(false);
      } else {
        hideChat();
      }
    }
  }

  function toggleChat() {
    if (isVisible) {
      hideChat();
    } else {
      showChat();
    }
  }

  function showChat() {
    isVisible = true;
    containerElement.classList.add('visible');
    fabElement.classList.add('hidden');
    document.getElementById('runa-input').focus();

    // Auto-fetch context if enabled and not already fetched
    if (config.auto_fetch_context && !networkContext) {
      refreshContext();
    }
  }

  function hideChat() {
    isVisible = false;
    containerElement.classList.remove('visible');
    fabElement.classList.remove('hidden');
  }

  function toggleSettings(show) {
    if (typeof show === 'boolean') {
      isSettingsVisible = show;
    } else {
      isSettingsVisible = !isSettingsVisible;
    }

    const settingsPanel = document.getElementById('runa-settings');
    if (isSettingsVisible) {
      // Load current values
      document.getElementById('runa-provider').value = config.api_provider;
      document.getElementById('runa-apikey').value = config.api_key;
      document.getElementById('runa-endpoint').value = config.api_endpoint;
      document.getElementById('runa-model').value = config.model;
      document.getElementById('runa-autofetch').checked = config.auto_fetch_context;
      
      // Show/hide endpoint based on provider
      const showEndpoint = ['ollama', 'custom'].includes(config.api_provider);
      document.getElementById('runa-endpoint-group').style.display = showEndpoint ? 'block' : 'none';
      
      settingsPanel.classList.add('visible');
    } else {
      settingsPanel.classList.remove('visible');
    }
  }

  function saveSettings() {
    config.api_provider = document.getElementById('runa-provider').value;
    config.api_key = document.getElementById('runa-apikey').value;
    config.api_endpoint = document.getElementById('runa-endpoint').value;
    config.model = document.getElementById('runa-model').value;
    config.auto_fetch_context = document.getElementById('runa-autofetch').checked;
    
    saveConfig();
    toggleSettings(false);
    addSystemMessage('Settings saved! ✓');
  }

  function clearConversation() {
    conversationHistory = [];
    saveHistory();
    
    const messagesContainer = document.getElementById('runa-messages');
    messagesContainer.innerHTML = `
      <div class="runa-welcome">
        <div class="runa-welcome-avatar">🤖</div>
        <h3>Conversation cleared! 🧹</h3>
        <p>Ready for a fresh start. How can I help you?</p>
        <div class="runa-suggestions">
          <button class="runa-suggestion" data-query="How many users are connected right now?">📊 How many users are online?</button>
          <button class="runa-suggestion" data-query="Show me a summary of the network status">🌐 Network status summary</button>
          <button class="runa-suggestion" data-query="What channels have the most users?">📢 Popular channels</button>
          <button class="runa-suggestion" data-query="Are there any active G-Lines?">🛡️ Check active bans</button>
        </div>
      </div>
    `;

    // Re-bind suggestion events
    messagesContainer.querySelectorAll('.runa-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        sendMessage(query);
      });
    });
  }

  async function refreshContext() {
    addSystemMessage('Refreshing network data... 🔄');
    networkContext = await fetchNetworkContext();
    if (networkContext) {
      addSystemMessage(`Network data updated! ${networkContext.userCount} users, ${networkContext.channelCount} channels online. ✓`);
    } else {
      addSystemMessage('Failed to fetch network data. Are you logged in?', 'error');
    }
  }

  function addMessage(role, content) {
    const messagesContainer = document.getElementById('runa-messages');
    
    // Remove welcome message if present
    const welcome = messagesContainer.querySelector('.runa-welcome');
    if (welcome) {
      welcome.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `runa-message ${role}`;
    
    const avatar = role === 'assistant' ? '🤖' : '👤';
    
    messageDiv.innerHTML = `
      <div class="runa-message-avatar">${avatar}</div>
      <div class="runa-message-content">${formatMarkdown(content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addSystemMessage(content, type = 'info') {
    const messagesContainer = document.getElementById('runa-messages');
    
    const statusDiv = document.createElement('div');
    statusDiv.className = type === 'error' ? 'runa-error' : 'runa-status';
    statusDiv.textContent = content;

    messagesContainer.appendChild(statusDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Auto-remove status messages after a delay
    if (type !== 'error') {
      setTimeout(() => statusDiv.remove(), 5000);
    }
  }

  function showTypingIndicator() {
    const messagesContainer = document.getElementById('runa-messages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'runa-message assistant';
    typingDiv.id = 'runa-typing';
    typingDiv.innerHTML = `
      <div class="runa-message-avatar">🤖</div>
      <div class="runa-message-content">
        <div class="runa-typing">
          <div class="runa-typing-dot"></div>
          <div class="runa-typing-dot"></div>
          <div class="runa-typing-dot"></div>
        </div>
      </div>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const typing = document.getElementById('runa-typing');
    if (typing) typing.remove();
  }

  async function sendMessage(message) {
    if (isLoading) return;

    // Check if API is configured
    if (!config.api_key && config.api_provider !== 'ollama') {
      addSystemMessage('Please configure your API key in settings first!', 'error');
      toggleSettings(true);
      return;
    }

    isLoading = true;
    document.getElementById('runa-send').disabled = true;

    // Add user message
    addMessage('user', message);

    // Show typing indicator
    showTypingIndicator();

    try {
      // Check if this is a data-specific query that needs fresh data
      await checkAndFetchRelevantData(message);

      const response = await sendToAI(message);
      hideTypingIndicator();
      addMessage('assistant', response);
    } catch (error) {
      hideTypingIndicator();
      addSystemMessage(`Error: ${error.message}`, 'error');
      console.error('[Runa] AI request failed:', error);
    } finally {
      isLoading = false;
      document.getElementById('runa-send').disabled = false;
    }
  }

  async function checkAndFetchRelevantData(message) {
    const lowerMsg = message.toLowerCase();
    
    // Keywords that suggest we need fresh data
    if (lowerMsg.includes('user') || lowerMsg.includes('nick') || lowerMsg.includes('who')) {
      const users = await fetchSpecificData('users');
      if (users && networkContext) {
        networkContext.users = Array.isArray(users) ? users : [];
        networkContext.userCount = networkContext.users.length;
      }
    }
    
    if (lowerMsg.includes('channel') || lowerMsg.includes('#')) {
      const channels = await fetchSpecificData('channels');
      if (channels && networkContext) {
        networkContext.channels = Array.isArray(channels) ? channels : [];
        networkContext.channelCount = networkContext.channels.length;
      }
    }
    
    if (lowerMsg.includes('ban') || lowerMsg.includes('gline') || lowerMsg.includes('kline') || lowerMsg.includes('zline')) {
      const bans = await fetchSpecificData('bans');
      if (bans && networkContext) {
        networkContext.bans = Array.isArray(bans) ? bans : [];
      }
    }
    
    if (lowerMsg.includes('spamfilter') || lowerMsg.includes('filter')) {
      const filters = await fetchSpecificData('spamfilters');
      if (filters && networkContext) {
        networkContext.spamfilters = Array.isArray(filters) ? filters : [];
      }
    }
    
    if (lowerMsg.includes('server') || lowerMsg.includes('topology') || lowerMsg.includes('link')) {
      const servers = await fetchSpecificData('servers');
      if (servers && networkContext) {
        networkContext.servers = Array.isArray(servers) ? servers : [];
      }
    }
  }

  // ========================================
  // Cleanup
  // ========================================

  function cleanup() {
    document.removeEventListener('keydown', handleKeyboardShortcut);
    
    if (containerElement) {
      containerElement.remove();
      containerElement = null;
    }
    
    if (fabElement) {
      fabElement.remove();
      fabElement = null;
    }

    console.log('[Runa] Plugin unloaded');
  }

  // ========================================
  // Initialization
  // ========================================

  function init() {
    console.log(`[${PLUGIN_NAME}] Initializing...`);
    
    loadConfig();
    loadHistory();
    createUI();

    // Restore conversation if exists
    if (conversationHistory.length > 0) {
      const messagesContainer = document.getElementById('runa-messages');
      const welcome = messagesContainer.querySelector('.runa-welcome');
      if (welcome) welcome.remove();

      conversationHistory.forEach(msg => {
        addMessage(msg.role, msg.content);
      });
    }

    console.log(`[${PLUGIN_NAME}] Initialized successfully!`);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging and cleanup
  window.Runa = {
    toggle: toggleChat,
    show: showChat,
    hide: hideChat,
    clearHistory: clearConversation,
    refreshContext: refreshContext,
    getConfig: () => ({ ...config }),
    cleanup: cleanup
  };

  // Register with UWP plugin system if available
  if (window.UWPPlugins) {
    window.UWPPlugins.register(PLUGIN_ID, { cleanup: cleanup });
  }

})();
