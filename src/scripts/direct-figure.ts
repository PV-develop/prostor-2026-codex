// Normalized model coordinates. Negative Z faces the viewer.
type Point = [number, number, number, number];

function roundedRect(x: number, y: number, width: number, height: number, radius: number) {
  const dx = Math.abs(x) - width / 2 + radius;
  const dy = Math.abs(y) - height / 2 + radius;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - radius;
}

// Round the transition between a planar profile and its front and back faces.
function roundedExtrusion(profile: number, z: number, depth: number, bevel: number) {
  const side = profile + bevel;
  const face = Math.abs(z) - depth / 2 + bevel;
  return Math.hypot(Math.max(side, 0), Math.max(face, 0)) + Math.min(Math.max(side, face), 0) - bevel;
}

function join(a: number, b: number, radius: number) {
  const overlap = Math.max(radius - Math.abs(a - b), 0) / radius;
  return Math.min(a, b) - overlap * overlap * radius / 4;
}

function surfaceDistance(x: number, y: number, z: number) {
  const outer = roundedRect(x + .035, y, 1, .64, .155);
  const inner = roundedRect(x + .035, y, .84, .455, .115);
  const frame = roundedExtrusion(Math.max(outer, -inner), z - .075, .21, .035);
  const bar = roundedExtrusion(roundedRect(x - .105, y, .82, .225, .11), z + .1275, .205, .05);

  // The web slopes forward from the left inside wall into the raised central bar.
  const travel = Math.max(0, Math.min(1, (x + .48) / .23));
  const web = roundedExtrusion(roundedRect(x + .365, y, .28, .142, .055),
    z - (.045 - .155 * travel), .14, .032);
  return join(join(frame, web, .045), bar, .045);
}

export function directFigure(size: number): Point[] {
  const points: Point[] = [];
  if (size <= 0) return points;

  // Jitter one sample per cell around the continuous surface. Tangent surfaces
  // receive more dots, so outlines form softly without drawing hard edge lines.
  const step = Math.min(.032, Math.max(.013, 5.8 / size));
  const jitter = () => Math.random() * step;
  for (let z = -.25; z < .20; z += step) {
    for (let y = -.34; y < .34; y += step) {
      for (let x = -.555; x < .535; x += step) {
        const px = x + jitter(), py = y + jitter(), pz = z + jitter();
        const d = surfaceDistance(px, py, pz);
        if (Math.abs(d) > step * .75) continue;

        const epsilon = .001;
        const nx = (surfaceDistance(px + epsilon, py, pz) - d) / epsilon;
        const ny = (surfaceDistance(px, py + epsilon, pz) - d) / epsilon;
        const nz = (surfaceDistance(px, py, pz + epsilon) - d) / epsilon;
        // Viewing direction in model space for the sign's resting three-quarter pose.
        const facing = Math.min(1, Math.abs(nx * .53 + ny * .16 + nz * .83));
        const rim = (1 - facing) ** 2;
        const depthNormal = Math.min(1, Math.abs(nz));
        const bevel = 4 * depthNormal * (1 - depthNormal);
        const density = .12 + .78 * rim + .42 * bevel;
        if (Math.random() > density) continue;
        points.push([px * size, py * size, pz * size, .25 + .45 * rim]);
      }
    }
  }
  return points;
}
