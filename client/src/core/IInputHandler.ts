// shared/IInputHandler.ts
export interface IInputHandler {
    getKeys(): Set<string>;
    getMousePosition(): { x: number; y: number };

    isSpaceDown(): boolean;
    consumeAttack(): boolean;
    consumeRightClick(): boolean;
    consumeShift(): boolean;

    update(): void;
}
