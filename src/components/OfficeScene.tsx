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
  unlockedDepartments: Department["id"][];
  onRestrictedAttempt: (department: Department) => void;
  restrictedDepartmentId: Department["id"] | null;
  accessError: string;
  accessLoading: boolean;
  accessGrantedDepartmentId: Department["id"] | null;
  onSubmitCredentials: (
    department: Department,
    email: string,
    password: string,
  ) => void;
  onCloseAccess: () => void;
  receptionCleared: boolean;
};

const WALL_HEIGHT = 1.38;
const WALL_THICKNESS = 0.13;

const NPC_DEPARTMENT_IDS = new Set<Department["id"]>([
  "reception",
  "operations",
  "director",
  "projects",
]);

const ROOM_PLATES: Record<Department["id"], string> = {
  reception: "RECEPTION",
  hr: "HR",
  procurement: "PROCUREMENT",
  operations: "OPS",
  director: "DIRECTOR",
  projects: "PROJECTS",
  meeting: "MEETING",
};

function isWalkable(
  x: number,
  z: number,
  unlockedDepartments: Set<Department["id"]>,
  receptionCleared: boolean,
) {
  const inRect = (
    px: number,
    pz: number,
    cx: number,
    cz: number,
    width: number,
    depth: number,
  ) => Math.abs(px - cx) <= width / 2 && Math.abs(pz - cz) <= depth / 2;

  // Até concluir a conversa com a Mina, a receção é a única zona navegável.
  if (!receptionCleared && z < 0.58) return false;

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

    const locked =
      department.requiresCredentials && !unlockedDepartments.has(department.id);

    if (!locked && inRect(x, z, cx, cz, width - 0.36, depth - 0.36)) return true;

    const doorZ = cz + 0.35;
    const connectorX = cx < 0 ? -2.03 : 2.03;
    if (!locked && inRect(x, z, connectorX, doorZ, 1.45, 1.35)) return true;
  }

  return false;
}


type MoveRequest = {
  id: number;
  point: THREE.Vector3;
  interact?: Department;
};

const PATH_STEP = 0.38;
const PATH_MIN_X = -8.35;
const PATH_MAX_X = 8.35;
const PATH_MIN_Z = -15.2;
const PATH_MAX_Z = 5.15;

