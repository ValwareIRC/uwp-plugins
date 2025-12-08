package emojitrail
// Emoji Trail Plugin for UnrealIRCd Web Panel
// Creates fun emoji fireworks when pressing the 'E' key

package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/unrealircd/unrealircd-webpanel/internal/hooks"
	"github.com/unrealircd/unrealircd-webpanel/internal/plugins"
)

// EmojiTrailPlugin implements the Plugin interface
type EmojiTrailPlugin struct {
	config Config
}

// Config holds plugin configuration
type Config struct {
	Enabled       bool   `json:"enabled"`
	TriggerKey    string `json:"trigger_key"`
	EmojiSet      string `json:"emoji_set"`
	ParticleCount int    `json:"particle_count"`
	BurstSize     int    `json:"burst_size"`
}

// NewPlugin creates a new instance of the plugin
func NewPlugin() plugins.Plugin {
	return &EmojiTrailPlugin{
		config: Config{
			Enabled:       true,
			TriggerKey:    "e",
			EmojiSet:      "party",





















































































































































































































































`})();  console.log('🎉 Emoji Trail loaded! Press E to see the magic!');  loadConfig();  // Initialize  }    }      console.log('Emoji Trail: Using default config');    } catch (err) {      }        };          burstSize: data.burst_size || 150          particleCount: data.particle_count || 12,          emojiSet: data.emoji_set || 'party',          triggerKey: data.trigger_key || 'e',        config = {        const data = await response.json();      if (response.ok) {      const response = await fetch('/api/plugin/emoji-trail/config');    try {  async function loadConfig() {  // Load configuration from plugin API  });    }      createBurst(mouseX, mouseY);            }        return;      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {      // Don't trigger if typing in an input    if (e.key.toLowerCase() === config.triggerKey.toLowerCase()) {    // Check if the key matches (case insensitive)  document.addEventListener('keydown', (e) => {  // Listen for key press  }    }      }, i * 20);        animateParticle(particle, angle, distance, 800 + Math.random() * 400);        const particle = createParticle(x, y, emoji);      setTimeout(() => {      // Stagger the creation slightly            const emoji = emojis[Math.floor(Math.random() * emojis.length)];      // Random emoji from set            const distance = burstSize * (0.5 + Math.random() * 0.5);      // Random distance            const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;      // Random angle for each particle (full circle)    for (let i = 0; i < count; i++) {        const burstSize = config.burstSize;    const count = config.particleCount;    const emojis = emojiSets[config.emojiSet] || emojiSets.party;  function createBurst(x, y) {  // Create burst of emoji  }    requestAnimationFrame(update);        }      }        particle.remove();      } else {        requestAnimationFrame(update);      if (progress < 1) {            particle.style.opacity = opacity;      particle.style.transform = \`translate(-50%, -50%) scale(\${scale}) rotate(\${rotation * progress}deg)\`;      particle.style.top = currentY + 'px';      particle.style.left = currentX + 'px';            const opacity = 1 - progress;      // Fade out            const scale = 1 - progress * 0.5;      // Scale down as it moves            const currentY = startY + (endY - startY) * eased + gravity;      const currentX = startX + (endX - startX) * eased;      const gravity = progress * progress * 100;      // Position with gravity effect            const eased = 1 - Math.pow(1 - progress, 3);      // Easing function (ease-out cubic)            const progress = Math.min(elapsed / duration, 1);      const elapsed = currentTime - startTime;    function update(currentTime) {        const rotation = (Math.random() - 0.5) * 720;    // Random rotation        const endY = startY + Math.sin(angle) * distance - 50; // Float up slightly    const endX = startX + Math.cos(angle) * distance;    // Random trajectory        const startY = parseFloat(particle.style.top);    const startX = parseFloat(particle.style.left);    const startTime = performance.now();  function animateParticle(particle, angle, distance, duration) {  // Animate particle  }    return particle;    document.body.appendChild(particle);        \`;      will-change: transform, opacity;      user-select: none;      transform: translate(-50%, -50%);      top: \${y}px;      left: \${x}px;      font-size: 24px;      z-index: 99999;      pointer-events: none;      position: fixed;    particle.style.cssText = \`    particle.textContent = emoji;    particle.className = 'emoji-trail-particle';    const particle = document.createElement('div');  function createParticle(x, y, emoji) {  // Create emoji particle  });    mouseY = e.clientY;    mouseX = e.clientX;  document.addEventListener('mousemove', (e) => {  let mouseY = 0;  let mouseX = 0;  // Track mouse position  };    burstSize: 150    particleCount: 12,    emojiSet: 'party',    triggerKey: 'e',  let config = {  // Plugin configuration (can be overridden)  };    random: ['🎉', '🌟', '❤️', '🦄', '🌈', '🔥', '💎', '🎸', '🚀', '🎨', '🎭', '🎪']    food: ['🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫'],    stars: ['⭐', '🌟', '✨', '💫', '🌠', '⚡', '🔥', '💥', '☄️', '🌙', '🌛', '🌜'],    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💝', '💗', '💓'],    nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🍃', '🦋', '🐝', '🌈', '☀️'],    party: ['🎉', '🎊', '🥳', '🎈', '🎁', '✨', '💫', '🌟', '⭐', '🎇', '🎆', '🪅'],  const emojiSets = {  // Emoji sets  'use strict';(function() {const emojiTrailScript = `// The actual JavaScript code for the emoji trail effect}	c.String(http.StatusOK, emojiTrailScript)	c.Header("Content-Type", "application/javascript")func (p *EmojiTrailPlugin) handleServeScript(c *gin.Context) {// handleServeScript serves the emoji trail JavaScript}	})		"config":  p.config,		"message": "Configuration updated",	c.JSON(http.StatusOK, gin.H{	p.config = newConfig	}		return		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid configuration"})	if err := c.ShouldBindJSON(&newConfig); err != nil {	var newConfig Configfunc (p *EmojiTrailPlugin) handleUpdateConfig(c *gin.Context) {// handleUpdateConfig updates the plugin configuration}	c.JSON(http.StatusOK, p.config)func (p *EmojiTrailPlugin) handleGetConfig(c *gin.Context) {// handleGetConfig returns the current configuration}	}		plugin.GET("/script.js", p.handleServeScript)		plugin.PUT("/config", p.handleUpdateConfig)		plugin.GET("/config", p.handleGetConfig)	{	plugin := router.Group("/plugin/emoji-trail")func (p *EmojiTrailPlugin) RegisterRoutes(router *gin.RouterGroup) {// RegisterRoutes adds API routes for this plugin}	return nilfunc (p *EmojiTrailPlugin) Shutdown() error {// Shutdown cleans up the plugin}	return nil	}, 999) // Low priority - load last		}			},				"burst_size":     p.config.BurstSize,				"particle_count": p.config.ParticleCount,				"emoji_set":      p.config.EmojiSet,				"trigger_key":    p.config.TriggerKey,			"config": map[string]interface{}{			"script":        "/api/plugin/emoji-trail/script.js",			"plugin":        "emoji-trail",		return map[string]interface{}{		// Return configuration for the frontend script		}			return nil		if !p.config.Enabled {	hm.Register(hooks.HookFooter, "emoji-trail-script", func(args interface{}) interface{} {	// Register the footer hook to inject our script	hm := hooks.GetManager()func (p *EmojiTrailPlugin) Init() error {// Init initializes the plugin}	}		License:     "MIT",		Homepage:    "https://github.com/ValwareIRC/uwp-plugins",		Description: "Delightful emoji fireworks when pressing E",		Email:       "plugins@valware.co.uk",		Author:      "ValwareIRC",		Version:     "1.0.0",		Name:        "Emoji Trail",	return plugins.PluginInfo{func (p *EmojiTrailPlugin) Info() plugins.PluginInfo {// Info returns plugin metadata}	}		},			BurstSize:     150,			ParticleCount: 12,