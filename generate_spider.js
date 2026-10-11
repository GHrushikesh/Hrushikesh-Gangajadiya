// Generator script to create a full 3D Cyber-Spider Model in GLTF format
const fs = require('fs');
const path = require('path');

function createSpiderGLTF() {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  let vertexOffset = 0;

  function addQuad(v1, v2, v3, v4, n) {
    positions.push(...v1, ...v2, ...v3, ...v4);
    normals.push(...n, ...n, ...n, ...n);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(
      vertexOffset, vertexOffset + 1, vertexOffset + 2,
      vertexOffset, vertexOffset + 2, vertexOffset + 3
    );
    vertexOffset += 4;
  }

  function addBox(center, size, rot = [0, 0, 0]) {
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = [size[0] / 2, size[1] / 2, size[2] / 2];

    const cosY = Math.cos(rot[1]), sinY = Math.sin(rot[1]);
    const cosZ = Math.cos(rot[2]), sinZ = Math.sin(rot[2]);

    function transform(x, y, z) {
      // Rotate around Z then Y
      let x1 = x * cosZ - y * sinZ;
      let y1 = x * sinZ + y * cosZ;
      let z1 = z;

      let x2 = x1 * cosY + z1 * sinY;
      let y2 = y1;
      let z2 = -x1 * sinY + z1 * cosY;

      return [cx + x2, cy + y2, cz + z2];
    }

    // 8 vertices
    const p000 = transform(-sx, -sy, -sz);
    const p100 = transform(sx, -sy, -sz);
    const p110 = transform(sx, sy, -sz);
    const p010 = transform(-sx, sy, -sz);
    const p001 = transform(-sx, -sy, sz);
    const p101 = transform(sx, -sy, sz);
    const p111 = transform(sx, sy, sz);
    const p011 = transform(-sx, sy, sz);

    // 6 faces
    addQuad(p001, p101, p111, p011, [0, 0, 1]); // Front
    addQuad(p100, p000, p010, p110, [0, 0, -1]); // Back
    addQuad(p010, p110, p111, p011, [0, 1, 0]); // Top
    addQuad(p000, p100, p101, p001, [0, -1, 0]); // Bottom
    addQuad(p100, p101, p111, p110, [1, 0, 0]); // Right
    addQuad(p000, p010, p011, p001, [-1, 0, 0]); // Left
  }

  function addSphere(center, radius, segments = 12, rings = 8, scale = [1, 1, 1]) {
    const startIndex = vertexOffset;
    for (let r = 0; r <= rings; r++) {
      const phi = (r * Math.PI) / rings;
      const y = radius * Math.cos(phi) * scale[1];
      const ringRadius = radius * Math.sin(phi);

      for (let s = 0; s <= segments; s++) {
        const theta = (s * 2 * Math.PI) / segments;
        const x = ringRadius * Math.cos(theta) * scale[0];
        const z = ringRadius * Math.sin(theta) * scale[2];

        positions.push(center[0] + x, center[1] + y, center[2] + z);
        
        // Normal
        const nx = x / scale[0];
        const ny = y / scale[1];
        const nz = z / scale[2];
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
        normals.push(nx / len, ny / len, nz / len);
        uvs.push(s / segments, r / rings);
        vertexOffset++;
      }
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const first = startIndex + r * (segments + 1) + s;
        const second = first + segments + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
  }

  // 1. Thorax / Head (Cephalothorax)
  addSphere([0, 0, 0.2], 0.7, 16, 12, [1.1, 0.65, 1.3]);

  // 2. Abdomen (Rear body)
  addSphere([0, 0.25, -1.4], 1.1, 18, 14, [1.0, 0.85, 1.6]);

  // 3. Fangs / Chelicerae
  addBox([-0.2, -0.2, 1.3], [0.12, 0.35, 0.15], [0.3, 0, 0.2]);
  addBox([0.2, -0.2, 1.3], [0.12, 0.35, 0.15], [0.3, 0, -0.2]);

  // 4. Eyes (8 glowing LED sensors)
  const eyePositions = [
    [-0.15, 0.22, 1.1], [0.15, 0.22, 1.1],
    [-0.32, 0.18, 1.0], [0.32, 0.18, 1.0],
    [-0.12, 0.34, 0.95], [0.12, 0.34, 0.95],
    [-0.28, 0.30, 0.88], [0.28, 0.30, 0.88]
  ];
  eyePositions.forEach(pos => addSphere(pos, 0.06, 8, 6));

  // 5. 8 Multi-Segment Spider Legs
  const legConfigs = [
    // Left Legs (1 to 4)
    { side: -1, angle: 0.65, reach: 2.8, height: 1.4, zOffset: 0.5 },
    { side: -1, angle: 0.25, reach: 3.2, height: 1.6, zOffset: 0.15 },
    { side: -1, angle: -0.25, reach: 3.3, height: 1.5, zOffset: -0.25 },
    { side: -1, angle: -0.75, reach: 3.6, height: 1.3, zOffset: -0.65 },

    // Right Legs (1 to 4)
    { side: 1, angle: -0.65, reach: 2.8, height: 1.4, zOffset: 0.5 },
    { side: 1, angle: -0.25, reach: 3.2, height: 1.6, zOffset: 0.15 },
    { side: 1, angle: 0.25, reach: 3.3, height: 1.5, zOffset: -0.25 },
    { side: 1, angle: 0.75, reach: 3.6, height: 1.3, zOffset: -0.65 }
  ];

  legConfigs.forEach((cfg) => {
    const s = cfg.side;
    const hipX = s * 0.6;
    const hipY = 0.05;
    const hipZ = cfg.zOffset;

    // Segment 1: Coxa / Joint
    addSphere([hipX, hipY, hipZ], 0.16, 8, 6);

    // Segment 2: Femur (Knee Up)
    const kneeX = hipX + s * Math.cos(cfg.angle) * 1.5;
    const kneeY = hipY + cfg.height;
    const kneeZ = hipZ + Math.sin(cfg.angle) * 1.2;

    const midFemur = [(hipX + kneeX)/2, (hipY + kneeY)/2, (hipZ + kneeZ)/2];
    const femurLen = Math.sqrt((kneeX-hipX)**2 + (kneeY-hipY)**2 + (kneeZ-hipZ)**2);
    addBox(midFemur, [0.12, femurLen, 0.12], [0, -cfg.angle * s, s * 0.6]);

    // Knee joint
    addSphere([kneeX, kneeY, kneeZ], 0.18, 8, 6);

    // Segment 3: Tibia (Leg Downwards to Foot)
    const footX = hipX + s * cfg.reach;
    const footY = -1.1; // Ground level
    const footZ = hipZ + Math.sin(cfg.angle) * 2.2;

    const midTibia = [(kneeX + footX)/2, (kneeY + footY)/2, (kneeZ + footZ)/2];
    const tibiaLen = Math.sqrt((footX-kneeX)**2 + (footY-kneeY)**2 + (footZ-kneeZ)**2);
    addBox(midTibia, [0.09, tibiaLen, 0.09], [0, -cfg.angle * s * 0.8, -s * 0.7]);

    // Claw / Tarsus
    addSphere([footX, footY, footZ], 0.08, 6, 4);
  });

  // Convert to GLTF JSON + Base64 binary buffer
  const posArray = new Float32Array(positions);
  const normArray = new Float32Array(normals);
  const indArray = new Uint16Array(indices);

  const posBuffer = Buffer.from(posArray.buffer);
  const normBuffer = Buffer.from(normArray.buffer);
  const indBuffer = Buffer.from(indArray.buffer);

  const totalByteLength = indBuffer.length + posBuffer.length + normBuffer.length;
  const combinedBuffer = Buffer.concat([indBuffer, posBuffer, normBuffer]);
  const base64Data = combinedBuffer.toString('base64');

  // Compute min/max
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    minY = Math.min(minY, positions[i+1]);
    minZ = Math.min(minZ, positions[i+2]);
    maxX = Math.max(maxX, positions[i]);
    maxY = Math.max(maxY, positions[i+1]);
    maxZ = Math.max(maxZ, positions[i+2]);
  }

  const gltf = {
    asset: { version: "2.0", generator: "Cybernetic Spider 3D Engine" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "Spider_3D_Master" }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 1, NORMAL: 2 },
            indices: 0,
            material: 0
          }
        ]
      }
    ],
    materials: [
      {
        name: "SpiderSuitPBR",
        pbrMetallicRoughness: {
          baseColorFactor: [0.08, 0.08, 0.1, 1.0],
          metallicFactor: 0.95,
          roughnessFactor: 0.2
        },
        emissiveFactor: [0.95, 0.05, 0.08],
        doubleSided: true
      }
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
        min: [0],
        max: [positions.length / 3 - 1]
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ]
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: 5126,
        count: normals.length / 3,
        type: "VEC3"
      }
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: indBuffer.length,
        target: 34963
      },
      {
        buffer: 0,
        byteOffset: indBuffer.length,
        byteLength: posBuffer.length,
        target: 34962
      },
      {
        buffer: 0,
        byteOffset: indBuffer.length + posBuffer.length,
        byteLength: normBuffer.length,
        target: 34962
      }
    ],
    buffers: [
      {
        byteLength: totalByteLength,
        uri: "data:application/octet-stream;base64," + base64Data
      }
    ]
  };

  return JSON.stringify(gltf, null, 2);
}

const gltfOutput = createSpiderGLTF();
fs.writeFileSync(path.join(__dirname, 'assets', 'glb', 'spider_tech.gltf'), gltfOutput);
fs.writeFileSync(path.join(__dirname, 'assets', 'glb', 'spider_core.gltf'), gltfOutput);
console.log('Successfully generated complete articulated 3D Spider models in assets/glb/!');
