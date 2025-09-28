export abstract class Ability {
  private cooldownRemaining = 0;

  constructor(private readonly cooldown: number) { }

  /** Appelé chaque frame pour décrémenter le cooldown */
  update(delta: number) {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining -= delta;
      if (this.cooldownRemaining < 0) this.cooldownRemaining = 0;
    }
  }

  /** True si l’ability peut être utilisée */
  canUse(): boolean {
    return this.cooldownRemaining <= 0;
  }

  /** Déclenche le cooldown après une utilisation */
  protected triggerCooldown() {
    this.cooldownRemaining = this.cooldown;
  }

  /** Méthode à implémenter par les abilities concrètes */
  abstract use(entity: any, ...args: any[]): void;
}
