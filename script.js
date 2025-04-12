// Get references to the HTML elements we need
const letterText = document.getElementById('letter-text');
const burnButton = document.getElementById('burn-button');
const burnSound = document.getElementById('burn-sound');
const themeButton = document.getElementById('theme-button');
const modal = document.getElementById('modal');
const cancelBurn = document.getElementById('cancel-burn');
const confirmBurn = document.getElementById('confirm-burn');
const wordCount = document.getElementById('word-count');
const wordCountProgress = document.getElementById('word-count-progress');
const MAX_WORDS = 500; // Maximum word limit

// Add these constants with your other constants at the top
const fontSelector = document.getElementById('font-selector');
const fontSize = document.getElementById('font-size');

// Add to your constants at the top
const rageButton = document.getElementById('rage-button');
let isRageMode = false;

// Add to your constants at the top
const burnEffect = document.getElementById('burn-effect');
let currentBurnEffect = 'classic';

// Add to your constants at the top
const MOOD_THRESHOLD = 3; // Number of mood words needed to trigger change
const moodPatterns = {
    anger: {
        words: ['hate', 'angry', 'mad', 'fury', 'rage', 'fuck', 'damn', 'annoyed', 'furious', 'sick of'],
        effect: 'spiral',
        theme: 'rage'
    },
    love: {
        words: ['love', 'heart', 'miss', 'darling', 'dear', 'beloved', 'sweetheart', 'cherish', 'adore', 'forever'],
        effect: 'fade',
        theme: 'love'
    },
    sadness: {
        words: ['sad', 'sorry', 'regret', 'miss', 'crying', 'tears', 'heartbroken', 'alone', 'lonely', 'goodbye'],
        effect: 'blue',
        theme: 'sad'
    }
};

// Add to your constants at the top
const saveButton = document.getElementById('save-button');
const saveModal = document.getElementById('save-modal');
const cancelSave = document.getElementById('cancel-save');
const confirmSave = document.getElementById('confirm-save');

// Add to your constants at the top
const whyButton = document.getElementById('why-button');
const infoModal = document.getElementById('info-modal');
const closeInfo = document.getElementById('close-info');

// Add to your constants at the top
const romanticMusic = document.getElementById('romantic-music');
const stopMusicButton = document.getElementById('stop-music');
let isMusicPlaying = false;

// Add a new flag to track if music was manually stopped
let musicManuallyPaused = false;

// Add to your constants at the top
const rageMusic = document.getElementById('rage-music');
let currentMusicMode = null; // 'love' or 'rage'

// Add to your constants at the top
const fireplaceSound = document.getElementById('fireplace-sound');
const fireplaceToggle = document.getElementById('fireplace-toggle');
let isFireplacePlaying = false;

// Theme switching functionality
let currentTheme = 'dark';

themeButton.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
});

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Load saved font preferences
    const savedFont = localStorage.getItem('selectedFont');
    const savedSize = localStorage.getItem('selectedSize');
    
    if (savedFont) {
        letterText.style.fontFamily = savedFont;
        fontSelector.value = savedFont;
    }
    
    if (savedSize) {
        letterText.style.fontSize = `${savedSize}px`;
        fontSize.value = savedSize;
    }
    
    updateWordCount();

    const savedBurnEffect = localStorage.getItem('selectedBurnEffect');
    if (savedBurnEffect) {
        currentBurnEffect = savedBurnEffect;
        burnEffect.value = savedBurnEffect;
    }

    const savedFireplaceState = localStorage.getItem('fireplaceOn') === 'true';
    if (savedFireplaceState) {
        fireplaceToggle.click();
    }
});

// --- Event Listener for the Button Click ---
burnButton.addEventListener('click', () => {
    if (!letterText.value.trim()) return;
    modal.classList.add('show');
});

// Cancel button handler
cancelBurn.addEventListener('click', () => {
    modal.classList.remove('show');
});

