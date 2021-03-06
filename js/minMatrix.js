// ------------------------------------------------------------------------------------------------
// minMatrix.js
// version 0.0.3
// ------------------------------------------------------------------------------------------------

function matIV() {
    this.create = function () {
        return new Float32Array(16);
    };
    this.identity = function (dest) {
        dest[0] = 1;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 1;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = 1;
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest;
    };
    this.multiply = function (mat1, mat2, dest) {
        var a = mat1[0], b = mat1[1], c = mat1[2], d = mat1[3],
            e = mat1[4], f = mat1[5], g = mat1[6], h = mat1[7],
            i = mat1[8], j = mat1[9], k = mat1[10], l = mat1[11],
            m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
            A = mat2[0], B = mat2[1], C = mat2[2], D = mat2[3],
            E = mat2[4], F = mat2[5], G = mat2[6], H = mat2[7],
            I = mat2[8], J = mat2[9], K = mat2[10], L = mat2[11],
            M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
        dest[0] = A * a + B * e + C * i + D * m;
        dest[1] = A * b + B * f + C * j + D * n;
        dest[2] = A * c + B * g + C * k + D * o;
        dest[3] = A * d + B * h + C * l + D * p;
        dest[4] = E * a + F * e + G * i + H * m;
        dest[5] = E * b + F * f + G * j + H * n;
        dest[6] = E * c + F * g + G * k + H * o;
        dest[7] = E * d + F * h + G * l + H * p;
        dest[8] = I * a + J * e + K * i + L * m;
        dest[9] = I * b + J * f + K * j + L * n;
        dest[10] = I * c + J * g + K * k + L * o;
        dest[11] = I * d + J * h + K * l + L * p;
        dest[12] = M * a + N * e + O * i + P * m;
        dest[13] = M * b + N * f + O * j + P * n;
        dest[14] = M * c + N * g + O * k + P * o;
        dest[15] = M * d + N * h + O * l + P * p;
        return dest;
    };
    this.scale = function (mat, vec, dest) {
        dest[0] = mat[0] * vec[0];
        dest[1] = mat[1] * vec[0];
        dest[2] = mat[2] * vec[0];
        dest[3] = mat[3] * vec[0];
        dest[4] = mat[4] * vec[1];
        dest[5] = mat[5] * vec[1];
        dest[6] = mat[6] * vec[1];
        dest[7] = mat[7] * vec[1];
        dest[8] = mat[8] * vec[2];
        dest[9] = mat[9] * vec[2];
        dest[10] = mat[10] * vec[2];
        dest[11] = mat[11] * vec[2];
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
        return dest;
    };
    this.translate = function (mat, vec, dest) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12];
        dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13];
        dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
        dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
        return dest;
    };
    this.rotate = function (mat, angle, axis, dest) {
        //方向成分がなければリターン
        //方向成分の
        var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        if (!sq) {
            return null;
        }

        var axis0 = axis[0], axis1 = axis[1], axis2 = axis[2];
        if (sq != 1) {
            sq = 1 / sq;
            axis0 *= sq;
            axis1 *= sq;
            axis2 *= sq;
        }
        var sin = Math.sin(angle),
            cos = Math.cos(angle),
            inverse_cos = 1 - cos,
            m0 = mat[0], m1 = mat[1], m2 = mat[2], m3 = mat[3],
            m4 = mat[4], m5 = mat[5], m6 = mat[6], m7 = mat[7],
            m8 = mat[8], m9 = mat[9], m10 = mat[10], m11 = mat[11],
            s = axis0 * axis0 * inverse_cos + cos,
            t = axis1 * axis0 * inverse_cos + axis2 * sin,
            u = axis2 * axis0 * inverse_cos - axis1 * sin,
            v = axis0 * axis1 * inverse_cos - axis2 * sin,
            w = axis1 * axis1 * inverse_cos + cos,
            x = axis2 * axis1 * inverse_cos + axis0 * sin,
            y = axis0 * axis2 * inverse_cos + axis1 * sin,
            z = axis1 * axis2 * inverse_cos - axis0 * sin,
            A = axis2 * axis2 * inverse_cos + cos;
        if (angle) {
            if (mat != dest) {
                dest[12] = mat[12];
                dest[13] = mat[13];
                dest[14] = mat[14];
                dest[15] = mat[15];
            }
        } else {
            dest = mat;
        }
        dest[0] = m0 * s + m4 * t + m8 * u;
        dest[1] = m1 * s + m5 * t + m9 * u;
        dest[2] = m2 * s + m6 * t + m10 * u;
        dest[3] = m3 * s + m7 * t + m11 * u;
        dest[4] = m0 * v + m4 * w + m8 * x;
        dest[5] = m1 * v + m5 * w + m9 * x;
        dest[6] = m2 * v + m6 * w + m10 * x;
        dest[7] = m3 * v + m7 * w + m11 * x;
        dest[8] = m0 * y + m4 * z + m8 * A;
        dest[9] = m1 * y + m5 * z + m9 * A;
        dest[10] = m2 * y + m6 * z + m10 * A;
        dest[11] = m3 * y + m7 * z + m11 * A;
        return dest;
    };
    this.lookAt = function (eye, center, up, dest) {
        var eyeX = eye[0], eyeY = eye[1], eyeZ = eye[2],
            upX = up[0], upY = up[1], upZ = up[2],
            centerX = center[0], centerY = center[1], centerZ = center[2];
        if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {
            return this.identity(dest);
        }
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
        z0 = eyeX - center[0];
        z1 = eyeY - center[1];
        z2 = eyeZ - center[2];
        l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= l;
        z1 *= l;
        z2 *= l;
        x0 = upY * z2 - upZ * z1;
        x1 = upZ * z0 - upX * z2;
        x2 = upX * z1 - upY * z0;
        l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!l) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            l = 1 / l;
            x0 *= l;
            x1 *= l;
            x2 *= l;
        }
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!l) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            l = 1 / l;
            y0 *= l;
            y1 *= l;
            y2 *= l;
        }
        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[3] = 0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[7] = 0;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[11] = 0;
        dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
        dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
        dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
        dest[15] = 1;
        return dest;
    };
    this.lookAt2 = function (eye, center, up, dest) {
        var eyeX = eye[0], eyeY = eye[1], eyeZ = eye[2],
            upX = up[0], upY = up[1], upZ = up[2],
            centerX = center[0], centerY = center[1], centerZ = center[2];
        if (eyeX == centerX && eyeY == centerY && eyeZ == centerZ) {
            return this.identity(dest);
        }

        var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
        z0 = eyeX - centerX;
        z1 = eyeY - centerY;
        z2 = eyeZ - centerZ;
        l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
        z0 *= l;
        z1 *= l;
        z2 *= l;
        x0 = upY * z2 - upZ * z1;
        x1 = upZ * z0 - upX * z2;
        x2 = upX * z1 - upY * z0;
        l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
        if (!l) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            l = 1 / l;
            x0 *= l;
            x1 *= l;
            x2 *= l;
        }
        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
        if (!l) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            l = 1 / l;
            y0 *= l;
            y1 *= l;
            y2 *= l;
        }
        dest[0] = x0;
        dest[1] = y0;
        dest[2] = z0;
        dest[4] = x1;
        dest[5] = y1;
        dest[6] = z1;
        dest[8] = x2;
        dest[9] = y2;
        dest[10] = z2;
        dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
        dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
        dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
        dest[3] = 0;
        dest[7] = 0;
        dest[11] = 0;
        dest[15] = 1;
        return dest;
    };

    this.perspective = function (fovy, aspect, near, far, dest) {
        var t = near * Math.tan(fovy * Math.PI / 360);
        var r = t * aspect;
        var a = r * 2, b = t * 2, c = far - near;
        dest[0] = near * 2 / a;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = near * 2 / b;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = -(far + near) / c;
        dest[11] = -1;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = -(far * near * 2) / c;
        dest[15] = 0;
        return dest;
    };
    this.ortho = function (left, right, top, bottom, near, far, dest) {
        var h = (right - left);
        var v = (top - bottom);
        var d = (far - near);
        dest[0] = 2 / h;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        dest[4] = 0;
        dest[5] = 2 / v;
        dest[6] = 0;
        dest[7] = 0;
        dest[8] = 0;
        dest[9] = 0;
        dest[10] = -2 / d;
        dest[11] = 0;
        dest[12] = -(left + right) / h;
        dest[13] = -(top + bottom) / v;
        dest[14] = -(far + near) / d;
        dest[15] = 1;
        return dest;
    };
    this.transpose = function (mat, dest) {
        dest[0] = mat[0];
        dest[1] = mat[4];
        dest[2] = mat[8];
        dest[3] = mat[12];
        dest[4] = mat[1];
        dest[5] = mat[5];
        dest[6] = mat[9];
        dest[7] = mat[13];
        dest[8] = mat[2];
        dest[9] = mat[6];
        dest[10] = mat[10];
        dest[11] = mat[14];
        dest[12] = mat[3];
        dest[13] = mat[7];
        dest[14] = mat[11];
        dest[15] = mat[15];
        return dest;
    };
    this.inverse = function (mat, dest) {
        var a = mat[0], b = mat[1], c = mat[2], d = mat[3],
            e = mat[4], f = mat[5], g = mat[6], h = mat[7],
            i = mat[8], j = mat[9], k = mat[10], l = mat[11],
            m = mat[12], n = mat[13], o = mat[14], p = mat[15],
            q = a * f - b * e, r = a * g - c * e,
            s = a * h - d * e, t = b * g - c * f,
            u = b * h - d * f, v = c * h - d * g,
            w = i * n - j * m, x = i * o - k * m,
            y = i * p - l * m, z = j * o - k * n,
            A = j * p - l * n, B = k * p - l * o,
            ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
        dest[0] = ( f * B - g * A + h * z) * ivd;
        dest[1] = (-b * B + c * A - d * z) * ivd;
        dest[2] = ( n * v - o * u + p * t) * ivd;
        dest[3] = (-j * v + k * u - l * t) * ivd;
        dest[4] = (-e * B + g * y - h * x) * ivd;
        dest[5] = ( a * B - c * y + d * x) * ivd;
        dest[6] = (-m * v + o * s - p * r) * ivd;
        dest[7] = ( i * v - k * s + l * r) * ivd;
        dest[8] = ( e * A - f * y + h * w) * ivd;
        dest[9] = (-a * A + b * y - d * w) * ivd;
        dest[10] = ( m * u - n * s + p * q) * ivd;
        dest[11] = (-i * u + j * s - l * q) * ivd;
        dest[12] = (-e * z + f * x - g * w) * ivd;
        dest[13] = ( a * z - b * x + c * w) * ivd;
        dest[14] = (-m * t + n * r - o * q) * ivd;
        dest[15] = ( i * t - j * r + k * q) * ivd;
        return dest;
    };
}