function findPath(
  start: THREE.Vector3,
  destination: THREE.Vector3,
  unlockedDepartments: Set<Department["id"]>,
  receptionCleared: boolean,
) {
  const clampPoint = (point: THREE.Vector3) =>
    new THREE.Vector3(
      THREE.MathUtils.clamp(point.x, PATH_MIN_X, PATH_MAX_X),
      0,
      THREE.MathUtils.clamp(point.z, PATH_MIN_Z, PATH_MAX_Z),
    );

  const startPoint = clampPoint(start);
  const endPoint = clampPoint(destination);

  if (
    !isWalkable(
      endPoint.x,
      endPoint.z,
      unlockedDepartments,
      receptionCleared,
    )
  ) {
    return [] as THREE.Vector3[];
  }

  const toGrid = (value: number, min: number) =>
    Math.round((value - min) / PATH_STEP);
  const fromGrid = (value: number, min: number) => min + value * PATH_STEP;
  const sx = toGrid(startPoint.x, PATH_MIN_X);
  const sz = toGrid(startPoint.z, PATH_MIN_Z);
  const ex = toGrid(endPoint.x, PATH_MIN_X);
  const ez = toGrid(endPoint.z, PATH_MIN_Z);
  const key = (x: number, z: number) => `${x},${z}`;
  const parse = (value: string) => value.split(",").map(Number) as [number, number];
  const startKey = key(sx, sz);
  const endKey = key(ex, ez);

  const open = new Set<string>([startKey]);
  const cameFrom = new Map<string, string>();
  const g = new Map<string, number>([[startKey, 0]]);
  const f = new Map<string, number>([
    [startKey, Math.hypot(ex - sx, ez - sz)],
  ]);

  const directions = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
  ] as const;

  const gridWalkable = (gx: number, gz: number) => {
    const x = fromGrid(gx, PATH_MIN_X);
    const z = fromGrid(gz, PATH_MIN_Z);
    return (
      x >= PATH_MIN_X &&
      x <= PATH_MAX_X &&
      z >= PATH_MIN_Z &&
      z <= PATH_MAX_Z &&
      isWalkable(x, z, unlockedDepartments, receptionCleared)
    );
  };

  let iterations = 0;

  while (open.size && iterations < 4500) {
    iterations += 1;
    let current = "";
    let currentScore = Infinity;

    for (const candidate of open) {
      const score = f.get(candidate) ?? Infinity;
      if (score < currentScore) {
        current = candidate;
        currentScore = score;
      }
    }

    if (!current) break;

    if (current === endKey) {
      const keys: string[] = [current];
      while (cameFrom.has(keys[keys.length - 1])) {
        keys.push(cameFrom.get(keys[keys.length - 1])!);
      }
      keys.reverse();

      const points = keys.slice(1).map((nodeKey) => {
        const [gx, gz] = parse(nodeKey);
        return new THREE.Vector3(
          fromGrid(gx, PATH_MIN_X),
          0,
          fromGrid(gz, PATH_MIN_Z),
        );
      });

      if (
        points.length === 0 ||
        points[points.length - 1].distanceTo(endPoint) > 0.08
      ) {
        points.push(endPoint);
      }

      return points;
    }

    open.delete(current);
    const [cx, cz] = parse(current);

    for (const [dx, dz, cost] of directions) {
      const nx = cx + dx;
      const nz = cz + dz;

      if (!gridWalkable(nx, nz)) continue;

      // Impede cortar diagonalmente através dos cantos das paredes.
      if (
        dx !== 0 &&
        dz !== 0 &&
        (!gridWalkable(cx + dx, cz) || !gridWalkable(cx, cz + dz))
      ) {
        continue;
      }

      const neighbor = key(nx, nz);
      const tentative = (g.get(current) ?? Infinity) + cost;

      if (tentative < (g.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, current);
        g.set(neighbor, tentative);
        f.set(neighbor, tentative + Math.hypot(ex - nx, ez - nz));
        open.add(neighbor);
      }
    }
  }

  return [] as THREE.Vector3[];
}

function getApproachPoint(department: Department) {
  const [x, , z] = department.npcPosition;

  if (department.id === "reception") {
    return new THREE.Vector3(x, 0, z + 1.05);
  }

  return new THREE.Vector3(x < 0 ? x + 1.05 : x - 1.05, 0, z);
}

function getDoorWorldPosition(department: Department) {
  const [x, , z] = department.position;
  const [width] = department.size;
  const innerWallX = x < 0 ? width / 2 : -width / 2;

  return new THREE.Vector3(x + innerWallX, 0, z + 0.35);
}

function getDoorApproachPoint(department: Department) {
  const door = getDoorWorldPosition(department);
  door.x += department.position[0] < 0 ? 0.85 : -0.85;
  return door;
}

