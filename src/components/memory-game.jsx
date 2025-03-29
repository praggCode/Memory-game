import { useEffect, useState, useCallback } from "react";
import "./MemoryGame.css";

const MemoryGame = () => {
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState([]);

  // Fun emoji pairs for the game
  const emojiPairs = [
    "🎮", "🎲", "🎯", "🎨", "🎭", "🎪", "🎟️", "🎠",
    "🎡", "🎢", "🎣", "🎤", "🎧", "🎨", "🎭", "🎪",
    "🎟️", "🎠", "🎡", "🎢", "🎣", "🎤", "🎧", "🎨",
    "🎭", "🎪", "🎟️", "🎠", "🎡", "🎢", "🎣", "🎤",
    "🎧", "🎨", "🎭", "🎪", "🎟️", "🎠", "🎡", "🎢",
    "🎣", "🎤", "🎧", "🎨", "🎭", "🎪", "🎟️", "🎠"
  ];

  const createConfetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      animationDuration: 2 + Math.random() * 2,
      animationDelay: Math.random() * 2
    }));
    setConfetti(newConfetti);
  };

  const handleGridSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 2 && size <= 10) {
      setGridSize(size);
      initializeGame();
    }
  };

  const initializeGame = useCallback(() => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    const selectedEmojis = emojiPairs.slice(0, pairCount);
    const shuffledCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((emoji, index) => ({ id: index, emoji }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setConfetti([]);
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let timer;
    if (isPlaying && !won) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, won]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].emoji === cards[secondId].emoji) {
      setSolved((prev) => [...prev, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const handleClick = (id) => {
    if (disabled || won || flipped.includes(id)) return;
    
    if (!isPlaying) {
      setIsPlaying(true);
    }

    setFlipped((prev) => {
      if (prev.length === 0) return [id];
      if (prev.length === 1) {
        setDisabled(true);
        setMoves((prev) => prev + 1);
        checkMatch(id);
        return [...prev, id];
      }
      return prev;
    });
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  useEffect(() => {
    const allPairsMatched = cards.length > 0 && 
      solved.length === cards.length && 
      cards.every(card => solved.includes(card.id));

    if (allPairsMatched) {
      setWon(true);
      setIsPlaying(false);
      createConfetti();
    }
  }, [solved, cards]);

  return (
    <div className="game-container">
      <h1 className="title">🎮 Memory Game 🎮</h1>
      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">🎯 Moves:</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">⏱️ Time:</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
      </div>
      <div className="input-container">
        <label htmlFor="gridSize">🎲 Grid Size:</label>
        <input
          type="number"
          id="gridSize"
          min="2"
          max="10"
          value={gridSize}
          onChange={handleGridSizeChange}
          className="grid-input"
        />
      </div>
      <div
        className="game-board"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))` }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`card ${
              isFlipped(card.id) ? (isSolved(card.id) ? "solved" : "flipped") : ""
            }`}
          >
            {isFlipped(card.id) ? (
              <span className="card-emoji">{card.emoji}</span>
            ) : (
              <span className="card-back">❓</span>
            )}
          </div>
        ))}
      </div>
      <button onClick={initializeGame} className="reset-button">
        {won ? "🎮 Play Again" : "🔄 Reset Game"}
      </button>

      {won && (
        <div className="win-popup">
          {confetti.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                backgroundColor: piece.color,
                left: `${piece.left}%`,
                animationDuration: `${piece.animationDuration}s`,
                animationDelay: `${piece.animationDelay}s`
              }}
            />
          ))}
          <div className="win-content">
            <h2 className="win-title">🎉 Congratulations! 🎉</h2>
            <div className="win-stats">
              <div className="win-stat">
                <span className="win-stat-label">🎯 Moves</span>
                <span className="win-stat-value">{moves}</span>
              </div>
              <div className="win-stat">
                <span className="win-stat-label">⏱️ Time</span>
                <span className="win-stat-value">{formatTime(time)}</span>
              </div>
            </div>
            <div className="win-message">
              You've completed the game in {moves} moves!
            </div>
            <div className="win-buttons">
              <button onClick={initializeGame} className="win-button">
                🎮 Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;