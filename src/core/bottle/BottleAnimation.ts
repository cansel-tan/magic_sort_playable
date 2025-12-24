import { gsap } from "gsap";
import { Sprite, Container } from "pixi.js";
import { Bottle } from "../../bottle/Bottle";

export class BottleAnimation {
  private liftTween: gsap.core.Tween | null = null;
  private pourTimeline: gsap.core.Timeline | null = null;
  private resetTween: gsap.core.Tween | null = null;

  public playLift(
    bottleElements: (Sprite | Container)[],
    startY: number,
    liftAmount: number,
    onUpdate: () => void,
    onComplete?: () => void
  ): void {
    if (this.liftTween) {
      this.liftTween.kill();
    }

    this.liftTween = gsap.to(bottleElements, {
      y: startY + liftAmount,
      duration: 0.4,
      ease: "power2.out",
      onUpdate,
      onComplete: () => {
        onUpdate();
        if (onComplete) {
          onComplete();
        }
      },
    });
  }

  public playPour(
    bottleElements: (Sprite | Container)[],
    startY: number,
    startX: number,
    targetX: number,
    targetY: number,
    rotation: number,
    pourDuration: number,
    flowDuration: number,
    returnDuration: number,
    returnYDuration: number,
    onUpdate: () => void,
    onFlowStart: () => void,
    onFlowUpdate: () => void,
    onReturnStart: () => void,
    onComplete: () => void
  ): gsap.core.Timeline {
    if (this.pourTimeline) {
      this.pourTimeline.kill();
    }

    this.pourTimeline = gsap.timeline();

    // Step 1
    let flowStarted = false;
    this.pourTimeline.to(bottleElements, {
      rotation: rotation,
      x: targetX,
      y: targetY,
      duration: pourDuration,
      ease: "power2.inOut",
      onUpdate: () => {
        onUpdate();
        const currentRotation = Math.abs((bottleElements[1] as Sprite).rotation);
        const targetRotationAbs = Math.abs(rotation);
        const rotationProgress = currentRotation / targetRotationAbs;

        if (!flowStarted && rotationProgress >= 0.85) {
          flowStarted = true;
          onFlowStart();
        }

        if (flowStarted) {
          onFlowUpdate();
        }
      },
      onComplete: () => {
        if (!flowStarted) {
          flowStarted = true;
          onFlowStart();
        }
      },
    })
      
      .to(bottleElements, {
        rotation: 0,
        x: startX,
        duration: returnDuration,
        ease: "power2.in",
        onUpdate,
        onStart: onReturnStart,
      }, pourDuration + flowDuration)
      .to(bottleElements, {
        y: startY,
        duration: returnYDuration,
        ease: "power2.in",
        onUpdate,
      }, pourDuration + flowDuration + returnDuration)
     
      .call(onComplete, [], pourDuration + flowDuration + returnDuration + returnYDuration);

    return this.pourTimeline;
  }

  public playReset(
    bottleElements: (Sprite | Container)[],
    initialY: number,
    onUpdate: () => void,
    onComplete: () => void
  ): void {
    if (this.resetTween) {
      this.resetTween.kill();
    }

    this.resetTween = gsap.to(bottleElements, {
      y: initialY,
      rotation: 0,
      duration: 0.4,
      ease: "power2.in",
      onUpdate,
      onComplete,
    });
  }

  public killAll(): void {
    if (this.liftTween) {
      this.liftTween.kill();
      this.liftTween = null;
    }
    if (this.pourTimeline) {
      this.pourTimeline.kill();
      this.pourTimeline = null;
    }
    if (this.resetTween) {
      this.resetTween.kill();
      this.resetTween = null;
    }
  }

  public liftBottle(
    bottle: Bottle,
    onComplete?: () => void
  ): void {
    if (bottle.isLifted || bottle.isPouring) return;
    bottle.isLifted = true;

    const bottleElements = bottle.renderer.getBottleElements();
    const startY = bottle.bottleBack.position.y;
    const maskHeight = bottle.bottleMask.texture.height * bottle.currentScale;
    const liftAmount = -(maskHeight * 0.25);

    this.playLift(
      bottleElements,
      startY,
      liftAmount,
      () => bottle.syncWaterContainer(),
      () => {
        bottle.syncWaterContainer();
        if (onComplete) onComplete();
      }
    );
  }

  public startPourAnimation(
    sourceBottle: Bottle,
    targetBottle: Bottle,
    onFlowStart: (targetBottle: Bottle, flowDuration: number, finalTargetLevel: number) => void,
    onFlowUpdate: (targetBottle: Bottle) => void,
    onPourReturn: () => void
  ): void {
    if (sourceBottle.isPouring || !sourceBottle.isLifted || !targetBottle) return;
    sourceBottle.isPouring = true;

    const { targetX, targetY, rotation } = this.calculatePourTarget(sourceBottle, targetBottle);
    const bottleElements = sourceBottle.renderer.getBottleElements();
    const pourDuration = 0.2;
    const flowDuration = 0.4;
    const returnDuration = 0.2;
    const returnYDuration = 0.2;
    const finalTargetLevel = 0.5;

    this.playPour(
      bottleElements,
      sourceBottle.initialY,
      sourceBottle.x,
      targetX,
      targetY,
      rotation,
      pourDuration,
      flowDuration,
      returnDuration,
      returnYDuration,
      () => sourceBottle.syncWaterContainer(),
      () => onFlowStart(targetBottle, flowDuration, finalTargetLevel),
      () => onFlowUpdate(targetBottle),
      () => onPourReturn(),
      () => {
        sourceBottle.isPouring = false;
        sourceBottle.isLifted = false;
        targetBottle.setLiquidLevel(finalTargetLevel);
      }
    );
  }

  public resetBottle(bottle: Bottle): void {
    if (!bottle.isLifted || bottle.isPouring) return;

    const bottleElements = bottle.renderer.getBottleElements();
    this.playReset(
      bottleElements,
      bottle.initialY,
      () => bottle.syncWaterContainer(),
      () => {
        bottle.syncWaterContainer();
        bottle.isLifted = false;
        bottle.isPouring = false;
        bottle.updateLiquidPosition();
      }
    );
  }

  private calculatePourTarget(
    sourceBottle: Bottle,
    targetBottle: Bottle
  ): { targetX: number; targetY: number; rotation: number } {
    const targetBottleX = targetBottle.bottleFront.x;
    const targetBottleY = targetBottle.bottleFront.y;
    const bottleHeight = sourceBottle.bottleFront.height * sourceBottle.currentScale;
    const rotationAngle = 1.7;
    let targetX = sourceBottle.x;
    let rotation = -1.2;

    if (sourceBottle.x > targetBottleX) {
      rotation = -rotationAngle;
      targetX = targetBottleX + (bottleHeight * 0.57);
    } else {
      rotation = rotationAngle;
      targetX = targetBottleX - (bottleHeight * 0.75);
    }

    const targetY = targetBottleY - (bottleHeight * 0.9);
    return { targetX, targetY, rotation };
  }
}

