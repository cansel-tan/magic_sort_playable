import { Sprite } from "pixi.js";
import { gsap } from "gsap";
import { FlowLineEffect } from "../../effects/FlowLineEffects";
import { Bottle } from "../../bottle/Bottle";

export class BottleFlowController {
  private liquidDrainTween: gsap.core.Tween | null = null;

  public startFlowTo(
    sourceBottle: Bottle,
    targetBottle: Bottle,
    flowEffect: FlowLineEffect,
    pourDuration: number,
    targetLevel: number,
    currentScale: number,
    liquidTint: number
  ): void {
    if (!flowEffect) return;

    const mouthPos = sourceBottle.getMouthGlobal();
    const src = { x: mouthPos.x, y: mouthPos.y + (8 * currentScale) };
    const dstMouth = targetBottle.getMouthGlobal();
    const dst = { x: dstMouth.x, y: dstMouth.y };
    
    const initialSurface = targetBottle.getLiquidSurfaceGlobal();
    const endYOffset = initialSurface.y - dstMouth.y;
    flowEffect.configure(liquidTint, 0.95, endYOffset, currentScale);

    const currentLevel = sourceBottle.getLiquidLevel();
    const startLevel = Math.max(currentLevel, 0.25);
    
  
    this.liquidDrainTween = gsap.fromTo(
      sourceBottle,
      { liquidLevelPercent: startLevel },
      {
        liquidLevelPercent: 0.2,
        duration: pourDuration * 1.18,
        ease: "linear",
        onUpdate: () => sourceBottle.updateLiquidPosition(),
        onComplete: () => {
          sourceBottle.setLiquidLevel(0.2);
          this.liquidDrainTween = null;
        },
      }
    );

    // Start flow effect
    let surfaceTweenStarted = false;
    flowEffect.start(
      src,
      dst,
      pourDuration,
      () => {
        console.log("onStart callback");
      },
      () => {
        
        if (surfaceTweenStarted) return;
        surfaceTweenStarted = true;
        gsap.to(sourceBottle, {
          liquidLevelPercent: 0.05,
          duration: 0.3,
          ease: "linear",
          onUpdate: () => sourceBottle.updateLiquidPosition(),
          onComplete: () => {
            sourceBottle.setLiquidLevel(0.05);
          },
        });

        const rippleTexture = Sprite.from("RippleRed").texture;
        targetBottle.liquidSurface.texture = rippleTexture;
        targetBottle.isUsingRippleRed = true;
        targetBottle.updateLiquidPosition();

        // Start fill effects
        if (targetBottle.fillEffects) {
          targetBottle.fillEffects.startContinuous(() => {
            return targetBottle.getLiquidSurfaceGlobal();
          });
        }

        // Fill target bottle
        gsap.to(targetBottle, {
          liquidLevelPercent: targetLevel,
          duration: pourDuration * 1.1,
          ease: "sine.out",
          onUpdate: () => targetBottle.updateLiquidPosition(),
          onComplete: () => {
            targetBottle.setLiquidLevel(targetLevel);
            
            if (flowEffect) {
              flowEffect.stop();
              gsap.to(sourceBottle, {
                liquidLevelPercent: 0,
                duration: 0.2,
                ease: "linear",
                onUpdate: () => {
                  sourceBottle.updateLiquidPosition();
                  const alpha = Math.max(0, sourceBottle.liquidLevelPercent / 0.001);
                  if (sourceBottle.liquidBase.visible) {
                    sourceBottle.liquidBase.alpha = alpha;
                  }
                },
                onComplete: () => {
                  sourceBottle.setLiquidLevel(0);
                  sourceBottle.liquidBase.visible = false;
                  sourceBottle.liquidBase.alpha = 0;
                  sourceBottle.liquidBase.scale.set(0, 0);
                },
              });
            }

            if (targetBottle.fillEffects) {
              targetBottle.fillEffects.stop();

              const ellipseTexture = Sprite.from("EllipseRed").texture;
              const targetLiquidSurface = targetBottle.liquidSurface;
              const originalTexture = targetLiquidSurface.texture;
             
              targetLiquidSurface.texture = ellipseTexture;
              targetBottle.isUsingRippleRed = false;
              targetBottle.updateLiquidPosition(true);

              const ellipsePosition = {
                x: targetLiquidSurface.position.x,
                y: targetLiquidSurface.position.y,
              };
              const ellipseScale = {
                x: targetLiquidSurface.scale.x,
                y: targetLiquidSurface.scale.y,
              };
              const ellipseAnchor = {
                x: targetLiquidSurface.anchor.x,
                y: targetLiquidSurface.anchor.y,
              };
              
              targetLiquidSurface.texture = originalTexture;
              targetBottle.isUsingRippleRed = true;
              targetBottle.updateLiquidPosition();

              targetLiquidSurface.texture = ellipseTexture;
              targetBottle.isUsingRippleRed = false;
              targetLiquidSurface.position.set(ellipsePosition.x, ellipsePosition.y);
              targetLiquidSurface.anchor.set(ellipseAnchor.x, ellipseAnchor.y);
              targetLiquidSurface.alpha = 1;
              targetLiquidSurface.scale.set(ellipseScale.x * 0.4, ellipseScale.y * 0.4);
            
              const transitionTimeline = gsap.timeline();
              transitionTimeline.to(targetLiquidSurface.scale, {
                x: ellipseScale.x,
                y: ellipseScale.y,
                duration: 0.7,
                ease: "elastic.out(1, 0.5)",
              });
              transitionTimeline.to(
                targetLiquidSurface,
                {
                  alpha: 1,
                  duration: 0.7,
                  ease: "sine.inOut",
                },
                0
              );
              transitionTimeline.to(
                targetLiquidSurface.position,
                {
                  x: ellipsePosition.x + 0.8,
                  y: ellipsePosition.y + 0.4,
                  duration: 0.25,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: 1,
                },
                0
              );
              transitionTimeline.to(targetLiquidSurface.position, {
                x: ellipsePosition.x,
                y: ellipsePosition.y,
                duration: 0.2,
                ease: "sine.out",
              });

              targetBottle.fillEffects.startSurfaceOscillation(() => {
                return targetBottle.getLiquidSurfaceGlobal();
              });
            }
          },
        });
      }
    );
  }

 
  public updateFlowPosition(
    flowEffect: FlowLineEffect,
    sourceBottle: Bottle,
    targetBottle: Bottle,
    currentScale: number
  ): void {
    if (!flowEffect) return;
    const mouthPos = sourceBottle.getMouthGlobal();
    const src = { x: mouthPos.x, y: mouthPos.y + (8 * currentScale) };
    const dstMouth = targetBottle.getMouthGlobal();
    const dst = { x: dstMouth.x, y: dstMouth.y };
    flowEffect.updateContainerPosition(src, dst);
  }

  public killDrainTween(): void {
    if (this.liquidDrainTween) {
      this.liquidDrainTween.kill();
      this.liquidDrainTween = null;
    }
  }
}
