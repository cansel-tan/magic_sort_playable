import { Point, Container } from "pixi.js";

export class BottleMath {
 
  public static calculateMaskWidth(maskTexture: { width: number }, currentScale: number): number {
    return maskTexture.width * currentScale;
  }

  public static calculateMaskHeight(maskTexture: { height: number }, currentScale: number): number {
    return maskTexture.height * currentScale;
  }

  public static calculateBottomY(maskHeight: number, currentScale: number): number {
    return maskHeight / 2 - 18 * currentScale;
  }

  public static calculateWaterHeight(maskHeight: number, liquidLevelPercent: number): number {
    return maskHeight * liquidLevelPercent;
  }

  public static calculateLiquidTopLevel(bottomY: number, waterHeight: number): number {
    return bottomY - waterHeight;
  }

  public static localToGlobal(
    container: Container,
    localX: number,
    localY: number
  ): { x: number; y: number } {
    const localPoint = new Point(localX, localY);
    const global = container.toGlobal(localPoint);
    return { x: global.x, y: global.y };
  }

  public static getMouthGlobal(
    waterContainer: Container,
    maskTexture: { height: number },
    currentScale: number
  ): { x: number; y: number } {
    const maskHeight = BottleMath.calculateMaskHeight(maskTexture, currentScale);
    const localMouthY = -maskHeight * 0.5;
    return BottleMath.localToGlobal(waterContainer, 0, localMouthY);
  }

  public static getLiquidSurfaceGlobal(
    waterContainer: Container,
    maskTexture: { height: number },
    liquidLevelPercent: number,
    currentScale: number
  ): { x: number; y: number } {
    const maskHeight = BottleMath.calculateMaskHeight(maskTexture, currentScale);
    const waterHeight = BottleMath.calculateWaterHeight(maskHeight, liquidLevelPercent);
    const bottomY = BottleMath.calculateBottomY(maskHeight, currentScale);
    const liquidTopLevel = BottleMath.calculateLiquidTopLevel(bottomY, waterHeight);
    return BottleMath.localToGlobal(waterContainer, 0, liquidTopLevel);
  }

  public static calculateBottomYCenter(maskHeight: number): number {
    return maskHeight / 2;
  }

  public static calculateLiquidTopLevelFromBottom(bottomY: number, waterHeight: number): number {
    return bottomY - waterHeight;
  }

  public static calculateRotationOffset(
    containerRotation: number,
    liquidBottomY: number,
    centerY: number = 0,
    multiplier: number = 1.2
  ): { offsetX: number; offsetY: number } {
    if (Math.abs(containerRotation) <= 0.01) {
      return { offsetX: 0, offsetY: 0 };
    }

    const centerToLiquidBottom = liquidBottomY - centerY;
    const offsetX = Math.sin(containerRotation) * centerToLiquidBottom * multiplier;
    const offsetY = (Math.cos(containerRotation) - 1) * centerToLiquidBottom * multiplier;

    return { offsetX, offsetY };
  }

  public static calculateRotationWidthMultiplier(containerRotation: number): number {
    if (Math.abs(containerRotation) <= 0.01) {
      return 1;
    }
    const rotationRad = Math.abs(containerRotation);
    return 1 / Math.cos(rotationRad);
  }
}
