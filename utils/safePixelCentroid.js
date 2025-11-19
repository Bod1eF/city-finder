export function safePixelCentroid(feature, path, projection) {
  // try path.centroid first
  try {
    const c = path.centroid(feature);
    if (Array.isArray(c) && isFinite(c[0]) && isFinite(c[1]) && Math.abs(c[0]) < 1e6 && Math.abs(c[1]) < 1e6) {
      return c;
    }
  } catch (e) {
    // ignore and try fallback
  }

  // fallback to geoBounds midpoint then project
  try {
    const b = d3.geoBounds(feature);
    if (b && b.length === 2) {
      const lon = (b[0][0] + b[1][0]) / 2;
      const lat = (b[0][1] + b[1][1]) / 2;
      const p = projection([lon, lat]);
      if (p && isFinite(p[0]) && isFinite(p[1])) return p;
    }
  } catch (e) {
    // ignore
  }

  return null;
}
