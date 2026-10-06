"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export type CharacterVariant = "mina" | "visitor" | "team01" | "team02";
export type CharacterState = "parado" | "andar" | "falar";

type Props = {
  variante?: CharacterVariant;
  estado?: CharacterState;
};

type Palette = {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoes: string;
  accent: string;
};

const palettes: Record<CharacterVariant, Palette> = {
  mina: {
    skin: "#c9855b",
    hair: "#4b2e24",
    top: "#f4f1ea",
    bottom: "#b7aa9a",
    shoes: "#f4efe8",
    accent: "#2b2d2c",
  },
  visitor: {
    skin: "#c9855b",
    hair: "#3a2a24",
    top: "#f5f3ee",
    bottom: "#2d2e30",
    shoes: "#f5f3ee",
    accent: "#242625",
  },
  team01: {
    skin: "#c9855b",
    hair: "#3d2b24",
    top: "#b9c7d5",
    bottom: "#313236",
    shoes: "#5c4436",
    accent: "#262727",
  },
  team02: {
    skin: "#c9855b",
    hair: "#4a332d",
    top: "#e8dfd3",
    bottom: "#343438",
    shoes: "#f5f3ee",
    accent: "#2a2b2a",
  },
};

function Capsule({
  position,
  rotation,
  radius,
  length,
  color,
  scale,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  radius: number;
  length: number;
  color: string;
  scale?: [number, number, number];
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <capsuleGeometry args={[radius, length, 5, 10]} />
      <meshStandardMaterial color={color} roughness={0.84} />
    </mesh>
  );
}

function Head({
  variante,
  palette,
}: {
  variante: CharacterVariant;
  palette: Palette;
}) {
  return (
    <group position={[0, 1.56, 0]}>
      <mesh scale={[0.98, 1.08, 0.94]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={palette.skin} roughness={0.9} />
      </mesh>

      {/* Ears */}
      {[-0.215, 0.215].map((x) => (
        <mesh key={x} position={[x, 0, 0]} scale={[0.55, 0.78, 0.4]}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color={palette.skin} roughness={0.9} />
        </mesh>
      ))}

      {/* Eyes */}
      {[-0.075, 0.075].map((x) => (
        <group key={x} position={[x, 0.015, 0.198]}>
          <mesh>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshStandardMaterial color="#211b18" roughness={0.8} />
          </mesh>
          <mesh position={[0.008, 0.009, 0.021]}>
            <sphereGeometry args={[0.006, 8, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Brows */}
      {[-0.075, 0.075].map((x) => (
        <mesh key={x} position={[x, 0.075, 0.195]} rotation={[0, 0, x < 0 ? -0.08 : 0.08]}>
          <boxGeometry args={[0.065, 0.012, 0.012]} />
          <meshStandardMaterial color={palette.hair} />
        </mesh>
      ))}

      {/* Nose */}
      <mesh position={[0, -0.015, 0.222]} scale={[0.65, 0.8, 0.5]}>
        <sphereGeometry args={[0.025, 8, 6]} />
        <meshStandardMaterial color={palette.skin} roughness={0.9} />
      </mesh>

      {/* Smile */}
      <mesh position={[0, -0.085, 0.207]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.045, 0.006, 6, 14, Math.PI]} />
        <meshStandardMaterial color="#9e5a4c" roughness={0.8} />
      </mesh>

      {/* Hair */}
      {variante === "mina" && (
        <>
          <mesh position={[0, 0.12, -0.025]} scale={[1.04, 0.78, 0.98]} castShadow>
            <sphereGeometry args={[0.235, 14, 10]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.31, -0.04]} castShadow>
            <sphereGeometry args={[0.105, 12, 8]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
          <mesh position={[-0.17, 0.02, 0.09]} rotation={[0, 0, 0.25]} castShadow>
            <capsuleGeometry args={[0.045, 0.19, 4, 8]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
        </>
      )}

      {variante === "visitor" && (
        <>
          <mesh position={[0, 0.13, -0.02]} scale={[1.06, 0.72, 0.98]} castShadow>
            <sphereGeometry args={[0.235, 14, 10]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
          {[-0.13, -0.04, 0.07, 0.15].map((x, index) => (
            <mesh
              key={x}
              position={[x, 0.24 + (index % 2) * 0.018, 0.02]}
              rotation={[0.05, 0, -0.45 + index * 0.22]}
              scale={[1, 0.65, 0.8]}
              castShadow
            >
              <sphereGeometry args={[0.085, 10, 8]} />
              <meshStandardMaterial color={palette.hair} roughness={0.86} />
            </mesh>
          ))}
        </>
      )}

      {variante === "team01" && (
        <>
          <mesh position={[0, 0.13, -0.02]} scale={[1.05, 0.72, 0.98]} castShadow>
            <sphereGeometry args={[0.235, 14, 10]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
          {[-0.13, -0.03, 0.08].map((x, index) => (
            <mesh
              key={x}
              position={[x, 0.235 + index * 0.012, 0.035]}
              scale={[1.1, 0.68, 0.78]}
              rotation={[0, 0, -0.32 + index * 0.2]}
              castShadow
            >
              <sphereGeometry args={[0.08, 10, 8]} />
              <meshStandardMaterial color={palette.hair} roughness={0.86} />
            </mesh>
          ))}

          {/* Glasses */}
          {[-0.075, 0.075].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.218]}>
              <torusGeometry args={[0.052, 0.008, 6, 16]} />
              <meshStandardMaterial color="#202120" metalness={0.25} roughness={0.45} />
            </mesh>
          ))}
          <mesh position={[0, 0.02, 0.218]}>
            <boxGeometry args={[0.045, 0.008, 0.008]} />
            <meshStandardMaterial color="#202120" />
          </mesh>
        </>
      )}

      {variante === "team02" && (
        <>
          <mesh position={[0, 0.09, -0.035]} scale={[1.08, 0.95, 1.0]} castShadow>
            <sphereGeometry args={[0.24, 14, 10]} />
            <meshStandardMaterial color={palette.hair} roughness={0.86} />
          </mesh>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x, -0.02, -0.015]} scale={[0.7, 1.25, 0.75]} castShadow>
              <sphereGeometry args={[0.095, 10, 8]} />
              <meshStandardMaterial color={palette.hair} roughness={0.86} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Accessory({
  variante,
  palette,
}: {
  variante: CharacterVariant;
  palette: Palette;
}) {
  if (variante === "visitor") return null;

  if (variante === "team01") {
    return (
      <group position={[-0.33, 0.88, 0.13]} rotation={[0.05, 0, -0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.42, 0.045]} />
          <meshStandardMaterial color="#3c3d3d" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0.24, 0.95, 0.18]} rotation={[0, 0, variante === "mina" ? -0.15 : 0.12]}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.34, 0.04]} />
        <meshStandardMaterial color={palette.accent} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0, 0.023]}>
        <boxGeometry args={[0.18, 0.29, 0.006]} />
        <meshStandardMaterial color="#545754" roughness={0.55} />
      </mesh>
    </group>
  );
}

