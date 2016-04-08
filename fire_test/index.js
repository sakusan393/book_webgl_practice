/**
 * Refence for http://webgl-fire.appspot.com/html/fire.html
 */

(function() {
    /**
     * @private
     */
    var prioritySortLow = function(a, b) {
        return b.priority - a.priority;
    };

    /**
     * @private
     */
    var prioritySortHigh = function(a, b) {
        return a.priority - b.priority;
    };

    /*global PriorityQueue */
    /**
     * @constructor
     * @class PriorityQueue manages a queue of elements with priorities. Default
     * is highest priority first.
     *
     * @param [options] If low is set to true returns lowest first.
     */
    window.PriorityQueue = function(options) {
        var contents = [];

        var sorted = false;
        var sortStyle;

        if(options && options.low) {
            sortStyle = prioritySortLow;
        }
        else {
            sortStyle = prioritySortHigh;
        }

        /**
         * @private
         */
        var sort = function() {
            contents.sort(sortStyle);
            sorted = true;
        };

        var self = {
            /**
             * Removes and returns the next element in the queue.
             * @member PriorityQueue
             * @return The next element in the queue. If the queue is empty returns
             * undefined.
             *
             * @see PrioirtyQueue#top
             */
            pop: function() {
                if(!sorted) {
                    sort();
                }

                return contents.pop();
            },

            /**
             * Returns but does not remove the next element in the queue.
             * @member PriorityQueue
             * @return The next element in the queue. If the queue is empty returns
             * undefined.
             *
             * @see PriorityQueue#pop
             */
            top: function() {
                if(!sorted) {
                    sort();
                }

                return contents[contents.length - 1];
            },

            /**
             * @member PriorityQueue
             * @param object The object to check the queue for.
             * @returns true if the object is in the queue, false otherwise.
             */
            includes: function(object) {
                for(var i = contents.length - 1; i >= 0; i--) {
                    if(contents[i].object === object) {
                        return true;
                    }
                }

                return false;
            },

            /**
             * @member PriorityQueue
             * @returns the current number of elements in the queue.
             */
            size: function() {
                return contents.length;
            },

            /**
             * @member PriorityQueue
             * @returns true if the queue is empty, false otherwise.
             */
            empty: function() {
                return contents.length === 0;
            },

            /**
             * @member PriorityQueue
             * @param object The object to be pushed onto the queue.
             * @param priority The priority of the object.
             */
            push: function(object, priority) {
                contents.push({object: object, priority: priority});
                sorted = false;
            }
        };

        return self;
    };
})();


