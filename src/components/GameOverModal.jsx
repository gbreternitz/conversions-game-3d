// src/components/GameOverModal.jsx
import React from "react";

const GameOverModal = ({ gameOver, scoreboard, gridSize, restartGame }) => {
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
        <button onClick={restartGame}>New Game</button>
      </div>
    </div>
  );
};

export default GameOverModal;
