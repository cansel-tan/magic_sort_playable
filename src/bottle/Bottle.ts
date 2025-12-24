import { Application, Container, Sprite } from "pixi.js";
import { FlowLineEffect } from "../effects/FlowLineEffects";
import { LiquidFillEffects } from "../effects/LiquidFillEffects";
import { RippleSurfaceFilter } from "../graphics/RippleSurfaceFilter";
import { BottleRenderer } from "../core/bottle/BottleRenderer";
import { BottlePhysics } from "../core/bottle/BottlePhysics";
import { BottleAnimation } from "../core/bottle/BottleAnimation";
import { BottleLiquidLevel } from "../core/bottle/BottleLiquidLevel";
import { BottleFlowController } from "../core/bottle/BottleFlowController";
import { BottleMath } from "../core/bottle/BottleMath";
import { BottleShake } from "../core/bottle/BottleShake";

export class Bottle {
  public renderer: BottleRenderer;
  private physics: BottlePhysics;
  private animation: BottleAnimation;
  private liquidLevel: BottleLiquidLevel;
  private flowController: BottleFlowController;
  private shake: BottleShake;

  // renderer properties
  public get waterContainer(): Container { return this.renderer.waterContainer; }
  public get liquidBody(): Sprite { return this.renderer.liquidBody; }
  public get liquidBase(): Sprite { return this.renderer.liquidBase; }
  public get liquidSurface(): Sprite { return this.renderer.liquidSurface; }
  public get bottleBack(): Sprite { return this.renderer.bottleBack; }
  public get bottleFront(): Sprite { return this.renderer.bottleFront; }
  public get bottleMask(): Sprite { return this.renderer.bottleMask; }

  public isPouring = false;
  public isLifted = false;
  public currentScale: number = 1;
  public liquidLevelPercent: number = 0.25;
  private flowEffect: FlowLineEffect | null = null;
  public fillEffects: LiquidFillEffects | null = null;
  public isUsingRippleRed: boolean = false;
  private rippleFilter: RippleSurfaceFilter | null = null;
  public initialY: number = 0;
  public x: number;

  constructor(
    private app: Application,
    x: number,
    private liquidTint: number
  ) {
    this.x = x;
    this.physics = new BottlePhysics();
    this.animation = new BottleAnimation();
    this.flowController = new BottleFlowController();
    this.renderer = new BottleRenderer(this.app, this.x, this.centerY, this.liquidTint);
    this.rippleFilter = this.renderer.getRippleFilter();

    this.liquidLevel = new BottleLiquidLevel(
      this.liquidBase,
      this.liquidBody,
      this.liquidSurface,
      this.bottleMask,
      this.waterContainer,
      this.currentScale,
      this.liquidTint
    );

    this.shake = new BottleShake(
      this.physics,
      this.liquidSurface,
      this.liquidBody,
      this.waterContainer,
      this.currentScale
    );

    this.flowEffect = new FlowLineEffect(this.app);
    this.flowEffect.configure(this.liquidTint, 0.95, 12 * this.currentScale, this.currentScale);
    this.fillEffects = new LiquidFillEffects(this.app);
    this.fillEffects.setScale(this.currentScale);
    this.initialY = this.centerY;
    this.updateLiquidPosition();
  }

  private get centerY(): number { return this.app.screen.height * 0.5; }
  public getMouthGlobal(): { x: number; y: number } {
    return BottleMath.getMouthGlobal(this.waterContainer, this.bottleMask.texture, this.currentScale);
  }
  public getLiquidSurfaceGlobal(): { x: number; y: number } {
    return BottleMath.getLiquidSurfaceGlobal(this.waterContainer, this.bottleMask.texture, this.liquidLevelPercent, this.currentScale);
  }
  public setLiquidLevel(percent: number): void {
    this.liquidLevelPercent = Math.max(0, Math.min(1, percent));
    this.updateLiquidPosition();
  }
  public getLiquidLevel(): number { return this.liquidLevelPercent; }

  public updatePosition(newX: number): void {
    this.x = newX;
    this.renderer.updatePosition(newX, this.centerY);
    this.waterContainer.position.y = this.bottleMask.position.y;
    this.updateLiquidPosition();
  }

  public updateScale(newScale: number): void {
    this.currentScale = newScale;
    this.renderer.updateScale(newScale);
    this.liquidLevel = new BottleLiquidLevel(
      this.liquidBase,
      this.liquidBody,
      this.liquidSurface,
      this.bottleMask,
      this.waterContainer,
      this.currentScale,
      this.liquidTint
    );
    this.shake.updateScale(this.currentScale);
    if (this.flowEffect) {
      this.flowEffect.configure(this.liquidTint, 0.95, 12 * this.currentScale, this.currentScale);
    }
    if (this.fillEffects) {
      this.fillEffects.setScale(this.currentScale);
    }
    this.updateLiquidPosition();
  }

  public updateLiquidPosition(isCompleted: boolean = false): void {
    this.liquidLevel.updateLiquidPosition(this.liquidLevelPercent, this.isUsingRippleRed, isCompleted);
  }

  public liftBottle(onComplete?: () => void): void {
    this.animation.liftBottle(this, onComplete);
  }

  public startPourAnimation(targetBottle?: Bottle): void {
    if (!targetBottle) return;
    this.animation.startPourAnimation(
      this,
      targetBottle,
      (targetBottle, flowDuration, finalTargetLevel) => this.onFlowStart(targetBottle, flowDuration, finalTargetLevel),
      (targetBottle) => this.onFlowUpdate(targetBottle),
      () => this.onPourReturn()
    );
  }

  public resetBottle(): void {
    this.animation.resetBottle(this);
  }

  public update(deltaSeconds: number): void {
    if (this.flowEffect) {
      this.flowEffect.update(deltaSeconds);
    }
    if (this.rippleFilter) {
      const uniforms = this.rippleFilter.resources.rippleUniforms.uniforms as any;
      uniforms.uTime = (uniforms.uTime || 0) + deltaSeconds;
      uniforms.uStrength = (this.isPouring || this.isLifted) ? 0.005 : 0.0;
    }

    // Delegate shake logic to BottleShake
    const isMoving = this.isPouring || this.isLifted;
    const liquidRotation = -this.waterContainer.rotation;
    this.shake.updateShake(deltaSeconds, isMoving, liquidRotation);
  }

  public syncWaterContainer(): void {
    this.waterContainer.position.set(this.bottleMask.position.x, this.bottleMask.position.y);
    this.updateLiquidPosition();
  }

  private onFlowStart(targetBottle: Bottle, flowDuration: number, finalTargetLevel: number): void {
    if (!this.flowEffect) return;
    this.flowController.startFlowTo(
      this,
      targetBottle,
      this.flowEffect,
      flowDuration,
      finalTargetLevel,
      this.currentScale,
      this.liquidTint
    );
  }

  private onFlowUpdate(targetBottle: Bottle): void {
    if (!this.flowEffect) return;
    this.flowController.updateFlowPosition(this.flowEffect, this, targetBottle, this.currentScale);
  }

  private onPourReturn(): void {
    this.flowController.killDrainTween();
    this.setLiquidLevel(0);
    [this.liquidBase, this.liquidBody, this.liquidSurface].forEach(sprite => {
      sprite.visible = false;
      sprite.alpha = 0;
    });
    this.liquidBase.scale.set(0, 0);
    this.fillEffects?.stop();
  }
}
