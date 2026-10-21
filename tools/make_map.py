import sys, shapefile
from shapely.geometry import shape
from shapely.ops import unary_union
src, out = sys.argv[1], sys.argv[2]
X0, Y0 = 24373, 13095          # viewBox origin in 100 m units (matches the Figma map crop)
W, H = 3898, 2477
TOL = 1.5                      # simplification tolerance, 150 m

def pt(e, n): return (e/100 - X0, Y0 - n/100)

def path(geom):
    polys = [geom] if geom.geom_type == 'Polygon' else list(geom.geoms)
    d = []
    for p in polys:
        for ring in [p.exterior, *p.interiors]:
            cs = [pt(x, y) for x, y in ring.coords]
            if len(cs) < 4: continue
            d.append('M' + 'L'.join(f'{x:.0f} {y:.0f}' for x, y in cs[:-1]) + 'Z')
    return ''.join(d)

def load(name):
    r = shapefile.Reader(f'{src}/{name}')
    return [(rec, shape(s.__geo_interface__)) for rec, s in zip(r.records(), r.shapes())]

cantons = load('cantons'); lakes = load('lakes')
country = unary_union([g for _, g in cantons]).simplify(TOL * 100)
canton_d = ''.join(path(g.simplify(TOL * 100)) for _, g in cantons)
lake_d = ''.join(path(g.simplify(TOL * 100)) for rec, g in lakes if g.area > 8e6)

def wgs_to_lv95(lat, lon):
    p = (lat*3600 - 169028.66) / 10000; l = (lon*3600 - 26782.5) / 10000
    e = 2600072.37 + 211455.93*l - 10938.51*l*p - 0.36*l*p*p - 44.54*l**3
    n = 1200147.07 + 308807.95*p + 3745.25*l*l + 76.63*p*p - 194.56*l*l*p + 119.79*p**3
    return e, n

# Pin positions follow the Figma map (px in the 1879×1194 map frame, circle centres),
# which spreads the five towns around Lake Zurich so the pins don't overlap.
K = W / 1879
design_pins = [(1185, 272), (1225, 300), (1250, 341), (1272, 383), (1157, 404)]
pins = [f'<use href="#pin" x="{x*K:.0f}" y="{(y+27)*K:.0f}"/>' for x, y in design_pins]

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="map-title">
  <title id="map-title">Service area: Zug, Baar, Wollerau, Pfäffikon and Horgen</title>
  <defs>
    <symbol id="pin" viewBox="-32 -88 64 90" width="64" height="90" x="-32" y="-88" overflow="visible">
      <path d="M0 0C-7-13-30-33-30-56A30 30 0 1 1 30-56C30-33 7-13 0 0Z" fill="#9a9a9a" stroke="#141313" stroke-width="3"/>
      <circle cy="-56" r="15" fill="#141313"/>
      <circle cy="-56" r="9" fill="#9a9a9a"/>
    </symbol>
  </defs>
  <path class="map-lakes" d="{lake_d}" fill="#1b1a1a" stroke="none"/>
  <path class="map-cantons" d="{canton_d}" fill="none" stroke="#454444" stroke-width="1" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  <path class="map-country" d="{path(country)}" fill="none" stroke="#5a5858" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  <g class="map-pins">
    {''.join(pins)}
  </g>
</svg>
'''
open(out, 'w').write(svg)
print(len(svg))
