import { useEffect, useState, useCallback } from "react";
import "./MemoryGame.css";

const MemoryGame = () => {
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);

  const handleGridSizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (size >= 2 && size <= 10) setGridSize(size);
  };

  const initializeGame = useCallback(() => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    const numbers = Array.from({ length: pairCount }, (_, i) => i + 1);
    const shuffledCards = [...numbers, ...numbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((number, index) => ({ id: index, number }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].number === cards[secondId].number) {
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

    setFlipped((prev) => {
      if (prev.length === 0) return [id];
      if (prev.length === 1) {
        setDisabled(true);
        checkMatch(id);
        return [...prev, id];
      }
      return prev;
    });
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setWon(true);
    }
  }, [solved, cards]);

  return (
    <div className="game-container">
      <h1 className="title">Memory Game</h1>
      <div className="input-container">
        <label htmlFor="gridSize">Grid Size: (max 10)</label>
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
            {isFlipped(card.id) ? card.number : "?"}
          </div>
        ))}
      </div>
      {won && <div className="win-message">You Won!</div>}
      <button onClick={initializeGame} className="reset-button">
        {won ? "Play Again" : "Reset"}
      </button>
    </div>
  );
};

export default MemoryGame;