function Wall({
  position,
  size,
  color = "#ecebe4",
}: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.92} />
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
  restricted = false,
}: {
  position: [number, number, number];
  rotation?: number;
  open?: boolean;
  restricted?: boolean;
}) {
  const hinge = useRef<THREE.Group>(null);
  const doorWidth = 0.96;
  const doorHeight = 2.18;
  const frame = 0.075;

  useFrame((_, delta) => {
    if (!hinge.current) return;
    const target = open ? (rotation > 0 ? -1.08 : 1.08) : 0;
    hinge.current.rotation.y = THREE.MathUtils.damp(
      hinge.current.rotation.y,
      target,
      7,
      delta,
    );
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Metal frame fixed to the wall */}
      <mesh position={[-doorWidth / 2 - frame / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[frame, doorHeight + frame * 2, 0.095]} />
        <meshStandardMaterial color="#3a3d3a" metalness={0.52} roughness={0.34} />
      </mesh>
      <mesh position={[doorWidth / 2 + frame / 2, doorHeight / 2, 0]} castShadow>
        <boxGeometry args={[frame, doorHeight + frame * 2, 0.095]} />
        <meshStandardMaterial color="#282b29" metalness={0.58} roughness={0.32} />
      </mesh>
      <mesh position={[0, doorHeight + frame / 2, 0]} castShadow>
        <boxGeometry args={[doorWidth + frame * 2, frame, 0.095]} />
        <meshStandardMaterial color="#282b29" metalness={0.58} roughness={0.32} />
      </mesh>

      {/* Threshold */}
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[doorWidth + 0.18, 0.05, 0.16]} />
        <meshStandardMaterial color="#666a66" metalness={0.4} roughness={0.42} />
      </mesh>

      {/* Door leaf pivots around its hinge instead of rotating from the centre */}
      <group ref={hinge} position={[-doorWidth / 2, 0, 0]}>
        <group position={[doorWidth / 2, 0, 0]}>
          <mesh position={[0, doorHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[doorWidth, doorHeight, 0.055]} />
            <meshStandardMaterial
              color={restricted ? "#8f9d99" : "#b9ceca"}
              transparent
              opacity={restricted ? 0.48 : 0.34}
              roughness={0.26}
              metalness={0.02}
            />
          </mesh>

          {/* Slim aluminium rails */}
          {[-doorWidth / 2 + 0.035, doorWidth / 2 - 0.035].map((x) => (
            <mesh key={x} position={[x, doorHeight / 2, 0.035]} castShadow>
              <boxGeometry args={[0.045, doorHeight, 0.04]} />
              <meshStandardMaterial color="#343836" metalness={0.62} roughness={0.28} />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0.035]} castShadow>
            <boxGeometry args={[doorWidth, 0.07, 0.04]} />
            <meshStandardMaterial color="#343836" metalness={0.62} roughness={0.28} />
          </mesh>
          <mesh position={[0, doorHeight - 0.08, 0.035]} castShadow>
            <boxGeometry args={[doorWidth, 0.07, 0.04]} />
            <meshStandardMaterial color="#343836" metalness={0.62} roughness={0.28} />
          </mesh>

          {/* Real pull handle */}
          <mesh position={[0.31, 1.08, 0.105]} castShadow>
            <boxGeometry args={[0.035, 0.42, 0.035]} />
            <meshStandardMaterial color="#d5d7d2" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.31, 0.87, 0.075]} castShadow>
            <boxGeometry args={[0.11, 0.035, 0.055]} />
            <meshStandardMaterial color="#d5d7d2" metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0.31, 1.29, 0.075]} castShadow>
            <boxGeometry args={[0.11, 0.035, 0.055]} />
            <meshStandardMaterial color="#d5d7d2" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Frosted privacy band */}
          <mesh position={[0, 1.08, 0.035]}>
            <boxGeometry args={[0.78, 0.34, 0.012]} />
            <meshStandardMaterial
              color="#dce2df"
              transparent
              opacity={0.3}
              roughness={0.78}
            />
          </mesh>
        </group>
      </group>

      {/* Access reader lives on the fixed frame */}
      {restricted && (
        <group position={[doorWidth / 2 + 0.18, 1.08, 0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.28, 0.07]} />
            <meshStandardMaterial color="#171b17" roughness={0.4} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.045, 0.041]}>
            <boxGeometry args={[0.105, 0.06, 0.008]} />
            <meshStandardMaterial
              color={open ? "#d9ff65" : "#c54b46"}
              emissive={open ? "#91a72d" : "#6b1e1b"}
              emissiveIntensity={0.9}
            />
          </mesh>
          <mesh position={[0, -0.055, 0.041]}>
            <circleGeometry args={[0.034, 18]} />
            <meshStandardMaterial color="#929892" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function NPC({
  department,
  active,
  onApproach,
}: {
  department: Department;
  active: boolean;
  onApproach: (department: Department) => void;
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
    onApproach(department);
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

      <Html position={[0, 2.08, 0]} center>
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
  unlocked,
  onRestrictedAttempt,
  onMove,
  accessActive,
  accessError,
  accessLoading,
  accessGranted,
  onSubmitCredentials,
  onCloseAccess,
  doorNearby,
}: {
  department: Department;
  active: boolean;
  unlocked: boolean;
  onRestrictedAttempt: (department: Department) => void;
  onMove: (point: THREE.Vector3) => void;
  accessActive: boolean;
  accessError: string;
  accessLoading: boolean;
  accessGranted: boolean;
  onSubmitCredentials: Props["onSubmitCredentials"];
  onCloseAccess: Props["onCloseAccess"];
  doorNearby: boolean;
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
          if (department.requiresCredentials && !unlocked) {
            onMove(getDoorApproachPoint(department));
            return;
          }
          onMove(event.point.clone());
        }}
      >
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={active ? "#e5e8d6" : "#d7d5cd"}
          roughness={0.82}
          metalness={0.02}
        />
      </mesh>

      <Wall
        position={[0, WALL_HEIGHT / 2, -d / 2]}
        size={[w, WALL_HEIGHT, WALL_THICKNESS]}
      />

      {isLeft && (
        <Wall
          position={[-w / 2, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS, WALL_HEIGHT, d]}
        />
      )}
      {isRight && (
        <Wall
          position={[w / 2, WALL_HEIGHT / 2, 0]}
          size={[WALL_THICKNESS, WALL_HEIGHT, d]}
        />
      )}

      {(isLeft || isRight) && (
        <>
          <Wall
            position={[innerWallX, WALL_HEIGHT / 2, -1.42]}
            size={[WALL_THICKNESS, WALL_HEIGHT, 1.46]}
          />
          <Wall
            position={[innerWallX, WALL_HEIGHT / 2, 1.42]}
            size={[WALL_THICKNESS, WALL_HEIGHT, 1.46]}
          />
          <GlassDoor
            position={[innerWallX + (isLeft ? -0.04 : 0.04), 0, 0.35]}
            rotation={doorRotation}
            open={unlocked && doorNearby}
            restricted={Boolean(department.requiresCredentials)}
          />
        </>
      )}

      {(isLeft || isRight) && (
        <group
          position={[
            innerWallX + (isLeft ? -0.07 : 0.07),
            1.34,
            -0.48,
          ]}
          rotation={[0, doorRotation, 0]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.44, 0.18, 0.035]} />
            <meshStandardMaterial color="#202320" roughness={0.7} />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.072}
            color="#f3f4ef"
            anchorX="center"
            anchorY="middle"
          >
            {ROOM_PLATES[department.id]}
          </Text>
        </group>
      )}

      <Desk
        position={[
          isLeft ? -0.7 : isRight ? 0.7 : 0,
          0,
          isReception ? -0.3 : -0.25,
        ]}
        rotation={isRight ? Math.PI : 0}
      />

      {department.requiresCredentials && !unlocked && (
        <>
          <Html
            position={[
              innerWallX + (isLeft ? 0.28 : -0.28),
              accessActive ? 1.55 : 1.3,
              0.35,
            ]}
            center
          >
            {accessActive ? (
              accessGranted ? (
                <div className="door-terminal door-terminal--granted">
                  <span>ACESSO AUTORIZADO</span>
                  <strong>Credenciais confirmadas.</strong>
                  <p>A abrir a porta...</p>
                </div>
              ) : (
                <form
                  className="door-terminal"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    onSubmitCredentials(
                      department,
                      String(form.get("accessEmail") || "").trim(),
                      String(form.get("accessPassword") || ""),
                    );
                  }}
                >
                  <div className="door-terminal-head">
                    <div>
                      <span>PORTAL DE ACESSO</span>
                      <strong>{department.label}</strong>
                    </div>
                    <button
                      type="button"
                      aria-label="Fechar terminal"
                      onClick={onCloseAccess}
                    >
                      ×
                    </button>
                  </div>

                  <div className="door-terminal-section-title">
                    <span>JÁ TEM ACESSO?</span>
                    <p>Introduza as credenciais atribuídas a si.</p>
                  </div>

                  <label>
                    Email
                    <input
                      name="accessEmail"
                      type="email"
                      placeholder="email@empresa.com"
                      autoComplete="username"
                      required
                      autoFocus
                    />
                  </label>

                  <label>
                    Password
                    <input
                      name="accessPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  {accessError && (
                    <div className="door-terminal-error">{accessError}</div>
                  )}

                  <button
                    className="door-terminal-submit"
                    type="submit"
                    disabled={accessLoading}
                  >
                    {accessLoading ? "A validar..." : "Entrar"}
                    <span>→</span>
                  </button>

                  <div className="door-terminal-request">
                    <span>NÃO TEM ACESSO?</span>
                    <a
                      href={
                        process.env.NEXT_PUBLIC_ACCESS_PORTAL_URL ||
                        "/portal/access"
                      }
                    >
                      Pedir acesso no portal <strong>↗</strong>
                    </a>
                  </div>
                </form>
              )
            ) : doorNearby ? (
              <button
                className="door-access-pop"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRestrictedAttempt(department);
                }}
              >
                <span>PORTA RESTRITA</span>
                <strong>Solicite acesso no portal</strong>
                <small><kbd>ENTER</kbd> Pedir acesso</small>
              </button>
            ) : null}
          </Html>
        </>
      )}

      <DepartmentProps department={department} />
    </group>
  );
}

