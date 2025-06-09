let gl;
let IsMove = 1;

let tetraf = false;
let cubef = false;
let octaf = false;
let icosf = false;
let dodef = false;

let isDragging  = false;
let saveX, saveY;

import {
  prim,
  VertToArray,
  arrayVert,
} from "./prims.js";
import { vec3, mat4, camera, matrIdentity, matrMulMatr, matrMulMatr3, setRotateX, setRotateY, degree2Radian } from "./mth.js";

function tetrFlagupdate() {
  tetraf = !tetraf;
}

function cubeFlagupdate() {
  cubef = !cubef;
}

function octaFlagupdate() {
  octaf = !octaf;
}

function icosFlagupdate() {
  icosf = !icosf;
}

function dodeFlagupdate() {
  dodef = !dodef
}

function normals(V, Ind) {
  let Vbuf = arrayVert(true, V);

  for (let i = 0; i < Ind.length; i += 3) {
    let n0 = Ind[i], n1 = Ind[i + 1], n2 = Ind[i + 2];
    
    let p0 = vec3(Vbuf[n0].pos);
    let p1 = vec3(Vbuf[n1].pos);
    let p2 = vec3(Vbuf[n2].pos);
    let N = ((p1.sub(p0)).cross(p2.sub(p0))).normalize();
    
    Vbuf[n0].normal = (vec3(Vbuf[n0].normal).add(N)).toArray();
    
    Vbuf[n1].normal = (vec3(Vbuf[n1].normal).add(N)).toArray();
    Vbuf[n2].normal = (vec3(Vbuf[n2].normal).add(N)).toArray();
  }
  for (let i = 0; i < Vbuf.length; i++) {
    Vbuf[i].normal = vec3(Vbuf[i].normal).normalize().toArray();
  }
  return VertToArray(Vbuf);
}

async function tryLoadShaderAsync(shaderName) {
  try {
    const response = await fetch(shaderName);
    const text = await response.text();
    return text;
  } catch (err) {
    console.log(err);
  }
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    let buf = gl.getShaderInfoLog(shader);
    console.log(buf);
  }
  return shader;
}

