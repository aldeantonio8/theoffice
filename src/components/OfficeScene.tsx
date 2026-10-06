"use client";

import { Html, Text } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Department, departments } from "./officeData";
import HumanAvatar from "./HumanAvatar";

type Props = {
  onSelect: (department: Department) => void;
  onNearby: (department: Department | null) => void;
  onAreaChange: (department: Department | null) => void;
  activeDepartmentId: Department["id"] | null;
};

const WALL_HEIGHT = 1.6;
const WALL_THICKNESS = 0.12;

function isWalkable(x: number, z: number) {
  const inRect = (
    px: number,
    pz: number,
    cx: number,
    cz: number,
    width: number,
    depth: number,
  ) => Math.abs(px - cx) <= width / 2 && Math.abs(pz - cz) <= depth / 2;

  // Main circulation spine and entrance.
  if (inRect(x, z, 0, -5.1, 3.15, 20.6)) return true;
  if (inRect(x, z, 0, 4.55, 3.7, 1.4)) return true;

  // Reception opens directly into the circulation spine.
  const reception = departments.find((department) => department.id === "reception");
  if (
    reception &&
    inRect(
      x,
      z,
      reception.position[0],
      reception.position[2],
      reception.size[0] - 0.28,
      reception.size[2] - 0.28,
    )
  ) {
    return true;
  }

  // Side rooms are bounded, except for a narrow doorway bridge to the corridor.
  for (const department of departments) {
    if (department.id === "reception") continue;

    const [cx, , cz] = department.position;
    const [width, , depth] = department.size;

    if (inRect(x, z, cx, cz, width - 0.36, depth - 0.36)) return true;

    const doorZ = cz + 0.35;
    const connectorX = cx < 0 ? -2.03 : 2.03;
    if (inRect(x, z, connectorX, doorZ, 1.45, 1.35)) return true;
  }

  return false;
}

function Wall({
  position,
  size,
  color = "#f2f1ea",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function Chair({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.58, 0.12, 0.58]} />
        <meshStandardMaterial color="#252824" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.72, 0.26]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.58, 0.72, 0.1]} />
        <meshStandardMaterial color="#30332e" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
        <meshStandardMaterial color="#52564f" />
      </mesh>
    </group>
  );
}

function Desk({
  position,
  rotation = 0,
}: {
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.65, 0.1, 0.72]} />
        <meshStandardMaterial color="#55584f" roughness={0.78} />
      </mesh>
      {[-0.66, 0.66].map((x) => (
        <mesh key={x} position={[x, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.45, 0.54]} />
          <meshStandardMaterial color="#4a4d47" />
        </mesh>
      ))}
      <mesh position={[0, 0.76, -0.09]} castShadow>
        <boxGeometry args={[0.68, 0.42, 0.045]} />
        <meshStandardMaterial color="#1f221f" emissive="#131512" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.56, 0.12]} castShadow>
        <boxGeometry args={[0.56, 0.035, 0.22]} />
        <meshStandardMaterial color="#2a2d29" />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.23, 0.18, 0.36, 12]} />
        <meshStandardMaterial color="#8b806d" roughness={1} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.11, 0.62, Math.sin(angle) * 0.11]}
            rotation={[0.5, angle, 0]}
            castShadow
          >
            <capsuleGeometry args={[0.08, 0.42, 4, 8]} />
            <meshStandardMaterial color="#596c4e" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

function Shelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0.22, 0.72, 1.22].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[1.45, 0.08, 0.55]} />
          <meshStandardMaterial color="#686b63" />
        </mesh>
      ))}
      {[-0.66, 0.66].map((x) => (
        <mesh key={x} position={[x, 0.72, 0]} castShadow>
          <boxGeometry args={[0.08, 1.42, 0.55]} />
          <meshStandardMaterial color="#555850" />
        </mesh>
      ))}
      {[
        [-0.38, 0.43, 0],
        [0.28, 0.43, 0],
        [-0.28, 0.93, 0],
        [0.38, 0.93, 0],
      ].map(([x, y, z], index) => (
        <mesh key={index} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.42, 0.28, 0.4]} />
          <meshStandardMaterial color={index % 2 ? "#b6aa91" : "#9e8b6c"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function Sofa({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.7, 0.42, 0.75]} />
        <meshStandardMaterial color="#73776d" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.72, 0.3]} castShadow>
        <boxGeometry args={[1.7, 0.65, 0.16]} />
        <meshStandardMaterial color="#777b71" roughness={0.96} />
      </mesh>
      {[-0.79, 0.79].map((x) => (
        <mesh key={x} position={[x, 0.48, 0]}>
          <boxGeometry args={[0.14, 0.48, 0.78]} />
          <meshStandardMaterial color="#666a61" />
        </mesh>
      ))}
    </group>
  );
}

function GlassDoor({
  position,
  rotation = 0,
  open = false,
}: {
  position: [number, number, number];
  rotation?: number;
  open?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    const direction = rotation > 0 ? 1 : -1;
    const target = open ? rotation + direction * 0.82 : rotation;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, target, 0.08);
  });

  return (
    <group ref={ref} position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.82, 1.5, 0.035]} />
        <meshPhysicalMaterial
          color="#bed4d1"
          transparent
          opacity={0.32}
          roughness={0.2}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0.31, 0.78, 0.035]}>
        <boxGeometry args={[0.035, 1.5, 0.035]} />
        <meshStandardMaterial color="#363936" />
      </mesh>
      <mesh position={[0.18, 0.82, 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#171b17" />
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
  const ref = useRef<THREE.Group>(null);
  const [x, , z] = department.npcPosition;
  const variante =
    department.id === "reception" || department.id === "hr" || department.id === "projects"
      ? "feminino"
      : "masculino";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + department.id.length * 0.63;
    ref.current.rotation.y = Math.sin(t * 0.65) * (active ? 0.04 : 0.018);
  });

  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(department);
  };

  return (
    <group
      ref={ref}
      position={[x, 0, z]}
      onClick={click}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <HumanAvatar variante={variante} estado={active ? "falar" : "parado"} />

      {(active || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <torusGeometry args={[0.48, 0.025, 8, 32]} />
          <meshBasicMaterial color="#d9ff65" />
        </mesh>
      )}

      <Html position={[0, 2.08, 0]} center distanceFactor={11}>
        <div className={`npc-tag ${active ? "npc-tag--active" : ""}`}>
          <strong>{department.npcName}</strong>
          <span>{department.npcRole}</span>
        </div>
      </Html>
    </group>
  );
}