function Player({
  onNearby,
  onAreaChange,
  onInteract,
  focusDepartment,
  unlockedDepartments,
  receptionCleared,
  moveRequest,
  onMoveFinished,
  onCancelMove,
  onDoorNearby,
  onLockedDoorNearby,
  onRequestAccess,
}: {
  onNearby: Props["onNearby"];
  onAreaChange: Props["onAreaChange"];
  onInteract: Props["onSelect"];
  focusDepartment: Department | null;
  unlockedDepartments: Set<Department["id"]>;
  receptionCleared: boolean;
  moveRequest: MoveRequest | null;
  onMoveFinished: () => void;
  onCancelMove: () => void;
  onDoorNearby: (department: Department | null) => void;
  onLockedDoorNearby: (department: Department | null) => void;
  onRequestAccess: (department: Department) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const nearbyRef = useRef<Department | null>(null);
  const lastNearbyId = useRef<string | null>(null);
  const lastAreaId = useRef<string | null>(null);
  const lastDoorId = useRef<string | null>(null);
  const lastLockedDoorId = useRef<string | null>(null);
  const lockedDoorRef = useRef<Department | null>(null);
  const lastMoving = useRef(false);
  const pathRef = useRef<THREE.Vector3[]>([]);
  const pathIndexRef = useRef(0);
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0.5, 0));
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      keys.current[key] = true;

      if (key === "enter" && lockedDoorRef.current) {
        event.preventDefault();
        onRequestAccess(lockedDoorRef.current);
        return;
      }

      if (
        ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(
          key,
        )
      ) {
        pathRef.current = [];
        pathIndexRef.current = 0;
        onCancelMove();
      }

      if (key === "e" && nearbyRef.current) onInteract(nearbyRef.current);
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
  }, [onCancelMove, onInteract, onRequestAccess]);

  useEffect(() => {
    if (!moveRequest || !ref.current || focusDepartment) return;

    pathRef.current = findPath(
      ref.current.position,
      moveRequest.point,
      unlockedDepartments,
      receptionCleared,
    );
    pathIndexRef.current = 0;

    if (pathRef.current.length === 0) {
      onMoveFinished();
    }
  }, [
    moveRequest,
    unlockedDepartments,
    receptionCleared,
    focusDepartment,
  ]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const speed = 3.45 * delta;
    const p = ref.current.position;

    const dx =
      (keys.current.d || keys.current.arrowright ? 1 : 0) -
      (keys.current.a || keys.current.arrowleft ? 1 : 0);

    const dz =
      (keys.current.s || keys.current.arrowdown ? 1 : 0) -
      (keys.current.w || keys.current.arrowup ? 1 : 0);

    const manualMoving = !focusDepartment && Boolean(dx || dz);
    const hasPath =
      !focusDepartment &&
      !manualMoving &&
      pathIndexRef.current < pathRef.current.length;

    if (manualMoving) {
      const magnitude = Math.hypot(dx, dz) || 1;
      const moveX = dx / magnitude;
      const moveZ = dz / magnitude;
      const nextX = p.x + moveX * speed;
      const nextZ = p.z + moveZ * speed;

      if (
        isWalkable(
          nextX,
          p.z,
          unlockedDepartments,
          receptionCleared,
        )
      ) {
        p.x = nextX;
      }

      if (
        isWalkable(
          p.x,
          nextZ,
          unlockedDepartments,
          receptionCleared,
        )
      ) {
        p.z = nextZ;
      }

      const targetAngle = Math.atan2(moveX, moveZ);
      const difference = Math.atan2(
        Math.sin(targetAngle - ref.current.rotation.y),
        Math.cos(targetAngle - ref.current.rotation.y),
      );
      ref.current.rotation.y += difference * 0.22;
    } else if (hasPath) {
      const waypoint = pathRef.current[pathIndexRef.current];
      const direction = waypoint.clone().sub(p);
      direction.y = 0;
      const distance = direction.length();

      if (distance < 0.1) {
        pathIndexRef.current += 1;

        if (pathIndexRef.current >= pathRef.current.length) {
          pathRef.current = [];
          pathIndexRef.current = 0;
          const interaction = moveRequest?.interact;
          onMoveFinished();
          if (interaction) onInteract(interaction);
        }
      } else {
        direction.normalize();
        const distanceThisFrame = Math.min(speed, distance);
        const nextX = p.x + direction.x * distanceThisFrame;
        const nextZ = p.z + direction.z * distanceThisFrame;

        if (
          isWalkable(
            nextX,
            nextZ,
            unlockedDepartments,
            receptionCleared,
          )
        ) {
          p.x = nextX;
          p.z = nextZ;
        } else {
          pathRef.current = [];
          pathIndexRef.current = 0;
          onMoveFinished();
        }

        const targetAngle = Math.atan2(direction.x, direction.z);
        const difference = Math.atan2(
          Math.sin(targetAngle - ref.current.rotation.y),
          Math.cos(targetAngle - ref.current.rotation.y),
        );
        ref.current.rotation.y += difference * 0.18;
      }
    }

    const isMoving = manualMoving || hasPath;

    if (isMoving !== lastMoving.current) {
      lastMoving.current = isMoving;
      setMoving(isMoving);
    }

    p.x = THREE.MathUtils.clamp(p.x, PATH_MIN_X, PATH_MAX_X);
    p.z = THREE.MathUtils.clamp(p.z, PATH_MIN_Z, PATH_MAX_Z);

    let nearestDoor: Department | null = null;
    let nearestDoorDistance = 1.25;

    for (const department of departments) {
      if (department.id === "reception") continue;

      const door = getDoorWorldPosition(department);
      const distance = Math.hypot(p.x - door.x, p.z - door.z);

      if (distance < nearestDoorDistance) {
        nearestDoor = department;
        nearestDoorDistance = distance;
      }
    }

    const doorId = nearestDoor?.id ?? null;
    if (doorId !== lastDoorId.current) {
      lastDoorId.current = doorId;
      onDoorNearby(nearestDoor);
    }

    const lockedDoor =
      nearestDoor?.requiresCredentials &&
      !unlockedDepartments.has(nearestDoor.id)
        ? nearestDoor
        : null;

    lockedDoorRef.current = lockedDoor;
    const lockedDoorId = lockedDoor?.id ?? null;

    if (lockedDoorId !== lastLockedDoorId.current) {
      lastLockedDoorId.current = lockedDoorId;
      onLockedDoorNearby(lockedDoor);
    }

    let nearest: Department | null = null;
    let nearestDistance = 1.72;

    for (const department of departments) {
      if (!NPC_DEPARTMENT_IDS.has(department.id)) continue;
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

    let area: Department | null = null;

    for (const department of departments) {
      const [cx, , cz] = department.position;
      const [width, , depth] = department.size;

      if (
        Math.abs(p.x - cx) <= width / 2 - 0.15 &&
        Math.abs(p.z - cz) <= depth / 2 - 0.15
      ) {
        area = department;
        break;
      }
    }

    const areaId = area?.id ?? null;

    if (areaId !== lastAreaId.current) {
      lastAreaId.current = areaId;
      onAreaChange(area);
    }

    const cameraTarget = new THREE.Vector3(
      p.x + 7.4,
      8.6,
      p.z + 7.4,
    );
    const target = new THREE.Vector3(p.x, 0.55, p.z);

    camera.position.lerp(cameraTarget, 0.055);
    lookTarget.current.lerp(target, 0.1);
    camera.lookAt(lookTarget.current);
  });

  return (
    <group ref={ref} position={[0, 0, 4.35]}>
      <HumanAvatar variante="masculino" estado={moving ? "andar" : "parado"} />
      <Html position={[0, 2.08, 0]} center>
        <div className="player-label">VOCÊ</div>
      </Html>
    </group>
  );
}