function initGL(canvas) {
  gl = canvas.getContext("webgl2");

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  gl.clearColor(0.30, 0.47, 0.8, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

let cubeBuf, octaBuf, tetraBuf, icosBuf, dodeBuf;
let cubeind, octaind, tetraind, icosind, dodeind;

function initBuffers(){
    cubeBuf = [
    0, 0, 0,
    0.47, 0.30, 0.52, 1, 
    -1, -1, -1, 
    
    1, 0, 0, 
    0.47, 0.30, 0.52, 1, 
    1, 0, 0, 
    
    1, 0, 1,
    0.47, 0.30, 0.52, 1, 
    1, 0, 1,
    
    0, 0, 1,
    0.47, 0.30, 0.52, 1, 
    0, 0, 1,
    
    0, 1, 0, 
    0.47, 0.30, 0.52, 1, 
    0, 1, 0, 
    
    1, 1, 0, 
    0.47, 0.30, 0.52, 1, 
    1, 1, 0,
    
    1, 1, 1, 
    0.47, 0.30, 0.52, 1, 
    1, 1, 1,
    
    0, 1, 1, 
    0.47, 0.30, 0.52, 1, 
    0, 1, 1,
  ];

  cubeind = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 4, 5,
    1, 5, 6, 1, 2, 6,
    2, 6, 7, 2, 3, 7,
    0, 3, 7, 7, 4, 0
  ];

  octaBuf = [
    0.70710678, 0, 0, 
    0.5, 1, 0.67, 1, 
    0.70710678, 0, 0, 
    
    0, 0, 0.70710678, 
    0.5, 1, 0.67, 1, 
    0, 0, 0.70710678, 
    
    -0.70710678, 0, 0, 
    0.5, 1, 0.67, 1, 
    -0.70710678, 0, 0, 
    
    0, 0, -0.70710678, 
    0.5, 1, 0.67, 1, 
    0, 0, -0.70710678, 
    
    0, 0.70710678, 0, 
    0.5, 1, 0.67, 1, 
    0, 0.70710678, 0, 
    
    0, -0.70710678, 0, 
    0.5, 1, 0.67, 1, 
    0, -0.70710678, 0, 
    
  ];

  octaind = [
    0, 1, 4, 0, 1, 5, 
    0, 3, 4, 0, 3, 5,
    1, 2, 4, 1, 2, 5, 
    2, 3, 4, 2, 3, 5,
  ];

  tetraBuf = [
    1, 0, 0,
    0.9, 0.57, 0.5, 1,
    0, 0, 0,
    
    0, 1, 0,
    0.9, 0.57, 0.5, 1,
    0, 0, 0,
    
    1, 1, 1,
    0.9, 0.57, 0.5, 1,
    0, 0, 0,

    0, 0, 1,
    0.9, 0.57, 0.5, 1,
    0, 0, 0,
  ];

  tetraind = [
    0, 1, 2,
    0, 2, 3, 
    0, 1, 3, 
    1, 2, 3
  ];

  icosBuf = [
    0, -1.11803, 0,
    0.47, 0.6, 0.47, 1,
    0, -1.11803, 0,
    
    0, -0.5, 1,
    0.47, 0.6, 0.47, 1,
    0, -0.5, 1,
    
    0.9511, -0.5, 0.309,
    0.47, 0.6, 0.47, 1,
    0.9511, -0.5, 0.309,
    
    0.58778, -0.5, -0.809,
    0.47, 0.6, 0.47, 1,
    0.58778, -0.5, -0.809,
    
    -0.58778, -0.5, -0.809,
    0.47, 0.6, 0.47, 1,
    -0.58778, -0.5, -0.809,
    
    -0.9511, -0.5, 0.309,
    0.47, 0.6, 0.47, 1,
    -0.9511, -0.5, 0.309,
    
    0.58778, 0.5, 0.809,
    0.47, 0.6, 0.47, 1,
    0.58778, 0.5, 0.809,
    
    0.9511, 0.5, -0.309,
    0.47, 0.6, 0.47, 1,
    0.9511, 0.5, -0.309,
    
    0, 0.5, -1,
    0.47, 0.6, 0.47, 1,
    0, 0.5, -1,
    
    -0.9511, 0.5, -0.309,
    0.47, 0.6, 0.47, 1,
    -0.9511, 0.5, -0.309,
    
    -0.58778, 0.5, 0.809,
    0.47, 0.6, 0.47, 1,
    -0.58778, 0.5, 0.809,
    
    0, 1.11803, 0,
    0.47, 0.6, 0.47, 1,
    0, 1.11803, 0,
    
  ];

  icosind = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 1, 5,

    11, 10, 6,
    11, 6, 7,
    11, 7, 8,
    11, 8, 9,
    11, 9, 10,

    1, 2, 6,
    2, 3, 7,
    3, 4, 8, 
    4, 5, 9,
    5, 1, 10,
    
    10, 1, 6,
    6, 2, 7,
    7, 3, 8,
    8, 4, 9,
    9, 5, 10
  ];

  dodeBuf = [
    0, -1.61803399, 0.61803399,//0
    0.21, 0.38, 0.71, 1, 
    0, -1.61803399, 0.61803399,//0
    
    1, -1, 1,//1 
    0.23, 0.4, 0.73, 1,  
    1, -1, 1,//1 
    
    0.61803399,0,1.61803399,//2 
    0.25, 0.42, 0.75, 1, 
    0.61803399,0,1.61803399,//2 
    
    -0.61803399,0,1.61803399,//3 
    0.27, 0.44, 0.77, 1, 
    -0.61803399,0,1.61803399,//3 
    
    -1, -1, 1,//4 
    0.29, 0.46, 0.79, 1, 
    -1, -1, 1,//4 
    
    //
    
    1, 1, 1,//5
    0.31, 0.48, 0.81, 1, 
    1, 1, 1,//5
    
    0,1.61803399,0.61803399,//6 
    0.33, 0.5, 0.83, 1,
    0,1.61803399,0.61803399,//6 
    
    -1, 1, 1,//7 
    0.35, 0.52, 0.85, 1, 
    -1, 1, 1,//7 
    
    //
    
    -1.61803399,0.61803399,0,//8 
    0.37, 0.54, 0.87, 1,
    -1.61803399,0.61803399,0,//8 
    
    -1.61803399,-0.61803399,0,//9 
    0.39, 0.56, 0.89, 1, 
    -1.61803399,-0.61803399,0,//9 
    
    //
    
    1.61803399,-0.61803399,0,//10 
    0.41, 0.58, 0.91, 1, 
    1.61803399,-0.61803399,0,//10 
    
    1.61803399,0.61803399,0,//11 
    0.43, 0.6, 0.93, 1, 
    1.61803399,0.61803399,0,//11 
    
    //
    
    0,-1.61803399,-0.61803399, //12
    0.45, 0.62, 0.95, 1, 
    0,-1.61803399,-0.61803399, //12
    
    1, -1, -1, //13
    0.47, 0.64, 0.97, 1, 
    1, -1, -1, //13
    
    0.61803399,0,-1.61803399, //14
    0.49, 0.66, 0.99, 1, 
    0.61803399,0,-1.61803399, //14
    
    -0.61803399,0,-1.61803399, //15
    0.51, 0.68, 1, 1,
    -0.61803399,0,-1.61803399, //15
    
    -1, -1, -1, //16
    0.53, 0.68, 1, 1, 
    -1, -1, -1, //16
    
    //
    
    0,1.61803399,-0.61803399, //17
    0.55, 0.7, 1, 1, 
    0,1.61803399,-0.61803399, //17
    
    1, 1, -1,//18 
    0.57, 0.72, 1, 1, 
    1, 1, -1,//18 
    
    -1, 1, -1,//19 
    0.59, 0.74, 1, 1, 
    -1, 1, -1,//19 
    
  ];

  dodeind = [
    0, 1, 2,
    2, 3, 4,
    4, 2, 0,

    2, 3, 7,
    7, 2, 5,
    5, 7, 6,

    4, 3, 7,
    4, 7, 8,
    4, 8, 9,

    1, 2, 5,
    1, 5, 11,
    1, 11, 10,
    
    10, 11, 18,
    10, 18, 13,
    18, 13, 14,

    14, 18, 17,
    14, 17, 15,
    15, 17, 19,
    
    8, 9, 19,
    9, 16, 19,
    19, 16, 15,

    15, 16, 12,
    12, 15, 13,
    13, 14, 15,

    0, 12, 13,
    13, 0, 1,
    13, 1, 10,

    11, 18, 17,
    11, 17, 5,
    17, 5, 6,

    6, 17, 19,
    6, 19, 7,
    19, 7, 8,

    16, 9, 4,
    16, 4, 0,
    16, 0, 12,
  ];

  //octaBuf = normals(octaBuf, octaind);
  tetraBuf = normals(tetraBuf, tetraind);
  //icosBuf = normals(icosBuf, icosind);
  //dodeBuf = normals(dodeBuf, dodeind);
  cubeBuf = normals(cubeBuf, cubeind);
}