// Confirm button handler
confirmBurn.addEventListener('click', () => {
    modal.classList.remove('show');
    
    if (letterText.value.trim() === '') return;

    // Play burn sound
    burnSound.currentTime = 0; // Reset sound to start
    burnSound.volume = 0.5; // Set appropriate volume
    burnSound.play().catch(error => {
        console.error("Error playing burn sound:", error);
    });

    // Apply the selected burn effect
    const effectClass = `burning-${currentBurnEffect}`;
    letterText.classList.add(effectClass);
    createEmbers(letterText);
    burnButton.disabled = true;

    // Clear text and reset after animation
    setTimeout(() => {
        // Reset text and burn effect
        letterText.value = '';
        letterText.classList.remove(effectClass);
        burnButton.disabled = false;
        
        // Reset theme to default
        document.documentElement.setAttribute('data-mode', 'normal');
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Reset burn effect to classic
        currentBurnEffect = 'classic';
        burnEffect.value = 'classic';
        
        // Reset rage mode if active
        if (isRageMode) {
            isRageMode = false;
            rageButton.textContent = 'RAGE MODE 🔥';
            letterText.style.color = 'var(--textarea-color)';
            letterText.removeEventListener('input', addRageShake);
        }
        
        // Reset word count
        updateWordCount();
    }, 1500);

    // Reset all music-related flags and stop any playing music
    stopCurrentMusic();
    musicManuallyPaused = false;
    stopMusicButton.style.display = 'none';
});

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Add keyboard support (Esc to cancel)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        modal.classList.remove('show');
    }
});

// Optional: Add a simple shake animation if you uncomment the code in step 1
/*
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
*/
// If you use the shake, add this rule to your CSS:
// textarea { /* ... existing styles ... */ animation: none; }
// textarea.shake { animation: shake 0.3s; }

// Add this function after your existing code
function createEmbers(sourceElement) {
    const rect = sourceElement.getBoundingClientRect();
    const emberCount = 30;
    const ashCount = 20;
    
    // Create embers with selected effect
    for (let i = 0; i < emberCount; i++) {
        const ember = document.createElement('div');
        ember.className = `ember ${currentBurnEffect}`;
        
        // Random properties
        const size = 2 + Math.random() * 4;
        const xOffset = -50 + Math.random() * 100;
        const rotation = -180 + Math.random() * 360;
        const duration = 0.8 + Math.random() * 1.2;
        const delay = Math.random() * 0.3;
        
        // Position and style
        ember.style.setProperty('--size', `${size}px`);
        ember.style.setProperty('--x-offset', `${xOffset}px`);
        ember.style.setProperty('--rotation', `${rotation}deg`);
        
        ember.style.left = `${rect.left + Math.random() * rect.width}px`;
        ember.style.top = `${rect.bottom - 10}px`;
        
        // Modify animation based on effect
        switch(currentBurnEffect) {
            case 'blue':
                ember.style.animation = `ember-float ${duration * 1.2}s ease-in ${delay}s`;
                break;
            case 'spiral':
                ember.style.animation = `ember-float ${duration}s cubic-bezier(.4,0,.2,1) ${delay}s`;
                break;
            case 'fade':
                ember.style.animation = `ember-float ${duration * 1.5}s ease-out ${delay}s`;
                break;
            default:
                ember.style.animation = `ember-float ${duration}s ease-out ${delay}s`;
        }
        
        document.body.appendChild(ember);
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(ember);
        }, (duration + delay) * 1000);
    }
    
    // Create ash particles
    for (let i = 0; i < ashCount; i++) {
        const ash = document.createElement('div');
        ash.className = 'ash';
        
        const size = 1 + Math.random() * 2;
        const xOffset = -30 + Math.random() * 60;
        const duration = 1.5 + Math.random() * 1;
        const delay = Math.random() * 0.5;
        
        ash.style.setProperty('--size', `${size}px`);
        ash.style.setProperty('--x-offset', `${xOffset}px`);
        
        ash.style.left = `${rect.left + Math.random() * rect.width}px`;
        ash.style.top = `${rect.top + Math.random() * rect.height}px`;
        ash.style.animation = `ash-fall ${duration}s ease-in ${delay}s`;
        
        document.body.appendChild(ash);
        
        setTimeout(() => {
            document.body.removeChild(ash);
        }, (duration + delay) * 1000);
    }
}

