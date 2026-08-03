export const CAMERA_ZOOM = 2.5;
export const RENDER_DISTANCE = 5;
export const TILE_SIZE = 16;        // Taille en pixels
export const CHUNK_SIZE = 8;       // Taille des chunks
export const MAP_FREQUENCY = 0.01;
/** Offset Y pour le tri profondeur : perso ancré au centre → pieds ≈ y + offset */
export const ENTITY_DEPTH_FOOT_OFFSET = 12;
export const KNOCKBACK_TIMER = 40;
export const ATTACK_COOLDOWN = 25;
export const ATTACK_RESET = 100;
export const TP_COOLDOWN = 120;
export const TP_DISTANCE = 120;
export const DASH_ATTACK_DURATION = 30;
export const BLOCK_DURATION = 30;
export const BLOCK_COOLDOWN = 30;
/** Demi-angle du cône de parade (°) — 60 → cône total 120° face à la souris */
export const BLOCK_HALF_ANGLE_DEG = 60;
export const BLOCK_FRONT_DOT_MIN = Math.cos((BLOCK_HALF_ANGLE_DEG * Math.PI) / 180);
export const ENTITY_BASE_CRIT_CHANCE = 0.1; // 10%
export const ATTACK_DASH_COOLDOWN = 60;

// Heavy sword
export const HEAVY_SWORD_ATTACK_1_BASE_DURATION = 40;
export const HEAVY_SWORD_ATTACK_2_BASE_DURATION = 40;
export const HEAVY_SWORD_ATTACK_3_BASE_DURATION = 10;
export const HEAVY_SWORD_CD = 20;

// gun
export const GUN_ATTACK_BASE_DURATION = 20;
export const FIREBALL_SPEED = 30;