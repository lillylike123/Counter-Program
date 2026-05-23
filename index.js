let count = parseInt(localStorage.getItem("savedCount")) || 0;

const decreaseBtn = document.getElementById("decreaseBtn");
const resetBtn = document.getElementById("resetBtn");
const increaseBtn = document.getElementById("increaseBtn");
const countLabel = document.getElementById("countLabel");
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d")
const themeSelect = document.getElementById("themeSelect");

countLabel.textContent = count;

let particles = [];
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 4;
        this.speedX = Math.random() * 6 -3;
        this.speedY = Math.random() * -6 - 2;
        const colors = document.body.className === 'cyberpunk' ? ['#ff007f', '#00ffcc'] : 'cyberpunk' ? ['#f787db', '#db90ee'] : ['#007bff', '#6c757d', '#ffc107'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.gravity = 0.15;
        this.alpha = 1;
    }
    update() {
        this.x += this.speedX;
        this.speedY += this.gravity;
        this.y += this.speedY;
        this.alpha -= 0.015;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}

function triggerMilestoneEffect() {
    const rect = countLabel.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(startX, startY));
    }

}
animateParticles();

function playSound(type) {
    const audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

if (type === 'increase') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // Slide up
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'decrease') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(330, audioCtx.currentTime); // E4 note
        oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.1); // Slide down
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'reset') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
    }
}


function updateCounter(newValue, actionType) {
    const oldValue = count;
    count = newValue;
    countLabel.textContent = count;
    localStorage.setItem("savedCount", count);
    playSound(actionType);

    
    if (count !== 0 && count % 10 === 0 && count > oldValue) {
        triggerMilestoneEffect();
    }
}


increaseBtn.onclick = () => updateCounter(count + 1, 'increase');
decreaseBtn.onclick = () => updateCounter(count - 1, 'decrease');
resetBtn.onclick = () => updateCounter(0, 'reset');

themeSelect.onchange = () => {
    document.body.className = themeSelect.value;
    localStorage.setItem("savedTheme", themeSelect.value);
};

// Auto-load theme preference on system boot
const savedTheme = localStorage.getItem("savedTheme") || "light";
themeSelect.value = savedTheme;
document.body.className = savedTheme;

// Accessibility Keyboard Listeners
window.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === 'ArrowUp') {
        increaseBtn.click();
    } else if (e.key === '-' || e.key === 'ArrowDown') {
        decreaseBtn.click();
    } else if (e.key.toLowerCase() === 'r' || e.key === ' ') {
        e.preventDefault(); 
        resetBtn.click();
    }
});