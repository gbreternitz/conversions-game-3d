// src/components/Person.jsx
import React, { useMemo } from "react";
import { animated, useSpring } from "@react-spring/three";

function Person({ state, position, removing, onAnimationComplete }) {
  const attributes = useMemo(() => ({
    height: Math.random() * 1 + 1.5,
    shoulders: Math.random() * 0.7 + 0.1,
    hips: Math.random() * 0.7 + 0.1,
    headSize: Math.random() * 0.3 + 0.4,
    armLength: Math.random() * 0.5 + 0.8,
    legLength: Math.random() * 0.5 + 0.9,
  }), []);

  const totalHeight = attributes.legLength + attributes.height + attributes.headSize;
  const centerOffset = totalHeight / 2;
  const color = state === "A" ? "red" : "blue";

  const { rotation, opacity } = useSpring({
    to: {
      rotation: removing ? [0, Math.PI * 2, 0] : [0, 0, 0],
      opacity: removing ? 0 : 1,
    },
    from: { rotation: [0, 0, 0], opacity: 1 },
    config: { duration: 500 },
    onRest: () => {
      if (removing && onAnimationComplete) {
        onAnimationComplete();
      }
    },
  });

  return (
    <animated.group
      position={[position[0], position[1] - centerOffset, position[2]]}
      rotation={rotation}
    >
      <animated.group scale={opacity}>
        {/* Left leg */}
        <mesh position={[-0.2, attributes.legLength / 2, 0]}>
          <boxGeometry args={[0.2, attributes.legLength, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.2, attributes.legLength / 2, 0]}>
          <boxGeometry args={[0.2, attributes.legLength, 0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Body */}
        <mesh position={[0, attributes.legLength + attributes.height / 2, 0]}>
          <cylinderGeometry args={[attributes.shoulders, attributes.hips, attributes.height, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Left arm */}
        <mesh position={[-0.5, attributes.legLength + attributes.height, 0]}>
          <boxGeometry args={[attributes.armLength, 0.15, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Right arm */}
        <mesh position={[0.5, attributes.legLength + attributes.height, 0]}>
          <boxGeometry args={[attributes.armLength, 0.15, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Head */}
        <mesh position={[0, attributes.legLength + attributes.height + attributes.headSize, 0]}>
          <sphereGeometry args={[attributes.headSize, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </animated.group>
    </animated.group>
  );
}

export default Person;
