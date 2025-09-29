export interface AttackReceivedData {
    dmg: number;
    newHp: number;
    knockbackData: KnockbackData;
}

export interface KnockbackData {
    knockbackVector: {dx:number, dy:number};
    knockbackTimer: number;
}

export interface AttackResult {
    targetId:string;
    dmg:number;
    isCrit: boolean;
}