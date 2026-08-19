/**
 * WebGL 3D Liquid Gradient Background
 * Powered by Three.js and custom GLSL noise shaders
 * Designed for ENTR Technologies (2026 Redesign)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Canvas container
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Create Canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'liquid-bg';
    container.appendChild(canvas);

    let scene, camera, renderer, geometry, material, mesh;
    
    // Mouse coordinates (normalized 0 to 1)
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    
    // Initialize WebGL Scene
    function init() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Scene
        scene = new THREE.Scene();

        // Camera - Perspective for 3D depth perception of waves
        camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
        camera.position.set(0, -0.25, 1.4);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create dense 3D plane geometry for smooth wave displacement
        // Size it larger than viewport to cover screen when rotated
        geometry = new THREE.PlaneGeometry(3.6, 2.6, 128, 128);

        // Custom GLSL Shader Material
        material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
                u_resolution: { value: new THREE.Vector2(width, height) }
            },
            vertexShader: `
                varying vec2 v_uv;
                varying float v_displacement;
                uniform float u_time;
                uniform vec2 u_mouse;

                // Simplex 3D noise generator
                vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

                float snoise(vec3 v){ 
                  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                  vec3 i  = floor(v + dot(v, C.yyy) );
                  vec3 x0 =   v - i + dot(i, C.xxx) ;
                  vec3 g = step(x0.yzx, x0.xyz);
                  vec3 l = 1.0 - g;
                  vec3 i1 = min( g.xyz, l.zxy );
                  vec3 i2 = max( g.xyz, l.zxy );
                  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                  vec3 x3 = x0 - D.yyy;
                  i = mod(i, 289.0 ); 
                  vec4 p = permute( permute( permute( 
                             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                  float n_ = 1.0/7.0;
                  vec3  ns = n_ * D.wyz - D.xzx;
                  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
                  vec4 x_ = floor(j * ns.z);
                  vec4 y_ = floor(j - 7.0 * x_ );
                  vec4 x = x_ *ns.x + ns.yyyy;
                  vec4 y = y_ *ns.x + ns.yyyy;
                  vec4 h = 1.0 - abs(x) - abs(y);
                  vec4 b0 = vec4( x.xy, y.xy );
                  vec4 b1 = vec4( x.zw, y.zw );
                  vec4 s0 = floor(b0)*2.0 + 1.0;
                  vec4 s1 = floor(b1)*2.0 + 1.0;
                  vec4 sh = -step(h, vec4(0.0));
                  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                  vec3 p0 = vec3(a0.xy,h.x);
                  vec3 p1 = vec3(a0.zw,h.y);
                  vec3 p2 = vec3(a1.xy,h.z);
                  vec3 p3 = vec3(a1.zw,h.w);
                  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                  p0 *= norm.x;
                  p1 *= norm.y;
                  p2 *= norm.z;
                  p3 *= norm.w;
                  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                  m = m * m;
                  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                void main() {
                    v_uv = uv;
                    vec3 pos = position;
                    
                    // Wave 1: Large rolling liquid undulations
                    float w1 = snoise(vec3(pos.x * 0.7, pos.y * 0.7, u_time * 0.08)) * 0.18;
                    // Wave 2: Faster micro-currents
                    float w2 = snoise(vec3(pos.x * 1.5 + u_time * 0.05, pos.y * 1.5 - u_time * 0.1, u_time * 0.2)) * 0.06;
                    
                    // Mouse ripple effect
                    float dist = distance(uv, u_mouse);
                    float mouseWave = sin(dist * 12.0 - u_time * 2.5) * exp(-dist * 3.5) * 0.06;
                    
                    float displacement = w1 + w2 + mouseWave;
                    v_displacement = displacement;
                    
                    // Move vertex along Z axis (outwards towards camera)
                    pos.z += displacement;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 v_uv;
                varying float v_displacement;

                uniform float u_time;
                uniform vec2 u_mouse;
                uniform vec2 u_resolution;

                // Simplex 3D noise generator
                vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
                vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

                float snoise(vec3 v){ 
                  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                  vec3 i  = floor(v + dot(v, C.yyy) );
                  vec3 x0 =   v - i + dot(i, C.xxx) ;
                  vec3 g = step(x0.yzx, x0.xyz);
                  vec3 l = 1.0 - g;
                  vec3 i1 = min( g.xyz, l.zxy );
                  vec3 i2 = max( g.xyz, l.zxy );
                  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                  vec3 x3 = x0 - D.yyy;
                  i = mod(i, 289.0 ); 
                  vec4 p = permute( permute( permute( 
                             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                  float n_ = 1.0/7.0;
                  vec3  ns = n_ * D.wyz - D.xzx;
                  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
                  vec4 x_ = floor(j * ns.z);
                  vec4 y_ = floor(j - 7.0 * x_ );
                  vec4 x = x_ *ns.x + ns.yyyy;
                  vec4 y = y_ *ns.x + ns.yyyy;
                  vec4 h = 1.0 - abs(x) - abs(y);
                  vec4 b0 = vec4( x.xy, y.xy );
                  vec4 b1 = vec4( x.zw, y.zw );
                  vec4 s0 = floor(b0)*2.0 + 1.0;
                  vec4 s1 = floor(b1)*2.0 + 1.0;
                  vec4 sh = -step(h, vec4(0.0));
                  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                  vec3 p0 = vec3(a0.xy,h.x);
                  vec3 p1 = vec3(a0.zw,h.y);
                  vec3 p2 = vec3(a1.xy,h.z);
                  vec3 p3 = vec3(a1.zw,h.w);
                  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                  p0 *= norm.x;
                  p1 *= norm.y;
                  p2 *= norm.z;
                  p3 *= norm.w;
                  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                  m = m * m;
                  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                                dot(p2,x2), dot(p3,x3) ) );
                }

                float fbm(vec3 p) {
                    float v = 0.0;
                    float a = 0.5;
                    vec3 shift = vec3(100.0);
                    for (int i = 0; i < 4; ++i) {
                        v += a * snoise(p);
                        p = p * 2.0 + shift;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec2 st = v_uv;
                    
                    // Curated Blue & Black Liquid Palette
                    vec3 color_bg = vec3(0.003, 0.005, 0.01);    // Deep midnight black-navy
                    vec3 color_blue = vec3(0.015, 0.22, 0.72);   // Deep cyber blue
                    vec3 color_cyan = vec3(0.00, 0.58, 0.95);    // Vibrant cyber cyan
                    vec3 color_indigo = vec3(0.08, 0.02, 0.28);  // Rich cobalt/purple undertone
                    vec3 color_violet = vec3(0.35, 0.08, 0.82);  // Electric violet peak highlight
                    
                    // Domain Warping (Liquid Flow math)
                    // Warp 1 (q)
                    vec3 q = vec3(
                        fbm(vec3(st * 1.8, u_time * 0.045)),
                        fbm(vec3(st * 1.8 + vec2(5.2, 1.7), u_time * 0.06)),
                        0.0
                    );
                    
                    // Warp 2 (r)
                    vec3 r = vec3(
                        fbm(vec3(st * 2.5 + q.xy * 2.0, u_time * 0.035)),
                        fbm(vec3(st * 2.5 + q.xy * 1.6 + vec2(8.3, 2.9), u_time * 0.05)),
                        0.0
                    );
                    
                    // Liquid flow computation
                    float f = fbm(vec3(st * 1.2 + r.xy * 2.5, u_time * 0.025));
                    
                    // Mix the palettes together
                    vec3 color = mix(color_bg, color_blue, clamp(f * 2.0, 0.0, 1.0));
                    color = mix(color, color_indigo, clamp(length(q.xy) * 0.7, 0.0, 1.0));
                    color = mix(color, color_cyan, clamp(r.x * 1.1, 0.0, 1.0) * 0.45);
                    color = mix(color, color_violet, clamp(r.y * 1.4, 0.0, 1.0) * 0.32);
                    
                    // Inject lighting highlight from 3D wave vertices
                    color += color_cyan * (v_displacement * 0.75);
                    
                    // Cursor proximity glow
                    float dist = distance(v_uv, u_mouse);
                    float cursor_glow = exp(-dist * 5.0);
                    color += color_cyan * cursor_glow * 0.25;
                    
                    // Enhance contrast and color saturation
                    color = pow(color, vec3(1.18));
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            transparent: false,
            depthWrite: true,
            depthTest: true
        });

        // Mesh - Tilt it slightly backwards in 3D space to expose physical wave peaks
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -0.72; // tilted away from viewer
        mesh.rotation.z = -0.15; // slightly rotated for diagonal waves
        mesh.position.y = 0.15;  // offset to align visual weight
        scene.add(mesh);

        // Listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);
        // Mobile touch support
        window.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    // Smooth mouse coordinates logic
    function onMouseMove(event) {
        // Normalize coordinates to 0.0 - 1.0 range
        mouse.targetX = event.clientX / window.innerWidth;
        mouse.targetY = 1.0 - (event.clientY / window.innerHeight); // Flip Y for WebGL coords
    }

    function onTouchMove(event) {
        if (event.touches.length > 0) {
            mouse.targetX = event.touches[0].clientX / window.innerWidth;
            mouse.targetY = 1.0 - (event.touches[0].clientY / window.innerHeight);
        }
    }

    // Resize event
    function onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        material.uniforms.u_resolution.value.set(width, height);
    }

    // Animation Loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);

        // Linear interpolation (lerp) for buttery smooth cursor reactions
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Update uniforms
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_mouse.value.set(mouse.x, mouse.y);

        // Render
        renderer.render(scene, camera);
    }

    // Start everything
    init();
    animate();
});
