// --- Global variable to prevent errors if the canvas doesn't exist ---
const canvas = document.getElementById('canvas');

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

// Reduced animation complexity for mobile devices
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Animation Handle ---
let animationId;

// --- Main execution block for the canvas animation ---
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0, mouseY = 0;
    let time = 0;
    let networkPoints = [];
    
    const pointCount = isMobile ? 12 : 18;

    function initNetworkPoints() {
        networkPoints = [];
        for (let i = 0; i < pointCount; i++) {
            networkPoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                angle: Math.random() * Math.PI * 2,
                radius: isMobile ? 20 + Math.random() * 60 : 30 + Math.random() * 80,
                speed: (isMobile ? 0.0005 : 0.001) + Math.random() * (isMobile ? 0.001 : 0.002)
            });
        }
    }

    function updateNetworkPoints() {
        const timeMultiplier = isMobile ? 0.5 : 1;
        
        networkPoints.forEach((point, index) => {
            point.angle += point.speed + Math.sin(time * 0.001 * timeMultiplier + index) * 0.002;
            point.baseX += Math.sin(time * 0.0005 * timeMultiplier + index) * 0.3;
            point.baseY += Math.cos(time * 0.0007 * timeMultiplier + index) * 0.3;
            
            const secondaryX = Math.cos(time * 0.0004 * timeMultiplier + index * 1.5) * (isMobile ? 20 : 30);
            const secondaryY = Math.sin(time * 0.0006 * timeMultiplier + index * 1.5) * (isMobile ? 20 : 30);
            
            point.x = point.baseX + Math.cos(point.angle) * point.radius + secondaryX;
            point.y = point.baseY + Math.sin(point.angle) * point.radius + secondaryY;

            if (point.baseX < -100) point.baseX = width + 100;
            if (point.baseX > width + 100) point.baseX = -100;
            if (point.baseY < -100) point.baseY = height + 100;
            if (point.baseY > height + 100) point.baseY = -100;
        });
    }

    function drawNetworkEffect() {
        if (!networkPoints.length) return;
        ctx.lineCap = 'round';
        const maxConnections = isMobile ? 4 : 6;
        
        const mouseConnections = networkPoints
            .map(point => ({
                point,
                distance: Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, maxConnections);

        mouseConnections.forEach(({ point, distance }) => {
            const maxDistance = isMobile ? 500 : 700;
            const opacity = Math.max(0.3, 1 - (distance / maxDistance));
            ctx.strokeStyle = `rgba(66, 153, 225, ${opacity * 0.8})`;
            ctx.lineWidth = isMobile ? 1 : 1.5;
            
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
            ctx.fillStyle = `rgba(66, 153, 225, ${opacity * 0.9})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, isMobile ? 2 : 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.fillStyle = 'rgba(66, 153, 225, 0.95)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, isMobile ? 3 : 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        updateNetworkPoints();
        drawNetworkEffect();
    }

    function animate() {
        time++;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNetworkPoints();
    }

    let resizeTimeout;
    function debouncedResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 250);
    }

    window.addEventListener('resize', debouncedResize);
    
    function updateMousePosition(x, y) {
        mouseX = x;
        mouseY = y;
    }

    document.addEventListener('mousemove', (e) => {
        if (!isMobile) {
            updateMousePosition(e.clientX, e.clientY);
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    if (isMobile) {
        setTimeout(() => {
            mouseX = window.innerWidth / 2;
            mouseY = window.innerHeight / 2;
        }, 100);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (animationId) cancelAnimationFrame(animationId);
        } else {
            if (!isReducedMotion) animate();
        }
    });

    if (!isReducedMotion) {
        resize();
        animate();
    } else {
        resize();
        draw();
    }
}

// Add mobile class for any mobile-specific styling
if (isMobile) {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('mobile-device');
        document.body.style.webkitOverflowScrolling = 'touch';
    });
}
