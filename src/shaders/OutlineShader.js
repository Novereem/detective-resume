import * as THREE from 'three'

export const OutlineShader = {
    /* ---------- UNIFORMS ---------- */
    uniforms: {
        tDiffuse:       { value: null },                // colour buffer
        tDepth:         { value: null },                // depth buffer
        resolution:     { value: new THREE.Vector2(1,1)},
        cameraNear:     { value: 0.1 },
        cameraFar:      { value: 1000 },
        edgeThickness:  { value: 1.0 },                 // 1‒2 px is plenty
        baseThreshold:  { value: 0.02 },                // tweak in React
        outlineColor:   { value: new THREE.Color(0xffffff) },
    },

    /* ---------- VERTEX ---------- */
    vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,

    /* ---------- FRAGMENT ---------- */
    fragmentShader: /* glsl */`
    #ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
    #endif
    
    #include <packing>            // perspectiveDepthToViewZ()
    
    varying vec2 vUv;

    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2  resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float edgeThickness;
    uniform float baseThreshold;
    uniform vec3  outlineColor;

    /* helper: depth → view-space Z (metres, negative in front) */
    float viewZ( vec2 uv ){
      float d = texture2D( tDepth, uv ).x;
      return perspectiveDepthToViewZ( d, cameraNear, cameraFar );
    }

    void main(){

      vec2  texel    = edgeThickness / resolution;   // step = 1 pixel
      float zCentre  = viewZ( vUv );

      /* local slope of the surface in Z per screen-pixel ------------ */
      float dzdx = dFdx( zCentre );
      float dzdy = dFdy( zCentre );
      float localSlope = sqrt( dzdx*dzdx + dzdy*dzdy ) + 1e-6; // avoid 0

      float edge = 0.0;

      /* 3×3 kernel --------------------------------------------------- */
      for( int x = -1; x <= 1; ++x ){
        for( int y = -1; y <= 1; ++y ){
          float z = viewZ( vUv + vec2( x, y ) * texel );
          float dz = z - zCentre;
          float thresh = baseThreshold + localSlope * baseThreshold;

          /* adaptive silhouette test -------------------------------- */
          if( dz > thresh ) edge = 1.0;
        }
      }

      /* output ------------------------------------------------------- */
      if( edge > 0.5 ){
        gl_FragColor = vec4( outlineColor, 1.0 );
      }else{
        gl_FragColor = texture2D( tDiffuse, vUv );
      }
    }
  `
}