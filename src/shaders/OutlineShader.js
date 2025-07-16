import * as THREE from 'three'

export const OutlineShader = {
    uniforms: {
        tColor:         { value: null },
        tNormal:        { value: null },
        tOutlineColor:  { value: null },
        resolution:     { value: new THREE.Vector2(1,1) },
        normalThreshold:{ value: 0.2 },
        edgeThickness:  { value: 1.0 },
    },

    vertexShader: /* glsl */`
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4( position.xy, 0.0, 1.0 );
    }
  `,

    fragmentShader: /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tColor;
    uniform sampler2D tNormal;
    uniform sampler2D tOutlineColor;
    uniform vec2 resolution;
    uniform float normalThreshold;
    uniform float edgeThickness;

    void main() {
      vec2 texel = edgeThickness / resolution;
      vec3 nC = texture2D( tNormal, vUv ).rgb * 2.0 - 1.0;
      float edge = 0.0;

      // simple 3×3 normal-difference kernel
      for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
          vec2 off = vec2(float(x),float(y)) * texel;
          vec3 nS = texture2D( tNormal, vUv + off ).rgb * 2.0 - 1.0;
          if (length(nC - nS) > normalThreshold) {
            edge = 1.0;
          }
        }
      }

      if (edge > 0.5) {
        // outline: grab this pixel’s per-object hue
        vec3 outCol = texture2D( tOutlineColor, vUv ).rgb;
        gl_FragColor = vec4( outCol, 1.0 );
      } else {
        // otherwise show the lit scene
        gl_FragColor = texture2D( tColor, vUv );
      }
    }
  `
}
