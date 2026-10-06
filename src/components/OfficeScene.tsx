"use client";

import { Html, Text } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Department, departments } from "./officeData";

type Props = {
  onSelect: (department: Department) => void;
  onNearby: (department: Department | null) => void;
};

const WALL_HEIGHT = 1.45;
const WALL_THICKNESS = 0.12;

function Wall({
  position,
  size,
}: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#f1f0e9" roughness={0.92} />
    </mesh>
  );
}

function Desk({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.55, 0.1, 0.68]} />
        <meshStandardMaterial color="#4a4d47" roughness={0.8} />
      </mesh>
      {[-0.62, 0.62].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.45, 0.5]} />
          <meshStandardMaterial color="#4a4d47" />
        </mesh>
      ))}
      <mesh position={[0, 0.74, -0.08]} castShadow>
        <boxGeometry args={[0.65, 0.4, 0.04]} />
        <meshStandardMaterial color="#20231f" />
      </mesh>
    </group>
  );
}

function NPC({
  department,
  active,
  onSelect,
}: {
  department: Department;
  active: boolean;
  onSelect: (department: Department) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [x, , z] = department.npcPosition;

  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(department);
  };

  return (
    <group
      position={[x, 0, z]}
      onClick={click}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.7, 6, 12]} />
        <meshStandardMaterial color={active || hovered ? "#d9ff65" : "#30342f"} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color="#70472f" roughness={0.92} />
      </mesh>
      <Html position={[0, 1.95, 0]} center distanceFactor={11}>
        <div className={`npc-tag ${active ? "npc-tag--active" : ""}`}>
          <strong>{department.npcName}</strong>
          <span>{department.npcRole}</span>
        </div>
      </Html>
    </group>
  );
}

function Room({
  department,
  active,
  onSelect,
}: {
  department: Department;
  active: boolean;
  onSelect: (department: Department) => void;
}) {
  const [x, , z] = department.position;
  const [w, , d] = department.size;
  const isLeft = x < -1;
  const isRight = x > 1;
  const isReception = department.id === "reception";
  const doorWidth = 1.5;
  const innerWallX = isLeft ? w / 2 : -w / 2;

  return (
    <group position={[x, 0, z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(department);
        }}
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={active ? "#e4efbd" : "#d8d9d1"} roughness={1} />
      </mesh>

      <Wall position={[0, WALL_HEIGHT / 2, -d / 2]} size={[w, WALL_HEIGHT, WALL_THICKNESS]} />
      {!isReception && (
        <Wall position={[0, WALL_HEIGHT / 2, d / 2]} size={[w, WALL_HEIGHT, WALL_THICKNESS]} />
      )}
      <Wall position={[-w / 2, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, d]} />
      <Wall position={[w / 2, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, d]} />

      {(isLeft || isRight) && (
        <>
          <mesh
            position={[
              innerWallX,
              WALL_HEIGHT / 2,
              -(d / 2 - (d - doorWidth) / 4),
            ]}
          >
            <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, (d - doorWidth) / 2]} />
            <meshStandardMaterial color="#f1f0e9" />
          </mesh>
          <mesh
            position={[
              innerWallX,
              WALL_HEIGHT / 2,
              d / 2 - (d - doorWidth) / 4,
            ]}
          >
            <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, (d - doorWidth) / 2]} />
            <meshStandardMaterial color="#f1f0e9" />
          </mesh>
        </>
      )}

      <Text
        position={[0, WALL_HEIGHT + 0.16, -d / 2 + 0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color="#171b17"
        anchorX="center"
        anchorY="middle"
      >
        {department.label.toUpperCase()}
      </Text>

      <Desk
        position={[
          isLeft ? -0.75 : isRight ? 0.75 : 0,
          0,
          isReception ? -0.35 : -0.25,
        ]}
        rotation={isRight ? Math.PI : 0}
      />

      {department.id === "procurement" && (
        <group position={[1.7, 0, 0.85]}>
          {[0, 0.6, 1.2].map((y) => (
            <mesh key={y} position={[0, 0.25 + y, 0]} castShadow>
              <boxGeometry args={[0.9, 0.08, 1.15]} />
              <meshStandardMaterial color="#777a70" />
            </mesh>
          ))}
        </group>
      )}

      {department.id === "operations" && (
        <mesh position={[-0.3, 0.88, -d / 2 + 0.09]}>
          <boxGeometry args={[2.4, 0.85, 0.05]} />
          <meshStandardMaterial color="#20231f" emissive="#243020" emissiveIntensity={0.25} />
        </mesh>
      )}
    </group>
  );
}