function CeilingLights() {
  return (
    <>
      {[-8.5, -1.5].map((z) => (
        <group key={z}>
          <pointLight position={[-4.2, 3.4, z]} intensity={8} distance={9} decay={2} />
          <pointLight position={[4.2, 3.4, z]} intensity={8} distance={9} decay={2} />
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
  unlockedDepartments,
  onRestrictedAttempt,
  restrictedDepartmentId,
  accessError,
  accessLoading,
  accessGrantedDepartmentId,
  onSubmitCredentials,
  onCloseAccess,
  receptionCleared,
}: {
  selected: Department | null;
  nearby: Department | null;
  onSelect: Props["onSelect"];
  onNearby: Props["onNearby"];
  onAreaChange: Props["onAreaChange"];
  unlockedDepartments: Set<Department["id"]>;
  onRestrictedAttempt: Props["onRestrictedAttempt"];
  restrictedDepartmentId: Department["id"] | null;
  accessError: string;
  accessLoading: boolean;
  accessGrantedDepartmentId: Department["id"] | null;
  onSubmitCredentials: Props["onSubmitCredentials"];
  onCloseAccess: Props["onCloseAccess"];
  receptionCleared: boolean;
}) {
  const [moveRequest, setMoveRequest] = useState<MoveRequest | null>(null);
  const [nearDoor, setNearDoor] = useState<Department | null>(null);
  const [nearLockedDoor, setNearLockedDoor] = useState<Department | null>(null);
  const moveSequence = useRef(0);

  useEffect(() => {
    if (
      restrictedDepartmentId &&
      nearLockedDoor?.id !== restrictedDepartmentId
    ) {
      onCloseAccess();
    }
  }, [nearLockedDoor, onCloseAccess, restrictedDepartmentId]);

  const requestMove = (point: THREE.Vector3, interact?: Department) => {
    moveSequence.current += 1;
    setMoveRequest({
      id: moveSequence.current,
      point: new THREE.Vector3(point.x, 0, point.z),
      interact,
    });
  };

  const approachDepartment = (department: Department) => {
    if (!receptionCleared && department.id !== "reception") return;

    if (
      department.requiresCredentials &&
      !unlockedDepartments.has(department.id)
    ) {
      requestMove(getDoorApproachPoint(department));
      return;
    }

    requestMove(getApproachPoint(department), department);
  };

  return (
    <>
      <color attach="background" args={["#e7e6df"]} />
      <fog attach="fog" args={["#e7e6df", 24, 48]} />
      <hemisphereLight args={["#f6f2e8", "#73786f", 1.5]} />
      <ambientLight intensity={0.58} />
      <directionalLight
        position={[8, 14, 8]}
        intensity={2.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <CeilingLights />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, -5.25]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          requestMove(event.point.clone());
        }}
      >
        <planeGeometry args={[19, 22]} />
        <meshStandardMaterial color="#bfc0b9" roughness={0.88} metalness={0.03} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, -7.35]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          requestMove(event.point.clone());
        }}
      >
        <planeGeometry args={[3.3, 16.3]} />
        <meshStandardMaterial color="#d9d7cf" roughness={0.7} metalness={0.02} />
      </mesh>

      <Text
        position={[0, 0.028, 4.45]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#4c504b"
        anchorX="center"
      >
        ENTER →
      </Text>

      <Wall
        position={[-9.05, WALL_HEIGHT / 2, -5.15]}
        size={[WALL_THICKNESS, WALL_HEIGHT, 21.5]}
        color="#d7d5ce"
      />
      <Wall
        position={[9.05, WALL_HEIGHT / 2, -5.15]}
        size={[WALL_THICKNESS, WALL_HEIGHT, 21.5]}
        color="#d7d5ce"
      />

      <group position={[0, 0, 0.56]}>
        <mesh position={[-1.2, 0.55, 0]} castShadow>
          <boxGeometry args={[0.1, 1.1, 0.1]} />
          <meshStandardMaterial color="#343834" />
        </mesh>
        <mesh position={[1.2, 0.55, 0]} castShadow>
          <boxGeometry args={[0.1, 1.1, 0.1]} />
          <meshStandardMaterial color="#343834" />
        </mesh>
        {!receptionCleared && (
          <>
            <mesh position={[0, 0.78, 0]} castShadow>
              <boxGeometry args={[2.35, 0.08, 0.08]} />
              <meshStandardMaterial color="#171b17" />
            </mesh>
            <Html position={[0, 1.25, 0]} center>
              <div className="reception-gate-label">FALE COM A MINA PARA CONTINUAR</div>
            </Html>
          </>
        )}
      </group>

      {departments.map((department) => (
        <Room
          key={department.id}
          department={department}
          active={selected?.id === department.id || nearby?.id === department.id}
          unlocked={
            !department.requiresCredentials || unlockedDepartments.has(department.id)
          }
          onRestrictedAttempt={onRestrictedAttempt}
          onMove={(point) => requestMove(point)}
          accessActive={restrictedDepartmentId === department.id}
          accessError={accessError}
          accessLoading={accessLoading}
          accessGranted={accessGrantedDepartmentId === department.id}
          onSubmitCredentials={onSubmitCredentials}
          onCloseAccess={onCloseAccess}
          doorNearby={nearDoor?.id === department.id}
        />
      ))}

      {departments
        .filter((department) => NPC_DEPARTMENT_IDS.has(department.id))
        .map((department) => (
        <NPC
          key={department.id}
          department={department}
          active={nearby?.id === department.id}
          onApproach={approachDepartment}
        />
      ))}

      {/* Corridor tile joints give the floor architectural scale */}
      {[-13.2, -11.2, -9.2, -7.2, -5.2, -3.2, -1.2].map((z) => (
        <mesh
          key={z}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.023, z]}
        >
          <planeGeometry args={[3.15, 0.012]} />
          <meshBasicMaterial color="#acaea8" transparent opacity={0.42} />
        </mesh>
      ))}

      {moveRequest && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[moveRequest.point.x, 0.035, moveRequest.point.z]}
        >
          <ringGeometry args={[0.16, 0.24, 28]} />
          <meshBasicMaterial color="#171b17" transparent opacity={0.5} />
        </mesh>
      )}

      <Player
        onNearby={onNearby}
        onAreaChange={onAreaChange}
        onInteract={onSelect}
        focusDepartment={selected}
        unlockedDepartments={unlockedDepartments}
        receptionCleared={receptionCleared}
        moveRequest={moveRequest}
        onMoveFinished={() => setMoveRequest(null)}
        onCancelMove={() => setMoveRequest(null)}
        onDoorNearby={setNearDoor}
        onLockedDoorNearby={setNearLockedDoor}
        onRequestAccess={onRestrictedAttempt}
      />
    </>
  );
}

