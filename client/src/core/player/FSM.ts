import type { PlayerState } from "../../../../shared/PlayerState";

type TransitionHook = (from: PlayerState, to: PlayerState) => void;

export class FSM {
    private current: PlayerState;
    private transitions: Map<PlayerState, Set<PlayerState>> = new Map();
    private onEnter: Map<PlayerState, TransitionHook[]> = new Map();
    private onExit: Map<PlayerState, TransitionHook[]> = new Map();

    constructor(initial: PlayerState) {
        this.current = initial;
    }

    public allow(from: PlayerState, to: PlayerState) {
        if (!this.transitions.has(from)) this.transitions.set(from, new Set());
        this.transitions.get(from)!.add(to);
    }

    public addEnterHook(state: PlayerState, fn: TransitionHook) {
        if (!this.onEnter.has(state)) this.onEnter.set(state, []);
        this.onEnter.get(state)!.push(fn);
    }

    public addExitHook(state: PlayerState, fn: TransitionHook) {
        if (!this.onExit.has(state)) this.onExit.set(state, []);
        this.onExit.get(state)!.push(fn);
    }

    public tryTransition(to: PlayerState): boolean {
        const allowed = this.transitions.get(this.current);
        if (allowed?.has(to)) {
            this.onExit.get(this.current)?.forEach(cb => cb(this.current, to));
            const old = this.current;
            this.current = to;
            this.onEnter.get(to)?.forEach(cb => cb(old, to));
            return true;
        }
        console.warn(`FSM: Transition interdite ${this.current} -> ${to}`);
        return false;
    }

    public get state(): PlayerState { return this.current; }
}
