import { Filter, GlProgram, GpuProgram } from "pixi.js";

/**
 * Éclairage directionnel soft (écran) : côté soleil plus clair + teinte chaude.
 * Angle en degrés, même convention que GodrayFilter.
 */
const glVertex = `in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const glFragment = `in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uLightDir;
uniform float uAmbient;
uniform float uIntensity;
uniform float uWarmth;

void main()
{
    vec4 color = texture(uTexture, vTextureCoord);
    if (color.a <= 0.0) {
        finalColor = color;
        return;
    }

    // Normalisation locale en UV : direction lumière vs centre écran
    vec2 dir = normalize(uLightDir);
    vec2 fromCenter = vTextureCoord - vec2(0.5);
    // gradient le long de la direction de la lumière
    float g = dot(fromCenter, dir);
    // 0 (ombre) → 1 (lit)
    float shade = clamp(g * 1.35 + 0.55, 0.0, 1.0);
    float light = uAmbient + uIntensity * shade;

    vec3 rgb = color.rgb * light;
    // teinte soleil (or) du côté éclairé
    vec3 warm = rgb * vec3(1.12, 1.05, 0.9);
    rgb = mix(rgb, warm, uWarmth * shade);

    finalColor = vec4(rgb, color.a);
}
`;

const wgslSource = `struct LightUniforms {
  uLightDir: vec2<f32>,
  uAmbient: f32,
  uIntensity: f32,
  uWarmth: f32,
};

@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> lightUniforms: LightUniforms;

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {
  var color = textureSample(uTexture, uSampler, uv);
  if (color.a <= 0.0) {
    return color;
  }
  let dir = normalize(lightUniforms.uLightDir);
  let fromCenter = uv - vec2<f32>(0.5);
  let g = dot(fromCenter, dir);
  let shade = clamp(g * 1.35 + 0.55, 0.0, 1.0);
  let light = lightUniforms.uAmbient + lightUniforms.uIntensity * shade;
  var rgb = color.rgb * light;
  let warm = rgb * vec3<f32>(1.12, 1.05, 0.9);
  rgb = mix(rgb, warm, lightUniforms.uWarmth * shade);
  return vec4<f32>(rgb, color.a);
}
`;

const wgslVertex = `struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}`;

export class DirectionalLightFilter extends Filter {
    private _angle = 28;

    constructor(options?: {
        ambient?: number;
        intensity?: number;
        warmth?: number;
        angle?: number;
    }) {
        const ambient = options?.ambient ?? 0.78;
        const intensity = options?.intensity ?? 0.42;
        const warmth = options?.warmth ?? 0.35;
        const angle = options?.angle ?? 28;

        const gpuProgram = GpuProgram.from({
            vertex: {
                source: wgslVertex,
                entryPoint: "mainVertex",
            },
            fragment: {
                source: wgslSource,
                entryPoint: "mainFragment",
            },
        });

        const glProgram = GlProgram.from({
            vertex: glVertex,
            fragment: glFragment,
            name: "directional-light-filter",
        });

        super({
            gpuProgram,
            glProgram,
            resources: {
                lightUniforms: {
                    uLightDir: { value: new Float32Array(2), type: "vec2<f32>" },
                    uAmbient: { value: ambient, type: "f32" },
                    uIntensity: { value: intensity, type: "f32" },
                    uWarmth: { value: warmth, type: "f32" },
                },
            },
        });

        this.angle = angle;
    }

    get angle(): number {
        return this._angle;
    }

    /** Angle lumière en degrés (0 = bas→haut / rayons verticaux type godray) */
    set angle(value: number) {
        this._angle = value;
        const rad = (value * Math.PI) / 180;
        // même convention approximate que godrays : angle → dir écran
        const u = this.resources.lightUniforms.uniforms;
        u.uLightDir[0] = Math.sin(rad);
        u.uLightDir[1] = -Math.cos(rad);
    }
}