export default function OfficeScene({
  onSelect,
  onNearby,
  onAreaChange,
  activeDepartmentId,
  unlockedDepartments,
  onRestrictedAttempt,
  restrictedDepartmentId,
  accessError,
  accessLoading,
  accessGrantedDepartmentId,
  onSubmitCredentials,
  onCloseAccess,
  receptionCleared,
}: Props) {
  const [selected, setSelected] = useState<Department | null>(null);
  const [nearby, setNearby] = useState<Department | null>(null);
  const unlockedSet = useMemo(
    () => new Set<Department["id"]>(unlockedDepartments),
    [unlockedDepartments],
  );

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
    <Canvas
      orthographic
      shadows
      dpr={[1, 1.15]}
      camera={{ position: [7.4, 8.6, 11.75], zoom: 58, near: 0.1, far: 80 }}
    >
      <World
        selected={selected}
        nearby={nearby}
        onSelect={select}
        onNearby={nearbyChange}
        onAreaChange={onAreaChange}
        unlockedDepartments={unlockedSet}
        onRestrictedAttempt={onRestrictedAttempt}
        restrictedDepartmentId={restrictedDepartmentId}
        accessError={accessError}
        accessLoading={accessLoading}
        accessGrantedDepartmentId={accessGrantedDepartmentId}
        onSubmitCredentials={onSubmitCredentials}
        onCloseAccess={onCloseAccess}
        receptionCleared={receptionCleared}
      />
    </Canvas>
  );
}
