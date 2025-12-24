import { Graphics, Container, FederatedPointerEvent, Application } from "pixi.js";
import { gsap } from "gsap";

export class CursorHighlight {
  private container: Container;
  private highlight: Graphics;
  private targetX: number = 0;
  private targetY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;
  private baseRadius: number = 25;
  private baseSmallBlueRadius: number = 8;
  private radius: number = 25;
  private smoothness: number = 0.2;
  private mode: "filled" | "smallBlue" | "ring" = "filled";
  private ringColor: number = 0x4A90E2;
  private smallBlueRadius: number = 8;
  private scale: number = 1.0;
  private onClickCallback?: (x: number, y: number) => void;

  constructor(private app: Application) {
    this.container = new Container();
    this.container.eventMode = "none";
    this.container.interactive = false;
    this.container.hitArea = null;
    this.app.stage.addChild(this.container);
    this.app.stage.sortableChildren = true;
    this.container.zIndex = 1000;

    // Highlight Circle
    this.highlight = new Graphics();
    this.highlight.eventMode = "none";
    this.highlight.interactive = false;
    this.highlight.hitArea = null;
    this.updateHighlight();
    this.container.addChild(this.highlight);

    // Mouse move event
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on("pointermove", this.onPointerMove.bind(this));
    this.app.stage.on("pointerdown", this.onPointerDown.bind(this));
    
    
    this.targetX = this.app.screen.width / 2;
    this.targetY = this.app.screen.height / 2;
    this.currentX = this.targetX;
    this.currentY = this.targetY;
    this.container.position.set(this.currentX, this.currentY);
    this.container.visible = true;
  }

  private updateHighlight(): void {
    this.highlight.clear();
    
    if (this.mode === "ring") {
      this.highlight.circle(0, 0, this.radius);
      this.highlight.stroke({ color: this.ringColor, width: 3 * this.scale, alpha: 0.8 });
    } else if (this.mode === "smallBlue") {
      this.highlight.circle(0, 0, this.smallBlueRadius);
      this.highlight.fill({ color: this.ringColor, alpha: 1.0 });
    } else {
      this.highlight.circle(0, 0, this.radius);
      this.highlight.fill({ color: 0xffff00, alpha: 0.6 });
    }
  }

  private onPointerMove(event: FederatedPointerEvent): void {
    const globalPos = event.global;
    this.targetX = globalPos.x;
    this.targetY = globalPos.y;
  }

  private onPointerDown(): void {
    if (this.onClickCallback) {
      this.onClickCallback(this.currentX, this.currentY);
    }
  }

  public setOnClick(callback: (x: number, y: number) => void): void {
    this.onClickCallback = callback;
  }

  public switchToSmallBlueMode(): void {
    this.mode = "smallBlue";
    this.highlight.scale.set(1, 1);
    this.highlight.alpha = 1;
    this.updateHighlight(); 
   
    gsap.delayedCall(0.15, () => {
      const scaleRatio = this.radius / this.smallBlueRadius;
      gsap.to(this.highlight.scale, {
        x: scaleRatio,
        y: scaleRatio,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => {
          const progress = this.highlight.scale.x / scaleRatio;
          this.highlight.alpha = 0.8 + (0.2 * (1 - progress));
        },
        onComplete: () => {
          this.switchToRingMode();
        }
      });
    });
  }

  public switchToRingMode(): void {
    this.mode = "ring";
    this.highlight.scale.set(1, 1); 
    this.highlight.alpha = 0.8; 
    this.updateHighlight();
  }

  public switchToFilledMode(): void {
    this.mode = "filled";
    this.updateHighlight();
  }

  public setInitialPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.currentX = x;
    this.currentY = y;
    this.container.position.set(x, y);
  }

  public update(): void {
    const dx = this.targetX - this.currentX;
    const dy = this.targetY - this.currentY;
    
    this.currentX += dx * this.smoothness;
    this.currentY += dy * this.smoothness;
    
    this.container.position.set(this.currentX, this.currentY);
  }

  public setRadius(radius: number): void {
    this.baseRadius = radius;
    this.radius = radius * this.scale;
    this.updateHighlight();
  }

  public setScale(scale: number): void {
    this.scale = scale;
    this.radius = this.baseRadius * scale;
    this.smallBlueRadius = this.baseSmallBlueRadius * scale;
    this.updateHighlight();
  }

  public setSmoothness(smoothness: number): void {
    this.smoothness = Math.max(0, Math.min(1, smoothness));
  }

  public setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  public getCurrentX(): number {
    return this.currentX;
  }

  public getCurrentY(): number {
    return this.currentY;
  }

  public destroy(): void {
    this.app.stage.off("pointermove", this.onPointerMove);
    this.app.stage.off("pointerdown", this.onPointerDown);
    this.container.destroy();
  }
}