let viewCam, cube, tetra, octa, nprim;
let icos, dode;

function cameraChange(plus) {
  if (plus == true) {
    viewCam.set(viewCam.loc.add(viewCam.dir.mul(3)), viewCam.at, viewCam.up);
  } else {
    viewCam.set(viewCam.loc.sub(viewCam.dir.mul(3)), viewCam.at, viewCam.up);
  }
}

function cameraChangeX(plus) {
  if (plus == true) {
    viewCam.set(vec3(viewCam.loc.x + 4.7, viewCam.loc.y, viewCam.loc.z), viewCam.at, viewCam.up);
  } else {
    viewCam.set(vec3(viewCam.loc.x - 4.7, viewCam.loc.y, viewCam.loc.z), viewCam.at, viewCam.up);
  }
}

function cameraChangeY(plus) {
  if (plus == true) {
    viewCam.set(vec3(viewCam.loc.x, viewCam.loc.y + 4.7, viewCam.loc.z), viewCam.at, viewCam.up);
  } else {
    viewCam.set(vec3(viewCam.loc.x, viewCam.loc.y - 4.7, viewCam.loc.z), viewCam.at, viewCam.up);
  }
}

function cameraChangeZ(plus) {
  if (plus == true) {
    viewCam.set(vec3(viewCam.loc.x, viewCam.loc.y, viewCam.loc.z + 4.7), viewCam.at, viewCam.up);
  } else {
    viewCam.set(vec3(viewCam.loc.x, viewCam.loc.y, viewCam.loc.z - 4.7), viewCam.at, viewCam.up);
  }
}

