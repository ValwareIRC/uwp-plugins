package exampleplugin
// Example Plugin for UnrealIRCd Web Panel
// This plugin demonstrates how to extend the panel with:
// - Custom navigation items
// - Dashboard cards
// - API endpoints
// - Hook callbacks

package main

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/unrealircd/unrealircd-webpanel/internal/hooks"
	"github.com/unrealircd/unrealircd-webpanel/internal/plugins"
)

// ExamplePlugin implements the Plugin interface
type ExamplePlugin struct {
	config     Config
	startTime  time.Time
	actionLog  []ActionLogEntry
	mu         sync.RWMutex
}

// Config holds plugin configuration
type Config struct {
	WelcomeMessage string `json:"welcome_message"`
	ShowUserCount  bool   `json:"show_user_count"`
	CardColor      string `json:"card_color"`
}

// ActionLogEntry records actions taken through the plugin
type ActionLogEntry struct {
	Timestamp time.Time `json:"timestamp"`


































































































































































































}	return json.Unmarshal(data, &p.config)	defer p.mu.Unlock()	p.mu.Lock()func (p *ExamplePlugin) UnmarshalConfig(data []byte) error {// UnmarshalConfig loads configuration from JSON}	return json.Marshal(p.config)	defer p.mu.RUnlock()	p.mu.RLock()func (p *ExamplePlugin) MarshalConfig() ([]byte, error) {// MarshalConfig returns the current configuration as JSON}	})		"config":  newConfig,		"message": "Configuration updated",	c.JSON(http.StatusOK, gin.H{	p.mu.Unlock()	p.config = newConfig	p.mu.Lock()	}		return		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid configuration"})	if err := c.ShouldBindJSON(&newConfig); err != nil {	var newConfig Configfunc (p *ExamplePlugin) handleUpdateConfig(c *gin.Context) {// handleUpdateConfig updates plugin configuration}	})		"count":   len(p.actionLog),		"entries": p.actionLog,	c.JSON(http.StatusOK, gin.H{	defer p.mu.RUnlock()	p.mu.RLock()func (p *ExamplePlugin) handleGetLog(c *gin.Context) {// handleGetLog returns the action log}	})		"action":  req.Action,		"message": "Action recorded successfully",	c.JSON(http.StatusOK, gin.H{	p.mu.Unlock()	})		User:      "demo-user", // Would come from auth context		Action:    req.Action,		Timestamp: time.Now(),	p.actionLog = append(p.actionLog, ActionLogEntry{	p.mu.Lock()	}		return		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})	if err := c.ShouldBindJSON(&req); err != nil {	}		Action string `json:"action"`	var req struct {func (p *ExamplePlugin) handleAction(c *gin.Context) {// handleAction processes an example action}	})		},			"Configuration Management",			"Hook Callbacks",			"API Endpoints",			"Dashboard Cards",			"Custom Navigation Items",		"features": []string{		"action_count":    len(p.actionLog),		"card_color":      p.config.CardColor,		"show_user_count": p.config.ShowUserCount,		"welcome_message": p.config.WelcomeMessage,		"uptime":          time.Since(p.startTime).String(),		"version":         "1.0.0",		"plugin_name":     "Example Plugin",	c.JSON(http.StatusOK, gin.H{	defer p.mu.RUnlock()	p.mu.RLock()func (p *ExamplePlugin) handleGetData(c *gin.Context) {// handleGetData returns plugin data}	}		plugin.PUT("/config", p.handleUpdateConfig)		plugin.GET("/log", p.handleGetLog)		plugin.POST("/action", p.handleAction)		plugin.GET("/data", p.handleGetData)	{	plugin := router.Group("/plugin/example")func (p *ExamplePlugin) RegisterRoutes(router *gin.RouterGroup) {// RegisterRoutes adds API routes for this plugin}	return nil	// Unregister hooks would happen here if neededfunc (p *ExamplePlugin) Shutdown() error {// Shutdown cleans up the plugin}	return nil	}, 50)		}			"lookup_time":         time.Now().Format(time.RFC3339),			"example_plugin_note": "User viewed via Example Plugin hooks",		return map[string]interface{}{		// For demo purposes, just return some example data		// This would add extra data to user lookups	hm.Register(hooks.HookUserLookup, "example-plugin-user-enrichment", func(args interface{}) interface{} {	// Hook into user lookups (demonstrates data enrichment)	}, 100)		}			"link": "/plugin/example",			"text": "Example Plugin v1.0.0 loaded",		return map[string]string{	hm.Register(hooks.HookFooter, "example-plugin-footer", func(args interface{}) interface{} {	// Add footer hook (demonstrates modifying page content)	}, 50)		}			Size:  "md",			Order: 50,			},				"color":        p.config.CardColor,				"action_count": len(p.actionLog),				"uptime":       uptime,				"message":      p.config.WelcomeMessage,			Content: map[string]interface{}{			Icon:  "puzzle",			Title: "Example Plugin",		return plugins.DashboardCard{				uptime := time.Since(p.startTime).Round(time.Second).String()		defer p.mu.RUnlock()		p.mu.RLock()	hm.Register(hooks.HookOverviewCard, "example-plugin-card", func(args interface{}) interface{} {	// Add dashboard card	}, 50)		}			Order: 100,			Path:  "/plugin/example",			Icon:  "puzzle",			Label: "Example Page",		return plugins.NavItem{	hm.Register(hooks.HookNavbar, "example-plugin-nav", func(args interface{}) interface{} {	// Add navigation item	hm := hooks.GetManager()	// Register hooksfunc (p *ExamplePlugin) Init() error {// Init initializes the plugin}	}		License:     "MIT",		Homepage:    "https://github.com/ValwareIRC/uwp-plugins",		Description: "A demonstration plugin for extending the UnrealIRCd Web Panel",		Email:       "plugins@valware.co.uk",		Author:      "ValwareIRC",		Version:     "1.0.0",		Name:        "Example Plugin",	return plugins.PluginInfo{func (p *ExamplePlugin) Info() plugins.PluginInfo {// Info returns plugin metadata}	}		actionLog: make([]ActionLogEntry, 0),		startTime: time.Now(),		},			CardColor:      "purple",			ShowUserCount:  true,			WelcomeMessage: "Hello from the Example Plugin!",		config: Config{	return &ExamplePlugin{func NewPlugin() plugins.Plugin {// NewPlugin creates a new instance of the plugin}	User      string    `json:"user"`	Action    string    `json:"action"`