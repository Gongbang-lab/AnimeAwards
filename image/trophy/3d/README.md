# Basic trophy turntable

First polygonal reconstruction of trophy-diamond-plain-wide.png. The unseen back is an inferred continuation, not recovered from the photo. Shaft profile, diagonal top, beveled black pedestal and gold trim are modeled in geometry.

- basic-trophy.obj + basic-trophy.mtl: editable mesh and materials; keep together when importing into Blender.
- basic-trophy-turntable.gif: dark matte background, 480 × 640, 120 frames, 50 ms per frame, 6-second continuous loop.
- basic-trophy-turntable.webp: same animation with alpha transparency.
- basic-trophy.png: transparent still.
- build_basic.py: reproducible geometry and software-rendering source; requires NumPy and Pillow.

Z is up. Pivot is the origin, at the center of the pedestal footprint. All components rotate together at constant speed around Z. Camera and lighting remain fixed. No duplicate endpoint frame.

This is a simplified modeling draft. Its flat-faced studio shading is not a photorealistic reproduction of the generated PNG. Main award assets remain unchanged. The next asset in the intended sequence is the golden cup.
