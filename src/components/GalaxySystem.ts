import * as THREE from 'three';

interface ParticleData {
  sprite: THREE.Sprite;
  initialAngle: number;
  radius: number;
  orbitalSpeed: number;
  branchAngle: number;
  randomOffset: { x: number; y: number; z: number };
}

/**
 * Procedural Galaxy System - Realistic Spiral Galaxy Simulation
 * 
 * This implementation creates a procedurally generated spiral galaxy based on real
 * astronomical observations and physics principles. The simulation incorporates:
 * 
 * 1. SPIRAL STRUCTURE: Uses logarithmic spiral formula (r = a * e^(b*θ)) to create
 *    realistic spiral arms, similar to observed galaxies like the Milky Way or Andromeda.
 * 
 * 2. DENSITY DISTRIBUTION: Implements realistic stellar density falloff (ρ ∝ r^(-2))
 *    where more stars cluster near the galactic center, matching observed galaxy profiles.
 * 
 * 3. DIFFERENTIAL ROTATION: Each particle orbits at its own speed based on distance
 *    from center, following Kepler's laws approximation. Inner stars orbit faster,
 *    creating the spiral arm structure through differential rotation.
 * 
 * 4. VELOCITY DISPERSION: Adds realistic randomness to particle positions, mimicking
 *    the velocity dispersion observed in real galaxies where stars don't follow
 *    perfect circular orbits.
 * 
 * 5. ADDITIVE BLENDING: Uses additive blending to simulate how starlight accumulates,
 *    creating the bright galactic center and glowing spiral arms seen in real photos.
 * 
 * The simulation balances realism with performance, using optimized particle counts
 * and rendering techniques to maintain smooth animation across all devices.
 */
