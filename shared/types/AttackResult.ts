export interface AttackReceivedData {
    id: string;
    dmg: number;
    newHp: number;
    knockbackData: KnockbackData;
}

export interface KnockbackData {
    id: string;
    knockbackVector: {dx:number, dy:number};
    knockbackTimer: number;
}

export interface AttackResult {
    id:string;
    targetId:string;
    dmg:number;
    isCrit: boolean;
}