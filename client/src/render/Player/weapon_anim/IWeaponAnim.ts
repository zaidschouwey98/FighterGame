export interface IWeaponAnim {

  play():void;

  stop():void;

  update(delta:number):void;

  isVisible?(): boolean;
}
