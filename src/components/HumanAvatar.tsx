"use client";

import { Suspense, Component, type ReactNode, useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

// Avatares provisórios de demonstração. Substituir por GLB locais autorizados
// em /public/models/characters/ antes de publicar a versão final.
export const avatarURLs = {
  masculino:
    process.env.NEXT_PUBLIC_AVATAR_MASCULINO_URL ||
    "https://raw.githubusercontent.com/carlosfranzreb/ravas/main/rpm/public/avatar_2_m.glb",
  feminino:
    process.env.NEXT_PUBLIC_AVATAR_FEMININO_URL ||
    "https://raw.githubusercontent.com/carlosfranzreb/ravas/main/rpm/public/avatar_1_f.glb",
} as const;

type Props = {
  variante?: keyof typeof avatarURLs;
  estado?: "parado" | "andar" | "falar";
};

function FiguraFallback({ variante = "masculino" }: Pick<Props, "variante">) {
  // Substituto apenas para erros de rede/carregamento; nunca é o avatar definitivo.
  return (
    <group>
      <mesh position={[0, 0.88, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.78, 8, 14]} />
        <meshStandardMaterial color={variante === "feminino" ? "#68756c" : "#343b38"} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.23, 20, 20]} />
        <meshStandardMaterial color="#75482d" />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, 0.30, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.44, 6, 10]} />
          <meshStandardMaterial color="#292e2d" />
        </mesh>
      ))}
    </group>
  );
}

class FalhaAvatar extends Component<{ children: ReactNode; variante: Props["variante"] }, { falhou: boolean }> {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    if (this.state.falhou) return <FiguraFallback variante={this.props.variante} />;
    return this.props.children;
  }
}

function ModeloHumano({ variante = "masculino", estado = "parado" }: Props) {
  const url = avatarURLs[variante];
  const { scene, animations } = useGLTF(url);
  const modelo = useMemo(() => clone(scene), [scene]);
  const root = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, root);

  // Normaliza a altura e encosta os pés ao chão independentemente da origem do GLB.
  const { escala, deslocamento } = useMemo(() => {
    modelo.updateMatrixWorld(true);
    const limites = new THREE.Box3().setFromObject(modelo);
    const altura = Math.max(limites.max.y - limites.min.y, 0.01);
    const fator = THREE.MathUtils.clamp(1.75 / altura, 0.01, 20);
    const centroX = (limites.min.x + limites.max.x) / 2;
    const centroZ = (limites.min.z + limites.max.z) / 2;

    modelo.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return {
      escala: fator,
      deslocamento: [
        -centroX * fator,
        -limites.min.y * fator,
        -centroZ * fator,
      ] as [number, number, number],
    };
  }, [modelo]);

  useEffect(() => {
    const clips = Object.keys(actions);
    if (!clips.length) return;
    const padrao = clips.find((nome) => /idle|stand|breath/i.test(nome)) ?? clips[0];
    const andar = clips.find((nome) => /walk|locomotion|run/i.test(nome));
    const falar = clips.find((nome) => /talk|speak|gesture/i.test(nome));
    const nome = estado === "andar" ? (andar ?? padrao) : estado === "falar" ? (falar ?? padrao) : padrao;
    const animacao = actions[nome];
    animacao?.reset().fadeIn(0.2).play();
    return () => {
      animacao?.fadeOut(0.2);
    };
  }, [actions, estado]);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.elapsedTime;
    const temAnimacao = animations.length > 0;
    // Fallback procedural subtil quando o GLB não inclui animações.
    root.current.position.y = temAnimacao
      ? 0
      : estado === "andar"
        ? Math.abs(Math.sin(t * 10)) * 0.055
        : Math.sin(t * 1.7) * 0.012;
    root.current.rotation.z = !temAnimacao && estado === "falar" ? Math.sin(t * 2.7) * 0.025 : 0;
  });

  return (
    <group ref={root}>
      <primitive object={modelo} position={deslocamento} scale={escala} />
    </group>
  );
}

export default function HumanAvatar(props: Props) {
  return (
    <FalhaAvatar variante={props.variante}>
      <Suspense fallback={<FiguraFallback variante={props.variante} />}>
        <ModeloHumano {...props} />
      </Suspense>
    </FalhaAvatar>
  );
}
