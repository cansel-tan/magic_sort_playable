import { Application, Container, Sprite } from "pixi.js";
import { gsap } from "gsap";

export class LiquidFillEffects {
  private container: Container;
  private ripple: Sprite;
  private particles: Sprite[] = [];
  private active: boolean = false;
  private continuousTimeline: gsap.core.Timeline | null = null;
  private scale: number = 1.0;

  constructor(private app: Application) {
    this.container = new Container();
    this.container.visible = false;
    this.container.zIndex = 1000;

    this.ripple = Sprite.from("RippleRed");
    this.ripple.anchor.set(0.5, 0.5);
    this.ripple.alpha = 0;
    this.container.addChild(this.ripple);

    for (let i = 0; i < 5; i++) {
      const particle = Sprite.from("particle1_Red");
      particle.anchor.set(0.5, 0.5);
      particle.alpha = 0;
      particle.scale.set(0);
      this.particles.push(particle);
      this.container.addChild(particle);
    }

    this.app.stage.addChild(this.container);
  }

  public start(
    centerX: number,
    centerY: number,
    duration: number,
    onComplete?: () => void
  ) {
    this.container.visible = true;
    this.container.position.set(centerX, centerY);

    this.ripple.position.set(0, 0);
    this.ripple.scale.set(0);
    this.ripple.alpha = 0.4;

    gsap.to(this.ripple.scale, {
      x: 0.8 * this.scale, 
      y: 0.8 * this.scale,
      duration: duration * 0.3,
      ease: "power1.out",
    });

    gsap.to(this.ripple, {
      alpha: 0,
      duration: duration * 0.3,
      ease: "power1.out",
    });

    this.particles.forEach((particle, i) => {
      const offsetX = (Math.random() - 0.5) * 4 * this.scale; 
      const offsetY = -(8 + Math.random() * 6) * this.scale; 

      particle.position.set(0, 0);
      particle.rotation = Math.random() * Math.PI * 2;
      particle.scale.set(0);
      particle.alpha = 0.5; 

      gsap.to(particle.position, {
        x: offsetX,
        y: offsetY,
        duration: duration * 0.3,
        delay: i * 0.05,
        ease: "power2.out",
      });

      gsap.to(particle.scale, {
        x: (0.3 + Math.random() * 0.2) * this.scale, 
        y: (0.3 + Math.random() * 0.2) * this.scale,
        duration: duration * 0.2,
        delay: i * 0.05,
        ease: "power1.out",
      });

      gsap.to(particle, {
        alpha: 0,
        duration: duration * 0.25,
        delay: duration * 0.2 + i * 0.05,
        ease: "power1.out",
      });
    });

    gsap.delayedCall(duration, () => {
      this.container.visible = false;
      if (onComplete) onComplete();
    });
  }
  
