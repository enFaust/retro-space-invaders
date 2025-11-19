import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Alien, Bullet, Particle, Star, AlienState } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  PLAYER_SPEED, 
  BULLET_SPEED, 
  ALIEN_WIDTH, 
  ALIEN_HEIGHT,
  ALIEN_PADDING,
  SPRITES 
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: number | ((prev: number) => number)) => void;
  level: number;
  setLevel: (level: number | ((prev: number) => number)) => void;
  lives: number;
  setLives: (lives: number | ((prev: number) => number)) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  setScore,
  level,
  setLevel,
  lives,
  setLives
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game entities refs (mutable state for performance loop)
  const playerRef = useRef<Player>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, width: PLAYER_WIDTH, height: PLAYER_HEIGHT, speed: PLAYER_SPEED, cooldown: 0, markedForDeletion: false });
  const aliensRef = useRef<Alien[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  
  // Input state
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Alien Movement State
  const alienDirectionRef = useRef<number>(1); // 1 = right, -1 = left
  const alienMoveTimerRef = useRef<number>(0);
  const alienMoveIntervalRef = useRef<number>(60); // Frames between moves (decreases with levels)

  // Initialization logic
  const initLevel = useCallback((currentLevel: number) => {
    aliensRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
    
    // Generate Stars Background if empty
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        starsRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          brightness: Math.random(),
        });
      }
    }

    // Create Aliens Grid
    // Rows increase with level, max 6 rows
    const rows = Math.min(3 + Math.floor(currentLevel / 2), 6); 
    const cols = 8;
    
    const startX = (CANVAS_WIDTH - (cols * (ALIEN_WIDTH + ALIEN_PADDING))) / 2;
    const startY = 60;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliensRef.current.push({
          x: startX + c * (ALIEN_WIDTH + ALIEN_PADDING),
          y: startY + r * (ALIEN_HEIGHT + ALIEN_PADDING),
          width: ALIEN_WIDTH,
          height: ALIEN_HEIGHT,
          type: r % 2, // Alternating sprite types
          scoreValue: (rows - r) * 10,
          markedForDeletion: false,
          state: AlienState.GRID
        });
      }
    }
    
    alienDirectionRef.current = 1;
    // Speed up aliens per level - Aggressive difficulty scaling
    // Level 1: 50 frames, Level 10: ~10 frames
    alienMoveIntervalRef.current = Math.max(5, 55 - (currentLevel * 5)); 
  }, []);

  // Reset Game
  useEffect(() => {
    if (gameState === GameState.START_SCREEN) {
      setScore(0);
      setLevel(1);
      setLives(3);
      // Center player
      playerRef.current.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    }
    if (gameState === GameState.PLAYING && aliensRef.current.length === 0) {
      initLevel(level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, initLevel]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      
      // Start game handling
      if (gameState === GameState.START_SCREEN && e.code === 'Enter') {
        setGameState(GameState.PLAYING);
      }
      // Restart handling
      if (gameState === GameState.GAME_OVER && e.code === 'Enter') {
        setGameState(GameState.START_SCREEN);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, setGameState]);


  // Main Game Loop
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;

    // 1. Player Movement
    if (keysRef.current['ArrowLeft']) player.x -= player.speed;
    if (keysRef.current['ArrowRight']) player.x += player.speed;
    // Clamp player
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));

    // 2. Player Shooting
    if (player.cooldown > 0) player.cooldown--;
    if (keysRef.current['Space'] && player.cooldown <= 0) {
      bulletsRef.current.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 10,
        speed: BULLET_SPEED,
        isEnemy: false,
        markedForDeletion: false
      });
      player.cooldown = 20; // Frames between shots
    }

    // 3. Alien Logic
    // Separate Grid Logic from Diving Logic
    alienMoveTimerRef.current++;
    let shouldMoveGrid = false;

    const gridAliens = aliensRef.current.filter(a => a.state === AlienState.GRID);

    if (alienMoveTimerRef.current >= alienMoveIntervalRef.current) {
      alienMoveTimerRef.current = 0;
      shouldMoveGrid = true;
    }

    let hitEdge = false;
    let moveDown = false;
    let gridDx = 0;

    // Only check edges for aliens currently in the grid
    if (shouldMoveGrid && gridAliens.length > 0) {
      gridAliens.forEach(alien => {
        if ((alienDirectionRef.current === 1 && alien.x + alien.width >= CANVAS_WIDTH - 20) ||
            (alienDirectionRef.current === -1 && alien.x <= 20)) {
          hitEdge = true;
        }
      });

      if (hitEdge) {
        alienDirectionRef.current *= -1;
        moveDown = true;
      } else {
        gridDx = 10 * alienDirectionRef.current;
      }
    }

    // Difficulty multiplier
    const difficultyMult = 1 + (level * 0.1);
    const diveSpeed = 2 + difficultyMult;
    // Chance to start diving increases with level
    const diveChance = 0.0005 + (level * 0.0005);

    aliensRef.current.forEach(alien => {
      if (alien.state === AlienState.GRID) {
        if (shouldMoveGrid) {
          if (moveDown) {
            alien.y += ALIEN_HEIGHT;
          } else {
            alien.x += gridDx;
          }
        }
        
        // Grid aliens hitting bottom ends game
        if (alien.y + alien.height >= player.y) {
          setGameState(GameState.GAME_OVER);
        }

        // Randomly break formation and dive (Kamikaze)
        // Only if not currently dropping down in grid
        if (!moveDown && Math.random() < diveChance && gridAliens.length > 1) {
          alien.state = AlienState.DIVING;
        }

      } else if (alien.state === AlienState.DIVING) {
        // Diving logic: Fly down and slight sine wave
        alien.y += diveSpeed;
        alien.x += Math.sin(alien.y * 0.05) * 2;

        // If off screen, wrap to top
        if (alien.y > CANVAS_HEIGHT) {
          alien.y = -alien.height;
          alien.x = Math.random() * (CANVAS_WIDTH - alien.width);
        }

        // Collision with player (Body slam)
        if (!alien.markedForDeletion && 
            alien.x < player.x + player.width && 
            alien.x + alien.width > player.x &&
            alien.y < player.y + player.height &&
            alien.y + alien.height > player.y) {
             
             alien.markedForDeletion = true;
             // Explosion
             for (let i = 0; i < 10; i++) {
                particlesRef.current.push({
                  x: alien.x + alien.width/2,
                  y: alien.y + alien.height/2,
                  width: 4,
                  height: 4,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  life: 30,
                  color: '#ff0000',
                  markedForDeletion: false
                });
             }
             
             // Lose a life
             setLives(prev => {
               const newLives = prev - 1;
               if (newLives <= 0) setGameState(GameState.GAME_OVER);
               return newLives;
             });
        }
      }
    });

    // Enemy Shooting
    // Chance increases with level
    if (Math.random() < 0.01 + (level * 0.003)) {
      const shooterIndex = Math.floor(Math.random() * aliensRef.current.length);
      const shooter = aliensRef.current[shooterIndex];
      if (shooter) {
         bulletsRef.current.push({
          x: shooter.x + shooter.width / 2,
          y: shooter.y + shooter.height,
          width: 4,
          height: 10,
          speed: -BULLET_SPEED * (0.6 + (level * 0.05)), // Bullets get faster
          isEnemy: true,
          markedForDeletion: false
        });
      }
    }

    // 4. Bullets Update
    bulletsRef.current.forEach(bullet => {
      bullet.y -= bullet.speed; 
      
      // Screen bounds
      if (bullet.y < 0 || bullet.y > CANVAS_HEIGHT) {
        bullet.markedForDeletion = true;
      }
    });

    // 5. Collision Detection
    // Bullet vs Alien
    bulletsRef.current.filter(b => !b.isEnemy).forEach(bullet => {
      aliensRef.current.forEach(alien => {
        if (!alien.markedForDeletion && !bullet.markedForDeletion &&
            bullet.x < alien.x + alien.width &&
            bullet.x + bullet.width > alien.x &&
            bullet.y < alien.y + alien.height &&
            bullet.y + bullet.height > alien.y) {
          
          alien.markedForDeletion = true;
          bullet.markedForDeletion = true;
          // Bonus for hitting diving aliens
          const scoreMult = alien.state === AlienState.DIVING ? 2 : 1;
          setScore(prev => prev + (alien.scoreValue * scoreMult));
          
          // Explosion particles
          for (let i = 0; i < 8; i++) {
             particlesRef.current.push({
               x: alien.x + alien.width/2,
               y: alien.y + alien.height/2,
               width: 3,
               height: 3,
               vx: (Math.random() - 0.5) * 5,
               vy: (Math.random() - 0.5) * 5,
               life: 30,
               color: '#00ff00',
               markedForDeletion: false
             });
          }
        }
      });
    });

    // Bullet vs Player
    bulletsRef.current.filter(b => b.isEnemy).forEach(bullet => {
       if (!bullet.markedForDeletion &&
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
          
          bullet.markedForDeletion = true;
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) setGameState(GameState.GAME_OVER);
            return newLives;
          });
          
          // Player hit particles
           for (let i = 0; i < 20; i++) {
             particlesRef.current.push({
               x: player.x + player.width/2,
               y: player.y + player.height/2,
               width: 4,
               height: 4,
               vx: (Math.random() - 0.5) * 10,
               vy: (Math.random() - 0.5) * 10,
               life: 45,
               color: '#ff0000',
               markedForDeletion: false
             });
          }
       }
    });

    // 6. Particle Update
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) p.markedForDeletion = true;
    });

    // 7. Cleanup
    aliensRef.current = aliensRef.current.filter(a => !a.markedForDeletion);
    bulletsRef.current = bulletsRef.current.filter(b => !b.markedForDeletion);
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);

    // 8. Level Complete Check
    if (aliensRef.current.length === 0) {
      // Delay slightly or just trigger
      setLevel(prev => prev + 1);
      initLevel(level + 1);
      // Bonus score
      setScore(prev => prev + 1000);
    }

  }, [gameState, level, setGameState, setLives, setScore, initLevel]);

  // Rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Stars
    starsRef.current.forEach(star => {
      // Move star logic inside draw for visual only
      if (gameState === GameState.PLAYING || gameState === GameState.START_SCREEN) {
        star.y += star.speed + (level * 0.1); // Stars move faster with level
        if (star.y > CANVAS_HEIGHT) star.y = 0;
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    if (gameState === GameState.PLAYING || gameState === GameState.GAME_OVER) {
      // Helper to draw pixel sprite
      const drawSprite = (sprite: number[][], x: number, y: number, w: number, h: number, color: string) => {
         ctx.fillStyle = color;
         const pixelW = w / sprite[0].length;
         const pixelH = h / sprite.length;
         
         sprite.forEach((row, rI) => {
           row.forEach((col, cI) => {
             if (col === 1) {
               ctx.fillRect(x + cI * pixelW, y + rI * pixelH, pixelW, pixelH);
             }
           });
         });
      };

      // Draw Player
      if (lives > 0 || gameState !== GameState.GAME_OVER) {
         drawSprite(SPRITES.PLAYER, playerRef.current.x, playerRef.current.y, playerRef.current.width, playerRef.current.height, '#34d399');
      }

      // Draw Aliens
      aliensRef.current.forEach(alien => {
        const sprite = alien.type === 0 ? SPRITES.ALIEN_1 : SPRITES.ALIEN_2;
        // Diving aliens are yellow/orange to indicate danger
        const color = alien.state === AlienState.DIVING ? '#fbbf24' : '#f87171';
        
        if (alien.state === AlienState.DIVING) {
             // Simple visual rotation/wobble effect for diving aliens
             // We can't easily rotate pixel grid without canvas transform
             // but we can just offset slightly
        }
        drawSprite(sprite, alien.x, alien.y, alien.width, alien.height, color);
      });

      // Draw Bullets
      bulletsRef.current.forEach(bullet => {
        ctx.fillStyle = bullet.isEnemy ? '#f87171' : '#34d399';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.globalAlpha = 1.0;
      });
    }

  }, [gameState, lives, level]);

  const loop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border-4 border-gray-800 rounded-lg shadow-2xl shadow-green-900/20 bg-black max-w-full h-auto"
    />
  );
};