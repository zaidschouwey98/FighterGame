import type { CoordinateService } from "./CoordinateService";
import type { IInputHandler } from "./IInputHandler";

export class InputHandler implements IInputHandler {
    private keysPressed: Set<string> = new Set();
    private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
    private attackPressed: boolean = false;
    private stopAttackPressed: boolean = false;
    private spaceDown: boolean = false;
    private shiftPressed: boolean = false;

    private coordinateService: CoordinateService;

    constructor(coordinateService: CoordinateService) {
        this.coordinateService = coordinateService;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        window.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        window.addEventListener("keydown", (e) => {
            this.keysPressed.add(e.key.toLowerCase());
            const key = e.key.toLowerCase();
            this.keysPressed.add(key);

            // Détecter "space"
            if (key === " ") { // e.key renvoie " " pour espace
                this.spaceDown = true;
            }
            if (key === "shift") {
                this.shiftPressed = true;
            }
        });



        window.addEventListener("keyup", (e) => {
            this.keysPressed.delete(e.key.toLowerCase());

            if (e.key === " ") {
                this.spaceDown = false;
            }

            if (e.key === "shift") {
                this.shiftPressed = false;
            }
        });

        document.addEventListener("mousemove", (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
        });

        document.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                this.attackPressed = true;
            }
            if (e.button === 2) {
                this.stopAttackPressed = true;
            }

        });
    }

    public consumeShift(): boolean {
        const wasPressed = this.shiftPressed;
        this.shiftPressed = false;
        return wasPressed;
    }

    public isSpaceDown(): boolean {
        return this.spaceDown;
    }

    public getKeys(): Set<string> {
        return this.keysPressed;
    }

    public getMousePosition(): { x: number; y: number } {
        const mousePos = this.mousePosition;
        return { ...this.coordinateService.screenToWorld(mousePos.x, mousePos.y) };
    }

    public consumeAttack(): boolean {
        const wasPressed = this.attackPressed;
        this.attackPressed = false;
        return wasPressed;
    }

    public consumeRightClick(): boolean {
        const wasPressed = this.stopAttackPressed;
        this.stopAttackPressed = false;
        return wasPressed;
    }

    public update(): void {
        // Reset attack pour le prochain frame
        this.attackPressed = false;
    }
}