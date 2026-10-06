"""Build a real polygonal trophy and render a turntable. Requires numpy, Pillow."""
from pathlib import Path
import math, json
import numpy as np
from PIL import Image

OUT = Path(__file__).resolve().parent
VERTS, FACES, MATERIALS = [], [], []

def ring(w, d, z, bevel=.08):
    b = min(w, d) * bevel
    return [(-w/2+b,-d/2,z),(w/2-b,-d/2,z),(w/2,-d/2+b,z),(w/2,d/2-b,z),(w/2-b,d/2,z),(-w/2+b,d/2,z),(-w/2,d/2-b,z),(-w/2,-d/2+b,z)]

def solid(rings, material):
    start = len(VERTS)
    for r in rings: VERTS.extend(r)
    n = len(rings[0])
    def face(ids):
        FACES.append(tuple(start+i for i in ids)); MATERIALS.append(material)
    for k in range(len(rings)-1):
        for j in range(n):
            a=k*n+j; b=k*n+(j+1)%n; c=(k+1)*n+(j+1)%n; d=(k+1)*n+j
            face((a,b,c)); face((a,c,d))
    for j in range(1,n-1):
        face((0,j+1,j))
        t=(len(rings)-1)*n; face((t,t+j,t+j+1))

def box(w,d,z,h,mat):
    e=.018
    solid([ring(w-e*2,d-e*2,z),ring(w,d,z+e),ring(w,d,z+h-e),ring(w-e*2,d-e*2,z+h)],mat)

# Z is the rotation axis; pedestal and shaft share the same centered pivot.
box(1.55,1.32,0,.10,'black')
box(1.52,1.29,.10,.035,'gold')
box(1.43,1.20,.135,.66,'black')
box(.98,.78,.795,.045,'gold')
shaft=[]
for z,w,d in [(.84,.98,.78),(1.02,.94,.75),(1.38,.84,.69),(1.85,.74,.62),(2.5,.70,.59),(3.25,.71,.60)]:
    shaft.append(ring(w,d,z,.06))
# A single diagonal cut forms the prominent lozenge-like top face.
top=ring(.74,.62,0,.06)
top=[(x,y,4.05 + .73*x + .64*y) for x,y,_ in top]
shaft.append(top)
solid(shaft,'gold')

V=np.array(VERTS,dtype=float); F=np.array(FACES)
(OUT/'basic-trophy.mtl').write_text('newmtl gold\nKa 0.25 0.16 0.04\nKd 0.83 0.55 0.14\nKs 1 0.88 0.58\nNs 180\n\nnewmtl black\nKa 0.02 0.02 0.02\nKd 0.035 0.04 0.05\nKs 0.5 0.5 0.5\nNs 120\n',encoding='utf-8')
with (OUT/'basic-trophy.obj').open('w',encoding='utf-8') as out:
    out.write('# Z-up; centered Z-axis pivot; units arbitrary\nmtllib basic-trophy.mtl\no BasicTrophy\n')
    for v in V: out.write('v %.6f %.6f %.6f\n'%tuple(v))
    active=None
    for f,m in zip(F,MATERIALS):
        if m!=active: out.write('usemtl '+m+'\n'); active=m
        out.write('f '+' '.join(str(int(i)+1) for i in f)+'\n')

def normalize(a): return a/np.maximum(np.linalg.norm(a,axis=-1,keepdims=True),1e-9)

W,H=480,640
SS=1.5; RW,RH=int(W*SS),int(H*SS)
elev=math.radians(12)
camera=np.array([[1,0,0],[0,-math.sin(elev),math.cos(elev)],[0,math.cos(elev),math.sin(elev)]])
lights=[(normalize(np.array([-.7,1.,1.2])),1.0),(normalize(np.array([1.,.7,.1])),.65),(normalize(np.array([0.,-.7,1.])),.35)]
view=np.array([0.,0.,1.])

