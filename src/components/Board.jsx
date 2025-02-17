// src/components/Board.jsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Person from "./Person";

const Board = ({
  board,
  gridSize,
  pendingSelection,
  handleCellClick,
  setBoard,
  neighborHighlights,
}) => {
  const cellSize = 10;
  const offset = (gridSize - 1) / 2;
  const objects = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        if (board[x][y][z] === "") continue;
        const posX = (x - offset) * cellSize;
        const posY = (y - offset) * cellSize;
        const posZ = (z - offset) * cellSize;
        const cellKey = `${x}-${y}-${z}`;
        objects.push(
          <group key={cellKey}>
            <Person
              state={board[x][y][z].state}
              position={[posX, posY, posZ]}
              removing={board[x][y][z].removing || false}
              name={board[x][y][z].name} 
              onAnimationComplete={() => {
                setBoard((prevBoard) => {
                  const newBoard = prevBoard.map((plane) => plane.slice());
                  newBoard[x][y][z] = "";
                  return newBoard;
                });
              }}
            />
            {/* Invisible mesh to capture clicks */}
            <mesh
              position={[posX, posY, posZ]}
              onClick={(e) => {
                e.stopPropagation();
                handleCellClick(x, y, z);
              }}
            >
              <boxGeometry args={[cellSize * 0.5, cellSize * 0.5, cellSize * 0.5]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            {/* Outline for pending selection (yellow) */}
            {pendingSelection &&
              pendingSelection[0] === x &&
              pendingSelection[1] === y &&
              pendingSelection[2] === z && (
                <mesh position={[posX, posY, posZ]}>
                  <boxGeometry args={[cellSize * 0.95, cellSize * 0.95, cellSize * 0.95]} />
                  <meshBasicMaterial color="yellow" transparent opacity={0.4} depthWrite={false} />
                </mesh>
              )}
            {/* Outline for neighbors */}
            {neighborHighlights.includes(cellKey) && (
              <mesh position={[posX, posY, posZ]}>
                <boxGeometry args={[cellSize * 0.95, cellSize * 0.95, cellSize * 0.95]} />
                <meshBasicMaterial
                  color={board[x][y][z].state === "A" ? "red" : "blue"}
                  transparent opacity={0.3} depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      }
    }
  }

  return (
    <Canvas camera={{ position: [35, 35, 35], fov: 60, near: 0.2, far: 2000 }}>
      <ambientLight intensity={0.6} />
      <directionalLight intensity={1} position={[100, 100, 100]} />
      {objects}
      <OrbitControls enablePan={false} />
    </Canvas>
  );
};

export default Board;
