// src/components/ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ pendingSelection, currentPlayer, board, handleConfirm, handleCancel }) => {
  if (!pendingSelection) return null;
  const [x, y, z] = pendingSelection;
  const cell = board[x][y][z];
  
  return (
    <div className="confirm-modal-overlay">
      <div className="modal-content">
        <p>
          Player {currentPlayer} converts {cell.name}?
        </p>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default ConfirmModal;
