import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Colors (from requirements)
 * --primary: #4a90e2
 * --accent: #e94e77
 * --secondary: #ffffff
 */

// ---- Helper logic ----
const EMPTY_BOARD = Array(9).fill(null);

const PLAYER_X = "X";
const PLAYER_O = "O";

// PUBLIC_INTERFACE
function checkWinner(cells) {
  /** Returns {winner: "X"|"O"|null, line: [indexes]|null, draw: true|false} */
  const lines = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // Diags
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line, draw: false };
    }
  }
  if (cells.every(Boolean)) {
    return { winner: null, line: null, draw: true };
  }
  return { winner: null, line: null, draw: false };
}

// Simple AI (minimax is overkill for tic-tac-toe; we'll use heuristics)
function findAIMove(cells, aiMark, playerMark) {
  // Try to win
  for (let i = 0; i < 9; i++) {
    if (!cells[i]) {
      const clone = [...cells];
      clone[i] = aiMark;
      if (checkWinner(clone).winner === aiMark) return i;
    }
  }
  // Block
  for (let i = 0; i < 9; i++) {
    if (!cells[i]) {
      const clone = [...cells];
      clone[i] = playerMark;
      if (checkWinner(clone).winner === playerMark) return i;
    }
  }
  // Center
  if (!cells[4]) return 4;
  // Corners
  const corners = [0, 2, 6, 8].filter(i => !cells[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Sides
  const sides = [1, 3, 5, 7].filter(i => !cells[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return null;
}

// ---- Components ----

// PUBLIC_INTERFACE
function TicTacToeBoard({ board, onMove, line, locked }) {
  return (
    <div className="ttt-board">
      {board.map((cell, idx) => {
        const highlight = line && line.includes(idx) ? "highlight" : "";
        return (
          <button
            key={idx}
            className={`ttt-cell ${highlight}`}
            onClick={() => !locked && !cell && onMove(idx)}
            disabled={locked || Boolean(cell)}
            aria-label={`cell ${idx + 1}`}
            tabIndex={cell ? -1 : 0}
          >
            {cell}
          </button>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
function SidePanel({
  mode,
  setMode,
  status,
  currentPlayer,
  gameActive,
  onRestart,
  playerSymbol,
  setPlayerSymbol,
  aiThinking,
}) {
  return (
    <div className="side-panel">
      <div className="panel-section">
        <h2 className="panel-title">Game Options</h2>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input
              type="radio"
              value="human"
              checked={mode === "human"}
              onChange={() => setMode("human")}
              disabled={gameActive}
            />{" "}
            <span>2 Players</span>
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              value="ai"
              checked={mode === "ai"}
              onChange={() => setMode("ai")}
              disabled={gameActive}
            />{" "}
            <span>Vs AI</span>
          </label>
        </div>
        {mode === "ai" && (
          <div style={{ marginBottom: 12 }}>
            <label>
              <span>Your symbol:</span>
              <select
                value={playerSymbol}
                onChange={e => setPlayerSymbol(e.target.value)}
                disabled={gameActive}
                style={{ marginLeft: 8 }}
              >
                <option value={PLAYER_X}>X</option>
                <option value={PLAYER_O}>O</option>
              </select>
            </label>
          </div>
        )}
        <button className="panel-btn" onClick={onRestart}>
          Restart Game
        </button>
      </div>
      <div className="panel-section">
        <h2 className="panel-title">Status</h2>
        <div className="game-status">
          <strong>{status}</strong>
        </div>
        <div className="turn-indicator">
          {gameActive && (
            <>
              {mode === "ai" && aiThinking ? (
                <span style={{ color: "var(--accent)" }}>AI is thinking...</span>
              ) : (
                <>
                  <span>
                    Turn:{" "}
                    <b style={{ color: currentPlayer === PLAYER_X ? "var(--primary)" : "var(--accent)" }}>
                      {currentPlayer}
                    </b>
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="panel-footer">
        <small>
          <span role="img" aria-label="copyright">©️</span> Modern Tic Tac Toe | Built with React
        </small>
      </footer>
    </div>
  );
}

// ---- Main App ----

// PUBLIC_INTERFACE
function App() {
  // ---- Game state ----
  const [mode, setMode] = useState("human"); // "human" or "ai"
  const [playerSymbol, setPlayerSymbol] = useState(PLAYER_X);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [current, setCurrent] = useState(PLAYER_X);
  const [result, setResult] = useState({ winner: null, line: null, draw: false });
  const [aiThinking, setAIThinking] = useState(false);
  const [theme] = useState("light"); // Theme is fixed to light (based on requirements)

  // Side effect: check winner after move
  useEffect(() => {
    const outcome = checkWinner(board);
    setResult(outcome);
  }, [board]);

  // EFFECT: AI move if necessary
  useEffect(() => {
    if (
      mode === "ai" &&
      current !== playerSymbol &&
      !result.winner &&
      !result.draw
    ) {
      setAIThinking(true);
      // Simulate AI thinking
      const timeout = setTimeout(() => {
        const aiMove = findAIMove(board, current, playerSymbol);
        if (aiMove !== null && !board[aiMove]) {
          handleMove(aiMove);
        }
        setAIThinking(false);
      }, 600 + Math.random() * 500);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [board, current, mode, playerSymbol, result.winner, result.draw]);

  // PUBLIC_INTERFACE
  function handleMove(idx) {
    if (board[idx] || result.winner) return;
    setBoard(prev => {
      const next = [...prev];
      next[idx] = current;
      return next;
    });
    setCurrent(cur => (cur === PLAYER_X ? PLAYER_O : PLAYER_X));
  }

  function restartGame() {
    setBoard(EMPTY_BOARD);
    setCurrent(PLAYER_X);
    setResult({ winner: null, line: null, draw: false });
    setAIThinking(false);
  }

  function handleModeChange(selected) {
    if (mode !== selected) {
      setMode(selected);
      restartGame();
    }
  }

  function handlePlayerSymbolChange(symbol) {
    if (symbol !== playerSymbol) {
      setPlayerSymbol(symbol);
      restartGame();
    }
  }

  // Prepare status
  let status = "";
  if (result.winner) {
    status = result.winner === playerSymbol && mode === "ai"
      ? "You win! 🎉"
      : mode === "ai" && result.winner !== playerSymbol
      ? "AI wins! 🤖"
      : `Winner: ${result.winner} 🎉`;
  } else if (result.draw) {
    status = "Draw game! 🤝";
  } else {
    status = "Game in progress";
  }

  // Layout: centered board with side panel
  return (
    <div className="tic-tac-wrapper" data-theme={theme}>
      <main className="game-main-container">
        <section className="game-area">
          <h1 className="game-title">Tic Tac Toe</h1>
          <TicTacToeBoard
            board={board}
            onMove={idx => { if (!aiThinking && !result.winner && !result.draw) handleMove(idx); }}
            line={result.line}
            locked={!!result.winner || !!result.draw || (mode === "ai" && aiThinking && current !== playerSymbol)}
          />
        </section>
        <SidePanel
          mode={mode}
          setMode={handleModeChange}
          status={status}
          currentPlayer={current}
          gameActive={!result.winner && !result.draw}
          onRestart={restartGame}
          playerSymbol={playerSymbol}
          setPlayerSymbol={handlePlayerSymbolChange}
          aiThinking={aiThinking}
        />
      </main>
    </div>
  );
}

export default App;
