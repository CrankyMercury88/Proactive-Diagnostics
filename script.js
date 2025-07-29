// Wait for DOM to load before initializing canvas
document.addEventListener('DOMContentLoaded', function() {
    // Ambient gradient background with mouse interaction
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }

    let width, height;
    let mouseX = 0, mouseY = 0;
    let time = 0;

    // Network animation points
    let networkPoints = [];

    function initNetworkPoints() {
        networkPoints = [];
        // Create 18 points that will move around (6 primary, 12 secondary)
        for (let i = 0; i < 18; i++) {
            networkPoints.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3, // Smoother velocity
                vy: (Math.random() - 0.5) * 0.3,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 80,
                speed: 0.001 + Math.random() * 0.002 // Individual speed variation
            });
        }
    }

    function updateNetworkPoints() {
        networkPoints.forEach((point, index) => {
            // More dynamic circular movement around base position
            point.angle += point.speed + Math.sin(time * 0.001 + index) * 0.002;
            
            // Add continuous drift to base position for more organic movement
            point.baseX += Math.sin(time * 0.0005 + index) * 0.3;
            point.baseY += Math.cos(time * 0.0007 + index) * 0.3;
            
            // Add secondary movement pattern for more complexity
            const secondaryX = Math.cos(time * 0.0004 + index * 1.5) * 30;
            const secondaryY = Math.sin(time * 0.0006 + index * 1.5) * 30;
            
            point.x = point.baseX + Math.cos(point.angle) * point.radius + secondaryX;
            point.y = point.baseY + Math.sin(point.angle) * point.radius + secondaryY;
            
            // Smooth wrapping around screen edges
            if (point.baseX < -100) point.baseX = width + 100;
            if (point.baseX > width + 100) point.baseX = -100;
            if (point.baseY < -100) point.baseY = height + 100;
            if (point.baseY > height + 100) point.baseY = -100;
            
            // Occasionally change radius for dynamic behavior
            if (time % 1000 === 0) {
                point.radius += (Math.random() - 0.5) * 10;
                point.radius = Math.max(20, Math.min(120, point.radius));
            }
        });
    }

    function drawNetworkEffect() {
        if (!networkPoints.length) return;
        
        ctx.lineCap = 'round';
        
        // Dynamic connection system - points connect and disconnect based on movement
        const activeConnections = [];
        
        // Always draw connections from mouse to closest 6 points (dynamic selection)
        const mouseConnections = networkPoints
            .map((point, index) => ({
                point,
                index,
                distance: Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
        
        mouseConnections.forEach(({ point, distance }) => {
            const opacity = Math.max(0.3, 1 - (distance / 700));
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.7})`;
            ctx.lineWidth = 1.5;
            
            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            
            // Draw circle at primary point
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            activeConnections.push(point);
        });
        
        // Dynamic secondary connections - points connect to nearby points
        activeConnections.forEach(primaryPoint => {
            const nearbyPoints = networkPoints
                .filter(p => p !== primaryPoint && !activeConnections.includes(p))
                .map(point => ({
                    point,
                    distance: Math.sqrt((primaryPoint.x - point.x) ** 2 + (primaryPoint.y - point.y) ** 2)
                }))
                .filter(({ distance }) => distance < 400)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2);
            
            nearbyPoints.forEach(({ point, distance }) => {
                const opacity = Math.max(0.15, 1 - (distance / 400)) * 0.6;
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.lineWidth = 1;
                
                ctx.beginPath();
                ctx.moveTo(primaryPoint.x, primaryPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                
                // Draw circle at secondary point
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        });
        
        // Add random interconnections between all points for extra dynamism
        for (let i = 0; i < networkPoints.length; i++) {
            for (let j = i + 1; j < networkPoints.length; j++) {
                const point1 = networkPoints[i];
                const point2 = networkPoints[j];
                const distance = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
                
                // Dynamic connection threshold that changes over time
                const connectionThreshold = 180 + Math.sin(time * 0.002 + i + j) * 50;
                
                if (distance < connectionThreshold) {
                    const opacity = Math.max(0.05, 1 - (distance / connectionThreshold)) * 0.25;
                    
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    
                    ctx.beginPath();
                    ctx.moveTo(point1.x, point1.y);
                    ctx.lineTo(point2.x, point2.y);
                    ctx.stroke();
                }
            }
        }
        
        // Always draw cursor point
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Desert color palette - warm browns, tans, and sandy tones
    const colors = [
        { r: 139, g: 111, b: 63 },   // Dark brown
        { r: 160, g: 130, b: 79 },   // Medium brown
        { r: 196, g: 164, b: 120 },  // Clay brown
        { r: 180, g: 150, b: 100 },  // Light brown
        { r: 218, g: 165, b: 32 },   // Gold
        { r: 184, g: 134, b: 11 },   // Deep gold
        { r: 205, g: 133, b: 63 },   // Peru brown
        { r: 210, g: 180, b: 140 },  // Tan
        { r: 222, g: 184, b: 135 },  // Burlywood
        { r: 238, g: 203, b: 173 },  // Bisque
        { r: 244, g: 164, b: 96 },   // Sandy brown
        { r: 188, g: 143, b: 143 },  // Rosy brown
    ];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNetworkPoints();
    }

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function draw() {
        // Clear with dark background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        
        ctx.globalCompositeOperation = 'screen';
        
        // Create 4 large radial gradients that cover the full screen
        for (let i = 0; i < 4; i++) {
            // Position gradients to cover different areas of the screen
            const angle = (time * 0.0005 + i * Math.PI / 2);
            let x = width * 0.5 + Math.cos(angle) * width * 0.3;
            let y = height * 0.5 + Math.sin(angle * 0.8) * height * 0.3;
            
            // Add cursor influence to gradient positions
            if (mouseX > 0 && mouseY > 0 && isFinite(mouseX) && isFinite(mouseY)) {
                const mouseInfluence = 0.15;
                const distanceToMouse = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
                const maxDistance = Math.max(width, height) * 0.5;
                const influence = Math.max(0, 1 - (distanceToMouse / maxDistance));
                
                x += (mouseX - x) * mouseInfluence * influence;
                y += (mouseY - y) * mouseInfluence * influence;
            }
            
            // Large radius to ensure full screen coverage
            const radius = Math.max(width, height) * 0.9;
            
            // Select colors that are spaced apart in the rainbow spectrum
            const colorIndex = (time * 0.002 + i * 3) % colors.length;
            const currentColorIndex = Math.floor(colorIndex);
            const nextColorIndex = (currentColorIndex + 1) % colors.length;
            const t = colorIndex - currentColorIndex;
            
            const currentColor = colors[currentColorIndex];
            const nextColor = colors[nextColorIndex];
            
            const r = Math.floor(lerp(currentColor.r, nextColor.r, t));
            const g = Math.floor(lerp(currentColor.g, nextColor.g, t));
            const b = Math.floor(lerp(currentColor.b, nextColor.b, t));
            
            // Increase opacity based on proximity to cursor
            let baseOpacity = 0.3;
            if (mouseX > 0 && mouseY > 0) {
                const distanceToMouse = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
                const maxDistance = Math.max(width, height) * 0.4;
                const cursorInfluence = Math.max(0, 1 - (distanceToMouse / maxDistance));
                baseOpacity += cursorInfluence * 0.1; // Reduced from 0.2 to 0.1 (50% reduction)
            }
            
            const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            radialGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseOpacity})`);
            radialGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.5})`);
            radialGradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${baseOpacity * 0.17})`);
            radialGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = radialGradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Add dynamic cursor spotlight effect
        if (mouseX > 0 && mouseY > 0 && isFinite(mouseX) && isFinite(mouseY)) {
            // Create a bright spotlight that follows the cursor
            const spotlightRadius = 300;
            const spotlightGradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, spotlightRadius
            );
            
            // Use a shifting rainbow color for the spotlight
            const spotlightColorIndex = (time * 0.005) % colors.length;
            const currentColorIndex = Math.floor(spotlightColorIndex);
            const nextColorIndex = (currentColorIndex + 1) % colors.length;
            const t = spotlightColorIndex - currentColorIndex;
            
            const currentColor = colors[currentColorIndex];
            const nextColor = colors[nextColorIndex];
            
            const r = Math.floor(lerp(currentColor.r, nextColor.r, t));
            const g = Math.floor(lerp(currentColor.g, nextColor.g, t));
            const b = Math.floor(lerp(currentColor.b, nextColor.b, t));
            
            spotlightGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.1)`); // Reduced from 0.2 to 0.1
            spotlightGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.05)`); // Reduced from 0.1 to 0.05
            spotlightGradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.025)`); // Reduced from 0.05 to 0.025
            spotlightGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = spotlightGradient;
            ctx.fillRect(0, 0, width, height);
            
            // Add a secondary, smaller bright core
            const coreRadius = 150;
            const coreGradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, coreRadius
            );
            
            coreGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`); // Reduced from 0.3 to 0.15
            coreGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.075)`); // Reduced from 0.15 to 0.075
            coreGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = coreGradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        ctx.globalCompositeOperation = 'source-over';
        
        // Update and draw network effect
        updateNetworkPoints();
        drawNetworkEffect();
    }

    function animate() {
        time++;
        draw();
        requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Touch support for mobile
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    });

    // Initialize
    resize();

    // Set default mouse position to center after resize
    if (mouseX === 0 && mouseY === 0) {
        mouseX = width / 2;
        mouseY = height / 2;
    }

    animate();

    console.log('Canvas animation initialized successfully');

    // Use Cases Slider Functionality
    let currentSlide = 0;
    const totalSlides = 3;
    let autoSlideInterval;
    let isHovering = false;

    const sliderWrapper = document.getElementById('sliderWrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');

    function updateSlider() {
        if (!sliderWrapper) return;
        const translateX = -currentSlide * (100 / totalSlides);
        sliderWrapper.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
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

    function startAutoSlide() {
        if (!isHovering) {
            autoSlideInterval = setInterval(() => {
                if (!isHovering) {
                    nextSlide();
                }
            }, 10000); // 10 seconds
        }
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(index);
            startAutoSlide();
        });
    });

    // Pause auto-slide on hover over the entire slider container
    const sliderContainer = document.querySelector('.slider-container');

    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            stopAutoSlide();
        });

        sliderContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            startAutoSlide();
        });
    }

    // Smooth scroll for navigation
    const secondaryBtn = document.querySelector('.cta-button.secondary');
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const productSection = document.querySelector('#product');
            if (productSection) {
                productSection.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        });
    }

    const primaryBtn = document.querySelector('.cta-button.primary');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add your waitlist logic here
            console.log('Join Waitlist clicked');
        });
    }

    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const contentSections = document.querySelector('.content-sections');
            if (contentSections) {
                contentSections.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        });
    }

    // Start auto-slide
    startAutoSlide();
    
    console.log('Slider and navigation initialized successfully');
});