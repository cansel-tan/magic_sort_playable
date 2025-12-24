import { Application, Assets, Ticker } from "pixi.js";
import { Bottle } from "../bottle/Bottle";
import { CursorHighlight } from "../effects/CursorHighlight";

export class MainScene {
  private bottles: Bottle[] = [];
  private leftBottle: Bottle | null = null;
  private rightBottle: Bottle | null = null;
  private bottleWidth: number = 200; 
  private bottleHeight: number = 400;
  private cursorHighlight: CursorHighlight; 

  constructor(private app: Application) {
    this.cursorHighlight = new CursorHighlight(this.app);
    this.createBottles();
    this.app.ticker.add(this.update);
    
   
    this.cursorHighlight.setOnClick((x, y) => {
      this.handleCursorClick(x, y);
    });
    
   //Resize Handler
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }
  
  private createBottles() {
    this.updateBottleWidth();
    
    const scale = this.calculateScale();
    const centerX = this.app.screen.width * 0.5;
    const offset = this.calculateOffset();
    const tint = 0xff3b3b;

    this.leftBottle = new Bottle(this.app, centerX - offset, tint);
    this.rightBottle = new Bottle(this.app, centerX + offset, tint);
    
    this.leftBottle.updateScale(scale);
    this.rightBottle.updateScale(scale);
    this.setupInteractions();
    this.bottles.push(this.leftBottle, this.rightBottle);
    
    // Cursor Initial Position and Scale
    this.cursorHighlight.setScale(scale);
    const rightBottleY = this.rightBottle.bottleFront.y;
    const rightBottleHeight = this.rightBottle.bottleFront.height * scale;
    const cursorY = rightBottleY + (rightBottleHeight / 2) + 40 * scale; 
    this.cursorHighlight.setInitialPosition(centerX + offset, cursorY);
  }
  
  private handleCursorClick(x: number, y: number): void {
    if (!this.leftBottle || !this.rightBottle) return;
    
    // Cursor controls
    const rightBottleBounds = this.rightBottle.bottleFront.getBounds();
    const leftBottleBounds = this.leftBottle.bottleFront.getBounds();
    
    if (x >= rightBottleBounds.x && x <= rightBottleBounds.x + rightBottleBounds.width &&
        y >= rightBottleBounds.y && y <= rightBottleBounds.y + rightBottleBounds.height) {
      this.rightBottleClickHandler();
      return;
    }
    
    if (x >= leftBottleBounds.x && x <= leftBottleBounds.x + leftBottleBounds.width &&
        y >= leftBottleBounds.y && y <= leftBottleBounds.y + leftBottleBounds.height) {
      this.leftBottleClickHandler();
      return;
    }
  }

  private rightBottleClickHandler = () => {
    this.cursorHighlight.switchToSmallBlueMode();
    
    if (this.rightBottle!.isLifted && !this.rightBottle!.isPouring) {
      this.rightBottle!.resetBottle();
      return;
    }
    
    if (!this.rightBottle!.isLifted && !this.rightBottle!.isPouring) {
      if (this.rightBottle!.getLiquidLevel() > 0) {
        this.rightBottle!.liftBottle();
      }
    }
  };

  private leftBottleClickHandler = () => {
    this.cursorHighlight.switchToSmallBlueMode();
    
    if (this.rightBottle!.isLifted && !this.rightBottle!.isPouring) {
      if (this.rightBottle!.getLiquidLevel() > 0) {
        this.rightBottle!.startPourAnimation(this.leftBottle!);
      }
    }
  };

  private setupInteractions() {
    if (!this.leftBottle || !this.rightBottle) return;
    this.rightBottle.bottleFront.on("pointerleave", () => {
      this.cursorHighlight.switchToFilledMode();
    });
    
    this.leftBottle.bottleFront.on("pointerleave", () => {
      this.cursorHighlight.switchToFilledMode();
    });
  }
  