function cameraRotateX(plus) {
  if (plus == true) {
    viewCam.set(viewCam.loc.add(viewCam.dir.cross(viewCam.up)), viewCam.at, viewCam.up);
  } else {
    viewCam.set(viewCam.loc.sub(viewCam.dir.cross(viewCam.up)), viewCam.at, viewCam.up);
  }
}

function cameraRotateY(plus) {
  if (plus == true) {
    viewCam.set(viewCam.loc.add(viewCam.up), viewCam.at, ((viewCam.at.sub(viewCam.loc).normalize()).cross(viewCam.up).normalize()).cross(viewCam.at.sub(viewCam.loc).normalize()).normalize());
  } else {
    viewCam.set(viewCam.loc.sub(viewCam.up), viewCam.at, ((viewCam.at.sub(viewCam.loc).normalize()).cross(viewCam.up).normalize()).cross(viewCam.at.sub(viewCam.loc).normalize()).normalize());
  }
}

function startDrag(ev) {
  isDragging  = true;
  saveX = ev.offsetX;
  saveY = ev.offsetY;
}

function drag(ev) {
  if (isDragging) {
    const Mdx = ev.clientX - saveX;
    const Mdy = ev.clientY - saveY;
    //console.log(Mdx, Mdy);
    
    /*
    let Dist = viewCam.at.sub(viewCam.loc).len;
    let
      cosT = (viewCam.loc.y - viewCam.at.y) / Dist,
      sinT = Math.sqrt(1 - cosT * cosT),
      plen = Dist * sinT,
      cosP = (viewCam.loc.z - viewCam.at.z) / plen,
      sinP = (viewCam.loc.x - viewCam.at.x) / plen,
      Azimuth = degree2Radian(Math.atan2(sinP, cosP)),
      Elevator = degree2Radian(Math.atan2(sinT, cosT));

    let Wp, Hp, sx, sy;
    let dv = vec3();

    Wp = viewCam.projSize;
    Hp = viewCam.projSize;

    if (gl.viewportWidth > gl.viewportHeight) {
      Wp *= gl.viewportWidth / gl.viewportHeight;
    } else {
      Hp *= gl.viewportHeight / gl.viewportWidth;
    }

    sx = -Mdx * Wp / gl.viewportWidth * Dist / viewCam.projDist;
    sy = Mdy * Hp / gl.viewportHeight * Dist / viewCam.projDist;

    dv = viewCam.right.mul(sx).add(viewCam.up.mul(sy));

    viewCam.at = viewCam.at.add(dv);
    viewCam.loc = viewCam.loc.add(dv);

    viewCam.set((matrMulMatr3(setRotateX(Elevator), setRotateY(Azimuth), mat4().matrTranslate(viewCam.at))).transformPoint(vec3(0, Dist, 0)),
                viewCam.at,
                vec3(0, 1, 0));
  */
  }
}

function stopDrag() {
  isDragging  = false;
}