  public startContinuous(
    getSurfacePosition: () => { x: number; y: number }
  ) {

    if (this.active) {
      this.stop();
    }
    this.active = true;
    this.container.visible = true;
    this.continuousTimeline = gsap.timeline({ repeat: -1 });

    const createRipple = () => {
      const pos = getSurfacePosition();
      this.container.position.set(pos.x, pos.y);

      const ripple = Sprite.from("RippleRed");
      ripple.anchor.set(0.5, 0.5);
      ripple.position.set(0, 0); 
      ripple.scale.set(0);
      ripple.alpha = 1; 
      ripple.tint = 0xff4138; 
      this.container.addChild(ripple);

      gsap.to(ripple.scale, {
        x: 0.4 * this.scale, 
        y: 0.4 * this.scale,
        duration: 0.3, 
        ease: "power1.out",
      });

      gsap.to(ripple, {
        alpha: 0,
        duration: 0.3, 
        ease: "power1.out",
        onComplete: () => {
          if (ripple.parent) {
            this.container.removeChild(ripple);
          }
        },
      });
    };

    const createParticle = () => {
      const pos = getSurfacePosition();
      this.container.position.set(pos.x, pos.y);

      const particle = Sprite.from("particle1_Red");
      particle.anchor.set(0.5, 0.5);
      particle.position.set(0, 0); 
      particle.rotation = Math.random() * Math.PI * 2;
      particle.scale.set(0);
      particle.alpha = 1; 
      particle.tint = 0xcc0000; 
      this.container.addChild(particle);

      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetX = direction * (6 + Math.random() * 3.5) * this.scale; 
      const apexY = -(8 + Math.random() * 4) * this.scale; 
      const settleY = (0.4 + Math.random() * 0.8) * this.scale;

      particle.scale.set(0.18 * this.scale, 0.18 * this.scale);

      const tl = gsap.timeline({
        onComplete: () => {
          if (particle.parent) {
            this.container.removeChild(particle);
          }
        },
      });

     
      tl.to(particle.position, {
        x: offsetX * 0.9,
        y: apexY,
        duration: 0.12,
        ease: "power2.out",
      }, 0);

      tl.to(particle.scale, {
        x: (0.24 + Math.random() * 0.1) * this.scale,
        y: (0.24 + Math.random() * 0.1) * this.scale,
        duration: 0.12,
        ease: "power2.out",
      }, 0);

     
      tl.to(particle.position, {
        x: offsetX,
        y: settleY,
        duration: 0.12,
        ease: "power3.in",
      }, 0.11);

     
      tl.to(particle.position, {
        y: settleY - 1.0 * this.scale,
        duration: 0.06,
        ease: "sine.out",
        yoyo: true,
        repeat: 1,
      }, 0.24);

     
      tl.to(particle, {
        rotation: particle.rotation + Math.PI * 0.15,
        alpha: 0,
        duration: 0.12,
        ease: "power1.in",
      }, 0.26);
    };

    this.continuousTimeline
      .call(createRipple, [], 0)
      .call(createParticle, [], 0)
      .call(createParticle, [], 0.18)
      .call(createRipple, [], 0.25)
      .call(createParticle, [], 0.36)
      .call(createParticle, [], 0.54)
      .call(createRipple, [], 0.6)
      .call(createParticle, [], 0.72)
      .call(createParticle, [], 0.9);
  }

    //Particle Effects
  public startSurfaceOscillation(
    getSurfacePosition: () => { x: number; y: number },
    onComplete?: () => void
  ) {
    const pos = getSurfacePosition();
    this.container.position.set(pos.x, pos.y);
    this.container.visible = true;

    for (let i = 0; i < 5; i++) {
      const particle = Sprite.from("particle1_Red");
      particle.anchor.set(0.5, 0.5);
      particle.position.set((Math.random() - 0.5) * 3 * this.scale, 0);
      particle.rotation = Math.random() * Math.PI * 2;
      particle.scale.set(0);
      particle.alpha = 1; 
      particle.tint = 0xcc0000;
      this.container.addChild(particle);
      
      const offsetX = (Math.random() - 0.5) * 3.5 * this.scale;
      const offsetY = -(18 + Math.random() * 8) * this.scale; 

      gsap.to(particle.position, {
        x: offsetX,
        y: offsetY,
        duration: 0.22,
        delay: i * 0.035,
        ease: "power2.out",
      });

      gsap.to(particle.scale, {
        x: (0.25 + Math.random() * 0.14) * this.scale,
        y: (0.25 + Math.random() * 0.14) * this.scale,
        duration: 0.2,
        delay: i * 0.035,
        ease: "power2.out",
      });

     
      gsap.to(particle, {
        alpha: 0,
        duration: 0.22,
        delay: i * 0.035,
        ease: "power2.out",
        onComplete: () => {
          if (particle.parent) {
            this.container.removeChild(particle);
          }
          if (i === 4) {
           
            this.container.visible = false;
            if (onComplete) {
              onComplete();
            }
          }
        },
      });
    }
  }

  public setScale(scale: number): void {
    this.scale = scale;
  }

  public stop() {
    if (!this.active) return;
    this.active = false;
    if (this.continuousTimeline) {
      this.continuousTimeline.kill();
      this.continuousTimeline = null;
    }
    this.container.visible = false;
    while (this.container.children.length > 0) {
      this.container.removeChildAt(0);
    }
  }
}

