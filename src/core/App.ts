import { Application } from "pixi.js";

export async function createApp(): Promise<Application> {
  const app = new Application();

  await app.init({
    background: "#141452",
    resizeTo: window,
    preference: "webgl",
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  
  //FPS Logger
  /*app.ticker.add(() => {
    console.log(app.ticker.FPS, "FPS");
  }); */

  document.getElementById("pixi-container")!.appendChild(app.canvas);
  
  
  window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
  });
  
  return app;
}