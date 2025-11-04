import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("scene-canvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.5, 8);

  const ambient = new THREE.AmbientLight(0xbdd4ff, 0.6);
  scene.add(ambient);
  const fill = new THREE.DirectionalLight(0xffffff, 0.8);
  fill.position.set(4, 5, 4);
  scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x6bd3ff),
      emissive: new THREE.Color(0x3f7bff),
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.4,
    })
  );
  group.add(sphere);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0.8,
    roughness: 0.15,
  });

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.05, 24, 120),
    ringMaterial.clone()
  );
  innerRing.rotation.x = Math.PI / 4;
  group.add(innerRing);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.08, 24, 140),
    ringMaterial.clone()
  );
  outerRing.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  group.add(outerRing);

  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 400;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 4 + Math.random() * 3;
    const y = (Math.random() - 0.5) * 2.5;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0x89aaff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    })
  );
  scene.add(particles);

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    group.rotation.y = t * 0.3;
    outerRing.rotation.z = Math.sin(t * 0.2) * 0.4;
    particles.rotation.y = -t * 0.05;
    renderer.render(scene, camera);
  });

  const applyTheme = (theme) => {
    if (theme === "dark") {
      scene.background = new THREE.Color(0x050b18);
      ambient.color.set(0xa9c6ff);
      fill.intensity = 0.9;
    } else {
      scene.background = new THREE.Color(0xf4efe3);
      ambient.color.set(0xfef6e9);
      fill.intensity = 0.75;
    }
  };

  const currentTheme = document.body.classList.contains("theme-dark")
    ? "dark"
    : "light";
  applyTheme(currentTheme);

  window.addEventListener("aniloom:theme-change", (event) => {
    applyTheme(event.detail.theme);
  });
}
