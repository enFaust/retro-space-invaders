import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START_SCREEN);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* CRT Effect Overlay */}
      <div className="scanlines"></div>
      
      {/* Game Container */}
      <div className="relative">
        
        {/* HUD (Heads Up Display) */}
        <div className="flex justify-between items-end px-4 py-2 w-full max-w-[500px] mx-auto border-b-2 border-green-900/50 mb-1 bg-black/50 rounded-t-lg text-green-400">
           <div className="text-left">
             <p className="text-xs text-green-700">SCORE</p>
             <p className="text-xl md:text-2xl leading-none">{score.toString().padStart(6, '0')}</p>
           </div>
           
           <div className="text-center">
             <h1 className="text-xs text-green-700 tracking-widest opacity-50">RETRO INVADERS</h1>
             <p className="text-sm text-white">LEVEL {level}</p>
           </div>

           <div className="text-right">
             <p className="text-xs text-green-700">LIVES</p>
             <div className="flex gap-1 justify-end">
               {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                 <div key={i} className="w-4 h-3 bg-green-500 rounded-sm"></div>
               ))}
             </div>
           </div>
        </div>

        <GameCanvas 
          gameState={gameState}
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          level={level}
          setLevel={setLevel}
          lives={lives}
          setLives={setLives}
        />

        {gameState === GameState.START_SCREEN && (
          <StartScreen onStart={() => setGameState(GameState.PLAYING)} />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOverScreen 
            score={score} 
            level={level}
            onRestart={() => setGameState(GameState.START_SCREEN)} 
          />
        )}
        
      </div>

      {/* Controls Hint for Mobile/Desktop */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-gray-600 text-xs pointer-events-none">
        RETRO SPACE INVADERS • BUILT WITH REACT & TAILWIND
      </div>
    </div>
  );
};

export default App;