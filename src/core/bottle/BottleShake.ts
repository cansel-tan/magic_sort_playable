import { Sprite, Container } from "pixi.js";
import { BottlePhysics } from "./BottlePhysics";

export class BottleShake {
  private shakeTime: number = 0;
  private physics: BottlePhysics;
  private liquidSurface: Sprite;
  private liquidBody: Sprite;
  private waterContainer: Container;
  private currentScale: number;

  constructor(
    physics: BottlePhysics,
    liquidSurface: Sprite,
    liquidBody: Sprite,
    waterContainer: Container,
    currentScale: number
  ) {
    this.physics = physics;
    this.liquidSurface = liquidSurface;
    this.liquidBody = liquidBody;
    this.waterContainer = waterContainer;
    this.currentScale = currentScale;
  }

  public updateShake(
    deltaSeconds: number,
    isMoving: boolean,
    liquidRotation: number
  ): void {
    
    if (isMoving) {
      this.shakeTime += deltaSeconds * 15;
    } else {
      this.shakeTime *= 1;
      if (this.shakeTime < 0.001) this.shakeTime = 0;
    }

    const containerRotation = this.waterContainer.rotation;

    // Handle tilted bottle
    if (Math.abs(containerRotation) > 0.01) {
      const shakeRotation = Math.sin(this.shakeTime * 0.5) * 0.02;
      this.liquidSurface.rotation = liquidRotation + shakeRotation;
      return;
    }

    // Handle upright bottle
    const bodyScaledHeight = this.liquidBody.texture.height * this.liquidBody.scale.y;
    const bodyTopY = this.liquidBody.position.y - bodyScaledHeight;
    const surfaceScaledHeight = this.liquidSurface.texture.height * this.liquidSurface.scale.y;

    const shakeData = this.physics.calculateShakeAnimation(
      this.shakeTime,
      bodyTopY,
      surfaceScaledHeight,
      this.currentScale
    );

    
    this.liquidSurface.position.set(shakeData.position.x, shakeData.position.y);
    this.liquidSurface.skew.set(shakeData.skew.x, shakeData.skew.y);
    this.liquidSurface.rotation = shakeData.rotation;
  }

  public updateScale(newScale: number): void {
    this.currentScale = newScale;
  }

  public reset(): void {
    this.shakeTime = 0;
  }
}