export default function HumanAvatar({
  variante = "visitor",
  estado = "parado",
}: Props) {
  const palette = palettes[variante];
  const root = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (!root.current) return;

    const walking = estado === "andar";
    const talking = estado === "falar";
    const swing = Math.sin(t * 7.4);
    const walkAmount = walking ? 0.52 : 0;
    const talkAmount = talking ? 0.28 : 0;

    root.current.position.y = walking
      ? Math.abs(Math.sin(t * 7.4)) * 0.025
      : Math.sin(t * 1.6) * 0.006;

    if (leftArm.current) {
      leftArm.current.rotation.x =
        swing * walkAmount + Math.sin(t * 2.4) * talkAmount;
    }

    if (rightArm.current) {
      rightArm.current.rotation.x =
        -swing * walkAmount - Math.sin(t * 2.1) * talkAmount;
      rightArm.current.rotation.z = talking
        ? -0.16 + Math.sin(t * 2.2) * 0.08
        : 0;
    }

    if (leftLeg.current) leftLeg.current.rotation.x = -swing * walkAmount * 0.72;
    if (rightLeg.current) rightLeg.current.rotation.x = swing * walkAmount * 0.72;

    if (head.current) {
      head.current.rotation.y = talking ? Math.sin(t * 1.5) * 0.08 : 0;
      head.current.rotation.z = talking ? Math.sin(t * 1.2) * 0.025 : 0;
    }
  });

  const femaleCut = variante === "mina" || variante === "team02";
  const shirtLength = femaleCut ? 0.46 : 0.5;

  return (
    <group ref={root}>
      {/* Torso */}
      <mesh position={[0, 1.12, 0]} scale={[1, 1.05, 0.72]} castShadow>
        <capsuleGeometry args={[0.2, shirtLength, 6, 12]} />
        <meshStandardMaterial color={palette.top} roughness={0.9} />
      </mesh>

      {/* Waist / belt */}
      <mesh position={[0, 0.82, 0]} scale={[1.1, 0.6, 0.72]} castShadow>
        <capsuleGeometry args={[0.16, 0.12, 5, 10]} />
        <meshStandardMaterial color={palette.bottom} roughness={0.88} />
      </mesh>

      {variante === "team01" && (
        <mesh position={[0, 0.88, 0.155]} castShadow>
          <boxGeometry args={[0.36, 0.045, 0.025]} />
          <meshStandardMaterial color="#493d34" roughness={0.7} />
        </mesh>
      )}

      {/* Arms */}
      <group ref={leftArm} position={[-0.245, 1.28, 0]}>
        <Capsule
          position={[0, -0.23, 0]}
          radius={0.065}
          length={0.32}
          color={palette.top}
        />
        <mesh position={[0, -0.48, 0]} castShadow>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color={palette.skin} roughness={0.9} />
        </mesh>
      </group>

      <group ref={rightArm} position={[0.245, 1.28, 0]}>
        <Capsule
          position={[0, -0.23, 0]}
          radius={0.065}
          length={0.32}
          color={palette.top}
        />
        <mesh position={[0, -0.48, 0]} castShadow>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color={palette.skin} roughness={0.9} />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={leftLeg} position={[-0.105, 0.72, 0]}>
        <Capsule
          position={[0, -0.31, 0]}
          radius={0.082}
          length={0.43}
          color={palette.bottom}
        />
        <mesh position={[0, -0.6, 0.055]} scale={[1.35, 0.72, 1.8]} castShadow>
          <sphereGeometry args={[0.085, 10, 8]} />
          <meshStandardMaterial color={palette.shoes} roughness={0.82} />
        </mesh>
      </group>

      <group ref={rightLeg} position={[0.105, 0.72, 0]}>
        <Capsule
          position={[0, -0.31, 0]}
          radius={0.082}
          length={0.43}
          color={palette.bottom}
        />
        <mesh position={[0, -0.6, 0.055]} scale={[1.35, 0.72, 1.8]} castShadow>
          <sphereGeometry args={[0.085, 10, 8]} />
          <meshStandardMaterial color={palette.shoes} roughness={0.82} />
        </mesh>
      </group>

      <group ref={head}>
        <Head variante={variante} palette={palette} />
      </group>

      <Accessory variante={variante} palette={palette} />
    </group>
  );
}
