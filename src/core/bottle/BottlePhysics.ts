import { BottleMath } from "./BottleMath";

export interface LiquidPosition {
  baseScale: { x: number; y: number };
  basePosition: { x: number; y: number };
  bodyScale: { x: number; y: number };
  bodyPosition: { x: number; y: number };
  surfaceScale: { x: number; y: number };
  surfacePosition: { x: number; y: number };
  surfaceAnchor: { x: number; y: number };
  baseTopY: number;
  liquidRotation: number;
}

export interface LiquidPhysicsData {
  maskWidth: number;
  maskHeight: number;
  waterHeight: number;
  bottomY: number;
  baseTargetWidth: number;
  baseTargetHeight: number;
  bodyTargetWidth: number;
  bodyTargetHeight: number;
  surfaceTargetWidth: number;
  surfaceTargetHeight: number;
}

export class BottlePhysics {
  public calculateLiquidPhysics(
    maskWidth: number,
    maskHeight: number,
    waterLevelPercent: number,
    currentScale: number,
    baseTexture: { width: number; height: number }
  ): LiquidPhysicsData {
    const waterHeight = maskHeight * waterLevelPercent;
    const bottomY = BottleMath.calculateBottomYCenter(maskHeight);

    const baseTargetWidth = maskWidth * 1;
    const baseTargetHeight = baseTexture.height * (baseTargetWidth / baseTexture.width);

    const baseScaleY = baseTargetHeight / baseTexture.height;
    const baseScaleYFlat = baseScaleY * -0.01;
    const baseActualHeight = baseTexture.height * baseScaleYFlat;
    const baseTopY = bottomY - baseActualHeight;
    const liquidTopLevel = BottleMath.calculateLiquidTopLevelFromBottom(bottomY, waterHeight);
    const bodyTargetHeight = baseTopY - liquidTopLevel;

    const surfaceTargetWidth = baseTargetWidth;

    return {
      maskWidth,
      maskHeight,
      waterHeight,
      bottomY,
      baseTargetWidth,
      baseTargetHeight,
      bodyTargetWidth: baseTargetWidth,
      bodyTargetHeight,
      surfaceTargetWidth,
      surfaceTargetHeight: surfaceTargetWidth,
    };
  }

  public calculateLiquidPosition(
    physicsData: LiquidPhysicsData,
    baseTexture: { width: number; height: number },
    bodyTexture: { width: number; height: number },
    surfaceTexture: { width: number; height: number },
    containerRotation: number,
    isUsingRippleRed: boolean,
    isCompleted: boolean
  ): LiquidPosition {
    const centerX = 0;
    const centerY = 0;

    // Base calculations
    const baseScaleX = physicsData.baseTargetWidth / baseTexture.width;
    const baseScaleY = (physicsData.baseTargetHeight / baseTexture.height) * -0.01;
    const baseActualHeight = baseTexture.height * baseScaleY;
    const baseTopY = physicsData.bottomY - baseActualHeight;

    // Body calculations
    const bodyScaleX = physicsData.bodyTargetWidth / bodyTexture.width;
    const bodyScaleY = physicsData.bodyTargetHeight / bodyTexture.height;

    // Surface calculations
    const surfaceTargetHeight =
      surfaceTexture.height *
      (physicsData.surfaceTargetWidth / surfaceTexture.width) *
      (isCompleted ? 1.3 : 1);
    const surfaceScaleX = physicsData.surfaceTargetWidth / surfaceTexture.width;
    const surfaceScaleY = surfaceTargetHeight / surfaceTexture.height;
    const surfaceAnchorY = isUsingRippleRed ? 0.83 : isCompleted ? 0.7 : 0.9;

    const liquidTopLevel = BottleMath.calculateLiquidTopLevelFromBottom(physicsData.bottomY, physicsData.waterHeight);
    const surfaceScaledHeight = surfaceTexture.height * surfaceScaleY;
    const surfaceYOffset = surfaceScaledHeight * 0.1;

    // Rotation & Offset calculations
    let offsetX = 0;
    let offsetY = 0;
    let adjustedBaseScaleX = baseScaleX;
    let adjustedBodyScaleX = bodyScaleX;
    let adjustedSurfaceScaleX = surfaceScaleX;

    if (Math.abs(containerRotation) > 0.01) {
      const widthMultiplier = BottleMath.calculateRotationWidthMultiplier(containerRotation);

      adjustedBaseScaleX = (physicsData.baseTargetWidth * widthMultiplier) / baseTexture.width;
      adjustedBodyScaleX = (physicsData.bodyTargetWidth * widthMultiplier) / bodyTexture.width;
      adjustedSurfaceScaleX = (physicsData.surfaceTargetWidth * widthMultiplier) / surfaceTexture.width;

      const liquidBottomY = physicsData.bottomY - physicsData.waterHeight;
      const rotationOffset = BottleMath.calculateRotationOffset(containerRotation, liquidBottomY, centerY, 1.2);
      offsetX = rotationOffset.offsetX;
      offsetY = rotationOffset.offsetY;
    }

    const liquidRotation = -containerRotation;

    return {
      baseScale: { x: adjustedBaseScaleX, y: baseScaleY },
      basePosition: { x: centerX + offsetX, y: physicsData.bottomY + offsetY },
      bodyScale: { x: adjustedBodyScaleX, y: bodyScaleY },
      bodyPosition: { x: centerX + offsetX, y: baseTopY + offsetY },
      surfaceScale: { x: adjustedSurfaceScaleX, y: surfaceScaleY },
      surfacePosition: {
        x: centerX + offsetX,
        y: Math.abs(containerRotation) > 0.01
          ? baseTopY + offsetY - (bodyTexture.height * bodyScaleY)
          : liquidTopLevel + surfaceYOffset,
      },
      surfaceAnchor: { x: 0.5, y: surfaceAnchorY },
      baseTopY: baseTopY + offsetY,
      liquidRotation,
    };
  }

  public calculateShakeAnimation(
    shakeTime: number,
    bodyTopY: number,
    surfaceScaledHeight: number,
    currentScale: number
  ): {
    position: { x: number; y: number };
    skew: { x: number; y: number };
    rotation: number;
  } {
    const surfaceYOffset = 3 * currentScale;
    const targetSurfaceY = bodyTopY + (surfaceScaledHeight * 0.5) - surfaceYOffset;
    const offsetAmplitude = 0.5 * currentScale;
    const offsetX = Math.sin(shakeTime) * offsetAmplitude;
    const skewX = Math.sin(shakeTime * 0.7) * 0.06;
    const shakeRotation = Math.sin(shakeTime * 0.5) * 0.04;

    return {
      position: { x: offsetX, y: targetSurfaceY },
      skew: { x: skewX, y: 0 },
      rotation: shakeRotation * 0.5,
    };
  }
}

