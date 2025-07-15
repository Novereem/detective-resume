import * as THREE from 'three'

export const OutlineShader = {
    uniforms: {
        tDiffuse:     { value: null },
        tNormal:      { value: null },
        tDepth:       { value: null },
        resolution:   { value: new THREE.Vector2(1,1) },
        cameraNear:   { value: 0.1 },
        cameraFar:    { value: 1000 },
        edgeThickness:{ value: 1.0 },
        depthThreshold: { value: 0.01 },
        normalThreshold:{ value: 0.1 },
        outlineColor: { value: new THREE.Color(0xffffff) },
    },

    vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0., 1.);
    }
  `,

    fragmentShader: /* glsl */`
    #include <packing>          // for linearDepthToViewZ / viewZToOrthographicDepth
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D tNormal;
    uniform sampler2D tDepth;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float depthThreshold;
    uniform float normalThreshold;
    uniform float edgeThickness;
    uniform vec3  outlineColor;

    float getViewZ(const in vec2 uv) {
      float d = texture2D(tDepth, uv).x;
      return perspectiveDepthToViewZ(d, cameraNear, cameraFar);
    }

    vec3 getNormal(const in vec2 uv) {
      // normals were encoded [0,1], remap to [-1,1]
      return texture2D(tNormal, uv).xyz * 2.0 - 1.0;
    }

    void main() {
      vec2 texel = edgeThickness / resolution;
      float centerZ = getViewZ(vUv);
      vec3  centerN = getNormal(vUv);

      float edge = 0.0;
      // sample a 3×3 grid
      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          vec2 o = vec2(x,y) * texel;
          float z = getViewZ(vUv + o);
          vec3  n = getNormal(vUv + o);

          if (abs(z - centerZ) > depthThreshold) edge = 1.0;
          if (length(n - centerN) > normalThreshold) edge = 1.0;
        }
      }

      vec4 color = texture2D(tDiffuse, vUv);
      if (edge > 0.5) {
        gl_FragColor = vec4(outlineColor, 1.0);
      } else {
        gl_FragColor = color;
      }
    }
  `
}