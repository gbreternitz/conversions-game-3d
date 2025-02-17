import React, { useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./App.css";

// Generate a random full name by combining a first and last name.
const randomName = () => {
  const firstNames = [
    "Alice", "Bob", "Cory", "Diana", "Eve", "Frank", "Gabi",
    "Hank", "Ivy", "Jack", "Kathy", "Leo", "Martha", "Nate", "Olivia",
    "Pete", "Quincy", "Raquel", "Seth", "Tina", "Uma", "Victor", "Wendy",
    "Xander", "Yurm", "Zack"
  ];
  const lastNames = [
    "Knuckles", "Star", "Farndoogle", "Beets", "Sizzler", "Jambalaya", "Clementine",
    "Alfalfa", "the Mensch", "Orbital", "Smoochers", "Hairpiece", "Wynn",
    "Twister", "Barbarella", "Estevez", "Bretz", "Padua", "Curry", "California"
  ];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

// Person component: builds a simple 3D person with randomized attributes.
// The person is centered vertically so its center aligns with the cell center.
function Person({ state, position }) {
  const attributes = useMemo(() => ({
    height: Math.random() * 1 + 1.5,       // torso height
    shoulders: Math.random() * 0.7 + 0.1,
    hips: Math.random() * 0.7 + 0.1,
    headSize: Math.random() * 0.3 + 0.4,
    armLength: Math.random() * 0.5 + 0.8,
    legLength: Math.random() * 0.5 + 0.9,
  }), []);

  const totalHeight = attributes.legLength + attributes.height + attributes.headSize;
  const centerOffset = totalHeight / 2;

  const color = state === "A" ? "red" : "blue";

  return (
    // Shift the person so its vertical center aligns with the cell center.
    <group position={[position[0], position[1] - centerOffset, position[2]]}>
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
    </group>
  );
}

// Initialize a 3D board (gridSize x gridSize x gridSize) with alternating states.
// Each cell is an object: { state, name }.
const initializeBoard3D = (size) => {
  const board = [];
  for (let x = 0; x < size; x++) {
    const plane = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let z = 0; z < size; z++) {
        const state = (x + y + z) % 2 === 0 ? "A" : "B";
        row.push({ state, name: randomName() });
      }
      plane.push(row);
    }
    board.push(plane);
  }
  return board;
};

// Helper: Given starting cell (x,y,z) and a direction (dx,dy,dz),
// find the coordinates of the first non-empty neighbor, or return null.
const findNeighbor = (board, x, y, z, dx, dy, dz) => {
  const size = board.length;
  let nx = x + dx, ny = y + dy, nz = z + dz;
  while (nx >= 0 && nx < size && ny >= 0 && ny < size && nz >= 0 && nz < size) {
    if (board[nx][ny][nz] !== "") {
      return [nx, ny, nz];
    }
    nx += dx;
    ny += dy;
    nz += dz;
  }
  return null;
};

// checkDirection looks in a specified direction (dx, dy, dz)
// from the cell at (x, y, z) and returns the state of the first non-empty cell it finds,
// or "EDGE" if it reaches the edge of the board.
const checkDirection = (board, x, y, z, dx, dy, dz) => {
  const size = board.length;
  let nx = x + dx, ny = y + dy, nz = z + dz;
  while (nx >= 0 && nx < size && ny >= 0 && ny < size && nz >= 0 && nz < size) {
    if (board[nx][ny][nz] !== "") {
      return board[nx][ny][nz].state;
    }
    nx += dx;
    ny += dy;
    nz += dz;
  }
  return "EDGE";
};

// shouldRemove checks if the cell at (x, y, z) should be removed.
// It returns true if all the first non-empty neighbors in the 6 cardinal directions
// either match the cell's state or if the neighbor is "EDGE" (i.e. the board's border).
const shouldRemove = (board, x, y, z) => {
  if (board[x][y][z] === "") return false; // already removed
  const current = board[x][y][z].state;
  const directions = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
  ];
  for (let [dx, dy, dz] of directions) {
    const neighbor = checkDirection(board, x, y, z, dx, dy, dz);
    if (neighbor !== "EDGE" && neighbor !== current) {
      return false;
    }
  }
  return true;
};

const removeMatches = (boardInput) => {
  const size = boardInput.length;
  // Deep copy the board so that we don't mutate the original
  let board = boardInput.map((plane) =>
    plane.map((cell) => (cell !== "" ? { ...cell } : ""))
  );
  let totalRemoved = 0;
  let removedNames = [];
  let changed = true;

  while (changed) {
    changed = false;
    let toRemove = [];
    // Iterate over every cell in the 3D board
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          if (board[x][y][z] !== "" && shouldRemove(board, x, y, z)) {
            toRemove.push([x, y, z]);
          }
        }
      }
    }
    if (toRemove.length > 0) {
      changed = true;
      // Remove each cell that met the criteria
      for (let [x, y, z] of toRemove) {
        const cell = board[x][y][z];
        if (cell !== "") {
          removedNames.push(cell.name);
        }
        board[x][y][z] = "";
        totalRemoved++;
      }
    }
  }
  return { board, removedCount: totalRemoved, removedNames };
};


