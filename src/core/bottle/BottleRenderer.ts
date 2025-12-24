import { Application, Container, Sprite } from "pixi.js";
import { RippleSurfaceFilter } from "../../graphics/RippleSurfaceFilter";
import { createRippleSurfaceFilter } from "../../graphics/RippleSurfaceFilter";

export class BottleRenderer {
  public bottleBack!: Sprite;
  public bottleFront!: Sprite;
  public bottleMask!: Sprite;
  public waterContainer!: Container;
  public liquidBase!: Sprite;
  public liquidBody!: Sprite;
  public liquidSurface!: Sprite;
  private rippleFilter: RippleSurfaceFilter | null = null;

  private x: number;
  private centerY: number;

  constructor(
    private app: Application,
    x: number,
    centerY: number,
    private liquidTint: number
  ) {
    this.x = x;
    this.centerY = centerY;
    this.createSprites();
    this.setupLiquidSprites();
  }

  private createSprites(): void {
    const backTex = Sprite.from("Bottle_Back").texture;
    const frontTex = Sprite.from("Bottle_Front").texture;

    // Back Layer
    this.bottleBack = Sprite.from("Bottle_Back");
    this.bottleBack.anchor.set(0.5);
    const backX = this.x - 1;
    this.bottleBack.position.set(backX, this.centerY);
    this.app.stage.addChild(this.bottleBack);

    // Mask Layer
    this.bottleMask = Sprite.from("Bottle_Mask");
    this.bottleMask.anchor.set(0.5);
    this.bottleMask.position.set(this.x, this.centerY);
    this.bottleMask.alpha = 0;
    this.app.stage.addChild(this.bottleMask);

    // Water Container
    this.waterContainer = new Container();
    this.waterContainer.position.set(this.x, this.centerY);
    this.app.stage.addChild(this.waterContainer);
    this.waterContainer.mask = this.bottleMask;

    // Front Layer
    this.bottleFront = Sprite.from("Bottle_Front");
    this.bottleFront.anchor.set(0.5);

    let frontX = this.x;
    let frontY = this.centerY;

    if (backTex.width !== frontTex.width) {
      frontX = this.x - 1;
    }

    if (backTex.height !== frontTex.height) {
      const heightDiff = (backTex.height - frontTex.height) / 2;
      if (backTex.height > frontTex.height) {
        const backY = this.centerY - heightDiff * 0.5;
        this.bottleBack.position.y = backY;
        frontY = backY;
      } else {
        frontY = this.centerY - heightDiff * 0.5;
        this.bottleBack.position.y = frontY;
      }
    }

    this.bottleFront.position.set(frontX, frontY);
    this.app.stage.addChild(this.bottleFront);
    
    this.bottleFront.eventMode = "static";
    this.bottleFront.cursor = "default";
  }

  private setupLiquidSprites(): void {
    // EllipseRed - base
    this.liquidBase = Sprite.from("EllipseRed");
    this.liquidBase.anchor.set(0.5, 1);
    this.liquidBase.alpha = 1;
    this.waterContainer.addChild(this.liquidBase);

    // water_body
    this.liquidBody = Sprite.from("water_body");
    this.liquidBody.anchor.set(0.5, 1);
    this.waterContainer.addChild(this.liquidBody);

    // EllipseRed - surface
    this.liquidSurface = Sprite.from("EllipseRed");
    this.liquidSurface.anchor.set(0.5, 0.5);
    this.liquidSurface.alpha = 1.0;
    this.liquidSurface.blendMode = "normal";
    this.waterContainer.addChild(this.liquidSurface);

    // Ripple shader filter
    this.rippleFilter = createRippleSurfaceFilter();
    const rippleUniforms = this.rippleFilter.resources.rippleUniforms.uniforms as any;
    rippleUniforms.uStrength = 0.0;
    rippleUniforms.uFrequency = 10.0;
    this.liquidSurface.filters = [this.rippleFilter];
  }

  public updatePosition(newX: number, centerY: number): void {
    this.bottleBack.position.x = newX - 1;
    this.bottleMask.position.set(newX, centerY);
    this.waterContainer.position.set(newX, centerY);

    const backTex = this.bottleBack.texture;
    const frontTex = this.bottleFront.texture;
    let frontX = newX;
    if (backTex.width !== frontTex.width) {
      frontX = newX - 1;
    }

    let frontY = centerY;
    if (backTex.height !== frontTex.height) {
      const heightDiff = (backTex.height - frontTex.height) / 2;
      if (backTex.height > frontTex.height) {
        const backY = centerY - heightDiff * 0.5;
        this.bottleBack.position.y = backY;
        frontY = backY;
      } else {
        frontY = centerY - heightDiff * 0.5;
        this.bottleBack.position.y = frontY;
      }
    } else {
      this.bottleBack.position.y = centerY;
    }

    this.bottleFront.position.set(frontX, frontY);
    this.waterContainer.position.x = newX;
    this.waterContainer.position.y = this.bottleMask.position.y;
  }

  public updateScale(newScale: number): void {
    this.bottleBack.scale.set(newScale, newScale * 1.03);
    this.bottleMask.scale.set(newScale);
    this.bottleFront.scale.set(newScale);
  }

  public getRippleFilter(): RippleSurfaceFilter | null {
    return this.rippleFilter;
  }

  public getBottleElements(): (Sprite | Container)[] {
    return [
      this.bottleBack,
      this.bottleFront,
      this.bottleMask,
      this.waterContainer,
    ];
  }
}

