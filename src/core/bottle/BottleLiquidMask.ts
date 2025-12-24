import { Graphics } from "pixi.js";

export interface MaskPoints {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export class BottleLiquidMask {
  public updateMask(graphics: Graphics, points: MaskPoints): void {
    graphics.clear();
    graphics.moveTo(points.topLeft.x, points.topLeft.y);
    graphics.bezierCurveTo(
      points.topLeft.x,
      (points.topLeft.y + points.bottomLeft.y) / 2,
      points.bottomLeft.x,
      (points.topLeft.y + points.bottomLeft.y) / 2,
      points.bottomLeft.x,
      points.bottomLeft.y
    );
    graphics.lineTo(points.bottomRight.x, points.bottomRight.y);
    graphics.bezierCurveTo(
      points.bottomRight.x,
      (points.topRight.y + points.bottomRight.y) / 2,
      points.topRight.x,
      (points.topRight.y + points.bottomRight.y) / 2,
      points.topRight.x,
      points.topRight.y
    );
    graphics.closePath();
    graphics.fill({ color: 0xffffff, alpha: 1 });
  }
}