// Add this function after your existing code
function updateWordCount() {
    const text = letterText.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const percentage = Math.min((words / MAX_WORDS) * 100, 100);
    
    wordCount.textContent = words;
    wordCountProgress.style.width = `${percentage}%`;
    
    // Change progress bar color based on word count
    if (percentage >= 90) {
        wordCountProgress.style.backgroundColor = '#d64545';
    } else if (percentage >= 70) {
        wordCountProgress.style.backgroundColor = '#ffa500';
    } else {
        wordCountProgress.style.backgroundColor = 'var(--button-bg)';
    }
}

// Add the input event listener
letterText.addEventListener('input', updateWordCount);

// Add the font control handlers
fontSelector.addEventListener('change', () => {
    letterText.style.fontFamily = fontSelector.value;
    localStorage.setItem('selectedFont', fontSelector.value);
});

fontSize.addEventListener('change', () => {
    letterText.style.fontSize = `${fontSize.value}px`;
    localStorage.setItem('selectedSize', fontSize.value);
});

// Add rage mode toggle functionality
rageButton.addEventListener('click', () => {
    isRageMode = !isRageMode;
    document.documentElement.setAttribute('data-mode', isRageMode ? 'rage' : 'normal');
    rageButton.textContent = isRageMode ? 'CALM DOWN 😌' : 'RAGE MODE 🔥';
    
    if (isRageMode) {
        letterText.style.color = '#ff3333';
        letterText.addEventListener('input', addRageShake);
    } else {
        letterText.style.color = 'var(--textarea-color)';
        letterText.removeEventListener('input', addRageShake);
    }
});

// Modify the rage shake effect function
function addRageShake() {
    const text = letterText.value;
    const words = text.split(' ');
    
    // Create a container for the shaking text
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    
    // Create animated spans for each word
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.animation = `text-rage 0.${Math.floor(Math.random() * 3) + 2}s infinite`;
        span.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(span);
    });
    
    // Create angry particles occasionally
    if (Math.random() > 0.8) {
        createAngryParticle();
    }
}

// Update createAngryParticle for more subtle effects
function createAngryParticle() {
    const symbols = ['💢', '😠', '💥', '🔥'];
    const particle = document.createElement('div');
    particle.className = 'rage-particle';
    particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    
    const rect = letterText.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.opacity = '0.7';
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        document.body.removeChild(particle);
    }, 1000);
}

