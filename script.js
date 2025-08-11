// --- Global variable to prevent errors if the canvas doesn't exist ---
const canvas = document.getElementById('canvas');

// --- Main execution block for the canvas animation ---
// We check if the canvas element was found before trying to run any animation code.
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let mouseX = 0, mouseY = 0;
    let time = 0;
    let networkPoints = [];

    // --- Core Functions for the Animation ---

    /**
     * Creates an array of point objects with random initial positions and velocities.
     */
    function initNetworkPoints() {
        networkPoints = [];
        const pointCount = 18;
        for (let i = 0; i < pointCount; i++) {
            networkPoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 80,
                speed: 0.001 + Math.random() * 0.002
            });
        }
    }

    /**
     * Updates the position of each point for the next frame.
     */
    function updateNetworkPoints() {
        networkPoints.forEach((point, index) => {
            point.angle += point.speed + Math.sin(time * 0.001 + index) * 0.002;
            point.baseX += Math.sin(time * 0.0005 + index) * 0.3;
            point.baseY += Math.cos(time * 0.0007 + index) * 0.3;
            
            const secondaryX = Math.cos(time * 0.0004 + index * 1.5) * 30;
            const secondaryY = Math.sin(time * 0.0006 + index * 1.5) * 30;
            
            point.x = point.baseX + Math.cos(point.angle) * point.radius + secondaryX;
            point.y = point.baseY + Math.sin(point.angle) * point.radius + secondaryY;

            if (point.baseX < -100) point.baseX = width + 100;
            if (point.baseX > width + 100) point.baseX = -100;
            if (point.baseY < -100) point.baseY = height + 100;
            if (point.baseY > height + 100) point.baseY = -100;
        });
    }

    /**
     * Draws the points and the lines connecting them (and the mouse) on the canvas.
     */
    function drawNetworkEffect() {
        if (!networkPoints.length) return;

        ctx.lineCap = 'round';
        
        // Find the 6 points closest to the mouse
        const mouseConnections = networkPoints
            .map(point => ({
                point,
                distance: Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);

        // Draw lines from the mouse to these points
        mouseConnections.forEach(({ point, distance }) => {
            const opacity = Math.max(0.3, 1 - (distance / 700));
            ctx.strokeStyle = `rgba(66, 153, 225, ${opacity * 0.8})`;
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
            ctx.fillStyle = `rgba(66, 153, 225, ${opacity * 0.9})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw a point at the mouse cursor
        ctx.fillStyle = 'rgba(66, 153, 225, 0.95)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * The main drawing function that clears and redraws the canvas each frame.
     */
    function draw() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        updateNetworkPoints();
        drawNetworkEffect();
    }

    /**
     * The animation loop that calls itself to render frames continuously.
     */
    function animate() {
        time++;
        draw();
        requestAnimationFrame(animate);
    }

    /**
     * Handles resizing of the browser window.
     */
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNetworkPoints();
    }

    // --- Event Listeners and Initialization ---
    
    // Set up event listeners
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Kick off the animation
    resize();  // Call once to set initial size
    animate(); // Start the animation loop

} // --- End of the main canvas execution block ---


// --- Logic for other interactive elements on the page ---

// Smooth scroll for the "Learn More" button
const learnMoreButton = document.querySelector('.cta-button.secondary');
if (learnMoreButton) {
    learnMoreButton.addEventListener('click', (e) => {
        e.preventDefault();
        const productSection = document.querySelector('#product');
        if (productSection) {
            productSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Smooth scroll for the scroll-down indicator
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        const contentSections = document.querySelector('.content-sections');
        if (contentSections) {
            contentSections.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Use Cases Slider Functionality
const sliderWrapper = document.getElementById('sliderWrapper');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = document.querySelectorAll('.dot');

if (sliderWrapper && prevBtn && nextBtn && dots.length > 0) {
    let currentSlide = 0;
    const totalSlides = 3;
    let autoSlideInterval;

    function updateSlider() {
        const translateX = -currentSlide * (100 / totalSlides);
        sliderWrapper.style.transform = `translateX(${translateX}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlider();
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 10000);
    }
    
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoSlide();
        });
    });

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }

    startAutoSlide();
}