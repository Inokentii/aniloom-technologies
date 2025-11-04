import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const THEME_STORAGE_KEY = "aniloom-theme";
const QUALITY_STORAGE_KEY = "aniloom-quality";

const getStoredValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const initScene = () => {
  const canvas = document.getElementById("scene-canvas");
  if (!canvas) return;

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
    200
  );
  camera.position.set(0, 5, 20);

  const ambientLight = new THREE.AmbientLight(0x9bb0ff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xdde4ff, 1.2);
  keyLight.position.set(6, 12, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4c66aa, 0.5);
  fillLight.position.set(-10, 6, -6);
  scene.add(fillLight);

  const goldenRatio = 1.618;
  const rainbowColorSpeed = 0.05;

  const domeMaterials = [];
  const connectionMeshes = [];
  const cloudGroups = [];
  const cloudMaterials = [];

  const sharedGlassMaterial = () =>
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x7fa9ff),
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.7,
      thickness: 1.5,
      transparent: true,
      opacity: 0.93,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
    });

  const registerDomeMaterial = (material, baseHue, luminance, phase) => {
    domeMaterials.push({ material, baseHue, luminance, phase });
    return material;
  };

  const createCore = (radius, colorPhase) => {
    const group = new THREE.Group();

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 80, 80, 0, Math.PI * 2, 0, Math.PI / 2),
      registerDomeMaterial(sharedGlassMaterial(), 0.55, 0.58, colorPhase)
    );
    dome.rotation.x = Math.PI;
    group.add(dome);

    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.32, 40, 40),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x9bd8ff),
        emissive: new THREE.Color(0x4db5ff),
        emissiveIntensity: 0.7,
        roughness: 0.2,
        metalness: 0.0,
      })
    );
    inner.position.y = radius * 0.35;
    group.add(inner);

    const basePlate = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.95, 64),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4f638c),
        metalness: 0.4,
        roughness: 0.55,
      })
    );
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.y = -radius * 0.02;
    group.add(basePlate);

    return group;
  };

  const createSatellite = (radius, colorPhase) => {
    const group = new THREE.Group();

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 60, 60, 0, Math.PI * 2, 0, Math.PI / 2),
      registerDomeMaterial(sharedGlassMaterial(), 0.6, 0.6, colorPhase)
    );
    dome.rotation.x = Math.PI;
    group.add(dome);

    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.22, radius * 0.28, radius * 0.8, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xdfe8ff),
        emissive: new THREE.Color(0x68aaff),
        emissiveIntensity: 0.25,
        roughness: 0.35,
        metalness: 0.1,
      })
    );
    tower.position.y = radius * 0.3;
    group.add(tower);

    const innerOrb = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.18, 24, 24),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x9bcfff),
        emissive: new THREE.Color(0x4c9dff),
        emissiveIntensity: 0.55,
        roughness: 0.25,
      })
    );
    innerOrb.position.set(radius * 0.15, radius * 0.4, 0);
    group.add(innerOrb);

    const basePlate = new THREE.Mesh(
      new THREE.CircleGeometry(radius * 0.85, 48),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x627ea9),
        metalness: 0.35,
        roughness: 0.6,
      })
    );
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.y = -radius * 0.02;
    group.add(basePlate);

    return group;
  };

  const centralCore = createCore(3.4, 0.0);
  scene.add(centralCore);

  const satelliteConfigs = [
    { angle: Math.PI / 6, radius: 5.4, height: 0.6, phase: 0.2 },
    { angle: Math.PI * 0.9, radius: 6.3, height: 0.4, phase: 0.35 },
    { angle: Math.PI * 1.75, radius: 7.5, height: 0.85, phase: 0.5 },
    { angle: Math.PI * 2.45, radius: 6.8 * goldenRatio, height: 0.3, phase: 0.68 },
  ];

  satelliteConfigs.forEach((config, index) => {
    const group = createSatellite(2.1 * (index === 0 ? 1.05 : 1), config.phase);
    const polarRadius = config.radius * Math.pow(goldenRatio, index * 0.08);
    const x = Math.cos(config.angle) * polarRadius;
    const z = Math.sin(config.angle) * polarRadius;
    group.position.set(x, config.height, z);
    group.rotation.y = -config.angle * 0.6;
    group.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.08;
    scene.add(group);

    const curvePoints = [
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(x * 0.42, 1.8 + index * 0.2, z * 0.42),
      new THREE.Vector3(x, config.height + 0.2, z),
    ];
    const conduitCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(conduitCurve, 48, 0.12, 12, false),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x86a9ff),
        emissive: new THREE.Color(0x2f6fff),
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.4,
      })
    );
    scene.add(tube);
    connectionMeshes.push(tube);
  });

  const createCloud = (centralPosition, scaleMultiplier, depthOffset) => {
    const cloudGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(1.0, 32, 32);
    for (let i = 0; i < 4; i += 1) {
      const puff = new THREE.Mesh(
        sphereGeo,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xd2dff3),
          roughness: 0.8,
          metalness: 0.0,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
        })
      );
      puff.position.set(
        centralPosition.x + (Math.random() - 0.5) * 1.8 * scaleMultiplier,
        centralPosition.y + (Math.random() - 0.5) * 0.7 * scaleMultiplier,
        centralPosition.z + depthOffset + Math.random() * scaleMultiplier * 0.6
      );
      puff.scale.setScalar(scaleMultiplier * (1.2 - i * 0.1));
      cloudGroup.add(puff);
      cloudMaterials.push(puff.material);
    }
    scene.add(cloudGroup);
    cloudGroups.push(cloudGroup);
  };

  createCloud(new THREE.Vector3(0, 7, -2), 2.4, 1.2);
  createCloud(new THREE.Vector3(4, 5.6, 3), 2.1, -1.5);
  createCloud(new THREE.Vector3(-5, 6.2, 4), 1.8, 0.4);
  createCloud(new THREE.Vector3(2.5, 7.5, -4), 2.6, -1.1);
  createCloud(new THREE.Vector3(-3.5, 5.4, -3.5), 1.9, 0.6);

  const cameraStops = [
    {
      id: "intro-orbit",
      position: new THREE.Vector3(0, 8.5, 18),
      lookAt: new THREE.Vector3(0, 2.4, 0),
    },
    {
      id: "dome-core",
      position: new THREE.Vector3(0.4, 6.4, 11),
      lookAt: new THREE.Vector3(0, 2.5, 0),
    },
    {
      id: "dome-web",
      position: new THREE.Vector3(6.3, 4, 8),
      lookAt: new THREE.Vector3(3.2, 2, 3.1),
    },
    {
      id: "dome-mobile",
      position: new THREE.Vector3(-6.8, 3.6, 9.5),
      lookAt: new THREE.Vector3(-4, 2, 1.2),
    },
    {
      id: "dome-chain",
      position: new THREE.Vector3(-1, 5.5, -10),
      lookAt: new THREE.Vector3(-3.8, 2.2, -4.5),
    },
    {
      id: "dome-games",
      position: new THREE.Vector3(4.5, 4.2, -11),
      lookAt: new THREE.Vector3(2.2, 2.1, -4.1),
    },
    {
      id: "contact",
      position: new THREE.Vector3(0, 3.5, 14),
      lookAt: new THREE.Vector3(0, 0.4, 0),
    },
  ];

  let desiredCameraPosition = cameraStops[0].position.clone();
  let desiredLookAt = cameraStops[0].lookAt.clone();
  const lookAtVector = desiredLookAt.clone();

  const updateCameraTargetForScroll = () => {
    const viewportMid = window.scrollY + window.innerHeight / 2;
    let closestStop = cameraStops[0];
    let closestDistance = Infinity;
    cameraStops.forEach((stop) => {
      const el = document.getElementById(stop.id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elementMid = rect.top + window.scrollY + rect.height / 2;
      const distance = Math.abs(elementMid - viewportMid);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStop = stop;
      }
    });
    desiredCameraPosition = closestStop.position.clone();
    desiredLookAt = closestStop.lookAt.clone();
  };

  const getInitialQuality = () => {
    if (document.body.dataset.quality === "low") return true;
    if (document.body.dataset.quality === "high") return false;
    const stored = getStoredValue(QUALITY_STORAGE_KEY);
    return stored === "low";
  };

  const isDarkTheme = () =>
    document.body.classList.contains("theme-dark") ||
    (!document.body.classList.contains("theme-light") &&
      getStoredValue(THEME_STORAGE_KEY) !== "light");

  const applyThemeToScene = (theme) => {
    const isDark = theme === "dark";
    const backgroundColor = new THREE.Color(isDark ? 0x030712 : 0xe8f1ff);
    scene.background = backgroundColor;
    scene.fog = new THREE.Fog(backgroundColor, 18, 48);

    ambientLight.intensity = isDark ? 0.65 : 0.85;
    ambientLight.color = new THREE.Color(isDark ? 0x94aaff : 0xcfe2ff);
    keyLight.intensity = isDark ? 1.25 : 0.95;
    keyLight.color = new THREE.Color(isDark ? 0xcdd6ff : 0xe4e9ff);
    fillLight.intensity = isDark ? 0.45 : 0.3;

    cloudMaterials.forEach((material) => {
      material.color.lerp(
        new THREE.Color(isDark ? 0xc7d7f1 : 0xf1f4fb),
        0.6
      );
      material.opacity = isDark ? 0.34 : 0.42;
    });
  };

  let lowQualityMode = getInitialQuality();
  const applyQualityToScene = (isLow) => {
    lowQualityMode = isLow;
    renderer.setPixelRatio(isLow ? 1 : Math.min(window.devicePixelRatio, 1.75));
    cloudGroups.forEach((group, index) => {
      group.visible = isLow ? index < 3 : true;
    });
    domeMaterials.forEach((entry) => {
      entry.material.transmission = isLow ? 0.45 : 0.7;
      entry.material.roughness = isLow ? 0.18 : 0.1;
    });
  };

  window.addEventListener("aniloom:theme-change", (event) => {
    applyThemeToScene(event.detail.theme);
  });

  window.addEventListener("aniloom:quality-change", (event) => {
    applyQualityToScene(event.detail.lowQuality);
  });

  applyThemeToScene(isDarkTheme() ? "dark" : "light");
  applyQualityToScene(lowQualityMode);

  updateCameraTargetForScroll();
  window.addEventListener("scroll", () => {
    requestAnimationFrame(updateCameraTargetForScroll);
  });

  window.addEventListener("resize", () => {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  const tempColor = new THREE.Color();

  const animate = () => {
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    camera.position.lerp(desiredCameraPosition, lowQualityMode ? 0.04 : 0.06);
    lookAtVector.lerp(desiredLookAt, lowQualityMode ? 0.05 : 0.07);
    camera.lookAt(lookAtVector);

    cloudGroups.forEach((group, idx) => {
      const direction = idx % 2 === 0 ? 1 : -1;
      group.position.x += direction * delta * 0.12;
      group.position.z += Math.sin(elapsed * 0.08 + idx) * delta * 0.05;
      if (group.position.x > 12) group.position.x = -12;
      if (group.position.x < -12) group.position.x = 12;
    });

    domeMaterials.forEach((entry) => {
      const hue =
        (entry.baseHue + entry.phase + elapsed * rainbowColorSpeed * 0.1) % 1;
      tempColor.setHSL(hue, 0.42, entry.luminance);
      entry.material.color.lerp(tempColor, 0.15);
      entry.material.opacity = lowQualityMode ? 0.88 : 0.93;
    });

    connectionMeshes.forEach((mesh, idx) => {
      const emissivePulse =
        0.25 + (Math.sin(elapsed * (0.4 + idx * 0.05)) + 1) * 0.08;
      mesh.material.emissiveIntensity = emissivePulse;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

document.addEventListener("DOMContentLoaded", initScene);
