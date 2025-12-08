/**
 * Example Plugin Frontend Script
 * 
 * This demonstrates how plugins can add custom frontend functionality
 * to the UnrealIRCd WebPanel.
 */

(function() {
    'use strict';

    const PLUGIN_ID = 'example-plugin';
    const PLUGIN_NAME = 'Example Plugin';

    // Get plugin config (passed from PluginLoader)
    const getConfig = () => {
        return window.__PLUGIN_CONFIG?.[PLUGIN_ID] || {};
    };

    /**
     * ExamplePlugin class - demonstrates various plugin capabilities
     */
    class ExamplePlugin {
        constructor() {
            this.initialized = false;
            this.config = getConfig();
            this.observers = [];
            this.keyboardShortcut = 'p'; // Ctrl+Shift+P for plugin info
        }

        /**
         * Initialize the plugin
         */
        init() {
            if (this.initialized) return;

            console.log(`[${PLUGIN_NAME}] Initializing...`);

            // Add keyboard shortcut
            this.setupKeyboardShortcut();

            // Add custom styling
            this.injectStyles();

            // Watch for page navigation
            this.setupNavigationObserver();

            // Add plugin badge to indicate plugin is active
            this.showActiveBadge();

            this.initialized = true;
            console.log(`[${PLUGIN_NAME}] Initialized successfully`);
        }

        /**
         * Setup keyboard shortcut (Ctrl+Shift+P)
         */
        setupKeyboardShortcut() {
            this.keyboardHandler = (e) => {
                if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === this.keyboardShortcut) {
                    e.preventDefault();
                    this.showPluginInfo();
                }
            };

            document.addEventListener('keydown', this.keyboardHandler);
        }

        /**
         * Show plugin info modal
         */
        showPluginInfo() {
            // Remove existing modal if present
            const existing = document.getElementById('example-plugin-modal');
            if (existing) {
                existing.remove();
                return;
            }

            const modal = document.createElement('div');
            modal.id = 'example-plugin-modal';
            modal.className = 'example-plugin-modal';
            modal.innerHTML = `
                <div class="example-plugin-modal-content">
                    <div class="example-plugin-modal-header">
                        <h2>🔌 ${PLUGIN_NAME}</h2>
                        <button class="example-plugin-modal-close">&times;</button>
                    </div>
                    <div class="example-plugin-modal-body">
                        <p>This is an example plugin demonstrating the UnrealIRCd WebPanel plugin system.</p>
                        
                        <h3>Features Demonstrated:</h3>
                        <ul>
                            <li>✅ Backend hook integration</li>
                            <li>✅ Navigation items</li>
                            <li>✅ Dashboard cards</li>
                            <li>✅ Frontend JavaScript injection</li>
                            <li>✅ Custom CSS styling</li>
                            <li>✅ Keyboard shortcuts</li>
                            <li>✅ DOM observation</li>
                        </ul>

                        <h3>Keyboard Shortcut:</h3>
                        <p><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> - Toggle this info panel</p>

                        <h3>Plugin Config:</h3>
                        <pre>${JSON.stringify(this.config, null, 2) || 'No configuration'}</pre>
                    </div>
                    <div class="example-plugin-modal-footer">
                        <small>Example Plugin v1.0.0 by Valware</small>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Close handlers
            modal.querySelector('.example-plugin-modal-close').addEventListener('click', () => {
                modal.remove();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // Animate in
            requestAnimationFrame(() => {
                modal.classList.add('visible');
            });
        }

        /**
         * Inject custom styles
         */
        injectStyles() {
            const style = document.createElement('style');
            style.id = 'example-plugin-styles';
            style.textContent = `
                /* Example Plugin Modal */
                .example-plugin-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .example-plugin-modal.visible {
                    opacity: 1;
                }

                .example-plugin-modal-content {
                    background: var(--card-bg, #1e1e2e);
                    border: 1px solid var(--border-color, #313244);
                    border-radius: 12px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.9);
                    transition: transform 0.2s ease;
                }

                .example-plugin-modal.visible .example-plugin-modal-content {
                    transform: scale(1);
                }

                .example-plugin-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border-color, #313244);
                }

                .example-plugin-modal-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--text-primary, #cdd6f4);
                }

                .example-plugin-modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary, #a6adc8);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }

                .example-plugin-modal-close:hover {
                    color: var(--text-primary, #cdd6f4);
                }

                .example-plugin-modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    color: var(--text-secondary, #a6adc8);
                }

                .example-plugin-modal-body h3 {
                    margin: 1rem 0 0.5rem 0;
                    font-size: 1rem;
                    color: var(--text-primary, #cdd6f4);
                }

                .example-plugin-modal-body h3:first-child {
                    margin-top: 0;
                }

                .example-plugin-modal-body ul {
                    margin: 0;
                    padding-left: 1.5rem;
                }

                .example-plugin-modal-body li {
                    margin: 0.25rem 0;
                }

                .example-plugin-modal-body kbd {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    background: var(--bg-tertiary, #45475a);
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.85rem;
                    color: var(--text-primary, #cdd6f4);
                }

                .example-plugin-modal-body pre {
                    background: var(--bg-secondary, #181825);
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-size: 0.85rem;
                    margin: 0.5rem 0 0 0;
                }

                .example-plugin-modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--border-color, #313244);
                    text-align: center;
                    color: var(--text-tertiary, #6c7086);
                }

                /* Plugin Active Badge */
                .example-plugin-badge {
                    position: fixed;
                    bottom: 1rem;
                    right: 1rem;
                    background: linear-gradient(135deg, #89b4fa, #b4befe);
                    color: #1e1e2e;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .example-plugin-badge:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
                }

                .example-plugin-badge-dot {
                    width: 8px;
                    height: 8px;
                    background: #a6e3a1;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;

            document.head.appendChild(style);
        }

        /**
         * Show active badge
         */
        showActiveBadge() {
            const badge = document.createElement('div');
            badge.id = 'example-plugin-badge';
            badge.className = 'example-plugin-badge';
            badge.innerHTML = `
                <span class="example-plugin-badge-dot"></span>
                <span>Example Plugin Active</span>
            `;

            badge.addEventListener('click', () => this.showPluginInfo());

            document.body.appendChild(badge);
        }

        /**
         * Watch for navigation changes
         */
        setupNavigationObserver() {
            // Use MutationObserver to detect page changes
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length) {
                        this.onPageChange();
                    }
                }
            });

            // Observe the main content area
            const observeMainContent = () => {
                const main = document.querySelector('main') || document.querySelector('#root');
                if (main) {
                    observer.observe(main, { childList: true, subtree: true });
                    this.observers.push(observer);
                } else {
                    // Retry after DOM is ready
                    setTimeout(observeMainContent, 100);
                }
            };

            observeMainContent();
        }

        /**
         * Called when page changes
         */
        onPageChange() {
            // Example: Log page changes
            // console.log(`[${PLUGIN_NAME}] Page changed:`, window.location.pathname);
        }

        /**
         * Cleanup when plugin is unloaded
         */
        destroy() {
            console.log(`[${PLUGIN_NAME}] Destroying...`);

            // Remove keyboard handler
            if (this.keyboardHandler) {
                document.removeEventListener('keydown', this.keyboardHandler);
            }

            // Disconnect observers
            this.observers.forEach(obs => obs.disconnect());

            // Remove injected elements
            const elementsToRemove = [
                '#example-plugin-styles',
                '#example-plugin-modal',
                '#example-plugin-badge'
            ];

            elementsToRemove.forEach(selector => {
                const el = document.querySelector(selector);
                if (el) el.remove();
            });

            this.initialized = false;
            console.log(`[${PLUGIN_NAME}] Destroyed`);
        }
    }

    // Create and initialize plugin
    const plugin = new ExamplePlugin();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => plugin.init());
    } else {
        plugin.init();
    }

    // Expose for debugging and cleanup
    window.__ExamplePlugin = plugin;

})();
