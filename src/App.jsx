// src/App.jsx
import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import ConfirmModal from "./components/ConfirmModal";
import GameOverModal from "./components/GameOverModal";
import Scoreboard from "./components/Scoreboard";
import {
  initializeBoard3D,
  removeMatches,
} from "./utils/boardUtils";
import "./App.css";

function App() {
  const gridSize = 3;
  const [board, setBoard] = useState(initializeBoard3D(gridSize));
  const [pendingSelection, setPendingSelection] = useState(null);
  const [scoreboard, setScoreboard] = useState({ P1: [], P2: [] });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [scoreboardVisible, setScoreboardVisible] = useState(true);

  const handleCellClick = (x, y, z) => {
    if (board[x][y][z] === "") return;
    setPendingSelection([x, y, z]);
  };

  const handleConfirm = () => {
    if (!pendingSelection) return;
    const [x, y, z] = pendingSelection;

    // Create a deep copy and toggle the cell's state.
    const newBoard = board.map((plane) =>
      plane.map((cell) => (cell !== "" ? { ...cell } : ""))
    );
    newBoard[x][y][z] = {
      ...newBoard[x][y][z],
      state: newBoard[x][y][z].state === "A" ? "B" : "A",
    };

    // Run removal logic.
    const removalResult = removeMatches(newBoard);
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
    setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
    setPendingSelection(null);
  };

  const handleCancel = () => {
    setPendingSelection(null);
  };

  useEffect(() => {
    const totalScore = scoreboard.P1.length + scoreboard.P2.length;
    const totalCells = gridSize * gridSize * gridSize;
    if (totalScore >= totalCells) {
      setGameOver(true);
    }
  }, [scoreboard, gridSize]);

  // For neighbor highlights (the logic remains unchanged)
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
      let nx = sx + dx, ny = sy + dy, nz = sz + dz;
      while (
        nx >= 0 &&
        nx < gridSize &&
        ny >= 0 &&
        ny < gridSize &&
        nz >= 0 &&
        nz < gridSize
      ) {
        if (board[nx][ny][nz] !== "") {
          neighbors.push(`${nx}-${ny}-${nz}`);
          break;
        }
        nx += dx;
        ny += dy;
        nz += dz;
      }
    }
    return neighbors;
  };

  const neighborHighlights = computeNeighborHighlights();

  const restartGame = () => {
    setBoard(initializeBoard3D(gridSize));
    setScoreboard({ P1: [], P2: [] });
    setCurrentPlayer(1);
    setGameOver(false);
    setPendingSelection(null);
  };

  return (
    <div className="app-container">
      {scoreboardVisible && (
        <Scoreboard scoreboard={scoreboard} currentPlayer={currentPlayer} />
      )}
      <div className="canvas-container">
        <button
          className="toggle-scoreboard-button"
          onClick={() => setScoreboardVisible((prev) => !prev)}
        >
          {scoreboardVisible ? "Hide Scoreboard" : "Show Scoreboard"}
        </button>
        <Board
          board={board}
          gridSize={gridSize}
          pendingSelection={pendingSelection}
          handleCellClick={handleCellClick}
          setBoard={setBoard}
          neighborHighlights={neighborHighlights}
        />
      </div>
      <ConfirmModal
        pendingSelection={pendingSelection}
        currentPlayer={currentPlayer}
        board={board}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
      />
      <GameOverModal
        gameOver={gameOver}
        scoreboard={scoreboard}
        gridSize={gridSize}
        restartGame={restartGame}
      />
    </div>
  );
}

export default App;