(function () {

    'use strict';

    /**
     * Volume fire element.
     */
    function FireElement(width, height, depth, sliceSpacing, camera) {
        this.camera = camera;

        var halfWidth  = width  / 2;
        var halfHeight = height / 2;
        var halfDepth  = depth  / 2;

        this._posCorners = [
            new THREE.Vector3(-halfWidth, -halfHeight, -halfDepth),
            new THREE.Vector3( halfWidth, -halfHeight, -halfDepth),
            new THREE.Vector3(-halfWidth,  halfHeight, -halfDepth),
            new THREE.Vector3( halfWidth,  halfHeight, -halfDepth),
            new THREE.Vector3(-halfWidth, -halfHeight,  halfDepth),
            new THREE.Vector3( halfWidth, -halfHeight,  halfDepth),
            new THREE.Vector3(-halfWidth,  halfHeight,  halfDepth),
            new THREE.Vector3( halfWidth,  halfHeight,  halfDepth)
        ];
        this._texCorners = [
            new THREE.Vector3(0.0, 0.0, 0.0),
            new THREE.Vector3(1.0, 0.0, 0.0),
            new THREE.Vector3(0.0, 1.0, 0.0),
            new THREE.Vector3(1.0, 1.0, 0.0),
            new THREE.Vector3(0.0, 0.0, 1.0),
            new THREE.Vector3(1.0, 0.0, 1.0),
            new THREE.Vector3(0.0, 1.0, 1.0),
            new THREE.Vector3(1.0, 1.0, 1.0)
        ];

        this._viewVector = new THREE.Vector3();
        this._sliceSpacing = sliceSpacing;

        var vsCode = [
            'attribute vec3 position;',
            'uniform mat4 projectionMatrix;',
            'uniform mat4 modelViewMatrix;',

            'attribute vec3 tex;',
            'varying vec3 texOut;',

            'void main(void) {',
            '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '    // texOut = vec3(1.0, 0.5, 0.3); //tex;',
            '    texOut = tex;',
            '}'
        ].join('\n');
        var fsCode = [
            'precision highp float;',

            '// Pregenerated noise texture.',
            'uniform sampler2D nzw;',
            'uniform sampler2D fireProfile;',
            'uniform float time;',

            'varying vec3 texOut;',

            'const float modulus = 61.0;  // Value used in pregenerated noise texture.',

            '// Modified Blum Blum Shub pseudo-random number generator.',
            '//// ランダム数値生成器？',
            'vec2 mBBS(vec2 val, float modulus) {',
            '    val = mod(val, modulus); // For numerical consistancy.',
            '    return mod(val * val, modulus);',
            '}',

            '/**',
            ' * Modified noise function.',
            ' * @see http://www.csee.umbc.edu/~olano/papers/index.html#mNoise',
            ' **/',
            '//// 事前に生成したノイズテクスチャからランダムにテクセルをフェッチ',
            'float mnoise(vec3 pos) {',
            '    float intArg = floor(pos.z);',
            '    float fracArg = fract(pos.z);',
            '    vec2 hash = mBBS(intArg * 3.0 + vec2(0, 3), modulus);',
            '    vec4 g = vec4(texture2D(nzw, vec2(pos.x, pos.y + hash.x) / modulus).xy,',
            '                  texture2D(nzw, vec2(pos.x, pos.y + hash.y) / modulus).xy) * 2.0 - 1.0;',
            '    return mix(g.x + g.y * fracArg,',
            '               g.z + g.w * (fracArg - 1.0),',
            '               smoothstep(0.0, 1.0, fracArg));',
            '}',

            'const int octives = 4;',
            'const float lacunarity = 2.0;',
            'const float gain = 0.5;',

            '/**',
            ' * Adds multiple octives of noise together.',
            ' **/',
            '//// 雰囲気的にパーリンノイズ風？',
            'float turbulence(vec3 pos) {',
            '    float sum = 0.0;',
            '    float freq = 1.0;',
            '    float amp = 1.0;',
            '    for(int i = 0; i < octives; i++) {',
            '        sum += abs(mnoise(pos * freq)) * amp;',
            '        freq *= lacunarity;',
            '        amp *= gain;',
            '    }',
            '    return sum;',
            '}',

            'const float magnatude = 1.3;',

            '/**',
            ' * Samples the fire.',
            ' *',
            ' * @param loc the normalized location (0.0-1.0) to sample the fire',
            ' * @param scale the "size" of the fire in world space and time',
            ' **/',
            '//// 炎テクスチャからランダムにテクセルをフェッチ',
            'vec4 sampleFire(vec3 loc, vec4 scale) {',
            '    // Convert xz to [-1.0, 1.0] range.',
            '    loc.xz = loc.xz * 2.0 - 1.0;',

            '    // Convert to (radius, height) to sample fire profile texture.',
            '    vec2 st = vec2(sqrt(dot(loc.xz, loc.xz)), loc.y);',

            '    // Convert loc to "noise" space',
            '    loc.y -= time * scale.w; // Scrolling noise upwards over time.',
            '    loc *= scale.xyz; // Scaling noise space.',

            '    // Offsetting vertial texture lookup.',
            '    // We scale this by the sqrt of the height so that things are',
            '    // relatively stable at the base of the fire and volital at the',
            '    // top.',
            '    //// turbulance = 乱流。おそらく参照点に揺らぎを加味してサンプルしている。',
            '    //// st.y == loc.y。st生成時にYは補正していない。意味的にはfire textureの高さ？',
            '    float offset = sqrt(st.y) * magnatude * turbulence(loc);',
            '    st.y += offset;',

            '    // TODO: Update fireProfile texture to have a black row of pixels.',
            '    // 高さが1.0を超えた場合はblack pixelにする。',
            '    if (st.y > 1.0) {',
            '        return vec4(0, 0, 0, 1);',
            '    }',

            '    //// 計算した結果のポイントをサンプリング。',
            '    vec4 result = texture2D(fireProfile, st);',

            '    // Fading out bottom so slice clipping isnt obvious',
            '    if (st.y < .1) {',
            '        result *= st.y / 0.1;',
            '    }',

            '    return result;',
            '}',

            'void main(void) {',
            '    // Mapping texture coordinate to -1 => 1 for xy, 0=> 1 for y',
            '    vec3 color = sampleFire(texOut, vec4(1.0, 2.0, 1.0, 0.5)).xyz;',
            '    // float r = mod(time, 1.0);',
            '    // gl_FragColor = vec4(color.r, color.g, 0.5, 1.0);',
            '    gl_FragColor = vec4(color * 1.5, 1);',
            '    // gl_FragColor = vec4(1.0, 0.3, 0.0, 1.0);',
            '    // gl_FragColor = vec4(color, 1.0);',
            '}'
        ].join('\n');

        var index    = new Uint16Array ((width + height + depth) * 30);
        var position = new Float32Array((width + height + depth) * 80 * 3);
        var tex      = new Float32Array((width + height + depth) * 30 * 3);

        var geometry = new THREE.BufferGeometry();
        geometry.dynamic = true;
        geometry.addAttribute('position', new THREE.BufferAttribute(position, 3));
        geometry.addAttribute('index',    new THREE.BufferAttribute(index,    1));
        geometry.addAttribute('tex',      new THREE.BufferAttribute(tex,      3));

        var material = this.createMaterial(vsCode, fsCode);

        this.mesh = new THREE.Mesh(geometry, material);

        this.mesh.updateMatrixWorld();
    }
    FireElement.prototype = Object.create({}, {
        constructor: {
            value: FireElement
        },

        _cornerNeighbors: {
            value: [
                [1, 2, 4],
                [0, 5, 3],
                [0, 3, 6],
                [1, 7, 2],
                [0, 6, 5],
                [1, 4, 7],
                [2, 7, 4],
                [3, 5, 6]
            ]
        },

        _incomingEdges: {
            value: [
                [-1,  2,  4, -1,  1, -1, -1, -1 ],
                [ 5, -1, -1,  0, -1,  3, -1, -1 ],
                [ 3, -1, -1,  6, -1, -1,  0, -1 ],
                [-1,  7,  1, -1, -1, -1, -1,  2 ],
                [ 6, -1, -1, -1, -1,  0,  5, -1 ],
                [-1,  4, -1, -1,  7, -1, -1,  1 ],
                [-1, -1,  7, -1,  2, -1, -1,  4 ],
                [-1, -1, -1,  5, -1,  6,  3, -1 ]
            ]
        },

        createMaterial: {
            value: function (vsCode, fsCode) {
                var nzw = THREE.ImageUtils.loadTexture('bsSkm.png');
                nzw.wrapS = THREE.RepeatWrapping;
                nzw.wrapT = THREE.RepeatWrapping;
                nzw.magFilter = THREE.LinearFilter;
                nzw.minFilter = THREE.LinearFilter;

                var fireProfile = THREE.ImageUtils.loadTexture('bI9xM2.png');
                fireProfile.wrapS = THREE.ClampToEdgeWrapping;
                fireProfile.wrapT = THREE.ClampToEdgeWrapping;
                fireProfile.magFilter = THREE.LinearFilter;
                fireProfile.minFilter = THREE.LinearFilter;

                var material = new THREE.RawShaderMaterial({
                    vertexShader  : vsCode,
                    fragmentShader: fsCode,
                    uniforms: {
                        time: {
                            type: 'f',
                            value: 0
                        },
                        nzw: {
                            type: 't',
                            value: nzw
                        },
                        fireProfile: {
                            type: 't',
                            value: fireProfile
                        }
                    },

                    attributes: {
                        tex: {
                            type: 'v3',
                            value: null
                        }
                    },

                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    transparent: true
                });

                return material;
            }
        },

        getViewVector: {
            value: function (matrix) {
                var elements = matrix.elements;
                return new THREE.Vector3(-elements[2], -elements[6], -elements[10]).normalize();
            }
        },

        update: {
            value: function (deltaTime) {
                var matrix = new THREE.Matrix4();

                matrix.multiplyMatrices(this.camera.matrixWorldInverse, this.mesh.matrixWorld);

                var viewVector = this.getViewVector(matrix);
                if (!this._viewVector.equals(viewVector)) {
                    this._viewVector = viewVector;
                    this.slice();

                    this.mesh.geometry.attributes.position.array.set(this._points);
                    this.mesh.geometry.attributes.tex.array.set(this._texCoords);
                    this.mesh.geometry.attributes.index.array.set(this._indexes);

                    this.mesh.geometry.attributes.position.needsUpdate = true;
                    this.mesh.geometry.attributes.tex.needsUpdate      = true;
                    this.mesh.geometry.attributes.index.needsUpdate    = true;
                }

                this.mesh.material.uniforms.time.value += deltaTime;
            }
        },

        slice: {
            value: function() {
                // 頂点情報
                this._points    = [];

                // テクスチャ位置情報
                this._texCoords = [];

                // インデックス
                this._indexes   = [];

                // モデルの角への視線距離？
                var cornerDistance = [];
                cornerDistance[0] = this._posCorners[0].dot(this._viewVector);

                // 最大距離の頂点のインデックス
                var maxCorner = 0;

                // 最小視線距離
                var minDistance = cornerDistance[0];

                // 最大視線距離
                var maxDistance = cornerDistance[0];

                // 全頂点数 | this._posCorners.length === 8
                // 全頂点に対して距離を算出、最大・最小を検出
                for (var i = 1; i < 8; ++i) {
                    // 距離なら三平方の定理で、x * x + y * yの平方根をとるが、処理負荷軽減のために平方根は取っていない？
                    // dotはx * x + y * yを実現している。
                    cornerDistance[i] = this._posCorners[i].dot(this._viewVector);

                    if (cornerDistance[i] > maxDistance) {
                        maxCorner = i;
                        maxDistance = cornerDistance[i];
                    }
                    if (cornerDistance[i] < minDistance) {
                        minDistance = cornerDistance[i];
                    }
                }

                // Aligning slices
                // 小数点第一位までに切り詰める処理？
                var sliceDistance = Math.floor(maxDistance / this._sliceSpacing) * this._sliceSpacing;

                var activeEdges = [];
                var firstEdge   = 0;
                var nextEdge    = 0;
                var expirations = new PriorityQueue();

                /**
                 * エッジ（辺）の生成
                 */
                var createEdge = function(startIndex, endIndex) {

                    // 12が最大値？
                    if (nextEdge >= 12) {
                        return undefined;
                    }

                    var activeEdge = {
                        expired   : false,
                        startIndex: startIndex,
                        endIndex  : endIndex,
                        deltaPos  : new THREE.Vector3(),
                        deltaTex  : new THREE.Vector3(),
                        pos       : new THREE.Vector3(),
                        tex       : new THREE.Vector3()
                    };

                    // start <-> end間の長さ
                    var range = cornerDistance[startIndex] - cornerDistance[endIndex];
                    if (range != 0.0) {
                        // rangeの逆数
                        var irange = 1.0 / range;

                        // start <-> end間の差分ベクトルを取得。差分ベクトルなので end - start。
                        // それに逆数を掛ける。
                        activeEdge.deltaPos.subVectors(
                            this._posCorners[endIndex],
                            this._posCorners[startIndex]
                        ).multiplyScalar(irange);

                        activeEdge.deltaTex.subVectors(
                            this._texCorners[endIndex],
                            this._texCorners[startIndex]
                        ).multiplyScalar(irange);

                        var step = cornerDistance[startIndex] - sliceDistance;

                        activeEdge.pos.addVectors(
                            activeEdge.deltaPos.clone().multiplyScalar(step),
                            this._posCorners[startIndex]
                        );

                        activeEdge.tex.addVectors(
                            activeEdge.deltaTex.clone().multiplyScalar(step),
                            this._texCorners[startIndex]
                        );

                        activeEdge.deltaPos.multiplyScalar(this._sliceSpacing);
                        activeEdge.deltaTex.multiplyScalar(this._sliceSpacing);
                    }

                    // 距離がプライオリティとして利用される
                    expirations.push(activeEdge, cornerDistance[endIndex]);
                    activeEdge.cur = nextEdge;
                    activeEdges[nextEdge++] = activeEdge;

                    return activeEdge;
                };

                // 3辺を接続？（A <-> B <-> C <-> A）
                for (i = 0; i < 3; ++i) {
                    var activeEdge = createEdge.call(this, maxCorner, this._cornerNeighbors[maxCorner][i]);
                    activeEdge.prev = (i + 2) % 3;
                    activeEdge.next = (i + 1) % 3;
                }

                // sliceDistanceがminDistanceより小さくなるまで繰り返し
                var nextIndex = 0;
                while (sliceDistance > minDistance) {
                    // 視線距離が大きいほうが優先度高？
                    while (expirations.top().priority >= sliceDistance) {
                        var edge = expirations.pop().object;
                        if (edge.expired) {
                            continue;
                        }

                        var isNotEnd = (edge.endIndex !== activeEdges[edge.prev].endIndex &&
                                        edge.endIndex !== activeEdges[edge.next].endIndex);
                        if (isNotEnd) {
                            // split this edge.
                            // 処理済としてフラグを立てる？
                            edge.expired = true;

                            // create two new edges.
                            var activeEdge1 = createEdge.call(
                                this,
                                edge.endIndex,
                                this._incomingEdges[edge.endIndex][edge.startIndex]
                            );
                            activeEdge1.prev = edge.prev;
                            activeEdges[edge.prev].next = nextEdge - 1;
                            activeEdge1.next = nextEdge;

                            var activeEdge2 = createEdge.call(
                                this,
                                edge.endIndex,
                                this._incomingEdges[edge.endIndex][activeEdge1.endIndex]
                            );
                            activeEdge2.prev = nextEdge - 2;
                            activeEdge2.next = edge.next;
                            activeEdges[activeEdge2.next].prev = nextEdge - 1;
                            firstEdge = nextEdge - 1;
                        }
                        else {
                            // merge edge.
                            var prev;
                            var next;
                            if (edge.endIndex === activeEdges[edge.prev].endIndex) {
                                prev = activeEdges[edge.prev];
                                next = edge;
                            }
                            else {
                                prev = edge;
                                next = activeEdges[edge.next];
                            }
                            prev.expired = true;
                            next.expired = true;

                            // make new edge
                            var activeEdge = createEdge.call(
                                this,
                                edge.endIndex,
                                this._incomingEdges[edge.endIndex][prev.startIndex]
                            );
                            activeEdge.prev = prev.prev;
                            activeEdges[activeEdge.prev].next = nextEdge - 1;
                            activeEdge.next = next.next;
                            activeEdges[activeEdge.next].prev = nextEdge - 1;
                            firstEdge = nextEdge - 1;
                        }
                    }

                    var cur   = firstEdge;
                    var count = 0;
                    do {
                        ++count;

                        // ループ処理中のアクティブなエッジ
                        var activeEdge = activeEdges[cur];

                        // 算出した頂点座標
                        this._points.push(activeEdge.pos.x); // x
                        this._points.push(activeEdge.pos.y); // y
                        this._points.push(activeEdge.pos.z); // z

                        // 算出したUV座標
                        this._texCoords.push(activeEdge.tex.x); // x
                        this._texCoords.push(activeEdge.tex.y); // y
                        this._texCoords.push(activeEdge.tex.z); // z

                        activeEdge.pos.add(activeEdge.deltaPos);
                        activeEdge.tex.add(activeEdge.deltaTex);

                        cur = activeEdge.next;
                    } while (cur !== firstEdge);

                    for (i = 2; i < count; ++i) {
                        this._indexes.push(nextIndex);
                        this._indexes.push(nextIndex + i - 1);
                        this._indexes.push(nextIndex + i + 0);
                    }

                    nextIndex     += count;
                    sliceDistance -= this._sliceSpacing;
                }
            }
        }
    });

    /////////////////////////////////////////////////////////////////////////////

    function init() {
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0x000000);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        var scene  = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        camera.position.y = 5;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        var controls = new THREE.OrbitControls(camera);

        // light
        var light = new THREE.DirectionalLight(0xfffffff);
        light.position.set(1, 1, 1);
        scene.add(light);

        var ambient = new THREE.AmbientLight(0x666666);
        scene.add(ambient);

        var fireElement = new FireElement(2, 10, 2, 0.3, camera);

        scene.add(fireElement.mesh);

        var prevTime = Date.now();
        (function loop() {
            var now = Date.now();
            var deltaTime = now - prevTime;
            prevTime = now;

            fireElement.update(deltaTime / 1000);
            renderer.render(scene, camera);

            controls.update();

            setTimeout(loop, 16);
        }());
    }

    /////////////////////////////////////////////////////////////////////////////

    // 起動
    init();

}());

