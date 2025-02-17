// src/utils/boardUtils.js
export const randomName = () => {
    const firstNames = [
      "Alice", "Bob", "Cory", "Diana", "Eric", "Frank", "Gabi", "Gloria",
      "Heisenberg", "Ivy", "Jack", "Kathy", "Leo", "Martha", "Nate", "Olivia",
      "Pete", "Quincy", "Raquel", "Seth", "Tina", "Uma", "Victor", "Wendy",
      "Xander", "Yurm", "Zack", "Zinedine", "Rupert", "Artur", "Lily", 
    ];
    const lastNames = [
      "Knuckles", "Star", "Farndoogle", "Beets", "Sizzler", "Jambalaya", "Clementine",
      "Alfalfa", "the Mensch", "Orbital", "Smoochers", "Hairpiece", "Wynn",
      "Twister", "Barbarella", "Estevez", "Bretz", "Padua", "Curry", "California", "Gasolina"
    ];
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  };
  
  export const initializeBoard3D = (size) => {
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
  
  export const checkDirection = (board, x, y, z, dx, dy, dz) => {
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
  
  export const shouldRemove = (board, x, y, z) => {
    if (board[x][y][z] === "" || board[x][y][z].removing) return false;
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
  
  export const removeMatches = (boardInput) => {
    const size = boardInput.length;
    // Deep copy the board
    let board = boardInput.map((plane) =>
      plane.map((cell) => (cell !== "" ? { ...cell } : ""))
    );
    let totalRemoved = 0;
    let removedNames = [];
    let changed = true;
  
    while (changed) {
      changed = false;
      let toRemove = [];
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          for (let z = 0; z < size; z++) {
            if (
              board[x][y][z] !== "" &&
              !board[x][y][z].removing &&
              shouldRemove(board, x, y, z)
            ) {
              toRemove.push([x, y, z]);
            }
          }
        }
      }
      if (toRemove.length > 0) {
        changed = true;
        for (let [x, y, z] of toRemove) {
          const cell = board[x][y][z];
          if (cell !== "") {
            removedNames.push(cell.name);
          }
          // Mark the cell as "removing"
          board[x][y][z] = { ...cell, removing: true };
          totalRemoved++;
        }
      }
    }
    return { board, removedCount: totalRemoved, removedNames };
  };
  