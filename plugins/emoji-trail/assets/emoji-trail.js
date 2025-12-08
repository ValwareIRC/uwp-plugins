/**
 * Emoji Trail Plugin for UnrealIRCd Web Panel
 * Creates delightful emoji fireworks when pressing the 'E' key
 * 
 * @version 1.0.0
 * @author ValwareIRC
 * @license MIT
 */
(function() {
  'use strict';

  // Emoji sets - different themes for variety
  const emojiSets = {
    party: ['🎉', '🎊', '🥳', '🎈', '🎁', '✨', '💫', '🌟', '⭐', '🎇', '🎆', '🪅'],
    nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🍃', '🦋', '🐝', '🌈', '☀️'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💝', '💗', '💓'],
    stars: ['⭐', '🌟', '✨', '💫', '🌠', '⚡', '🔥', '💥', '☄️', '🌙', '🌛', '🌜'],
    food: ['🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🎂', '🍰', '🧁', '🍭', '🍬', '🍫'],
    random: ['🎉', '🌟', '❤️', '🦄', '🌈', '🔥', '💎', '🎸', '🚀', '🎨', '🎭', '🎪']
  };

  // Configuration with defaults
  const config = {
    triggerKey: 'e',
    emojiSet: 'party',
    particleCount: 12,
    burstSize: 150,
    enabled: true
  };

  // Track mouse position
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Mouse tracking
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Create a single emoji particle element
  function createParticle(x, y, emoji) {
    const particle = document.createElement('div');
    particle.className = 'uwp-emoji-particle';
    particle.textContent = emoji;
    particle.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 999999;
      font-size: 24px;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
      user-select: none;
      will-change: transform, opacity;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(particle);
    return particle;
  }

  // Animate a particle with physics
  function animateParticle(particle, angle, distance, duration) {
    const startTime = performance.now();
    const startX = parseFloat(particle.style.left);
    const startY = parseFloat(particle.style.top);
    
    // Calculate end position
    const endX = startX + Math.cos(angle) * distance;
    const endY = startY + Math.sin(angle) * distance - 50; // Float up slightly
    
    // Random rotation for variety
    const rotation = (Math.random() - 0.5) * 720;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Add gravity effect
      const gravity = progress * progress * 100;
      const currentX = startX + (endX - startX) * eased;
      const currentY = startY + (endY - startY) * eased + gravity;
      
      // Scale down as it moves
      const scale = 1 - progress * 0.5;
      
      // Fade out
      const opacity = 1 - progress;
      
      particle.style.left = currentX + 'px';
      particle.style.top = currentY + 'px';
      particle.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation * progress}deg)`;
      particle.style.opacity = opacity;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        particle.remove();
      }
    }
    
    requestAnimationFrame(update);
  }

  // Create a burst of emoji at the given position
  function createBurst(x, y) {
    if (!config.enabled) return;

    const emojis = emojiSets[config.emojiSet] || emojiSets.party;
    const count = config.particleCount;
    const burstSize = config.burstSize;
    
    for (let i = 0; i < count; i++) {
      // Spread particles in a circle with some randomness
      const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
      
      // Vary the distance for natural look
      const distance = burstSize * (0.5 + Math.random() * 0.5);
      
      // Random emoji from the set
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Stagger particle creation for cascade effect
      setTimeout(function() {
        const particle = createParticle(x, y, emoji);
        animateParticle(particle, angle, distance, 800 + Math.random() * 400);
      }, i * 20);
    }
  }

  // Listen for key press
  document.addEventListener('keydown', function(e) {
    // Check if the key matches (case insensitive)
    if (e.key.toLowerCase() !== config.triggerKey.toLowerCase()) return;

    // Don't trigger if typing in an input field
    const target = e.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Create burst at mouse position
    createBurst(mouseX, mouseY);
  });

  // Expose API for configuration
  window.EmojiTrail = {
    setConfig: function(newConfig) {
      Object.assign(config, newConfig);
    },
    getConfig: function() {
      return { ...config };
    },
    setEmojiSet: function(setName) {
      if (emojiSets[setName]) {
        config.emojiSet = setName;
      }
    },
    trigger: function(x, y) {
      createBurst(x || mouseX, y || mouseY);
    },
    enable: function() {
      config.enabled = true;
    },
    disable: function() {
      config.enabled = false;
    }
  };

  // Log successful load
  console.log('🎉 Emoji Trail plugin loaded! Press "E" to see the magic!');
})();
