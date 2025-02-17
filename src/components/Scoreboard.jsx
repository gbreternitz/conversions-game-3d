// src/components/Scoreboard.jsx
import React from "react";

const Scoreboard = ({ scoreboard, currentPlayer }) => {
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
            <p>Scroll to zoom in and out. Click and drag to rotate.</p>
            <p>Players alternate turns by selecting a person to convert.</p>
            <p>A person surrounded by likeminded neighbors in all six cardinal directions disappear and count towards the player's score.</p>
            <p>Chain reactions may occur.</p>
            <p>The player with the most people in their stash wins.</p>
      </div>
    </div>
  );
};

export default Scoreboard;
