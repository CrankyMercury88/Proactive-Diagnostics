// --- Global variable to prevent errors if the canvas doesn't exist ---
const canvas = document.getElementById('canvas');

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

// Reduced animation complexity for mobile devices
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Animation/Interval Handles ---
let animationId;
let autoSlideInterval;
let cytokineAutoInterval; // Still declared for future use

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

function smoothScrollTo(target, offset = 0) {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetElement) return;

    const targetPosition = targetElement.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = isMobile ? 800 : 1000;
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- START OF CYTOKINE FIX ---
    // Select all the elements needed for the cytokine tabs
    const cytokineTabs = document.querySelectorAll('.cytokine-tab');
    const cytokineContents = document.querySelectorAll('.cytokine-content');
    const cytokineHighlights = document.querySelectorAll('.cytokine-highlight');

    // Only run the script if we found the tab buttons
    if (cytokineTabs.length > 0) {
        
        // This function handles showing the correct content
        function showCytokine(cytokineId) {
            // Loop through each tab button
            cytokineTabs.forEach(tab => {
                const isTarget = tab.dataset.cytokine === cytokineId;
                tab.classList.toggle('active', isTarget);
                tab.setAttribute('aria-selected', isTarget);
            });

            // Loop through each content panel
            cytokineContents.forEach(content => {
                content.classList.toggle('active', content.dataset.cytokine === cytokineId);
            });

            // Loop through each highlight panel
            cytokineHighlights.forEach(highlight => {
                highlight.classList.toggle('active', highlight.dataset.cytokine === cytokineId);
            });
        }

        // Add a click listener to every tab button
        cytokineTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Get the ID from the 'data-cytokine' attribute of the clicked tab
                const cytokineId = e.currentTarget.dataset.cytokine;
                showCytokine(cytokineId);
            });
            
            // Add keyboard support for accessibility
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const cytokineId = e.currentTarget.dataset.cytokine;
                    showCytokine(cytokineId);
                }
            });
        });
    }
    // --- END OF CYTOKINE FIX ---

    const learnMoreButton = document.querySelector('.cta-button.secondary');
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo('#product', 80);
        });
    }

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        const scrollToContent = () => smoothScrollTo('.content-sections', 20);
        scrollIndicator.addEventListener('click', scrollToContent);
        scrollIndicator.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToContent();
            }
        });
    }

    if (isMobile) {
        document.body.classList.add('mobile-device');
        document.body.style.webkitOverflowScrolling = 'touch';
    }
});

// Other existing script logic...
// (The rest of your script for sliders, observers, etc., remains the same)

// Use Cases Slider Functionality
const sliderWrapper = document.getElementById('sliderWrapper');
if (sliderWrapper) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const totalSlides = 3;
    let startX = 0, currentX = 0, isDragging = false;

    function updateSlider() {
        sliderWrapper.style.transform = `translateX(${-currentSlide * (100 / totalSlides)}%)`;
        dots.forEach((dot, index) => {
            const isActive = index === currentSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive);
        });
    }

    function nextSlide() { currentSlide = (currentSlide + 1) % totalSlides; updateSlider(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; updateSlider(); }
    function goToSlide(slideIndex) { currentSlide = slideIndex; updateSlider(); }
    
    function stopAutoSlide() { clearInterval(autoSlideInterval); }
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, isMobile ? 8000 : 10000);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoSlide(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { goToSlide(index); startAutoSlide(); });
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
                startAutoSlide();
            }
        });
    });

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const handleTouchStart = (e) => { startX = e.touches[0].clientX; isDragging = true; stopAutoSlide(); };
        const handleTouchMove = (e) => { if (isDragging) currentX = e.touches[0].clientX; };
        const handleTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            if (Math.abs(startX - currentX) > 50) {
                if (startX > currentX) nextSlide(); else prevSlide();
            }
            startAutoSlide();
        };

        sliderContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
        sliderContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
        sliderContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
        sliderContainer.addEventListener('focusin', stopAutoSlide);
        sliderContainer.addEventListener('focusout', startAutoSlide);
    }

    updateSlider();
    startAutoSlide();

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAutoSlide(); else startAutoSlide();
    });
}