// Add CSS for rage particles
const style = document.createElement('style');
style.textContent = `
    .rage-particle {
        position: fixed;
        font-size: 20px;
        pointer-events: none;
        animation: float-up 1s ease-out forwards;
        z-index: 1000;
    }
    
    @keyframes float-up {
        0% { transform: translateY(0) scale(0); opacity: 1; }
        100% { transform: translateY(-50px) scale(1.5); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Add burn effect handler
burnEffect.addEventListener('change', () => {
    currentBurnEffect = burnEffect.value;
    localStorage.setItem('selectedBurnEffect', currentBurnEffect);
});

// Add the mood analysis function
function analyzeMood(text) {
    const words = text.toLowerCase().split(/\s+/);
    const moodCounts = {};
    
    // Count mood-specific words
    Object.keys(moodPatterns).forEach(mood => {
        moodCounts[mood] = words.filter(word => 
            moodPatterns[mood].words.some(moodWord => word.includes(moodWord))
        ).length;
    });
    
    // Find the dominant mood
    const dominantMood = Object.entries(moodCounts)
        .filter(([_, count]) => count >= MOOD_THRESHOLD)
        .sort(([_, a], [__, b]) => b - a)[0];
    
    return dominantMood ? dominantMood[0] : null;
}

let lastMoodCheck = 0;
const MOOD_CHECK_INTERVAL = 1000; // Check every second

letterText.addEventListener('input', () => {
    updateWordCount();
    
    // Don't check mood too frequently
    if (Date.now() - lastMoodCheck < MOOD_CHECK_INTERVAL) return;
    lastMoodCheck = Date.now();
    
    const words = letterText.value.trim().split(/\s+/);
    if (words.length >= 20) {
        const mood = analyzeMood(letterText.value);
        if (mood) {
            // Apply mood-specific changes
            const moodPattern = moodPatterns[mood];
            
            // Change theme
            document.documentElement.setAttribute('data-mode', moodPattern.theme);
            
            // Change burn effect
            currentBurnEffect = moodPattern.effect;
            burnEffect.value = moodPattern.effect;
            
            // Special handling for love theme
            if (mood === 'love' && words.length >= 40 && !isMusicPlaying && !musicManuallyPaused) {
                stopCurrentMusic();
                romanticMusic.volume = 0.5;
                romanticMusic.play().then(() => {
                    stopMusicButton.style.display = 'block';
                    isMusicPlaying = true;
                    currentMusicMode = 'love';
                    updateMusicButton();
                }).catch(error => {
                    console.error("Error playing romantic music:", error);
                });
            } 
            // Special handling for rage theme music
            else if (mood === 'anger' && words.length >= 30 && !isMusicPlaying && !musicManuallyPaused) {
                stopCurrentMusic();
                rageMusic.volume = 0.4; // Slightly lower volume for rage music
                rageMusic.play().then(() => {
                    stopMusicButton.style.display = 'block';
                    isMusicPlaying = true;
                    currentMusicMode = 'rage';
                    updateMusicButton();
                    rageButton.click();
                }).catch(error => {
                    console.error("Error playing rage music:", error);
                });
            }
            // Handle other moods
            else if (mood !== 'love' && mood !== 'anger') {
                stopCurrentMusic();
            }
        }
    }
});

// Add love particles effect
function createLoveParticles() {
    if (document.documentElement.getAttribute('data-mode') !== 'love') return;
    
    const hearts = ['❤️', '💖', '💝', '💕', '💗'];
    const particle = document.createElement('div');
    particle.className = 'love-particle';
    particle.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    
    const rect = letterText.getBoundingClientRect();
    particle.style.left = `${rect.left + Math.random() * rect.width}px`;
    particle.style.top = `${rect.bottom}px`;
    
    document.body.appendChild(particle);
    setTimeout(() => document.body.removeChild(particle), 3000);
}

// Add periodic love particles for love theme
setInterval(() => {
    if (document.documentElement.getAttribute('data-mode') === 'love') {
        if (Math.random() > 0.7) createLoveParticles();
    }
}, 500);

// Add save button functionality
saveButton.addEventListener('click', () => {
    if (!letterText.value.trim()) return;
    saveModal.classList.add('show');
});

// Cancel save handler
cancelSave.addEventListener('click', () => {
    saveModal.classList.remove('show');
});

// Confirm save handler
confirmSave.addEventListener('click', () => {
    const text = letterText.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toLocaleString().replace(/[/:]/g, '-');
    
    a.href = url;
    a.download = `saved-letter-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    saveModal.classList.remove('show');
});

// Close save modal when clicking outside
saveModal.addEventListener('click', (e) => {
    if (e.target === saveModal) {
        saveModal.classList.remove('show');
    }
});

// Add keyboard support for save modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && saveModal.classList.contains('show')) {
        saveModal.classList.remove('show');
    }
});

// Add info modal handlers
whyButton.addEventListener('click', () => {
    infoModal.classList.add('show');
});

closeInfo.addEventListener('click', () => {
    infoModal.classList.remove('show');
});

// Close info modal when clicking outside
infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.classList.remove('show');
    }
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && infoModal.classList.contains('show')) {
        infoModal.classList.remove('show');
    }
});

// Add music control handlers
stopMusicButton.addEventListener('click', () => {
    if (currentMusicMode === 'love') {
        romanticMusic.pause();
        romanticMusic.currentTime = 0;
    } else if (currentMusicMode === 'rage') {
        rageMusic.pause();
        rageMusic.currentTime = 0;
    }
    stopMusicButton.style.display = 'none';
    isMusicPlaying = false;
    musicManuallyPaused = true;
});

// Add helper function to stop current music
function stopCurrentMusic() {
    if (currentMusicMode === 'love') {
        romanticMusic.pause();
        romanticMusic.currentTime = 0;
    } else if (currentMusicMode === 'rage') {
        rageMusic.pause();
        rageMusic.currentTime = 0;
    }
    isMusicPlaying = false;
    currentMusicMode = null;
}

