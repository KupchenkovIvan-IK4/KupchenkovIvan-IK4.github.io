import {
  mat4,
  matrTranspose,
  matrMulMatr,
} from "./mth.js";

class _vert {
  constructor(p1 = null) {
    if (p1 == null) {
      this.pos = [0, 0, 0];
      this.color = [0, 0, 0, 0];
      this.normal = [0, 0, 0];
    } else if (typeof p1 == "object" && p1.length == 3) {
      this.pos = p1[0];
      this.color = p1[1];
      this.normal = p1[2];
    } else if (typeof p1 == "object" && p1.length == 10) {
      this.pos = [p1[0], p1[1], p1[2]];
      this.color = [p1[3], p1[4], p1[5], p1[6]];
      this.normal = [p1[7], p1[8], p1[9]];
    } else {
      let k = arguments.length;
      this.pos = [0, 0, 0];
      this.color = [0, 0, 0, 0];
      this.normal = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        this.pos[i] = arguments[i];
      }
      for (let i = 3; i < 7; i++) {
        this.color[i - 3] = arguments[i];
      }
      if (k == 10) {
        this.normal = [arguments[7], arguments[8], arguments[9]];
      }
    }
  }
  toArray() {
    return [].concat(this.pos, this.color, this.normal);
  }
}

export function vert(...args) {
  return new _vert(...args);
}

export function arrayVert(mode, array) {
  let res = [];
  if (mode == false) {
    for (let i = 0; i < array.length; i += 7) {
      res.push(
        vert(
          array[i],
          array[i + 1],
          array[i + 2],
          array[i + 3],
          array[i + 4],
          array[i + 5],
          array[i + 6]
        )
      );
    }
  } else {
    for (let i = 0; i < array.length; i += 10) {
      res.push(
        vert(
          array[i],
          array[i + 1],
          array[i + 2],
          array[i + 3],
          array[i + 4],
          array[i + 5],
          array[i + 6],
          0,
          0,
          0
        )
      );
    }
  }
  return res;
}

export function VertToArray(array) {
  let res = [];
  for (let i = 0; i < array.length; i++) {
    res.push(...array[i].toArray());
  }
  return res;
}

class _prim {
  constructor(gl, type, V, NumofV, I, shd) {
    this.Trans = mat4().setIdentity();
    this.type = type;

    if (I != undefined) {
      this.NumofElements = I.length;
      this.IBuf = gl.createBuffer();
    } else {
      if (V != undefined) {
        this.NumofElements = V.length;
      }
    }
    this.NV = NumofV;
    this.VBuf = gl.createBuffer();
    this.VA = gl.createVertexArray();

    gl.bindVertexArray(this.VA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(V), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBuf);
    if (I != null)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(I), gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 10 * 4, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 10 * 4, 4 * 3);

    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 10 * 4, 4 * 7);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    gl.bindVertexArray(null);
    this.shader = shd;
    this.gl = gl;
  }

  draw(cam, World) {
    let w = matrMulMatr(this.Trans, World);
    
    let winw = matrTranspose(mat4(w).inverse());
    let wvp = mat4(w).mul(cam.matrVP);

    this.gl.useProgram(this.shader);
    this.gl.bindVertexArray(this.VA);

    let loc1 = this.gl.getUniformLocation(this.shader, "matrWVP");
    if (loc1 != null)
      this.gl.uniformMatrix4fv(loc1, false, new Float32Array(wvp.toArray()));

    let loc2 = this.gl.getUniformLocation(this.shader, "matrW");
    if (loc2 != null)
      this.gl.uniformMatrix4fv(loc2, false, new Float32Array(w.toArray()));

    let loc3 = this.gl.getUniformLocation(this.shader, "matrInv");
    if (loc3 != null)
      this.gl.uniformMatrix4fv(loc3, false, new Float32Array(winw.toArray()));

    let loc4 = this.gl.getUniformLocation(this.shader, "camLoc");
    if (loc4 != null) this.gl.uniform3fv(loc4, new Float32Array(cam.loc.toArray()));

    let loc5 = this.gl.getUniformLocation(this.shader, "camDir");
    if (loc5 != null) this.gl.uniform3fv(loc5, new Float32Array(cam.dir.toArray()));

    if (this.IBuf != undefined) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.IBuf);
      this.gl.drawElements(this.type, this.NumofElements, this.gl.UNSIGNED_INT, 0);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    } else {
      this.gl.drawArrays(this.type, 0, this.NumofElements);
    }

    this.gl.bindVertexArray(null);
    this.gl.useProgram(null);
  }

}
export function prim(gl, type, V, NumofV, I, shd) {
  return new _prim(gl, type, V, NumofV, I, shd);
}
