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

    burnSound.currentTime = 0;
    burnSound.play().catch(error => {
        console.error("Error playing sound:", error);
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
            if (mood === 'love') {
                createLoveParticles();
            }
            
            // Special handling for rage mode
            if (mood === 'anger' && !isRageMode) {
                rageButton.click(); // Activate rage mode
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