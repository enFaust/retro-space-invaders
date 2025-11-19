export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 550;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 5;
export const BULLET_SPEED = 7;
export const ALIEN_WIDTH = 32;
export const ALIEN_HEIGHT = 24;
export const ALIEN_PADDING = 15;

// Pixel art definitions (1 = draw, 0 = empty)
export const SPRITES = {
  PLAYER: [
    [0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ],
  ALIEN_1: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,0,1,1,0,1,0],
    [1,0,0,0,0,0,0,1],
    [0,1,0,0,0,0,1,0]
  ],
  ALIEN_2: [
    [0,0,1,0,0,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,0,1,0,0,1,0,1],
    [0,0,0,1,1,0,0,0]
  ]
};