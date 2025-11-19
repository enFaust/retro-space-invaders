import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      <div className="text-center animate-pulse space-y-8">
        <h1 className="text-6xl md:text-8xl font-bold text-green-500 tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
          SPACE<br/>INVADERS
        </h1>
        <div className="space-y-2">
          <p className="text-white text-xl md:text-2xl tracking-widest">INSERT COIN</p>
          <div className="h-4"></div>
          <button 
            onClick={() => {
               // Just visual helper, the real trigger is Enter key but we can map click too if we enable pointer events
               onStart();
            }}
            className="pointer-events-auto bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-8 rounded-none border-2 border-white hover:scale-105 transition-transform duration-100"
          >
             PRESS ENTER OR CLICK START
          </button>
        </div>
        <div className="mt-12 text-gray-500 text-sm">
          <p>ARROWS TO MOVE • SPACE TO SHOOT</p>
        </div>
      </div>
    </div>
  );
};