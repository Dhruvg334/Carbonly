/**
 * Interactive 3D Eco-Particle Globe (Three.js)
 * Implements GPU-accelerated particle rotation reacting smoothly to cursor movement.
 */

function initHeroGlobe() {
    const container = document.getElementById("heroCanvas");
    if (!container || typeof THREE === "undefined") return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Create Particle Globe Geometry
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 70;
    const colorEmerald = new THREE.Color("#2D6A4F");
    const colorMint = new THREE.Color("#B7E4C7");

    for (let i = 0; i < particleCount; i++) {
        // Fibonacci sphere point distribution
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;

        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color interpolation
        const mixRatio = Math.random();
        const particleColor = colorEmerald.clone().lerp(colorMint, mixRatio);
        colors[i * 3] = particleColor.r;
        colors[i * 3 + 1] = particleColor.g;
        colors[i * 3 + 2] = particleColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle material
    const material = new THREE.PointsMaterial({
        size: 2.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
    });

    const globe = new THREE.Points(geometry, material);
    scene.add(globe);

    // Add subtle ambient wireframe inner sphere
    const innerGeo = new THREE.IcosahedronGeometry(66, 2);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x2D6A4F,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const innerGlobe = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerGlobe);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    function onMouseMove(event) {
        const rect = container.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;
    }

    container.addEventListener("mousemove", onMouseMove, false);

    // Responsive resize handler
    window.addEventListener("resize", () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 3. Animation loop (Sub-16ms 60fps loop)
    function animate() {
        requestAnimationFrame(animate);

        // Constant subtle rotation
        globe.rotation.y += 0.002;
        innerGlobe.rotation.y += 0.001;

        // Smooth mouse damping
        globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.05;
        globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
}

window.addEventListener("DOMContentLoaded", initHeroGlobe);
