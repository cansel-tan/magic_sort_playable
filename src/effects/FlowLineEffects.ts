import { Application, Container, Sprite } from "pixi.js";

export class FlowLineEffect {
  private container: Container;
  private line: Sprite;
  private head: Sprite;
  private tint: number = 0xff4138;
  private alpha: number = 0.9;
  private endYOffset: number = 0;
  private active: boolean = false;
  private length: number = 0;
  private velocity: number = 0;
  private maxLength: number = 0;
  private time: number = 0;
  private baseThickness: number = 0.29;
  private scale: number = 1.0;
  private onCompleteCallback?: () => void;
  private onSurfaceReachedCallback?: () => void;
  private surfaceReached: boolean = false;
  private surfaceReachedTime: number = 0;

  private readonly BASE_GRAVITY = 2800; 
  private readonly BASE_INITIAL_VELOCITY = 150; 
  private readonly BASE_MAX_VELOCITY = 3000;
  
  private get GRAVITY(): number { return this.BASE_GRAVITY * this.scale; }
  private get INITIAL_VELOCITY(): number { return this.BASE_INITIAL_VELOCITY * this.scale; }
  private get MAX_VELOCITY(): number { return this.BASE_MAX_VELOCITY * this.scale; } 

  constructor(private app: Application) {
    this.container = new Container();
    this.container.visible = false;

    this.line = Sprite.from("flow_line");
    this.line.anchor.set(-0.1, 0);

    this.head = Sprite.from("flow_line_head");
    this.head.anchor.set(1.1, -0.90);

    this.container.addChild(this.line);
    this.container.addChild(this.head);
    this.app.stage.addChild(this.container);
  }

  public configure(
    tint: number,
    alpha: number = 0.9,
    endYOffset: number = 0,
    scale: number = 1.0
  ) {
    this.tint = tint;
    this.alpha = alpha;
    this.endYOffset = endYOffset;
    this.scale = scale;
    this.baseThickness = 0.29 * scale;
    this.line.tint = tint;
    this.head.tint = tint;
    this.line.alpha = alpha;
    this.head.alpha = alpha;
  }

  
  public updateContainerPosition(src: { x: number; y: number }, dst: { x: number; y: number }): void {
    if (!this.active) return;
    
    const adjDstY = dst.y + this.endYOffset;
    const dx = dst.x - src.x;
    const dy = adjDstY - src.y;
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    
    this.container.position.set(src.x, src.y);
    this.container.rotation = angle;
  }

  public start(
    src: { x: number; y: number },
    dst: { x: number; y: number },
    _duration: number,
    onComplete?: () => void,
    onSurfaceReached?: () => void
  ) {
    const adjDstY = dst.y + this.endYOffset;
    const dx = dst.x - src.x;
    const dy = adjDstY - src.y;
    this.maxLength = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - Math.PI / 2;

    this.container.visible = true;
    this.container.position.set(src.x, src.y);
    this.container.rotation = angle;
    this.active = true;
    this.length = 0;
    this.velocity = this.INITIAL_VELOCITY;
    this.time = 0;
    this.onCompleteCallback = onComplete;
    this.onSurfaceReachedCallback = onSurfaceReached;
    this.surfaceReached = false;
    this.surfaceReachedTime = 0;
    this.head.visible = true; 
    this.line.visible = false; 
    this.line.tint = this.tint;
    this.head.tint = this.tint;
    this.line.alpha = this.alpha;
    this.head.alpha = this.alpha;
    this.line.scale.set(this.baseThickness, 0);
    this.line.rotation = 0;
    this.line.skew.set(0, 0);
    this.head.rotation = 0; 
    this.head.position.set(0, -4);
    this.line.position.set(0, this.head.position.y + 5);
  }

  public update(delta: number): void {
    if (!this.active) return;

    this.time += delta;
    
    if (this.length < this.maxLength) {
      this.velocity += this.GRAVITY * delta;
      this.length += this.velocity * delta;

      if (this.length >= this.maxLength) {
        this.length = this.maxLength;
        
        if (!this.surfaceReached && this.onSurfaceReachedCallback) {
          this.surfaceReached = true;
          this.surfaceReachedTime = this.time;
          this.onSurfaceReachedCallback();
        }
      }
    }
    
    const stretch = Math.min(this.velocity / this.MAX_VELOCITY, 1);
    let thickness = this.baseThickness * (1 - stretch * 0.25);

    const t = this.length / this.maxLength;
    const lengthScale = this.length / this.line.texture.height;
    const stretchFactor = 1 + stretch * 0.12;

  
    if (lengthScale > 0.05) {
      this.head.visible = false;
      this.line.visible = true;
    }

    const nearTarget = t > 0.88;
    if (nearTarget) {
      thickness = this.baseThickness * (1 - stretch * 0.1);
    }

    const fadeOutDuration = 0.2;
    
    if (this.surfaceReached) {
      
      const elapsedSinceReach = this.time - this.surfaceReachedTime;
      const fadeProgress = Math.min(elapsedSinceReach / fadeOutDuration, 1);
      const fadeAlpha = this.alpha * (1 - fadeProgress);
    
      if (fadeAlpha < 0.05) {
        this.line.visible = false;
        this.head.visible = false;
      } else {
        this.line.visible = true;
        this.line.alpha = fadeAlpha;
      }
    }

    const lineScaleY = this.head.visible ? 0 : lengthScale * stretchFactor;
    this.line.scale.set(thickness, lineScaleY);
    
    if (this.head.visible) {
      
      this.head.scale.set(this.baseThickness, this.baseThickness);
      this.head.position.set(0, -4 * this.scale);
      this.line.position.set(0, this.head.position.y + 5 * this.scale);
    }
    
    this.line.skew.set(0, 0);
    this.line.rotation = 0;
  
    if (!this.head.visible) {
      this.line.position.set(0, -4 * this.scale);
    }
      this.head.rotation = 3 * Math.PI / 2;
  }

  public stop() {
    this.active = false;
    this.container.visible = false;
    this.line.visible = false;
    this.head.visible = false;
    this.line.alpha = this.alpha;
    this.head.alpha = this.alpha;
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
}

