# The Living Graph — Concept Brief (Section 02 reimagined)

> **Purpose:** Replace the lifeless "one graph, shared" diagram with the emotional centerpiece of the Synap landing — the moment a dreamer sees their own mind, alive, externalized, and quietly tended. This brief defines the narrative, the visual language, the toolchain, and the Phase 0/1 exploration prompts.

---

## 0. The one feeling

> **Your whole life becomes a living space you can move through — and you're not alone in it.**

Not "AI and a human share a database." The feeling is recognition and awe: *this is my world, alive, and something tends it alongside me — surfacing, connecting, offering — and never taking it from me.*

We never say "AI." We say: human intelligence and artificial support, sharing one living space.

Audience: **dreamers** first. Investors and clients come later. This section is the one that makes someone feel the future, not evaluate a feature.

---

## 1. The four-beat journey (medium-agnostic)

The section is a short scroll-journey, four beats:

1. **It begins as you.** Scattered fragments of a real life drift in the dark — a voice note, a photo, a message, a half-thought. Raw, physical, human. Unstructured.
2. **It crystallizes.** Those fragments harden into glowing, typed entities and snap into a constellation. The physical becomes structured — without you lifting a finger. *(Reference: Igloo Inc — particles crystallizing from chaos.)*
3. **It comes alive.** The constellation breathes. Connections form on their own. Soft warm presences move through it, touching nodes, leaving gentle pulses — proposals offered, never forced. *(Reference: Active Theory — an inhabited space, not a displayed one.)*
4. **It's yours.** Pull back: the whole field is one living space. Human intelligence and artificial support, one source of truth. Yours. The copy lands here: a single line, not a stat row.

The current diagram (you / entity / orchestrator columns + 1·0·∞ stats) is **deleted**. Its one true idea — one shared source of truth, full history — survives only as the quiet closing line of beat 4.

---

## 2. Visual language

- **Palette:** warm. Amber primary (`$primary`) for the user's own data; emerald (`$ai` / `$aiLight`) for the support presences. Dark warm background (#0a0a0a-adjacent). **No cold blue sci-fi** — that's every other AI site.
- **Motion:** organic, breathing, firefly-like drift. Curl-noise, not rigid orbits. Idle motion even when not scrolling — the space is alive when unobserved.
- **Nodes:** soft emissive points; typed entities (person, note, deal, idea) distinguished by hue, not labels-first. Labels surface on approach.
- **Presences (the "support"):** soft, luminous, non-anthropomorphic. They move *with* intent but never grab. A pulse = a proposal offered.
- **Restraint:** "a calm sea with useful islands." Empty space is a feature. No decorative blobs. The awe comes from depth and life, not density.
- **Type:** Fraunces for the one or two lines of copy that appear. Mono for any micro-labels.

---

## 3. Production stack (decided)

| Layer | Tool | Role |
|---|---|---|
| 3D field | **React Three Fiber + drei** | instanced glowing nodes, scroll-linked camera |
| Living motion | **custom GLSL / FBO particle shader** | curl-noise connections, breathing field (GPU-side → protects INP) |
| Choreography | **GSAP ScrollTrigger + Lenis** | conducts the 4-beat camera + shader timeline |
| Presences | **Rive** | the warm "support" agents — tiny, interactive, state-machine |
| Fallback / LCP | **Blender → AVIF/MP4 loop** | mobile + low-power substitute, `poster` + `fetchpriority=high` |

**CWV contract (non-negotiable):**
- `dynamic(() => Canvas, { ssr: false })`, lazy-mount on scroll via `IntersectionObserver`
- render-on-demand, instancing, DPR cap; pause when offscreen
- keep simulation GPU-side (FBO) to protect **INP** — the most-failed vital in 2026
- respect `prefers-reduced-motion` → serve the static poster
- mobile gets the AVIF loop, not the live canvas

**Avoid shipping:** Spline (bundle weight), Framer (no clean Next export).

---

## 4. The pipeline (how we generate it)

**Phase 0 — Mood / north star (hours).**
Midjourney → mood boards (palette, node-glow, presence silhouettes) + seamless textures and an equirectangular env map we reuse in production R3F. Lock the emotional target.

**Phase 1 — Fast form exploration (1–3 days, disposable).**
- **v0** → multiple runnable R3F scaffolds (keepable code).
- **Spline** + **Unicorn Studio** in parallel → quick non-code looks for density/glow gut-check.
- `react-force-graph` / `cobe` → validate "literal graph" vs "abstract field."
- Choose the winning *feel*, not the winning tool.

**Phase 2 — Production synthesis (ships).**
Port the best v0 scaffold; bake MJ textures/env; R3F + GLSL + GSAP timeline; Rive presences overlaid; AVIF fallback. Tune to the CWV contract.

---

## 5. Ready-to-run prompts

### v0 (Phase 1 scaffold)
```
Build a full-bleed React Three Fiber scene for a Next.js landing section:
a dark, warm-toned 3D field of ~400 instanced glowing points (amber and
emerald emissive) drifting with curl noise, connected by faint living lines.
A camera slowly dollies through the cloud on scroll using drei ScrollControls
+ a GSAP-driven timeline. A few softer emerald "presence" orbs move through
the field independently, occasionally pulsing. Idle motion continues when not
scrolling. Lazy-load the Canvas with dynamic ssr:false. Respect
prefers-reduced-motion with a static fallback. Warm dark background (#0a0a0a),
no blue. Keep particle simulation on the GPU.
```

### Midjourney (Phase 0 mood)
```
a living constellation of glowing amber and emerald nodes suspended in warm
dark space, soft luminous connections forming a vast organic neural field,
fragments of a human life crystallizing into structured points of light,
gentle ambient presences drifting through, cinematic depth, calm and reverent,
warm not cold, premium editorial, volumetric haze, no text --ar 16:9 --style raw
```
Variations: `--ar 21:9` (cinematic wide), swap "a human silhouette emerging from the node field at a distance" for beat-1 establishing shot, "seamless tileable glowing particle texture, dark background" for the production texture.

---

## 6. Open decisions (founder)

1. **Scope** — section 02 now (recommended: build spine-ready), or commit to re-architecting the whole page as one journey?
2. Final **closing line** for beat 4 — the one sentence the whole section earns. Candidate: *"One living space. Everything you know, everything that tends it — yours."*
3. Whether the **hero** stays the calm "spatial shell / Maya briefing," or whether the Living Graph eventually *becomes* the hero.

---

*Status: concept locked, exploration not yet started. Next action: Phase 0 (Midjourney mood + v0 scaffold).*
