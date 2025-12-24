import { Filter, GlProgram } from "pixi.js";
const rippleVertex = `
in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    
    gl_Position = vec4(position, 0.0, 1.0);
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

const rippleFragment = `
in vec2 vTextureCoord;

uniform sampler2D uTexture;
uniform float uTime;
uniform float uStrength;
uniform float uFrequency;

void main(void) {
    vec2 uv = vTextureCoord;
    
    // Radial ripple from center
    vec2 center = vec2(0.5, 0.5);
    vec2 offset = uv - center;
    float dist = length(offset);
    
    // Radial wave: slight distortion with sine wave
    float wave = sin(dist * uFrequency - uTime * 3.0) * uStrength;
    uv += normalize(offset) * wave;

    // Sample texture
    gl_FragColor = texture(uTexture, uv);
}
`;

export function createRippleSurfaceFilter() {
  const glProgram = new GlProgram({
    vertex: rippleVertex,
    fragment: rippleFragment,
  });

  const filter = new Filter({
    glProgram,
    resources: {
      rippleUniforms: {
        uTime: { value: 0.0, type: "f32" },
        uStrength: { value: 0.015, type: "f32" },
        uFrequency: { value: 14.0, type: "f32" },
      },
    },
  });

  return filter;
}

export type RippleSurfaceFilter = ReturnType<typeof createRippleSurfaceFilter>;

