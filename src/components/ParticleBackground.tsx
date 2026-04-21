import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const InfiniteGrid = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColorCyan: { value: new THREE.Color('#22d3ee') },
      uColorPurple: { value: new THREE.Color('#a78bfa') },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorCyan;
      uniform vec3 uColorPurple;
      varying vec2 vUv;

      void main() {
        // Infinite grid calculation
        float gridScale = 40.0;
        vec2 gridUv = vUv * gridScale;
        gridUv.y += uTime * 1.5; // Move grid towards camera

        vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / fwidth(gridUv);
        float line = min(grid.x, grid.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        // Sweeping pulse effect
        float pulse = sin(gridUv.y * 0.2 - uTime * 5.0) * 0.5 + 0.5;
        pulse = pow(pulse, 8.0); // Sharpen the pulse

        // Gradient from cyan to purple based on distance (vUv.y)
        vec3 baseColor = mix(uColorCyan, uColorPurple, vUv.y);
        vec3 color = mix(baseColor, vec3(1.0), pulse * 0.3); // Add white flash to pulse
        
        // Fade out towards horizon (vUv.y = 0 is horizon, 1 is near camera)
        float fade = pow(vUv.y, 2.5);
        
        // Final alpha combines grid lines, pulse intensity, and horizon fade
        float finalAlpha = gridAlpha * (0.3 + pulse * 0.7) * fade;
        
        gl_FragColor = vec4(color, finalAlpha * 0.5);
      }
    `
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <shaderMaterial
        args={[shaderArgs]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const Particles = ({ count = 800 }) => {
  const points = useRef<THREE.Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 0.4 + Math.random() * 0.12;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Cyan base color
      colors[i * 3] = 0.13; // 22/255
      colors[i * 3 + 1] = 0.83; // 211/255
      colors[i * 3 + 2] = 0.93; // 238/255
    }
    
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.1;
    points.current.rotation.x = time * 0.05;
    
    // Subtle pulsing
    const scale = 1 + Math.sin(time * 2) * 0.02;
    points.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const GlitchLayer = ({ color, offset, opacity }: { color: string, offset: [number, number, number], opacity: number }) => {
  const points = useRef<THREE.Points>(null!);
  const count = 400;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 0.4 + Math.random() * 0.12;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.1;
    points.current.rotation.x = time * 0.05;
    
    const glitch = Math.sin(time * 3.7) * 0.01;
    points.current.position.x = offset[0] + glitch;
  });

  return (
    <points ref={points} position={offset}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.01}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-background-deep">
      <Canvas camera={{ position: [0, 0.2, 1], fov: 75 }}>
        <InfiniteGrid />
        <Particles />
        <GlitchLayer color="#ff3355" offset={[0.01, 0, 0]} opacity={0.15} />
        <GlitchLayer color="#3366ff" offset={[-0.01, 0, 0]} opacity={0.12} />
      </Canvas>
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
}
