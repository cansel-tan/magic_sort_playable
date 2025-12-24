import { Sprite, Container } from "pixi.js";
import { BottlePhysics, LiquidPosition } from "./BottlePhysics";

export class BottleLiquidLevel {
  private physics: BottlePhysics;

  constructor(
    private liquidBase: Sprite,
    private liquidBody: Sprite,
    private liquidSurface: Sprite,
    private bottleMask: Sprite,
    private waterContainer: Container,
    private currentScale: number,
    private liquidTint: number
  ) {
    this.physics = new BottlePhysics();
  }

  public updateLiquidPosition(
    liquidLevelPercent: number,
    isUsingRippleRed: boolean,
    isCompleted: boolean = false
  ): void {
    const maskTexture = this.bottleMask.texture;
    const maskWidth = maskTexture.width * this.currentScale;
    const maskHeight = maskTexture.height * this.currentScale;

    if (liquidLevelPercent <= 0.001) {
      this.hideLiquid();
      return;
    }

    const physicsData = this.physics.calculateLiquidPhysics(
      maskWidth,
      maskHeight,
      liquidLevelPercent,
      this.currentScale,
      this.liquidBase.texture
    );

    const liquidPosition = this.physics.calculateLiquidPosition(
      physicsData,
      this.liquidBase.texture,
      this.liquidBody.texture,
      this.liquidSurface.texture,
      this.waterContainer.rotation,
      isUsingRippleRed,
      isCompleted
    );

    if (physicsData.bodyTargetHeight <= 0) {
      this.hideLiquid();
      return;
    }

    this.applyLiquidPosition(liquidPosition, liquidLevelPercent);
  }

  private applyLiquidPosition(liquidPosition: LiquidPosition, liquidLevelPercent: number): void {
    this.liquidBase.scale.set(liquidPosition.baseScale.x, liquidPosition.baseScale.y);
    this.liquidBase.position.set(liquidPosition.basePosition.x, liquidPosition.basePosition.y);
    this.liquidBody.scale.set(liquidPosition.bodyScale.x, liquidPosition.bodyScale.y);
    this.liquidBody.position.set(liquidPosition.bodyPosition.x, liquidPosition.bodyPosition.y);
    this.liquidSurface.anchor.set(liquidPosition.surfaceAnchor.x, liquidPosition.surfaceAnchor.y);
    this.liquidSurface.scale.set(liquidPosition.surfaceScale.x, liquidPosition.surfaceScale.y);
    this.liquidSurface.position.set(liquidPosition.surfacePosition.x, liquidPosition.surfacePosition.y);

    this.liquidBase.visible = true;
    this.liquidBody.visible = true;
    this.liquidSurface.visible = true;

    this.liquidBase.alpha = liquidLevelPercent < 0.05 ? Math.max(0, liquidLevelPercent / 0.05) : 1;
    this.liquidBody.tint = this.liquidTint;
    this.liquidBase.tint = this.liquidTint;
    this.liquidSurface.tint = this.liquidTint;

    this.liquidBody.rotation = liquidPosition.liquidRotation;
    this.liquidBase.rotation = liquidPosition.liquidRotation;
    this.liquidSurface.rotation = liquidPosition.liquidRotation;
  }

 
  private hideLiquid(): void {
    this.liquidBase.visible = false;
    this.liquidBase.scale.set(0, 0);
    this.liquidBase.alpha = 0;
    this.liquidBody.visible = false;
    this.liquidBody.alpha = 0;
    this.liquidSurface.visible = false;
    this.liquidSurface.alpha = 0;
  }
}
