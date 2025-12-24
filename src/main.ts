import { createApp } from "./core/App";
import { loadAssets } from "./core/Loader";
import { MainScene } from "./scenes/MainScene";

async function main() {
  const app = await createApp();
  await loadAssets(); 
  new MainScene(app);
}

main();