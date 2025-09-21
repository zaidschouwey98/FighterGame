// shared/IInputHandler.ts
export interface IInputHandler {
    getKeys(): Set<string>;
    getMousePosition(): { x: number; y: number };

    consumeAttack(): boolean;
    consumeRightClick(): boolean;
    consumeSpaceClick(): boolean;

    update(): void;
}