function onStart() 
{
    let canvas = document.getElementById("webgl-canvas");

    initGL(canvas);
    initBuffers();
    
    Promise.all([tryLoadShaderAsync("./vert.glsl"), tryLoadShaderAsync("./frag.glsl")]).then((results) => {
      const vertexSh = loadShader(gl, gl.VERTEX_SHADER, results[0]);
      const fragmentSh = loadShader(gl, gl.FRAGMENT_SHADER, results[1]);

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexSh);
      gl.attachShader(shaderProgram, fragmentSh);
      gl.linkProgram(shaderProgram);

      viewCam = camera();
      viewCam.set(vec3(8, 4.7, 18), vec3(0, 0, 0), vec3(0, 1, 0));
      
      cube = prim(gl, gl.TRIANGLES, cubeBuf, 24, cubeind, shaderProgram);

      tetra = prim(gl, gl.TRIANGLES, tetraBuf, 24, tetraind, shaderProgram);
      octa = prim(gl, gl.TRIANGLES, octaBuf, 24, octaind, shaderProgram);
      icos = prim(gl, gl.TRIANGLES, icosBuf, 24, icosind, shaderProgram);
      dode = prim(gl, gl.TRIANGLES, dodeBuf, 24, dodeind, shaderProgram);
      
      nprim = prim(gl, gl.POINTS, null, 0, null, shaderProgram);

      drawScene(); 
    });
}

function drawScene() {  
  gl.enable(gl.DEPTH_TEST);

  nprim.draw(viewCam, matrIdentity());
  if (tetraf == true) {
    tetra.draw(
      viewCam,
      matrMulMatr(
        mat4().setRotate(Math.sin(Date.now() / 800.0 * IsMove), vec3(4.7, 18, 47)),
        mat4().matrTranslate(vec3(Math.sin(Date.now() / 470 * IsMove) * 2, Math.sin(Date.now() / 470 * IsMove), 1)))
    );
  }
  if (cubef == true) {
    cube.draw(
      viewCam, 
      matrMulMatr3(
        mat4().setRotate(Date.now() / 1847 * IsMove, vec3(3.0, 1.8, 0.8)), 
        mat4().matrTranslate(vec3(0.8, 1.8, 1.8)), 
        mat4().setRotate(Math.sin(Date.now() / 1020.0 * IsMove), vec3(0.47, 1, 102)))
    );
  }
  if (octaf == true) {
    octa.draw(
      viewCam,
      matrMulMatr3(
        mat4().setRotate(Date.now() / 1020 * IsMove, vec3(0, 1, 1)),
        mat4().matrTranslate(vec3(0.8, 1.8, 0.8)),
        setRotateX(100 * Math.sin(Date.now() / 800.0 * IsMove)),
      )
    );
  }
  if (icosf == true) {
    icos.draw(
      viewCam,
      matrMulMatr3(
        mat4().setRotate(Date.now() / 1020 * IsMove, vec3(0.47, 0.30, 0.8)),
        mat4().matrTranslate(vec3(3.0, 0.47, 3.0)),
        mat4().setRotate(Math.sin(Date.now() / 1470.0 * IsMove), vec3(0.47, 0.8, 1.8))
      )
    );
  }
  if (dodef == true) {
    dode.draw(
      viewCam,
      matrMulMatr3(
        mat4().setRotate(Math.sin(Date.now() / 3047.0 * IsMove), vec3(0.47, 0.30, 0.8)),
        mat4().matrTranslate(vec3(-3.0, 0.47, 0)),
        mat4().setRotate(Math.sin(Date.now() / 1847.0 * IsMove), vec3(0.47, 0.30, 0))
      )
    );
  }

  window.requestAnimationFrame(drawScene);

}

function movingFlagUpdate(){
  if (IsMove == 1){
    IsMove = 0;
  } else {
    IsMove = 1;
  }
}

window.onload = onStart();

export { tetrFlagupdate, cubeFlagupdate, octaFlagupdate, icosFlagupdate, dodeFlagupdate,
         movingFlagUpdate, cameraChangeX, cameraChangeY, cameraChangeZ, cameraChange, cameraRotateY, cameraRotateX, startDrag, drag, stopDrag };
