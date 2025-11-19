import React from 'react';

interface GameOverScreenProps {
  score: number;
  level: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, level, onRestart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
      <h2 className="text-6xl font-bold text-red-600 mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]">GAME OVER</h2>
      <div className="text-center mb-8 space-y-2">
        <p className="text-2xl text-white">FINAL SCORE: <span className="text-green-400">{score}</span></p>
        <p className="text-xl text-gray-400">LEVEL REACHED: {level}</p>
      </div>
      <button 
        onClick={onRestart}
        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold py-3 px-6 transition-colors duration-200 animate-bounce"
      >
        PRESS ENTER TO TRY AGAIN
      </button>
    </div>
  );
};