  private updateBottleWidth() {
   
    try {
      const maskTexture = Assets.get("Bottle_Front");
      if (maskTexture) {
        this.bottleWidth = maskTexture.width;
        this.bottleHeight = maskTexture.height;
      }
    } catch (e) {
     console.error(e);
    }
  }
  
  private calculateScale(): number {
    
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    const availableWidth = screenWidth * 0.9; 
    const availableHeight = screenHeight * 0.55; 
    
    const minSpacing = this.bottleWidth * 0.3; 
    const requiredWidth = (this.bottleWidth * 2) + minSpacing;
    const scaleByWidth = availableWidth / requiredWidth;
    const scaleByHeight = availableHeight / this.bottleHeight;  
    const scale = Math.min(scaleByWidth, scaleByHeight, 1.0); 
    
    return Math.max(scale, 0.3); 
  }
  
  private calculateOffset(): number {
   
    const scale = this.calculateScale();
    const scaledBottleWidth = this.bottleWidth * scale;
    const minSpacing = scaledBottleWidth * 0.3; 
    
    const screenWidth = this.app.screen.width;
    const isMobile = screenWidth < 768;
    const percentageOffset = isMobile ? 0.06 : 0.08;
    const calculatedOffset = screenWidth * percentageOffset;
  
    return Math.max(calculatedOffset, (scaledBottleWidth + minSpacing) / 2);
  }
  
  private handleResize() {
    const scale = this.calculateScale();
    const centerX = this.app.screen.width * 0.5;
    const offset = this.calculateOffset();
    
    if (this.leftBottle && this.rightBottle) {
      this.leftBottle.updateScale(scale);
      this.rightBottle.updateScale(scale);
      
      this.leftBottle.updatePosition(centerX - offset);
      this.rightBottle.updatePosition(centerX + offset);
    }
    
    // Update cursor highlight scale
    this.cursorHighlight.setScale(scale);
    
    // Update cursor initial position
    if (this.rightBottle) {
      const rightBottleY = this.rightBottle.bottleFront.y;
      const rightBottleHeight = this.rightBottle.bottleFront.height * scale;
      const cursorY = rightBottleY + (rightBottleHeight / 2) + 40 * scale;
      this.cursorHighlight.setInitialPosition(centerX + offset, cursorY);
    }
  }

  private update = (ticker: Ticker): void => {
    const dt = ticker.deltaTime / 60;
    this.bottles.forEach((bottle) => bottle.update(dt));
    this.cursorHighlight.update();
    this.updateCursorVisibility();
  };

  private updateCursorVisibility(): void {
    if (!this.leftBottle || !this.rightBottle) return;
    
    const cursorX = this.cursorHighlight.getCurrentX();
    const cursorY = this.cursorHighlight.getCurrentY();
    
    const rightBottleBounds = this.rightBottle.bottleFront.getBounds();
    const leftBottleBounds = this.leftBottle.bottleFront.getBounds();
    
    let isOverBottle = false;
    let bottleHasLiquid = false;
    
    if (cursorX >= rightBottleBounds.x && cursorX <= rightBottleBounds.x + rightBottleBounds.width &&
        cursorY >= rightBottleBounds.y && cursorY <= rightBottleBounds.y + rightBottleBounds.height) {
      isOverBottle = true;
      bottleHasLiquid = this.rightBottle.getLiquidLevel() > 0;
    }
    
    if (!isOverBottle && 
        cursorX >= leftBottleBounds.x && cursorX <= leftBottleBounds.x + leftBottleBounds.width &&
        cursorY >= leftBottleBounds.y && cursorY <= leftBottleBounds.y + leftBottleBounds.height) {
      isOverBottle = true;
      
      if (this.rightBottle.isLifted && this.rightBottle.getLiquidLevel() > 0) {
        bottleHasLiquid = true;
      } else {
        bottleHasLiquid = false;
      }
    }
    
    if (isOverBottle && !bottleHasLiquid) {
      this.cursorHighlight.setVisible(false);
    } else {
      this.cursorHighlight.setVisible(true);
    }
  }
}
