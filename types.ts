export enum GameState {
  START_SCREEN = 'START_SCREEN',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export enum AlienState {
  GRID = 'GRID',
  DIVING = 'DIVING'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  width: number;
  height: number;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  speed: number;
  cooldown: number;
}

export interface Alien extends Entity {
  type: number; // 0, 1, 2 for different sprite styles
  scoreValue: number;
  state: AlienState;
}

export interface Bullet extends Entity {
  speed: number;
  isEnemy: boolean;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}