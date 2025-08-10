document.addEventListener('DOMContentLoaded', () => {
    // Simple canvas background for white theme
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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
            ctx.strokeStyle = `rgba(66, 153, 225, ${opacity * 0.8})`;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            // Draw circle at primary point
            ctx.fillStyle = `rgba(66, 153, 225, ${opacity * 0.9})`;
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

                ctx.strokeStyle = `rgba(66, 153, 225, ${opacity})`;
                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(primaryPoint.x, primaryPoint.y);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();

                // Draw circle at secondary point
                ctx.fillStyle = `rgba(66, 153, 225, ${opacity * 0.8})`;
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
                    const opacity = Math.max(0.08, 1 - (distance / connectionThreshold)) * 0.3;

                    ctx.strokeStyle = `rgba(66, 153, 225, ${opacity})`;
                    ctx.lineWidth = 0.5;

                    ctx.beginPath();
                    ctx.moveTo(point1.x, point1.y);
                    ctx.lineTo(point2.x, point2.y);
                    ctx.stroke();
                }
            }
        }

        // Always draw cursor point
        ctx.fillStyle = 'rgba(66, 153, 225, 0.95)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNetworkPoints();
    }

    function draw() {
        // Clear with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Update and draw subtle network effect
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

    // Initialize
    resize();
    animate();

    // Smooth scroll for navigation
    const learnMoreButton = document.querySelector('.cta-button.secondary');
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', (e) => {
            e.preventDefault();
            const productSection = document.querySelector('#product');
            if (productSection) {
                productSection.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        });
    }
    
    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if(scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const cont