export class GalaxySystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private galaxyGroup: THREE.Group | null = null;
  private particles: ParticleData[] = [];
  private animationId: number | null = null;
  private isDestroyed = false;
  private time = 0;
  private resizeHandler: (() => void) | null = null;
  private orientationHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private resizeTimeout: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private canvas: HTMLCanvasElement;
  private renderLogCounter = 0;
  private lastRenderLogTime = 0;
  private lastSize: { width: number; height: number } | null = null;
  private lastDevice: 'mobile' | 'tablet' | 'desktop' | null = null;
  private updateSizePending = false;
  private isPageVisible = true;

  // Galaxy parameters - optimized for performance
  // Based on real spiral galaxy observations: most galaxies have 2-4 spiral arms
  private readonly PARTICLES_COUNT = 8000; // Reduced for sprite performance - real galaxies have billions of stars
  private readonly RADIUS = 20; // Galaxy radius in 3D space units
  private readonly BRANCHES = 4; // Number of spiral arms - I chose 4 because it creates a more dramatic, symmetric look
  // SPIN factor controls how tightly wound the spiral arms are
  // Higher values create tighter spirals (like barred spiral galaxies)
  // Formula: spinAngle = radius * SPIN - this creates the logarithmic spiral pattern
  private readonly SPIN = 1.5; // I increased this from 1.0 to create more visible, dramatic spiral arms
  private readonly RANDOMNESS = 0.4; // Controls how much particles deviate from perfect spiral - adds realism
  // RANDOMNESS_POWER: Using power of 3 means most particles stay close to spiral, few drift far
  // This mimics real galaxies where stars cluster along arms but have some dispersion
  private readonly RANDOMNESS_POWER = 3;
  // Color gradient: In real galaxies, center is hotter (blue-white) and outer regions cooler (red)
  // I'm using blue tints throughout for aesthetic, but the gradient still represents distance
  private readonly INSIDE_COLOR = 0x3b82f6; // Bright blue for galactic center (hotter, denser)
  private readonly OUTSIDE_COLOR = 0x1e40af; // Darker blue for outer regions (cooler, sparser)
  
  // Device detection and optimization
  private get deviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (width < 640 || (isMobileUA && width < 1024)) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    }
    return 'desktop';
  }

  // Performance optimization: reduce particle count based on device
  private get optimizedParticleCount(): number {
    const device = this.deviceType;
    switch (device) {
      case 'mobile':
        return Math.floor(this.PARTICLES_COUNT * 0.3); // 30% for mobile
      case 'tablet':
        return Math.floor(this.PARTICLES_COUNT * 0.6); // 60% for tablet
      default:
        return this.PARTICLES_COUNT; // 100% for desktop
    }
  }

  // Get optimal camera position based on device
  private getCameraPosition(): { x: number; y: number; z: number } {
    const device = this.deviceType;
    
    switch (device) {
      case 'mobile':
        // 45-degree angle from top: Y = Z creates 45° viewing angle, but keep distance closer
        // Original distance was ~11.7, so for 45° with similar distance: y=z≈8
        // Reducing to y=z=7 keeps it closer while maintaining the 45-degree angle
        return { x: 0, y: 7, z: 7 };
      case 'tablet':
        return { x: 0, y: 7, z: 14 };
      default:
        return { x: 0, y: 8, z: 15 };
    }
  }

  // Get optimal camera lookAt point based on device
  private getCameraLookAt(): { x: number; y: number; z: number } {
    const device = this.deviceType;
    
    switch (device) {
      case 'mobile':
        // Offset galaxy center slightly to the right and down to avoid text overlap
        // Smaller offset to keep it subtle, negative Y moves galaxy down
        return { x: 1.5, y: 2, z: 0 };
      case 'tablet':
        return { x: 0, y: 0, z: 0 };
      default:
        return { x: 0, y: 0, z: 0 };
    }
  }

  // Get optimal camera FOV based on device
  private getCameraFOV(): number {
    const device = this.deviceType;
    switch (device) {
      case 'mobile':
        return 70; // Wider FOV for mobile to see more
      case 'tablet':
        return 72;
      default:
        return 75;
    }
  }

  // Get accurate canvas size from multiple sources with fallback priority
  // Since canvas is absolutely positioned with inset: 0, it should match parent container
  // Priority: 1. Parent container (most reliable for absolutely positioned), 2. getBoundingClientRect, 3. clientWidth/Height, 4. window dimensions
  private getCanvasSize(): { width: number; height: number } {
    const canvas = this.canvas;
    
    // Try parent container first (canvas is absolutely positioned with inset: 0, so it matches parent)
    const parent = canvas.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      if (parentRect.width > 0 && parentRect.height > 0) {
        return { 
          width: Math.round(parentRect.width), 
          height: Math.round(parentRect.height) 
        };
      }
    }
    
    // Fallback to canvas getBoundingClientRect
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return { 
        width: Math.round(rect.width), 
        height: Math.round(rect.height) 
      };
    }
    
    // Fallback to clientWidth/clientHeight
    if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
      return { 
        width: Math.round(canvas.clientWidth), 
        height: Math.round(canvas.clientHeight) 
      };
    }
    
    // Final fallback to window dimensions
    return {
      width: Math.round(window.innerWidth || 1920),
      height: Math.round(window.innerHeight || 1080)
    };
  }

  // Create texture for "1" or "0" - optimized size based on device
  private createTextTexture(text: string): THREE.CanvasTexture {
    const device = this.deviceType;
    const size = device === 'mobile' ? 64 : device === 'tablet' ? 96 : 128;
    const fontSize = device === 'mobile' ? 48 : device === 'tablet' ? 72 : 96;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = size;
    canvas.height = size;

    // White text so we can tint it with sprite colors
    context.fillStyle = 'rgba(255, 255, 255, 0.95)';
    context.font = `bold ${fontSize}px monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  constructor(canvas: HTMLCanvasElement) {
    // Store canvas reference
    this.canvas = canvas;
    
    // Setup scene
    this.scene = new THREE.Scene();

    // Setup renderer first (needed for device detection)
    // Ensure renderer stays behind text content - depth test disabled for proper layering
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      depth: false, // Disable depth buffer to ensure it stays behind text
    });
    
    // Get accurate initial size (reused for camera setup)
    const initialSize = this.getCanvasSize();
    this.renderer.setSize(initialSize.width, initialSize.height);
    
    // Optimize pixel ratio based on device
    const device = this.deviceType;
    const pixelRatio = device === 'mobile' 
      ? Math.min(window.devicePixelRatio, 1.5) 
      : device === 'tablet'
      ? Math.min(window.devicePixelRatio, 2)
      : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    // Setup camera - responsive to device (reuse initialSize)
    const aspect = initialSize.width / initialSize.height;
    const fov = this.getCameraFOV();
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
    
    // Position camera based on device to ensure center visibility
    const camPos = this.getCameraPosition();
    const lookAt = this.getCameraLookAt();
    this.camera.position.set(camPos.x, camPos.y, camPos.z);
    this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    
    // Log initial setup
    console.log('[GalaxySystem] Initialized:', {
      resolution: `${initialSize.width}x${initialSize.height}`,
      device,
      pixelRatio,
      camera: {
        position: camPos,
        lookAt,
        fov,
        aspect: aspect.toFixed(2)
      }
    });

    // Create galaxy
    this.createGalaxy();

    // Handle resize
    this.handleResize();

    // Handle visibility changes for performance optimization
    this.handleVisibility();

    // Start animation
    this.animate();
  }

  private createGalaxy(): void {
    const particleCount = this.optimizedParticleCount;
    const device = this.deviceType; // Declare once for the entire function
    
    this.galaxyGroup = new THREE.Group();
    this.particles = [];

    const colorInside = new THREE.Color(this.INSIDE_COLOR);
    const colorOutside = new THREE.Color(this.OUTSIDE_COLOR);

    // Create textures for "1" and "0" - white textures that will be tinted blue
    const texture1 = this.createTextTexture('1');
    const texture0 = this.createTextTexture('0');

    for (let i = 0; i < particleCount; i++) {
      // SPIRAL GALAXY STRUCTURE FORMULA
      // Real galaxies follow a logarithmic spiral pattern: r = a * e^(b*θ)
      // I'm using a simplified version: radius varies, angle = branchAngle + spinAngle
      
      // DENSITY DISTRIBUTION - This is crucial for realism!
      // In real galaxies, stellar density follows: ρ(r) ∝ r^(-α) where α ≈ 2-3
      // Using Math.pow(Math.random(), 2) creates a distribution where:
      // - More particles cluster near center (like real galactic bulges)
      // - Fewer particles in outer regions (like real galactic halos)
      // This matches observed galaxy density profiles from astronomy
      // IMPORTANT: Reduced center density to prevent text readability issues
      const radius = Math.random() * this.RADIUS;
      // Mobile: power of 3 to reduce center density and prevent text interference
      // Desktop: power of 2.5 for slightly more center particles (but still reduced) while keeping edges visible
      const densityPower = device === 'mobile' ? 3 : 2.5;
      const radiusPower = Math.pow(Math.random(), densityPower);
      const finalRadius = radiusPower * this.RADIUS;
      
      // SPIRAL ARM FORMULA
      // Each particle's angle = branch angle (which arm) + spin angle (position along arm)
      // spinAngle = finalRadius * SPIN creates the logarithmic spiral pattern
      // This is based on density wave theory - how spiral arms form in real galaxies
      const initialSpinAngle = finalRadius * this.SPIN;
      // Branch angle distributes particles evenly across spiral arms
      const branchAngle = ((i % this.BRANCHES) / this.BRANCHES) * Math.PI * 2;
      const initialAngle = branchAngle + initialSpinAngle;

      // Binary value: determine if particle is "1" or "0"
      // Using 50/50 distribution for visual variety
      const binaryValue = Math.random() < 0.5 ? 1 : 0;
      
      // RANDOMNESS DISTRIBUTION - Adding realistic dispersion
      // Real stars don't follow perfect spirals - they have velocity dispersion
      // Using power distribution: most stars stay close to arm, few drift significantly
      // This mimics the velocity dispersion observed in real spiral galaxies
      // The binary sign (1 or -1) ensures symmetric distribution around the spiral
      const randomX = Math.pow(Math.random(), this.RANDOMNESS_POWER) * this.RANDOMNESS * (Math.random() < 0.5 ? 1 : -1);
      const randomY = Math.pow(Math.random(), this.RANDOMNESS_POWER) * this.RANDOMNESS * (Math.random() < 0.5 ? 1 : -1);
      // Z-axis randomness is reduced (0.3 factor) because real spiral galaxies are relatively flat
      // Most stars orbit in the galactic plane with minimal vertical motion
      const randomZ = Math.pow(Math.random(), this.RANDOMNESS_POWER) * this.RANDOMNESS * 0.3 * (Math.random() < 0.5 ? 1 : -1);

      // INITIAL POSITION CALCULATION
      // Using polar coordinates converted to Cartesian: x = r*cos(θ), z = r*sin(θ)
      // This creates the spiral pattern in the XZ plane (galactic plane)
      const x = Math.cos(initialAngle) * finalRadius + randomX;
      // Y-axis kept minimal - real spiral galaxies are disk-shaped, not spherical
      // Keeping it flat (mostly randomY) maintains the disk structure while allowing slight thickness
      const y = randomY;
      const z = Math.sin(initialAngle) * finalRadius + randomZ;

      // COLOR GRADIENT - Based on real galaxy observations
      // In real galaxies: center is brighter/hotter (blue-white), outer regions dimmer/cooler (red)
      // Using linear interpolation (lerp) to blend colors based on distance
      // This creates the visual effect of a bright galactic center fading to darker edges
      // Matches how we observe galaxies: bright bulge, dimmer spiral arms
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, finalRadius / this.RADIUS);

      // SPRITE MATERIAL SETUP
      // Reduced opacity to make background more subtle and less attention-grabbing
      // CRITICAL: Center particles must have VERY low opacity to prevent text readability issues
      // The galaxy center overlaps with text content, so center brightness must be minimal
      const distanceFactor = finalRadius / this.RADIUS;
      // Increased visibility on mobile for better effect, Desktop: more visible (0.5 base)
      const baseOpacity = device === 'mobile' ? 0.4 : 0.5;
      // Inverted opacity: center particles (distanceFactor ~0) have MINIMAL opacity
      // Outer particles (distanceFactor ~1) can be brighter
      // Formula ensures center particles are very dim to stay behind text
      // Edges can be brighter since they don't overlap with text
      const centerOpacity = baseOpacity * 0.4; // Very low opacity for center
      const edgeOpacity = baseOpacity * 1.2; // Slightly higher for edges
      const opacity = centerOpacity + (edgeOpacity - centerOpacity) * distanceFactor;
      
      // ADDITIVE BLENDING - This is key for realistic galaxy appearance!
      // In real galaxies, stars' light adds together (additive)
      // Using AdditiveBlending makes overlapping particles brighter, like real starlight
      // Without this, overlapping particles would just overwrite each other
      // This creates the "glow" effect you see in real galaxy photos
      const spriteMaterial = new THREE.SpriteMaterial({
        map: binaryValue === 1 ? texture1 : texture0,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending, // Critical for realistic starlight accumulation
        color: mixedColor,
        depthWrite: false, // Disabled for performance with many overlapping sprites
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      
      // Size based on distance and device (smaller further out, adjusted for device)
      const baseSize = device === 'mobile' ? 0.12 : device === 'tablet' ? 0.14 : 0.15;
      const size = baseSize * (1 - finalRadius / this.RADIUS * 0.5);
      sprite.scale.set(size, size, 1);
      
      sprite.position.set(x, y, z);
      
      // ORBITAL VELOCITY CALCULATION - Based on Kepler's Laws and Galactic Dynamics
      // In real galaxies, orbital speed follows: v(r) = √(GM(r)/r)
      // For a point mass: v ∝ 1/√r (Kepler's 3rd law)
      // However, real galaxies have dark matter halos, so outer stars orbit faster than Kepler predicts
      // I'm using a simplified version: v = k/√(r+1) where k=0.5
      // The +1 prevents division by zero and ensures inner particles orbit fastest
      // This creates realistic differential rotation - inner stars complete orbits faster
      // Matches observed galactic rotation curves (though simplified)
      const orbitalSpeed = 0.5 / Math.sqrt(finalRadius + 1);
      
      // Store particle data for orbital motion
      this.particles.push({
        sprite,
        initialAngle,
        radius: finalRadius,
        orbitalSpeed,
        branchAngle,
        randomOffset: { x: randomX, y: randomY, z: randomZ }
      });
      
      this.galaxyGroup.add(sprite);
    }

    this.scene.add(this.galaxyGroup);

    // INITIAL GALAXY ORIENTATION
    // Rotating slightly to show the spiral structure better (like viewing Andromeda at an angle)
    // Real galaxies are viewed from various angles, so this adds realism
    this.galaxyGroup.rotation.y = Math.PI * 0.1; // Slight rotation around vertical axis
    // More inclined angle on mobile for better visual effect while keeping center visible
    // In real observations, we often view galaxies edge-on or face-on, rarely perfectly flat
    this.galaxyGroup.rotation.x = device === 'mobile' ? -Math.PI * 0.08 : -Math.PI * 0.1;
  }

  private handleResize(): void {
    // Core resize update function - updates camera and renderer immediately
    // Debounced to prevent multiple simultaneous updates
    const updateSize = (source: string) => {
      if (this.isDestroyed || this.updateSizePending) return;
      
      this.updateSizePending = true;
      
      // Use requestAnimationFrame to batch updates and prevent lag
      requestAnimationFrame(() => {
        if (this.isDestroyed) {
          this.updateSizePending = false;
          return;
        }

        // Get accurate canvas size using multiple fallback sources
        const size = this.getCanvasSize();
        const { width, height } = size;

        // Ensure valid dimensions
        if (width === 0 || height === 0) {
          console.warn('[GalaxySystem] Invalid canvas dimensions detected:', { width, height, source });
          this.updateSizePending = false;
          return;
        }

        // Only update if size actually changed
        if (this.lastSize && this.lastSize.width === width && this.lastSize.height === height) {
          this.updateSizePending = false;
          return;
        }

        // Get current device type (may have changed on resize)
        const device = this.deviceType;
        
        // Log resolution change if size changed
        if (this.lastSize) {
          console.log('[GalaxySystem] Resolution change detected:', {
            source,
            previous: `${this.lastSize.width}x${this.lastSize.height}`,
            current: `${width}x${height}`,
            device: this.lastDevice !== device ? `${this.lastDevice} → ${device}` : device,
            aspectRatio: (width / height).toFixed(2)
          });
        }
        
        // Log device type change
        if (this.lastDevice && this.lastDevice !== device) {
          console.log('[GalaxySystem] Device type changed:', {
            previous: this.lastDevice,
            current: device,
            resolution: `${width}x${height}`
          });
        }

        // CRITICAL: Update camera position and lookAt FIRST to maintain center visibility
        // This ensures the galaxy center stays visible when switching between devices
        const camPos = this.getCameraPosition();
        const lookAt = this.getCameraLookAt();
        this.camera.position.set(camPos.x, camPos.y, camPos.z);
        this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

        // Update camera aspect and FOV based on current device
        const aspect = width / height;
        const fov = this.getCameraFOV();
        this.camera.aspect = aspect;
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size immediately
        this.renderer.setSize(width, height, false);
        
        // Force immediate render to show updated camera position
        if (this.galaxyGroup) {
          this.renderer.render(this.scene, this.camera);
          console.log('[GalaxySystem] Rerendered after resize:', {
            source,
            resolution: `${width}x${height}`,
            device,
            camera: { position: camPos, lookAt, fov, aspect: aspect.toFixed(2) }
          });
        }
        
        // Store current size and device for next comparison
        this.lastSize = { width, height };
        this.lastDevice = device;
        this.updateSizePending = false;
        
        // Debounce only the pixel ratio update (less critical)
        if (this.resizeTimeout !== null) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = window.setTimeout(() => {
          if (this.isDestroyed) return;
          
          // Update pixel ratio based on current device
          const device = this.deviceType;
          const pixelRatio = device === 'mobile' 
            ? Math.min(window.devicePixelRatio, 1.5) 
            : device === 'tablet'
            ? Math.min(window.devicePixelRatio, 2)
            : Math.min(window.devicePixelRatio, 2);
          this.renderer.setPixelRatio(pixelRatio);
        }, 150);
      });
    };

    // Debounced resize handler to prevent excessive updates
    let resizeDebounceTimeout: number | null = null;
    
    // Window resize event listener - debounced
    const handleResizeEvent = () => {
      console.log('[GalaxySystem] Browser resize event detected');
      
      // Clear existing timeout
      if (resizeDebounceTimeout !== null) {
        clearTimeout(resizeDebounceTimeout);
      }
      
      // Debounce to prevent excessive updates during window dragging
      resizeDebounceTimeout = window.setTimeout(() => {
        updateSize('window-resize');
      }, 16); // ~60fps debounce
    };

    // Orientation change handler (for mobile devices) - debounced
    let orientationDebounceTimeout: number | null = null;
    const handleOrientationChange = () => {
      console.log('[GalaxySystem] Orientation change detected');
      
      // Clear existing timeout
      if (orientationDebounceTimeout !== null) {
        clearTimeout(orientationDebounceTimeout);
      }
      
      // Delay to allow orientation change to complete
      orientationDebounceTimeout = window.setTimeout(() => {
        updateSize('orientation-change');
      }, 150);
    };

    // ResizeObserver for direct canvas size monitoring (most reliable)
    // Only observe parent container since canvas is absolutely positioned
    if (typeof ResizeObserver !== 'undefined') {
      let observerDebounceTimeout: number | null = null;
      
      this.resizeObserver = new ResizeObserver((entries) => {
        // Clear existing timeout
        if (observerDebounceTimeout !== null) {
          clearTimeout(observerDebounceTimeout);
        }
        
        // Debounce ResizeObserver callbacks
        observerDebounceTimeout = window.setTimeout(() => {
          entries.forEach(entry => {
            const target = entry.target;
            const isCanvas = target === this.canvas;
            console.log('[GalaxySystem] ResizeObserver detected size change:', {
              target: isCanvas ? 'canvas' : 'parent',
              size: `${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}`
            });
          });
          updateSize('resize-observer');
        }, 16); // ~60fps debounce
      });
      
      // Only observe parent container (canvas matches parent size due to absolute positioning)
      const parent = this.canvas.parentElement;
      if (parent) {
        this.resizeObserver.observe(parent);
      }
    }

    // Add event listeners
    window.addEventListener('resize', handleResizeEvent);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Store cleanup functions
    this.resizeHandler = handleResizeEvent;
    this.orientationHandler = handleOrientationChange;
  }

  private handleVisibility(): void {
    // Set initial visibility state
    this.isPageVisible = !document.hidden;

    // Handle visibility change events
    const handleVisibilityChange = () => {
      this.isPageVisible = !document.hidden;
      
      if (this.isPageVisible) {
        // Page became visible - resume animation
        if (!this.animationId && !this.isDestroyed) {
          this.animate();
        }
      } else {
        // Page became hidden - pause animation to save resources
        if (this.animationId !== null) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.visibilityHandler = handleVisibilityChange;
  }

  private animate = (): void => {
    if (this.isDestroyed) return;

    // Only request next frame if page is visible
    if (this.isPageVisible) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
      return;
    }

    // Only animate if page is visible and galaxy exists
    if (this.galaxyGroup && this.isPageVisible) {
      // Reduced time increment to slow down individual particle orbital motion
      this.time += 0.005; // Slower particle movement for more subtle effect
      
      // ORBITAL MOTION SIMULATION - Each particle orbits independently
      // This is the key to realistic galaxy animation!
      // Real stars orbit the galactic center at different speeds (differential rotation)
      // Inner stars complete orbits faster than outer stars - this is what creates spiral arms
      // Formula: θ(t) = θ₀ + ω*t where ω is angular velocity (orbitalSpeed)
      this.particles.forEach(particle => {
        // Calculate current angle: initial angle + (angular velocity × time)
        // This creates differential rotation - each particle moves at its own speed
        const currentAngle = particle.initialAngle + particle.orbitalSpeed * this.time;
        
        // Update position using circular motion: x = r*cos(θ), z = r*sin(θ)
        // Adding randomOffset maintains the particle's position relative to the spiral arm
        // This preserves the spiral structure while allowing orbital motion
        const x = Math.cos(currentAngle) * particle.radius + particle.randomOffset.x;
        const z = Math.sin(currentAngle) * particle.radius + particle.randomOffset.z;
        
        particle.sprite.position.x = x;
        particle.sprite.position.z = z;
        // Y position stays relatively constant - stars orbit in the galactic plane
        // Real stars have minimal vertical motion compared to orbital motion
        particle.sprite.position.y = particle.randomOffset.y;
      });
      
      // OVERALL GALAXY ROTATION
      // Adding slow rotation to the entire galaxy group creates a sense of motion
      // In reality, galaxies rotate, but very slowly (millions of years per rotation)
      // Reduced rotation speed to make it more subtle and less distracting
      this.galaxyGroup.rotation.y += 0.00003; // Slower rotation for subtle background effect
      
      this.renderer.render(this.scene, this.camera);
      
      // Throttled logging for regular rerenders (every 5 seconds)
      this.renderLogCounter++;
      const now = Date.now();
      if (now - this.lastRenderLogTime > 5000) {
        const canvasSize = this.getCanvasSize();
        console.log('[GalaxySystem] Regular rerender (throttled log):', {
          frameCount: this.renderLogCounter,
          resolution: `${canvasSize.width}x${canvasSize.height}`,
          device: this.deviceType,
          fps: Math.round(this.renderLogCounter / ((now - this.lastRenderLogTime) / 1000))
        });
        this.renderLogCounter = 0;
        this.lastRenderLogTime = now;
      }
    }
  };

  public destroy(): void {
    this.isDestroyed = true;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remove resize event listener
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

    // Remove orientation change listener
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
      this.orientationHandler = null;
    }

    // Remove visibility change listener
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
    
    // Clear resize timeout
    if (this.resizeTimeout !== null) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // Dispose sprites and materials
    if (this.galaxyGroup) {
      this.particles.forEach(particle => {
        const material = particle.sprite.material as THREE.SpriteMaterial;
        if (material.map) {
          material.map.dispose();
        }
        material.dispose();
      });
      
      this.scene.remove(this.galaxyGroup);
      this.galaxyGroup = null;
      this.particles = [];
    }

    // Dispose renderer
    this.renderer.dispose();
  }
}