def render(degrees):
    a=math.radians(degrees)
    rot=np.array([[math.cos(a),-math.sin(a),0],[math.sin(a),math.cos(a),0],[0,0,1]])
    world=V@rot.T
    cv=(world-np.array([0,0,2.17]))@camera.T
    scale=RH/5.25
    screen=np.stack([RW/2+cv[:,0]*scale,RH/2-cv[:,1]*scale,cv[:,2]],axis=1)
    pixels=np.zeros((RH,RW,4),dtype=np.uint8)
    depth=np.full((RH,RW),-np.inf)
    for f,mat in zip(F,MATERIALS):
        # Camera basis changes handedness; restore outward-facing normals.
        pts=cv[f]; normal=-normalize(np.cross(pts[1]-pts[0],pts[2]-pts[0]))
        if normal[2]<=0: continue
        p=screen[f]; x0=max(0,int(p[:,0].min())); x1=min(RW-1,int(p[:,0].max()+1))
        y0=max(0,int(p[:,1].min())); y1=min(RH-1,int(p[:,1].max()+1))
        if x0>x1 or y0>y1: continue
        xx,yy=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
        den=(p[1,1]-p[2,1])*(p[0,0]-p[2,0])+(p[2,0]-p[1,0])*(p[0,1]-p[2,1])
        if abs(den)<1e-8: continue
        u=((p[1,1]-p[2,1])*(xx-p[2,0])+(p[2,0]-p[1,0])*(yy-p[2,1]))/den
        v=((p[2,1]-p[0,1])*(xx-p[2,0])+(p[0,0]-p[2,0])*(yy-p[2,1]))/den
        t=1-u-v; z=u*p[0,2]+v*p[1,2]+t*p[2,2]
        visible=(u>=-1e-6)&(v>=-1e-6)&(t>=-1e-6)&(z>depth[y0:y1+1,x0:x1+1])
        if not visible.any(): continue
        base=np.array([.86,.57,.17]) if mat=='gold' else np.array([.045,.052,.066])
        diffuse=.30; spec=0.
        for light,power in lights:
            diffuse+=max(0,float(normal@light))*.55*power
            spec+=max(0,float(normal@normalize(light+view)))**55*power
        # Broad studio reflection bands across the metal, fixed to the environment.
        reflection=2*normal[2]*normal-view
        band=math.exp(-((reflection[0]+.45)/.18)**2)*.45+math.exp(-((reflection[0]-.7)/.09)**2)*.8
        color=base*diffuse+np.array([1.,.89,.65] if mat=='gold' else [.7,.75,.85])*(spec*.7+band*(.5 if mat=='gold' else .1))
        color=np.clip(color,0,1)**(1/1.6)*255
        section=pixels[y0:y1+1,x0:x1+1]; section[visible,:3]=color.astype(np.uint8);section[visible,3]=255
        depth[y0:y1+1,x0:x1+1][visible]=z[visible]
    return Image.fromarray(pixels).resize((W,H),Image.Resampling.LANCZOS)

frames=[]
for i in range(120):
    frame=render(32+i*3)
    if i==0: frame.save(OUT/'basic-trophy.png')
    frames.append(frame)
    if i%30==0: print(f'Rendered {i+1}/120',flush=True)
frames[0].save(OUT/'basic-trophy-turntable.webp',save_all=True,append_images=frames[1:],duration=50,loop=0,lossless=True)
# GIF uses a dark matte to avoid jagged one-bit transparent edges.
rgb=[]
for f in frames:
    bg=Image.new('RGBA',f.size,(17,17,17,255));bg.alpha_composite(f);rgb.append(bg.convert('RGB'))
palette=rgb[0].quantize(colors=256)
gif=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in rgb]
gif[0].save(OUT/'basic-trophy-turntable.gif',save_all=True,append_images=gif[1:],duration=50,loop=0,disposal=2,optimize=False)
print('Saved OBJ, MTL, PNG, transparent WebP and dark-background GIF.',flush=True)