function qtnIV() {
    this.create = function () {
        return new Float32Array(4);
    };
    this.identity = function (dest) {
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 1;
        return dest;
    };
    this.inverse = function (qtn, dest) {
        dest[0] = -qtn[0];
        dest[1] = -qtn[1];
        dest[2] = -qtn[2];
        dest[3] = qtn[3];
        return dest;
    };
    this.normalize = function (dest) {
        var x = dest[0], y = dest[1], z = dest[2], w = dest[3];
        var l = Math.sqrt(x * x + y * y + z * z + w * w);
        if (l === 0) {
            dest[0] = 0;
            dest[1] = 0;
            dest[2] = 0;
            dest[3] = 0;
        } else {
            l = 1 / l;
            dest[0] = x * l;
            dest[1] = y * l;
            dest[2] = z * l;
            dest[3] = w * l;
        }
        return dest;
    };
    this.multiply = function (qtn1, qtn2, dest) {
        var ax = qtn1[0], ay = qtn1[1], az = qtn1[2], aw = qtn1[3];
        var bx = qtn2[0], by = qtn2[1], bz = qtn2[2], bw = qtn2[3];
        dest[0] = ax * bw + aw * bx + ay * bz - az * by;
        dest[1] = ay * bw + aw * by + az * bx - ax * bz;
        dest[2] = az * bw + aw * bz + ax * by - ay * bx;
        dest[3] = aw * bw - ax * bx - ay * by - az * bz;
        return dest;
    };
    this.rotate = function (angle, axis, dest) {
        var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        if (!sq) {
            return null;
        }
        var a = axis[0], b = axis[1], c = axis[2];
        if (sq != 1) {
            sq = 1 / sq;
            a *= sq;
            b *= sq;
            c *= sq;
        }
        var s = Math.sin(angle * 0.5);
        dest[0] = a * s;
        dest[1] = b * s;
        dest[2] = c * s;
        dest[3] = Math.cos(angle * 0.5);
        return dest;
    };
    this.toVecIII = function (vec, qtn, dest) {
        var qp = this.create();
        var qq = this.create();
        var qr = this.create();
        this.inverse(qtn, qr);
        qp[0] = vec[0];
        qp[1] = vec[1];
        qp[2] = vec[2];
        this.multiply(qr, qp, qq);
        this.multiply(qq, qtn, qr);
        dest[0] = qr[0];
        dest[1] = qr[1];
        dest[2] = qr[2];
        return dest;
    };
    this.toMatIV = function (qtn, dest) {
        var x = qtn[0], y = qtn[1], z = qtn[2], w = qtn[3];
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;
        dest[0] = 1 - (yy + zz);
        dest[1] = xy - wz;
        dest[2] = xz + wy;
        dest[3] = 0;
        dest[4] = xy + wz;
        dest[5] = 1 - (xx + zz);
        dest[6] = yz - wx;
        dest[7] = 0;
        dest[8] = xz - wy;
        dest[9] = yz + wx;
        dest[10] = 1 - (xx + yy);
        dest[11] = 0;
        dest[12] = 0;
        dest[13] = 0;
        dest[14] = 0;
        dest[15] = 1;
        return dest;
    };
    this.slerp = function (qtn1, qtn2, time, dest) {
        var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3];
        var hs = 1.0 - ht * ht;
        if (hs <= 0.0) {
            dest[0] = qtn1[0];
            dest[1] = qtn1[1];
            dest[2] = qtn1[2];
            dest[3] = qtn1[3];
        } else {
            hs = Math.sqrt(hs);
            if (Math.abs(hs) < 0.0001) {
                dest[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
                dest[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
                dest[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
                dest[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
            } else {
                var ph = Math.acos(ht);
                var pt = ph * time;
                var t0 = Math.sin(ph - pt) / hs;
                var t1 = Math.sin(pt) / hs;
                dest[0] = qtn1[0] * t0 + qtn2[0] * t1;
                dest[1] = qtn1[1] * t0 + qtn2[1] * t1;
                dest[2] = qtn1[2] * t0 + qtn2[2] * t1;
                dest[3] = qtn1[3] * t0 + qtn2[3] * t1;
            }
        }
        return dest;
    };
}

function torus(row, column, irad, orad, color) {
    var i, j, tc;
    var pos = new Array(), nor = new Array(),
        col = new Array(), st = new Array(), idx = new Array();
    for (i = 0; i <= row; i++) {
        var r = Math.PI * 2 / row * i;
        var rr = Math.cos(r);
        var ry = Math.sin(r);
        for (j = 0; j <= column; j++) {
            var tr = Math.PI * 2 / column * j;
            var tx = (rr * irad + orad) * Math.cos(tr);
            var ty = ry * irad;
            var tz = (rr * irad + orad) * Math.sin(tr);
            var rx = rr * Math.cos(tr);
            var rz = rr * Math.sin(tr);
            if (color) {
                tc = color;
            } else {
                tc = hsva(360 / column * j, 1, 1, 1);
            }
            var rs = 1 / column * j;
            var rt = 1 / row * i + 0.5;
            if (rt > 1.0) {
                rt -= 1.0;
            }
            rt = 1.0 - rt;
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            col.push(tc[0], tc[1], tc[2], tc[3]);
            st.push(rs, rt);
        }
    }
    for (i = 0; i < row; i++) {
        for (j = 0; j < column; j++) {
            r = (column + 1) * i + j;
            idx.push(r, r + column + 1, r + 1);
            idx.push(r + column + 1, r + column + 2, r + 1);
        }
    }
    return {p: pos, n: nor, c: col, t: st, i: idx};
}

function sphere(row, column, rad, color) {
    var i, j, tc;
    var pos = new Array(), nor = new Array(),
        col = new Array(), st = new Array(), idx = new Array();
    for (i = 0; i <= row; i++) {
        var r = Math.PI / row * i;
        var ry = Math.cos(r);
        var rr = Math.sin(r);
        for (j = 0; j <= column; j++) {
            var tr = Math.PI * 2 / column * j;
            var tx = rr * rad * Math.cos(tr);
            var ty = ry * rad;
            var tz = rr * rad * Math.sin(tr);
            var rx = rr * Math.cos(tr);
            var rz = rr * Math.sin(tr);
            if (color) {
                tc = color;
            } else {
                tc = hsva(360 / row * i, 1, 1, 1);
            }
            pos.push(tx, ty, tz);
            nor.push(rx, ry, rz);
            col.push(tc[0], tc[1], tc[2], tc[3]);
            st.push(1 - 1 / column * j, 1 / row * i);
        }
    }
    r = 0;
    for (i = 0; i < row; i++) {
        for (j = 0; j < column; j++) {
            r = (column + 1) * i + j;
            idx.push(r, r + 1, r + column + 2);
            idx.push(r, r + column + 2, r + column + 1);
        }
    }
    return {p: pos, n: nor, c: col, t: st, i: idx};
}

function cube(side, color) {
    var tc, hs = side * 0.5;
    var pos = [
        -hs, -hs, hs, hs, -hs, hs, hs, hs, hs, -hs, hs, hs,
        -hs, -hs, -hs, -hs, hs, -hs, hs, hs, -hs, hs, -hs, -hs,
        -hs, hs, -hs, -hs, hs, hs, hs, hs, hs, hs, hs, -hs,
        -hs, -hs, -hs, hs, -hs, -hs, hs, -hs, hs, -hs, -hs, hs,
        hs, -hs, -hs, hs, hs, -hs, hs, hs, hs, hs, -hs, hs,
        -hs, -hs, -hs, -hs, -hs, hs, -hs, hs, hs, -hs, hs, -hs
    ];
    var nor = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
    ];
    var col = new Array();
    for (var i = 0; i < pos.length / 3; i++) {
        if (color) {
            tc = color;
        } else {
            tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
        }
        col.push(tc[0], tc[1], tc[2], tc[3]);
    }
    var st = [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];
    var idx = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    return {p: pos, n: nor, c: col, t: st, i: idx};
}
function beam(side, color) {
    var tc, hs = 1 * 0.5;
    var pos = [
        -hs, -hs, hs,
        hs, -hs, hs,
        hs, hs, hs,
        -hs, hs, hs,
        -hs, -hs, -hs,
        -hs, hs, -hs,
        hs, hs, -hs,
        hs, -hs, -hs,
        -hs, hs, -hs,
        -hs, hs, hs,
        hs, hs, hs,
        hs, hs, -hs,
        -hs, -hs, -hs,
        hs, -hs, -hs,
        hs, -hs, hs,
        -hs, -hs, hs,
        hs, -hs, -hs,
        hs, hs, -hs,
        hs, hs, hs,
        hs, -hs, hs,
        -hs, -hs, -hs,
        -hs, -hs, hs,
        -hs, hs, hs,
        -hs, hs, -hs
    ];
    var nor = [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
    ];
    var col = new Array();
    for (var i = 0; i < pos.length / 3; i++) {
        if (color) {
            tc = color;
        } else {
            tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
        }
        col.push(tc[0], tc[1], tc[2], tc[3]);
    }
    var st = [
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    ];
    var idx = [
        0, 1, 2, 0, 2, 3,
        4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    return {p: pos, n: nor, c: col, t: st, i: idx};
}
function star(side, color) {
    var tc, hs = side * 0.5;
    var pos = [
        //-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs,-hs, -hs, -hs, -hs, -hs, hs, -hs, hs, hs, -hs, hs, -hs
    ];
    ratio = 80
    for(var i = 0; i < 300; i++){
        pos.push(ratio*(Math.random()-0.5),ratio*(Math.random()-0.5),ratio*(Math.random()-0.5))
    }
    return {p: pos};
}
function funnel(color) {
    var tc;
    var pos = [];
    pos.push(-15, 35, -60) //0
    pos.push(15, 35, -60) //1
    pos.push(20, 15, -100) //2
    pos.push(-20, 15, -100) //3
    pos.push(-10, 15, 100) //4
    pos.push(10, 15, 100) //5

    pos.push(-20, -15, -100) //6
    pos.push(20, -15, -100) //7
    pos.push(15, -35, -60) //8
    pos.push(-15, -35, -60) //9
    pos.push(-10, -15, 100) //10
    pos.push(10, -15, 100) //11

    pos.push(-20, 15, -90) //12
    pos.push(20, 15, -90) //13
    pos.push(20, -15, -90) //14
    pos.push(-20, -15, -90) //15

    pos.push(10, 15, 100) //16(5)
    pos.push(-10, 15, 100) //17(4)
    pos.push(10, -15, 100) //18(11)
    pos.push(-10, -15, 100) //19(10)
    pos.push(-20, 15, -90) //20(12)
    pos.push(-20, -15, -90) //21(15)
    pos.push(-10, 15, 100) //22(4)
    pos.push(10, 15, 100) //23(5)
    pos.push(-10, -15, 100) //24(10)
    pos.push(10, -15, 100) //25(11)
    //console.log(pos.length)


    var nor = [];
    for (var i = 0, l = pos.length; i < l; i++) {
        pos[i] *= 0.01
        nor.push(0)
    }

    var col = new Array();
    for (var i = 0; i < pos.length / 3; i++) {
        if (color) {
            tc = color;
        } else {
            tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
        }
        col.push(tc[0], tc[1], tc[2], tc[3]);
    }
    var st = [];
    st.push(1 / 4, 1 / 5);//0
    st.push(2 / 4, 1 / 5);//1
    st.push(2 / 4, 2 / 5);//2
    st.push(1 / 4, 2 / 5);//3

    st.push(1 / 4, 0);//4
    st.push(2 / 4, 0);//5

    st.push(1 / 4, 3 / 5);//6
    st.push(2 / 4, 3 / 5);//7
    st.push(2 / 4, 4 / 5);//8
    st.push(1 / 4, 4 / 5);//9

    st.push(1 / 4, 1);//10
    st.push(2 / 4, 1);//11

    st.push(1, 2 / 5);//12
    st.push(3 / 4, 2 / 5);//13
    st.push(3 / 4, 3 / 5);//14
    st.push(1, 3 / 5);//15

    st.push(3 / 4, 1 / 5);//16
    st.push(1, 1 / 5);//17
    st.push(3 / 4, 4 / 5);//18
    st.push(1, 4 / 5);//19
    st.push(0, 2 / 5);//20
    st.push(0, 3 / 5);//21

    //
    st.push(0, 2 / 5);//22
    st.push(3 / 4, 2 / 5);//23
    st.push(0, 3 / 5);//24
    st.push(3 / 4, 3 / 5);//25


    var idx = [];
    addRectangleIndices(idx, 0, 1, 2, 3);
    addTriangleIndices(idx, 1, 23, 2);
    addRectangleIndices(idx, 1, 0, 4, 5);
    addTriangleIndices(idx, 0, 3, 22);
    addRectangleIndices(idx, 16, 17, 12, 13);

    addRectangleIndices(idx, 3, 2, 7, 6);
    addRectangleIndices(idx, 2, 13, 14, 7);
    addRectangleIndices(idx, 13, 12, 15, 14);
    addRectangleIndices(idx, 20, 3, 6, 21);

    addRectangleIndices(idx, 6, 7, 8, 9);
    addTriangleIndices(idx, 7, 25, 8);
    addRectangleIndices(idx, 9, 8, 11, 10);
    addTriangleIndices(idx, 6, 9, 24);
    addRectangleIndices(idx, 14, 15, 19, 18);


    function addRectangleIndices(idx, number0, number1, number2, number3) {
        idx.push(number0, number1, number3);
        idx.push(number3, number1, number2);
    }

    function addTriangleIndices(idx, number0, number1, number2) {
        idx.push(number0, number1, number2);
    }

    function vec3Normalize(v, d) {
        var e, dig;
        var n = [0.0, 0.0, 0.0];
        var l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (l > 0) {
            if (!d) {
                dig = 5;
            } else {
                dig = d;
            }
            e = 1.0 / l;
            n[0] = Number((v[0] * e).toFixed(dig));
            n[1] = Number((v[1] * e).toFixed(dig));
            n[2] = Number((v[2] * e).toFixed(dig));
        }
        return n;
    }

    function faceNormal(v0, v1, v2) {
        var n = [];
        var vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        var vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
        n[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
        n[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
        n[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
        return vec3Normalize(n);
    }

    function setNormal(id, fNormal) {
        if (fNormals[id] != undefined) {
            fNormals[id] = vec3Add(fNormals[id], fNormal)
        } else {
            fNormals[id] = fNormal
        }
    }

    function vec3Add(a, b) {
        var v = []
        v[0] = Number(a[0]) + Number(b[0]);
        v[1] = Number(a[1]) + Number(b[1])
        v[2] = Number(a[2]) + Number(b[2])
        //console.log(v)

        return vec3Normalize(v)
    }

    var i, j, k, l;
    var fNormal;

    //面の数
    j = idx.length;
    var fNormals = new Array();
    for (i = 0; i < j; i += 3) {
        //console.log("□a:",idx[i] ," ",pos[idx[i]*3],pos[idx[i]*3+1],pos[idx[i]*3+2])
        //console.log("◎b:",idx[i+1] ," ",pos[idx[i+1]*3],pos[idx[i+1]*3+1],pos[idx[i+1]*3+2])
        //console.log("▼c:",idx[i+2] ," ",pos[idx[i+2]*3],pos[idx[i+2]*3+1],pos[idx[i+2]*3+2])
        var positionA = [pos[idx[i + 0] * 3], pos[idx[i + 0] * 3 + 1], pos[idx[i + 0] * 3 + 2]]
        var positionB = [pos[idx[i + 1] * 3], pos[idx[i + 1] * 3 + 1], pos[idx[i + 1] * 3 + 2]]
        var positionC = [pos[idx[i + 2] * 3], pos[idx[i + 2] * 3 + 1], pos[idx[i + 2] * 3 + 2]]
        var fNormal = faceNormal(positionA, positionB, positionC);

        setNormal(idx[i + 0], fNormal)
        setNormal(idx[i + 1], fNormal)
        setNormal(idx[i + 2], fNormal)

        //fNormals[idx[i+0]] = fNormal
        //fNormals[idx[i+1]] = fNormal
        //fNormals[idx[i+2]] = fNormal
    }
    nor = []
    for (var i = 0; i < fNormals.length; i++) {
        //console.log("fNormals.length : ", fNormals[i])
        for (var j = 0; j < fNormals[i].length; j++) {
            nor.push(Number(fNormals[i][j]))
        }
    }
    //console.log("nor : ", nor)


    //for(i = 0; i < pos.length; i++){
    //    a = [0.0, 0.0, 0.0];
    //    b = vertex[i].faceIndex;
    //    k = b.length;
    //    for(j = 0; j < k; j++){
    //        a[0] += parseFloat(fNormal[b[j]][0]);
    //        a[1] += parseFloat(fNormal[b[j]][1]);
    //        a[2] += parseFloat(fNormal[b[j]][2]);
    //    }
    //    nor.push(vec3Normalize(a));
    //}

    return {p: pos, n: nor, c: col, t: st, i: idx};
}

function hsva(h, s, v, a) {
    if (s > 1 || v > 1 || a > 1) {
        return;
    }
    var th = h % 360;
    var i = Math.floor(th / 60);
    var f = th / 60 - i;
    var m = v * (1 - s);
    var n = v * (1 - s * f);
    var k = v * (1 - s * (1 - f));
    var color = new Array();
    if (!s > 0 && !s < 0) {
        color.push(v, v, v, a);
    } else {
        var r = new Array(v, n, m, m, k, v);
        var g = new Array(k, v, v, n, m, m);
        var b = new Array(m, m, k, v, v, n);
        color.push(r[i], g[i], b[i], a);
    }
    return color;
}
