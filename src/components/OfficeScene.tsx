"use client";

import { Html, OrbitControls, Text } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Department, departments } from "./officeData";

type Props = {
  onSelect: (department: Department) => void;
};

function Room({
  department,
  active,
  onSelect,
}: {
  department: Department;
  active: boolean;
  onSelect: (department: Department) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = department.position;
  const [w, h, d] = department.size;

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(department);
  };

  return (
    <group position={[x, y, z]}>
      <mesh
        onClick={handleClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={active ? "#d9ff65" : hovered ? "#bfc5b6" : "#8d9489"}
          transparent
          opacity={active ? 0.75 : 0.48}
          roughness={0.78}
          metalness={0.05}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w, h, d)]} />
        <lineBasicMaterial color="#171b17" transparent opacity={0.6} />
      </lineSegments>

      <Text
        position={[0, h / 2 + 0.28, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.34}
        color="#171b17"
        anchorX="center"
        anchorY="middle"
      >
        {department.label.toUpperCase()}
      </Text>
    </group>
  );
}

function Player() {
  const ref = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const { camera } = useThree();

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const speed = 4.2 * delta;
    const p = ref.current.position;

    if (keys.current.w || keys.current.arrowup) p.z -= speed;
    if (keys.current.s || keys.current.arrowdown) p.z += speed;
    if (keys.current.a || keys.current.arrowleft) p.x -= speed;
    if (keys.current.d || keys.current.arrowright) p.x += speed;

    p.x = THREE.MathUtils.clamp(p.x, -9, 9);
    p.z = THREE.MathUtils.clamp(p.z, -11, 5);

    const target = new THREE.Vector3(p.x + 6.5, 8.5, p.z + 9);
    camera.position.lerp(target, 0.05);
    camera.lookAt(p.x, 0, p.z - 2);
  });

  return (
    <group ref={ref} position={[0, 0, 4]}>
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.28, 0.75, 6, 12]} />
        <meshStandardMaterial color="#171b17" />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.32, 18, 18]} />
        <meshStandardMaterial color="#9a5f3f" />
      </mesh>
    </group>
  );
}

function World({ selected, onSelect }: { selected: Department | null; onSelect: Props["onSelect"] }) {
  const grid = useMemo(() => new THREE.GridHelper(24, 24, "#596057", "#aeb4a9"), []);

  return (
    <>
      <color attach="background" args={["#e9ece5"]} />
      <fog attach="fog" args={["#e9ece5", 18, 34]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[8, 14, 6]} intensity={2.8} castShadow />
      <primitive object={grid} position={[0, 0.01, -3]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -3]} receiveShadow>
        <planeGeometry args={[24, 28]} />
        <meshStandardMaterial color="#d9ddd5" roughness={1} />
      </mesh>

      {departments.map((department) => (
        <Room
          key={department.id}
          department={department}
          active={selected?.id === department.id}
          onSelect={onSelect}
        />
      ))}

      <Player />

      <Html position={[0, 0.4, 4]} center distanceFactor={12}>
        <div className="player-label">YOU</div>
      </Html>

      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={19}
        minPolarAngle={0.55}
        maxPolarAngle={1.2}
        target={[0, 0, -3]}
      />
    </>
  );
}

export default function OfficeScene({ onSelect }: Props) {
  const [selected, setSelected] = useState<Department | null>(null);

  const select = (department: Department) => {
    setSelected(department);
    onSelect(department);
  };

  return (
    <Canvas shadows camera={{ position: [8, 10, 13], fov: 45 }}>
      <World selected={selected} onSelect={select} />
    </Canvas>
  );
}