function Player({
  onNearby,
  onInteract,
}: {
  onNearby: Props["onNearby"];
  onInteract: Props["onSelect"];
}) {
  const ref = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const nearbyRef = useRef<Department | null>(null);
  const lastNearbyId = useRef<string | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.current[key] = true;

      if (key === "e" && nearbyRef.current) {
        onInteract(nearbyRef.current);
      }
    };
    const up = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [onInteract]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const speed = 3.6 * delta;
    const p = ref.current.position;

    if (keys.current.w || keys.current.arrowup) p.z -= speed;
    if (keys.current.s || keys.current.arrowdown) p.z += speed;
    if (keys.current.a || keys.current.arrowleft) p.x -= speed;
    if (keys.current.d || keys.current.arrowright) p.x += speed;

    p.x = THREE.MathUtils.clamp(p.x, -8.4, 8.4);
    p.z = THREE.MathUtils.clamp(p.z, -10.2, 5.2);

    let nearest: Department | null = null;
    let nearestDistance = 1.65;

    for (const department of departments) {
      const [nx, , nz] = department.npcPosition;
      const distance = Math.hypot(p.x - nx, p.z - nz);
      if (distance < nearestDistance) {
        nearest = department;
        nearestDistance = distance;
      }
    }

    nearbyRef.current = nearest;
    const nextId = nearest?.id ?? null;
    if (nextId !== lastNearbyId.current) {
      lastNearbyId.current = nextId;
      onNearby(nearest);
    }

    const cameraTarget = new THREE.Vector3(p.x + 5.8, 7.4, p.z + 7.4);
    camera.position.lerp(cameraTarget, 0.055);
    camera.lookAt(p.x, 0.2, p.z - 2.2);
  });

  return (
    <group ref={ref} position={[0, 0, 4.35]}>
      <mesh position={[0, 0.68, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.68, 6, 12]} />
        <meshStandardMaterial color="#171b17" />
      </mesh>
      <mesh position={[0, 1.46, 0]} castShadow>
        <sphereGeometry args={[0.29, 18, 18]} />
        <meshStandardMaterial color="#8b5638" />
      </mesh>
      <Html position={[0, 1.9, 0]} center distanceFactor={11}>
        <div className="player-label">YOU</div>
      </Html>
    </group>
  );
}

function World({
  selected,
  nearby,
  onSelect,
  onNearby,
}: {
  selected: Department | null;
  nearby: Department | null;
  onSelect: Props["onSelect"];
  onNearby: Props["onNearby"];
}) {
  const grid = useMemo(() => new THREE.GridHelper(22, 22, "#8b8e86", "#c4c7bf"), []);

  return (
    <>
      <color attach="background" args={["#e9ece5"]} />
      <fog attach="fog" args={["#e9ece5", 19, 32]} />
      <ambientLight intensity={1.9} />
      <directionalLight position={[8, 14, 8]} intensity={2.7} castShadow shadow-mapSize={[1024, 1024]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -2.7]} receiveShadow>
        <planeGeometry args={[19, 17]} />
        <meshStandardMaterial color="#c9cbc3" roughness={1} />
      </mesh>
      <primitive object={grid} position={[0, 0.005, -2.7]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -4.8]} receiveShadow>
        <planeGeometry args={[3.3, 11.2]} />
        <meshStandardMaterial color="#e8e7df" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 4.55]}>
        <planeGeometry args={[3.5, 1.4]} />
        <meshStandardMaterial color="#d9ff65" />
      </mesh>
      <Text
        position={[0, 0.035, 4.55]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color="#171b17"
      >
        ENTER THE OFFICE
      </Text>

      {departments.map((department) => (
        <Room
          key={department.id}
          department={department}
          active={selected?.id === department.id}
          onSelect={onSelect}
        />
      ))}

      {departments.map((department) => (
        <NPC
          key={department.id}
          department={department}
          active={nearby?.id === department.id}
          onSelect={onSelect}
        />
      ))}

      <Player onNearby={onNearby} onInteract={onSelect} />
    </>
  );
}

export default function OfficeScene({ onSelect, onNearby }: Props) {
  const [selected, setSelected] = useState<Department | null>(null);
  const [nearby, setNearby] = useState<Department | null>(null);

  const select = (department: Department) => {
    setSelected(department);
    onSelect(department);
  };

  const nearbyChange = (department: Department | null) => {
    setNearby(department);
    onNearby(department);
  };

  return (
    <Canvas shadows camera={{ position: [6.5, 8.5, 12], fov: 42 }}>
      <World
        selected={selected}
        nearby={nearby}
        onSelect={select}
        onNearby={nearbyChange}
      />
    </Canvas>
  );
}