function App() {
  const gridSize = 3;
  const [board, setBoard] = useState(initializeBoard3D(gridSize));
  // pendingSelection: [x, y, z] for the clicked cell.
  const [pendingSelection, setPendingSelection] = useState(null);
  // Scoreboard: record names converted by each player.
  const [scoreboard, setScoreboard] = useState({ P1: [], P2: [] });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [scoreboardVisible, setScoreboardVisible] = useState(true);

  // When a cell is clicked, mark it as pending (if it hasn't been removed).
  const handleCellClick = (x, y, z) => {
    if (board[x][y][z] === "") return;
    setPendingSelection([x, y, z]);
  };

  // Toggle the state at cell (x,y,z), run removal logic, update scoreboard, and switch players.
  const handleConfirm = () => {
    if (!pendingSelection) return;
    const [x, y, z] = pendingSelection;
    console.log("Confirm clicked for cell:", pendingSelection); // Debug log
  
    // Create a deep copy of the board.
    const newBoard = board.map((plane) =>
      plane.map((cell) => (cell !== "" ? { ...cell } : ""))
    );
    // Toggle the selected cell.
    newBoard[x][y][z] = {
      ...newBoard[x][y][z],
      state: newBoard[x][y][z].state === "A" ? "B" : "A",
    };
  
    // Run removal logic.
    const removalResult = removeMatches(newBoard);
    // If removal logic doesn't remove the toggled cell,
    // ensure that the toggled cell remains toggled.
    if (newBoard[x][y][z].state !== removalResult.board[x][y][z]?.state) {
      console.log("Removal logic changed toggled cell state unexpectedly");
    }
  
    // Update the scoreboard for the current player.
    setScoreboard((prev) => {
      const newScore = { ...prev };
      if (currentPlayer === 1) {
        newScore.P1 = newScore.P1.concat(removalResult.removedNames);
      } else {
        newScore.P2 = newScore.P2.concat(removalResult.removedNames);
      }
      return newScore;
    });
  
    // Update board and switch players.
    setBoard(removalResult.board);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setPendingSelection(null);
  };

  const handleCancel = () => {
    setPendingSelection(null);
  };

  // Check for game over: if the board is completely empty.
  useEffect(() => {
    const totalScore = scoreboard.P1.length + scoreboard.P2.length;
    const totalCells = gridSize * gridSize * gridSize;
    if (totalScore >= totalCells) {
      setGameOver(true);
    }
  }, [scoreboard, gridSize]);

  // When a cell is pending, compute its neighbor coordinates (for 6 directions) that are not empty.
  const computeNeighborHighlights = () => {
    if (!pendingSelection) return [];
    const directions = [
      [-1, 0, 0],
      [1, 0, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0, 0, -1],
      [0, 0, 1],
    ];
    const [sx, sy, sz] = pendingSelection;
    let neighbors = [];
    for (let [dx, dy, dz] of directions) {
      const neighbor = findNeighbor(board, sx, sy, sz, dx, dy, dz);
      if (neighbor) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  };

  // Render the 3D grid.
  const renderBoard = () => {
    const objects = [];
    const cellSize = 10;
    const offset = (gridSize - 1) / 2;
    // Compute neighbor coordinates for highlighting.
    const neighborHighlights = computeNeighborHighlights().map(
      ([nx, ny, nz]) => `${nx}-${ny}-${nz}`
    );
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          // Skip rendering if the cell is removed.
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
    return objects;
  };

  // Render a confirm modal for the pending selection (top-right).
  const renderConfirmModal = () => {
    if (!pendingSelection) return null;
    const [x, y, z] = pendingSelection;
    const cell = board[x][y][z];
    return (
      <div className="confirm-modal-overlay">
        <div className="modal-content">
          <p>Player {currentPlayer} converts {cell.name}?</p>
          <button onClick={handleConfirm}>Confirm</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    );
  };

  // Render the game-over modal (centered) with final score and a New Game button.
  const renderGameOverModal = () => {
    if (!gameOver) return null;
    const countP1 = scoreboard.P1.length;
    const countP2 = scoreboard.P2.length;
    let resultText = "";
    if (countP1 > countP2) resultText = "Player 1 is the winner!";
    else if (countP2 > countP1) resultText = "Player 2 is the winner!";
    else resultText = "It's a tie!";
    return (
      <div className="gameover-modal-overlay">
        <div className="modal-content">
          <h2>Game Over!</h2>
          <p>Final Score:</p>
          <p>Player 1: {countP1}</p>
          <p>Player 2: {countP2}</p>
          <p>{resultText}</p>
          <button
            onClick={() => {
              setBoard(initializeBoard3D(gridSize));
              setScoreboard({ P1: [], P2: [] });
              setCurrentPlayer(1);
              setGameOver(false);
              setPendingSelection(null);
            }}
          >
            New Game
          </button>
        </div>
      </div>
    );
  };

  // Render the sidebar scoreboard.
  const renderScoreboard = () => {
    return (
      <div className="scoreboard">
        <h2>Scoreboard</h2>
        <div>
          <h3>Player 1 Conversions ({scoreboard.P1.length})</h3>
          <ul>
            {scoreboard.P1.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Player 2 Conversions ({scoreboard.P2.length})</h3>
          <ul>
            {scoreboard.P2.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Current Turn</h3>
          <p>
            <strong>Player {currentPlayer}'s Turn</strong>
          </p>
        </div>
        <div>
          <h3>Instructions</h3>
          <p>
            <ol>Players alternate turns by selecting a townsfolk to convert.</ol>
            <ol>Townsfolk surrounded by likeminded neighbors in all six cardinal directions are collected by the player.</ol>
            <ol>Chain reactions may occur.</ol>
            <ol>The winner has collected the most townsfolk by the end of the game</ol>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {scoreboardVisible && renderScoreboard()}
      <div className="canvas-container">
        <button 
          className="toggle-scoreboard-button"
          onClick={() => setScoreboardVisible(!scoreboardVisible)}
        >
          {scoreboardVisible ? "Hide Scoreboard" : "Show Scoreboard"}
        </button>
        <Canvas
          camera={{ position: [100, 100, 100], fov: 60, near: 0.1, far: 2000 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight intensity={1} position={[100, 100, 100]} />
          {renderBoard()}
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      {renderConfirmModal()}
      {renderGameOverModal()}
    </div>
  );
}

export default App;