// Add helper function to update music button appearance
function updateMusicButton() {
    if (currentMusicMode === 'love') {
        stopMusicButton.textContent = 'Stop Love Music 💝';
    } else if (currentMusicMode === 'rage') {
        stopMusicButton.textContent = 'Stop Rage Music 😠';
    }
}

// Modify the existing input event listener for mood detection
letterText.addEventListener('input', () => {
    updateWordCount();
    
    // Don't check mood too frequently
    if (Date.now() - lastMoodCheck < MOOD_CHECK_INTERVAL) return;
    lastMoodCheck = Date.now();
    
    const words = letterText.value.trim().split(/\s+/);
    if (words.length >= 20) {
        const mood = analyzeMood(letterText.value);
        if (mood) {
            // Apply mood-specific changes
            const moodPattern = moodPatterns[mood];
            
            // Change theme
            document.documentElement.setAttribute('data-mode', moodPattern.theme);
            
            // Change burn effect
            currentBurnEffect = moodPattern.effect;
            burnEffect.value = moodPattern.effect;
            
            // Special handling for love theme
            if (mood === 'love' && words.length >= 40 && !isMusicPlaying && !musicManuallyPaused) {
                romanticMusic.volume = 0.5; // Set a comfortable volume
                romanticMusic.play().then(() => {
                    stopMusicButton.style.display = 'block';
                    isMusicPlaying = true;
                }).catch(error => {
                    console.error("Error playing music:", error);
                });
            }
            
            // Special handling for rage mode
            if (mood === 'anger' && !isRageMode) {
                rageButton.click();
            }
        }
    }
});

// Add cleanup for theme changes
document.addEventListener('themechange', () => {
    if (isMusicPlaying && document.documentElement.getAttribute('data-mode') !== 'love') {
        romanticMusic.pause();
        romanticMusic.currentTime = 0;
        stopMusicButton.style.display = 'none';
        isMusicPlaying = false;
    }
});

// Add fireplace sound handler
fireplaceToggle.addEventListener('click', () => {
    if (!isFireplacePlaying) {
        fireplaceSound.volume = 0.3; // Set a comfortable volume
        fireplaceSound.play().then(() => {
            isFireplacePlaying = true;
            fireplaceToggle.classList.add('active');
            // Start particle generation
            startFireplaceParticles();
        }).catch(error => {
            console.error("Error playing fireplace sound:", error);
        });
    } else {
        fireplaceSound.pause();
        isFireplacePlaying = false;
        fireplaceToggle.classList.remove('active');
        // Stop particle generation
        stopFireplaceParticles();
    }
});

let fireplaceParticleInterval;

function startFireplaceParticles() {
    // Create initial batch of particles
    for(let i = 0; i < 10; i++) {
        setTimeout(() => createFireplaceParticles(), i * 100);
    }
    
    // Continue creating particles at interval
    fireplaceParticleInterval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance to create particle
            createFireplaceParticles();
        }
    }, 200);
}

function stopFireplaceParticles() {
    clearInterval(fireplaceParticleInterval);
}

// Add after your fireplace toggle code
function createFireplaceParticles() {
    if (!isFireplacePlaying) return;

    const particle = document.createElement('div');
    particle.className = 'fireplace-particle';
    
    // Random properties
    const size = 2 + Math.random() * 3;
    const xDrift = -50 + Math.random() * 100;
    const startX = Math.random() * window.innerWidth;
    const duration = 3 + Math.random() * 2;
    
    // Set particle properties
    particle.style.setProperty('--size', `${size}px`);
    particle.style.setProperty('--x-drift', `${xDrift}px`);
    particle.style.left = `${startX}px`;
    particle.style.bottom = '0px';
    particle.style.animation = `firefly ${duration}s ease-out forwards`;
    
    document.body.appendChild(particle);
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(particle);
    }, duration * 1000);
}

// Add cleanup when leaving the page
window.addEventListener('beforeunload', () => {
    if (isFireplacePlaying) {
        fireplaceSound.pause();
        stopFireplaceParticles();
    }
});

// Save fireplace state in localStorage
function saveFireplaceState() {
    localStorage.setItem('fireplaceOn', isFireplacePlaying);
}