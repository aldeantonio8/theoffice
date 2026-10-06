# 3D asset guide

The current prototype uses procedural geometry so the interaction system remains easy to iterate on.

## Recommended asset folders

```
public/
  models/
    characters/
      player.glb
      receptionist.glb
      hr.glb
      procurement.glb
      operations.glb
      director.glb
    furniture/
      reception-desk.glb
      office-desk.glb
      office-chair.glb
      sofa.glb
      shelf.glb
      plant.glb
    environment/
      office-shell.glb
```

## Model rules

- Use GLB/GLTF.
- Keep origins sensible and scale consistently.
- Prefer compressed textures.
- Avoid very high polygon counts for web.
- Keep characters as separate assets from the office shell.
- Character animations should ideally include idle, walk and talk.
- Do not bake UI text into 3D models; UI remains HTML for accessibility and responsiveness.

## Integration

Use `useGLTF` from `@react-three/drei` inside dedicated components. The existing NPC, Desk, Chair, Sofa, Shelf and Plant components can be replaced one by one without changing the department interaction logic.

The gameplay state currently lives outside the visual assets:

- room metadata: `officeData.ts`
- movement/proximity/collision: `OfficeScene.tsx`
- dialogues/forms: `OfficeExperience.tsx`

This separation is intentional so visual models can evolve without rebuilding the experience.
