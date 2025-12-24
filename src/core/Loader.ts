import { Assets } from "pixi.js";

  const assetList = [
    { alias: "Bottle_Front", src: "/assets/Bottle_Front.png" },
    { alias: "Bottle_Back", src: "/assets/Bottle_Back.png" },
    { alias: "Bottle_Mask", src: "/assets/Bottle_Mask.png" },
    { alias: "EllipseRed", src: "/assets/EllipseRed.png" },
    { alias: "water_body", src: "/assets/water_body.png" },
    { alias: "square_water", src: "/assets/square_water.png" },
    { alias: "flow_line", src: "/assets/flow_line.png" },
    { alias: "flow_line_head", src: "/assets/flow_line_head.png" },
    { alias: "particle1_Red", src: "/assets/particle1_Red.png" },
    { alias: "RippleRed", src: "/assets/RippleRed.png" },
  ];

  export async function loadAssets() {
    assetList.forEach((a) => Assets.add(a));
    await Promise.all(assetList.map((a) => Assets.load(a.alias)));
  }