function DepartmentProps({ department }: { department: Department }) {
  const id = department.id;

  if (id === "reception") {
    return (
      <>
        <Sofa position={[-1.45, 0, 1.05]} />
        <Plant position={[1.9, 0, 1.05]} />
        <Text
          position={[0, 1.15, -1.7]}
          fontSize={0.34}
          color="#171b17"
          anchorX="center"
        >
          THE OFFICE
        </Text>
      </>
    );
  }

  if (id === "procurement") {
    return (
      <>
        <Shelf position={[1.65, 0, 0.95]} />
        <Plant position={[-1.8, 0, 1.25]} />
      </>
    );
  }

  if (id === "operations") {
    return (
      <>
        <mesh position={[-0.2, 1.0, -2.04]}>
          <boxGeometry args={[2.6, 0.92, 0.055]} />
          <meshStandardMaterial color="#20231f" emissive="#223021" emissiveIntensity={0.35} />
        </mesh>
        {[[-0.72, 1.08, -2.005], [0, 1.08, -2.005], [0.72, 1.08, -2.005]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[0.52, 0.34, 0.02]} />
            <meshStandardMaterial
              color={i === 1 ? "#d9ff65" : "#95a58c"}
              emissive={i === 1 ? "#8aa12f" : "#30402d"}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
        <Chair position={[-0.65, 0, 0.75]} />
      </>
    );
  }

  if (id === "director") {
    return (
      <>
        <Sofa position={[1.45, 0, 0.95]} />
        <Plant position={[-1.75, 0, 1.15]} />
        <mesh position={[0, 1.08, -2.04]}>
          <boxGeometry args={[1.8, 0.9, 0.05]} />
          <meshStandardMaterial color="#d7d0bc" />
        </mesh>
      </>
    );
  }

  if (id === "projects") {
    return (
      <>
        {[-1.45, 0, 1.45].map((x, index) => (
          <group key={x} position={[x, 0, 0.9]}>
            <mesh position={[0, 0.52, 0]} castShadow>
              <boxGeometry args={[0.95, 1.02, 0.55]} />
              <meshStandardMaterial color={index === 1 ? "#d9ff65" : "#8d9187"} roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.08, -0.12]}>
              <boxGeometry args={[0.72, 0.36, 0.035]} />
              <meshStandardMaterial color="#222521" emissive="#182018" emissiveIntensity={0.25} />
            </mesh>
          </group>
        ))}
      </>
    );
  }

  if (id === "meeting") {
    return (
      <>
        <mesh position={[0, 0.5, 0.4]} castShadow>
          <boxGeometry args={[2.7, 0.12, 1.15]} />
          <meshStandardMaterial color="#5f625b" roughness={0.82} />
        </mesh>
        {[-1.25, -0.4, 0.4, 1.25].map((x) => (
          <Chair key={x} position={[x, 0, 1.18]} rotation={Math.PI} />
        ))}
        <mesh position={[0, 1.06, -2.04]}>
          <boxGeometry args={[1.9, 0.92, 0.05]} />
          <meshStandardMaterial color="#20231f" emissive="#283426" emissiveIntensity={0.28} />
        </mesh>
      </>
    );
  }

  return (
    <>
      <Chair position={[-1.45, 0, 1]} />
      <Plant position={[1.8, 0, 1.2]} />
    </>
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
  const innerWallX = isLeft ? w / 2 : -w / 2;
  const doorRotation = isLeft ? Math.PI / 2 : -Math.PI / 2;

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
        <meshStandardMaterial color={active ? "#e4efbd" : "#dadbd4"} roughness={1} />
      </mesh>

      <Wall position={[0, WALL_HEIGHT / 2, -d / 2]} size={[w, WALL_HEIGHT, WALL_THICKNESS]} />
      {!isReception && (
        <Wall position={[0, WALL_HEIGHT / 2, d / 2]} size={[w, WALL_HEIGHT, WALL_THICKNESS]} />
      )}

      {!isLeft && (
        <Wall position={[-w / 2, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, d]} />
      )}
      {!isRight && (
        <Wall position={[w / 2, WALL_HEIGHT / 2, 0]} size={[WALL_THICKNESS, WALL_HEIGHT, d]} />
      )}

      {(isLeft || isRight) && (
        <>
          <Wall
            position={[innerWallX, WALL_HEIGHT / 2, -1.35]}
            size={[WALL_THICKNESS, WALL_HEIGHT, 1.3]}
          />
          <Wall
            position={[innerWallX, WALL_HEIGHT / 2, 1.35]}
            size={[WALL_THICKNESS, WALL_HEIGHT, 1.3]}
          />
          <GlassDoor
            position={[innerWallX + (isLeft ? -0.04 : 0.04), 0, 0.35]}
            rotation={doorRotation}
            open={active}
          />
        </>
      )}

      <Text
        position={[0, WALL_HEIGHT + 0.17, -d / 2 + 0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color="#171b17"
        anchorX="center"
        anchorY="middle"
      >
        {department.label.toUpperCase()}
      </Text>

      <Desk
        position={[
          isLeft ? -0.7 : isRight ? 0.7 : 0,
          0,
          isReception ? -0.3 : -0.25,
        ]}
        rotation={isRight ? Math.PI : 0}
      />

      <DepartmentProps department={department} />
    </group>
  );
}

function Player({
  onNearby,
  onAreaChange,
  onInteract,
  focusDepartment,
}: {
  onNearby: Props["onNearby"];
  onAreaChange: Props["onAreaChange"];
  onInteract: Props["onSelect"];
  focusDepartment: Department | null;
}) {
  const ref = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const nearbyRef = useRef<Department | null>(null);
  const lastNearbyId = useRef<string | null>(null);
  const lastAreaId = useRef<string | null>(null);
  const { camera } = useThree();
  const walkTime = useRef(0);
  const lookTarget = useRef(new THREE.Vector3(0, 0.5, 0));
  const movingRef = useRef(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      keys.current[key] = true;
      if (key === "e" && nearbyRef.current) onInteract(nearbyRef.current);
    };
    const up = (event: KeyboardEvent) => {
      keys.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return (
    <group ref={ref} position={[0, 0, 4.35]}>
      <HumanAvatar variante="masculino" estado={movingRef.current ? "andar" : "parado"} />
      <Html position={[0, 2.08, 0]} center distanceFactor={11}>
        <div className="player-label">VOCÊ</div>
      </Html>
    </group>
  );
}

function CeilingLights() {
  return (
    <>
      {[-11.5, -7.5, -3.5, 0.5, 2.5].map((z) => (
        <group key={z}>
          <pointLight position={[-4.6, 4.2, z]} intensity={16} distance={8} decay={2.1} />
          <pointLight position={[4.6, 4.2, z]} intensity={16} distance={8} decay={2.1} />
        </group>
      ))}
    </>
  );
}

function World({
  selected,
  nearby,
  onSelect,
  onNearby,
  onAreaChange,
}: {
  selected: Department | null;
  nearby: Department | null;
  onSelect: Props["onSelect"];
  onNearby: Props["onNearby"];
  onAreaChange: Props["onAreaChange"];
}) {
  const grid = useMemo(() => new THREE.GridHelper(28, 28, "#8b8e86", "#c4c7bf"), []);

  return (
    <>
      <color attach="background" args={["#e9ece5"]} />
      <fog attach="fog" args={["#e9ece5", 22, 42]} />
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <CeilingLights />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -5.25]} receiveShadow>
        <planeGeometry args={[19, 22]} />
        <meshStandardMaterial color="#c9cbc3" roughness={1} />
      </mesh>
      <primitive object={grid} position={[0, 0.005, -5.25]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -7.35]} receiveShadow>
        <planeGeometry args={[3.3, 16.3]} />
        <meshStandardMaterial color="#e9e8e0" roughness={1} />
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
        ENTRE NO ESCRITÓRIO
      </Text>

      <Wall position={[-9.05, 0.8, -5.15]} size={[0.12, 1.6, 21.5]} color="#bfc2ba" />
      <Wall position={[9.05, 0.8, -5.15]} size={[0.12, 1.6, 21.5]} color="#bfc2ba" />

      {departments.map((department) => (
        <Room
          key={department.id}
          department={department}
          active={selected?.id === department.id || nearby?.id === department.id}
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

      <Player
        onNearby={onNearby}
        onAreaChange={onAreaChange}
        onInteract={onSelect}
        focusDepartment={selected}
      />
    </>
  );
}

export default function OfficeScene({
  onSelect,
  onNearby,
  onAreaChange,
  activeDepartmentId,
}: Props) {
  const [selected, setSelected] = useState<Department | null>(null);
  const [nearby, setNearby] = useState<Department | null>(null);

  useEffect(() => {
    setSelected(
      activeDepartmentId
        ? departments.find((department) => department.id === activeDepartmentId) ?? null
        : null,
    );
  }, [activeDepartmentId]);

  const select = (department: Department) => {
    setSelected(department);
    onSelect(department);
  };

  const nearbyChange = (department: Department | null) => {
    setNearby(department);
    onNearby(department);
  };

  return (
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [6.5, 8.5, 12], fov: 42 }}>
      <World
        selected={selected}
        nearby={nearby}
        onSelect={select}
        onNearby={nearbyChange}
        onAreaChange={onAreaChange}
      />
    </Canvas>
  );
}
