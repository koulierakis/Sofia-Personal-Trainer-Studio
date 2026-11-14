# Custom / Advanced — Frame order audit (READ ONLY)

Date: 2026-11-14. Scope: 221 source-default pending Custom/Advanced exercises: 13 stored hybrid + 208 generated concepts. Browser-specific review overrides and image files may not be accessible.

**No frame count, saved frame, prompt or image was modified by this audit.** Code/data audit, not visual certification.

## Aggregate findings

- 13 saved Hybrid, 7 authored slots each = 91 frames. 2 complete strict reverse aliases; 11 do not store intermediate return aliases. 10 have missing stored prompt texts.
- 208 dynamically generated: 12 standing × 12 upper = 144; 8 ground × 8 finish = 64.
- 56 squat-keyword combined names trigger generic 5-frame squat branch and lose the secondary movement in the visual sequence.
- Remaining 152 complex names normally generate nine frames from shared 5-outward / 4-reuse template.
- Estimated generated slots: 56 × 5 + 152 × 9 = 1,648; plus saved 91 = 1,739 if browser overrides do not intervene.
- All 208 generated prompts append the complete multi-step exercise.instructions to every frame. This is contrary to frame-specific prompt isolation.
- This audit does not certify actual human anatomy or approved images.

## Saved Hybrid — per-frame register

### Zevara (hybrid-zev) — 7 frames, male

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Check unique poses and return alias semantics.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση (Αρχή) | none | FAIL: empty prompt |
| 2 | Κίνηση 1 (Πίσω προβολή δεξιού ποδιού) | none | FAIL: empty prompt |
| 3 | Κίνηση 2 (Δυναμική άνοδος & μεταφορά δεξιού ποδιού) | none | FAIL: empty prompt |
| 4 | Κορύφωση (Μόνιμη στήριξη στο αριστερό με δεξί γόνατο ψηλά) | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 (Έναρξη καθόδου & μεταφορά δεξιού ποδιού πίσω) | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 (Πίσω προβολή επιστροφής δεξιού ποδιού) | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Vyxora (hybrid-vyx) — 7 frames, female

Blank prompts: 0; REUSE gaps: none; Notes: RIGHT-facing 45°/black mat specified; exact reverse aliases; image verification missing.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | High plank — RIGHT facing | none | PASS: source structure |
| 2 | Transition — LEFT hand anchored | none | PASS: source structure |
| 3 | Mid-Kick — LEFT leg extended halfway | none | PASS: source structure |
| 4 | Peak Hold — RIGHT facing, LEFT hand + RIGHT foot support | none | PASS: source structure |
| 5 | REUSE — Frame 3 | 3 | PASS: source structure |
| 6 | REUSE — Frame 2 | 2 | PASS: source structure |
| 7 | REUSE — Frame 1 | 1 | PASS: source structure |

### Qorix (hybrid-qor) — 7 frames, male

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Frame 3 returns to original shoulder rack before overhead press.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση (Αρχή) — Όρθιος με αλτήρες στους ώμους | none | FAIL: empty prompt |
| 2 | Κίνηση 1 — Ελεγχόμενο βαθύ κάθισμα | none | FAIL: empty prompt |
| 3 | Κίνηση 2 — Άνοδος σε όρθια στάση με αλτήρες στους ώμους | none | FAIL: empty prompt |
| 4 | Κορύφωση — Κατακόρυφη πίεση αλτήρων πάνω από το κεφάλι | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 — Ελεγχόμενο χαμήλωμα αλτήρων στους ώμους | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 — Δεύτερο ελεγχόμενο βαθύ κάθισμα | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Nexari (hybrid-nex) — 7 frames, female

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Check unique poses and return alias semantics.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση (Αρχή) — Όρθιος με αλτήρες στους μηρούς | none | FAIL: empty prompt |
| 2 | Κίνηση 1 — Κλίση από τα ισχία με ίσια πλάτη | none | FAIL: empty prompt |
| 3 | Κίνηση 2 — Κωπηλατική με αγκώνες πίσω | none | FAIL: empty prompt |
| 4 | Κορύφωση — Άνοιγμα χεριών σε σχήμα Τ | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 — Επιστροφή σε κωπηλατική θέση | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 — Κάθοδος χεριών με ίσια πλάτη | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Azyra (hybrid-azy) — 7 frames, male

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Check unique poses and return alias semantics.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Xulene (hybrid-xul) — 7 frames, female

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Dead bug alternates sides, midpoint repeats neutral position; check unilateral support.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Jaxori (hybrid-jax) — 7 frames, male

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Transition from pull-apart to external rotation changes arm plane; joint angle must be checked.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Ruvexa (hybrid-ruv) — 7 frames, female

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Alternating left-right lunge: midpoint repeats neutral position; do not infer simple symmetric reverse.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση (Αρχή) — Όρθιος κρατώντας τους ιμάντες TRX | none | FAIL: empty prompt |
| 2 | Κίνηση 1 — Πλάγια προβολή αριστερά | none | FAIL: empty prompt |
| 3 | Κίνηση 2 — Επιστροφή στο κέντρο | none | FAIL: empty prompt |
| 4 | Κορύφωση — Πλάγια προβολή δεξιά | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 — Επιστροφή στο κέντρο | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 — Πλάγια προβολή αριστερά | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Tykora (hybrid-tyk) — 7 frames, male

Blank prompts: 0; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Frames 5-6 lack stored alias; strict reuse must be verified and attached.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση — bear hover | none | PASS: source structure |
| 2 | Μεταφορά βάρους και άνοιγμα λεκάνης | none | PASS: source structure |
| 3 | Πέρασμα δεξιού ποδιού κάτω από τον κορμό | none | PASS: source structure |
| 4 | Κορύφωση — kick-through σε ανάστροφη στήριξη | none | PASS: source structure |
| 5 | Ελεγχόμενη επαναφορά του δεξιού ποδιού | none | FAIL: reverse alias |
| 6 | Επαναφορά στην αρχική bear hover | none | FAIL: reverse alias |
| 7 | Τελική θέση — ίδια ακριβώς με την αρχική | 1 | PASS: source structure |

### Bexali (hybrid-bex) — 7 frames, female

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Frame 3 returns to original incline plank before shoulder tap.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Daxune (hybrid-dax) — 7 frames, male

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Frame 3 is hands-forward reset before Frame 4 second pull.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Uzaro (hybrid-uza) — 7 frames, female

Blank prompts: 7; REUSE gaps: 5→3 (current none), 6→2 (current none); Notes: Frame 3 returns high before Frame 4 high hold; redundant pose possible.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Αρχική θέση | none | FAIL: empty prompt |
| 2 | Κίνηση 1 | none | FAIL: empty prompt |
| 3 | Κίνηση 2 | none | FAIL: empty prompt |
| 4 | Κορύφωση | none | FAIL: empty prompt |
| 5 | Επιστροφή 1 | none | FAIL: reverse alias |
| 6 | Επιστροφή 2 | none | FAIL: reverse alias |
| 7 | Τελική επαναφορά — ίδια με την αρχική θέση (επαναφορά στην αρχική θέση) | 1 | FAIL: empty prompt |

### Bear Hover Left-Leg Kick-Through (hybrid-tyk-left) — 7 frames, male

Blank prompts: 0; REUSE gaps: none; Notes: Phase 2 describes final extended kick before phase 3 transitional threading: order conflict.

| Frame | Label | Existing alias | Check |
|---:|---|---|---|
| 1 | Καρέ 1 — Αρχική θέση bear hover | none | PASS: source structure |
| 2 | Καρέ 2 — Πρώτη μεταβατική θέση | none | PASS: source structure |
| 3 | Καρέ 3 — Επόμενη μεταβατική θέση | none | PASS: source structure |
| 4 | Καρέ 4 — Τελική θέση της εξόδου | none | PASS: source structure |
| 5 | Καρέ 5 — Επιστροφή με το καρέ 3 | 3 | PASS: source structure |
| 6 | Καρέ 6 — Επιστροφή με το καρέ 2 | 2 | PASS: source structure |
| 7 | Καρέ 7 — Επιστροφή στην αρχική θέση | 1 | PASS: source structure |

## Generated 208 — individual exercise register

Each row is audited against its shared generator branch, without modifying its source-inferred slot count. Browser-rendered exercise-specific images have not been independently verified.

| # | ID | Name | Existing generator slots | Frame structure |
|---:|---|---|---:|---|
| 1 | sofia-original-001 | Reverse Lunge to Knee Drive + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 2 | sofia-original-002 | Reverse Lunge to Knee Drive + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 3 | sofia-original-003 | Reverse Lunge to Knee Drive + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 4 | sofia-original-004 | Reverse Lunge to Knee Drive + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 5 | sofia-original-005 | Reverse Lunge to Knee Drive + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 6 | sofia-original-006 | Reverse Lunge to Knee Drive + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 7 | sofia-original-007 | Reverse Lunge to Knee Drive + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 8 | sofia-original-008 | Reverse Lunge to Knee Drive + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 9 | sofia-original-009 | Reverse Lunge to Knee Drive + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 10 | sofia-original-010 | Reverse Lunge to Knee Drive + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 11 | sofia-original-011 | Reverse Lunge to Knee Drive + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 12 | sofia-original-012 | Reverse Lunge to Knee Drive + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 13 | sofia-original-013 | Lateral Lunge to Balance + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 14 | sofia-original-014 | Lateral Lunge to Balance + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 15 | sofia-original-015 | Lateral Lunge to Balance + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 16 | sofia-original-016 | Lateral Lunge to Balance + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 17 | sofia-original-017 | Lateral Lunge to Balance + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 18 | sofia-original-018 | Lateral Lunge to Balance + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 19 | sofia-original-019 | Lateral Lunge to Balance + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 20 | sofia-original-020 | Lateral Lunge to Balance + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 21 | sofia-original-021 | Lateral Lunge to Balance + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 22 | sofia-original-022 | Lateral Lunge to Balance + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 23 | sofia-original-023 | Lateral Lunge to Balance + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 24 | sofia-original-024 | Lateral Lunge to Balance + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 25 | sofia-original-025 | Split Squat to Controlled March + Band Anti-Rotation Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 26 | sofia-original-026 | Split Squat to Controlled March + Band Diagonal Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 27 | sofia-original-027 | Split Squat to Controlled March + Band High-to-Low Pull | 5 | CRITICAL: generic squat branch overrides combined motion |
| 28 | sofia-original-028 | Split Squat to Controlled March + Dumbbell Neutral-Grip Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 29 | sofia-original-029 | Split Squat to Controlled March + Dumbbell Suitcase Carry Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 30 | sofia-original-030 | Split Squat to Controlled March + Dumbbell Front Rack Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 31 | sofia-original-031 | Split Squat to Controlled March + Kettlebell Goblet Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 32 | sofia-original-032 | Split Squat to Controlled March + Kettlebell Suitcase Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 33 | sofia-original-033 | Split Squat to Controlled March + Medicine Ball Forward Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 34 | sofia-original-034 | Split Squat to Controlled March + Medicine Ball Diagonal Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 35 | sofia-original-035 | Split Squat to Controlled March + Cable Anti-Rotation Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 36 | sofia-original-036 | Split Squat to Controlled March + Bodyweight Cross-Body Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 37 | sofia-original-037 | Cossack Squat to Rise + Band Anti-Rotation Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 38 | sofia-original-038 | Cossack Squat to Rise + Band Diagonal Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 39 | sofia-original-039 | Cossack Squat to Rise + Band High-to-Low Pull | 5 | CRITICAL: generic squat branch overrides combined motion |
| 40 | sofia-original-040 | Cossack Squat to Rise + Dumbbell Neutral-Grip Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 41 | sofia-original-041 | Cossack Squat to Rise + Dumbbell Suitcase Carry Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 42 | sofia-original-042 | Cossack Squat to Rise + Dumbbell Front Rack Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 43 | sofia-original-043 | Cossack Squat to Rise + Kettlebell Goblet Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 44 | sofia-original-044 | Cossack Squat to Rise + Kettlebell Suitcase Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 45 | sofia-original-045 | Cossack Squat to Rise + Medicine Ball Forward Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 46 | sofia-original-046 | Cossack Squat to Rise + Medicine Ball Diagonal Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 47 | sofia-original-047 | Cossack Squat to Rise + Cable Anti-Rotation Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 48 | sofia-original-048 | Cossack Squat to Rise + Bodyweight Cross-Body Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 49 | sofia-original-049 | Hip Hinge to Single-Leg Balance + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 50 | sofia-original-050 | Hip Hinge to Single-Leg Balance + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 51 | sofia-original-051 | Hip Hinge to Single-Leg Balance + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 52 | sofia-original-052 | Hip Hinge to Single-Leg Balance + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 53 | sofia-original-053 | Hip Hinge to Single-Leg Balance + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 54 | sofia-original-054 | Hip Hinge to Single-Leg Balance + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 55 | sofia-original-055 | Hip Hinge to Single-Leg Balance + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 56 | sofia-original-056 | Hip Hinge to Single-Leg Balance + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 57 | sofia-original-057 | Hip Hinge to Single-Leg Balance + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 58 | sofia-original-058 | Hip Hinge to Single-Leg Balance + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 59 | sofia-original-059 | Hip Hinge to Single-Leg Balance + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 60 | sofia-original-060 | Hip Hinge to Single-Leg Balance + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 61 | sofia-original-061 | Diagonal Step-Back to Stand + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 62 | sofia-original-062 | Diagonal Step-Back to Stand + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 63 | sofia-original-063 | Diagonal Step-Back to Stand + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 64 | sofia-original-064 | Diagonal Step-Back to Stand + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 65 | sofia-original-065 | Diagonal Step-Back to Stand + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 66 | sofia-original-066 | Diagonal Step-Back to Stand + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 67 | sofia-original-067 | Diagonal Step-Back to Stand + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 68 | sofia-original-068 | Diagonal Step-Back to Stand + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 69 | sofia-original-069 | Diagonal Step-Back to Stand + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 70 | sofia-original-070 | Diagonal Step-Back to Stand + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 71 | sofia-original-071 | Diagonal Step-Back to Stand + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 72 | sofia-original-072 | Diagonal Step-Back to Stand + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 73 | sofia-original-073 | Side Step to Squat Rise + Band Anti-Rotation Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 74 | sofia-original-074 | Side Step to Squat Rise + Band Diagonal Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 75 | sofia-original-075 | Side Step to Squat Rise + Band High-to-Low Pull | 5 | CRITICAL: generic squat branch overrides combined motion |
| 76 | sofia-original-076 | Side Step to Squat Rise + Dumbbell Neutral-Grip Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 77 | sofia-original-077 | Side Step to Squat Rise + Dumbbell Suitcase Carry Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 78 | sofia-original-078 | Side Step to Squat Rise + Dumbbell Front Rack Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 79 | sofia-original-079 | Side Step to Squat Rise + Kettlebell Goblet Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 80 | sofia-original-080 | Side Step to Squat Rise + Kettlebell Suitcase Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 81 | sofia-original-081 | Side Step to Squat Rise + Medicine Ball Forward Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 82 | sofia-original-082 | Side Step to Squat Rise + Medicine Ball Diagonal Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 83 | sofia-original-083 | Side Step to Squat Rise + Cable Anti-Rotation Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 84 | sofia-original-084 | Side Step to Squat Rise + Bodyweight Cross-Body Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 85 | sofia-original-085 | Step-Up to Balance Hold + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 86 | sofia-original-086 | Step-Up to Balance Hold + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 87 | sofia-original-087 | Step-Up to Balance Hold + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 88 | sofia-original-088 | Step-Up to Balance Hold + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 89 | sofia-original-089 | Step-Up to Balance Hold + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 90 | sofia-original-090 | Step-Up to Balance Hold + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 91 | sofia-original-091 | Step-Up to Balance Hold + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 92 | sofia-original-092 | Step-Up to Balance Hold + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 93 | sofia-original-093 | Step-Up to Balance Hold + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 94 | sofia-original-094 | Step-Up to Balance Hold + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 95 | sofia-original-095 | Step-Up to Balance Hold + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 96 | sofia-original-096 | Step-Up to Balance Hold + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 97 | sofia-original-097 | Single-Leg Hinge to Reverse Step + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 98 | sofia-original-098 | Single-Leg Hinge to Reverse Step + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 99 | sofia-original-099 | Single-Leg Hinge to Reverse Step + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 100 | sofia-original-100 | Single-Leg Hinge to Reverse Step + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 101 | sofia-original-101 | Single-Leg Hinge to Reverse Step + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 102 | sofia-original-102 | Single-Leg Hinge to Reverse Step + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 103 | sofia-original-103 | Single-Leg Hinge to Reverse Step + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 104 | sofia-original-104 | Single-Leg Hinge to Reverse Step + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 105 | sofia-original-105 | Single-Leg Hinge to Reverse Step + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 106 | sofia-original-106 | Single-Leg Hinge to Reverse Step + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 107 | sofia-original-107 | Single-Leg Hinge to Reverse Step + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 108 | sofia-original-108 | Single-Leg Hinge to Reverse Step + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 109 | sofia-original-109 | Sled March to Reset + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 110 | sofia-original-110 | Sled March to Reset + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 111 | sofia-original-111 | Sled March to Reset + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 112 | sofia-original-112 | Sled March to Reset + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 113 | sofia-original-113 | Sled March to Reset + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 114 | sofia-original-114 | Sled March to Reset + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 115 | sofia-original-115 | Sled March to Reset + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 116 | sofia-original-116 | Sled March to Reset + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 117 | sofia-original-117 | Sled March to Reset + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 118 | sofia-original-118 | Sled March to Reset + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 119 | sofia-original-119 | Sled March to Reset + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 120 | sofia-original-120 | Sled March to Reset + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 121 | sofia-original-121 | Low Lunge to Standing Rotation + Band Anti-Rotation Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 122 | sofia-original-122 | Low Lunge to Standing Rotation + Band Diagonal Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 123 | sofia-original-123 | Low Lunge to Standing Rotation + Band High-to-Low Pull | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 124 | sofia-original-124 | Low Lunge to Standing Rotation + Dumbbell Neutral-Grip Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 125 | sofia-original-125 | Low Lunge to Standing Rotation + Dumbbell Suitcase Carry Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 126 | sofia-original-126 | Low Lunge to Standing Rotation + Dumbbell Front Rack Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 127 | sofia-original-127 | Low Lunge to Standing Rotation + Kettlebell Goblet Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 128 | sofia-original-128 | Low Lunge to Standing Rotation + Kettlebell Suitcase Hold | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 129 | sofia-original-129 | Low Lunge to Standing Rotation + Medicine Ball Forward Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 130 | sofia-original-130 | Low Lunge to Standing Rotation + Medicine Ball Diagonal Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 131 | sofia-original-131 | Low Lunge to Standing Rotation + Cable Anti-Rotation Press | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 132 | sofia-original-132 | Low Lunge to Standing Rotation + Bodyweight Cross-Body Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 133 | sofia-original-133 | Squat to Lateral Step Hold + Band Anti-Rotation Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 134 | sofia-original-134 | Squat to Lateral Step Hold + Band Diagonal Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 135 | sofia-original-135 | Squat to Lateral Step Hold + Band High-to-Low Pull | 5 | CRITICAL: generic squat branch overrides combined motion |
| 136 | sofia-original-136 | Squat to Lateral Step Hold + Dumbbell Neutral-Grip Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 137 | sofia-original-137 | Squat to Lateral Step Hold + Dumbbell Suitcase Carry Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 138 | sofia-original-138 | Squat to Lateral Step Hold + Dumbbell Front Rack Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 139 | sofia-original-139 | Squat to Lateral Step Hold + Kettlebell Goblet Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 140 | sofia-original-140 | Squat to Lateral Step Hold + Kettlebell Suitcase Hold | 5 | CRITICAL: generic squat branch overrides combined motion |
| 141 | sofia-original-141 | Squat to Lateral Step Hold + Medicine Ball Forward Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 142 | sofia-original-142 | Squat to Lateral Step Hold + Medicine Ball Diagonal Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 143 | sofia-original-143 | Squat to Lateral Step Hold + Cable Anti-Rotation Press | 5 | CRITICAL: generic squat branch overrides combined motion |
| 144 | sofia-original-144 | Squat to Lateral Step Hold + Bodyweight Cross-Body Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 145 | sofia-original-145 | Bear Crawl to Kneeling Reach + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 146 | sofia-original-146 | Bear Crawl to Kneeling Reach + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 147 | sofia-original-147 | Bear Crawl to Kneeling Reach + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 148 | sofia-original-148 | Bear Crawl to Kneeling Reach + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 149 | sofia-original-149 | Bear Crawl to Kneeling Reach + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 150 | sofia-original-150 | Bear Crawl to Kneeling Reach + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 151 | sofia-original-151 | Bear Crawl to Kneeling Reach + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 152 | sofia-original-152 | Bear Crawl to Kneeling Reach + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 153 | sofia-original-153 | Plank Walkout to Shoulder Tap + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 154 | sofia-original-154 | Plank Walkout to Shoulder Tap + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 155 | sofia-original-155 | Plank Walkout to Shoulder Tap + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 156 | sofia-original-156 | Plank Walkout to Shoulder Tap + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 157 | sofia-original-157 | Plank Walkout to Shoulder Tap + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 158 | sofia-original-158 | Plank Walkout to Shoulder Tap + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 159 | sofia-original-159 | Plank Walkout to Shoulder Tap + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 160 | sofia-original-160 | Plank Walkout to Shoulder Tap + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 161 | sofia-original-161 | Crab Walk to Hip Bridge + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 162 | sofia-original-162 | Crab Walk to Hip Bridge + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 163 | sofia-original-163 | Crab Walk to Hip Bridge + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 164 | sofia-original-164 | Crab Walk to Hip Bridge + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 165 | sofia-original-165 | Crab Walk to Hip Bridge + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 166 | sofia-original-166 | Crab Walk to Hip Bridge + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 167 | sofia-original-167 | Crab Walk to Hip Bridge + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 168 | sofia-original-168 | Crab Walk to Hip Bridge + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 169 | sofia-original-169 | Half-Kneeling Rotation to Stand + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 170 | sofia-original-170 | Half-Kneeling Rotation to Stand + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 171 | sofia-original-171 | Half-Kneeling Rotation to Stand + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 172 | sofia-original-172 | Half-Kneeling Rotation to Stand + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 173 | sofia-original-173 | Half-Kneeling Rotation to Stand + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 174 | sofia-original-174 | Half-Kneeling Rotation to Stand + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 175 | sofia-original-175 | Half-Kneeling Rotation to Stand + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 176 | sofia-original-176 | Half-Kneeling Rotation to Stand + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 177 | sofia-original-177 | Quadruped Reach to Beast Hold + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 178 | sofia-original-178 | Quadruped Reach to Beast Hold + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 179 | sofia-original-179 | Quadruped Reach to Beast Hold + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 180 | sofia-original-180 | Quadruped Reach to Beast Hold + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 181 | sofia-original-181 | Quadruped Reach to Beast Hold + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 182 | sofia-original-182 | Quadruped Reach to Beast Hold + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 183 | sofia-original-183 | Quadruped Reach to Beast Hold + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 184 | sofia-original-184 | Quadruped Reach to Beast Hold + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 185 | sofia-original-185 | Side Plank to Bear Reset + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 186 | sofia-original-186 | Side Plank to Bear Reset + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 187 | sofia-original-187 | Side Plank to Bear Reset + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 188 | sofia-original-188 | Side Plank to Bear Reset + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 189 | sofia-original-189 | Side Plank to Bear Reset + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 190 | sofia-original-190 | Side Plank to Bear Reset + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 191 | sofia-original-191 | Side Plank to Bear Reset + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 192 | sofia-original-192 | Side Plank to Bear Reset + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 193 | sofia-original-193 | Low Squat to Walkout + Opposite Reach | 5 | CRITICAL: generic squat branch overrides combined motion |
| 194 | sofia-original-194 | Low Squat to Walkout + Shoulder Tap | 5 | CRITICAL: generic squat branch overrides combined motion |
| 195 | sofia-original-195 | Low Squat to Walkout + Thoracic Open | 5 | CRITICAL: generic squat branch overrides combined motion |
| 196 | sofia-original-196 | Low Squat to Walkout + Balance Pause | 5 | CRITICAL: generic squat branch overrides combined motion |
| 197 | sofia-original-197 | Low Squat to Walkout + Diagonal Arm Sweep | 5 | CRITICAL: generic squat branch overrides combined motion |
| 198 | sofia-original-198 | Low Squat to Walkout + Slow Reverse Transition | 5 | CRITICAL: generic squat branch overrides combined motion |
| 199 | sofia-original-199 | Low Squat to Walkout + Contralateral Lift | 5 | CRITICAL: generic squat branch overrides combined motion |
| 200 | sofia-original-200 | Low Squat to Walkout + Controlled Reach Reset | 5 | CRITICAL: generic squat branch overrides combined motion |
| 201 | sofia-original-201 | Kneeling Get-Up to Lateral Step + Opposite Reach | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 202 | sofia-original-202 | Kneeling Get-Up to Lateral Step + Shoulder Tap | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 203 | sofia-original-203 | Kneeling Get-Up to Lateral Step + Thoracic Open | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 204 | sofia-original-204 | Kneeling Get-Up to Lateral Step + Balance Pause | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 205 | sofia-original-205 | Kneeling Get-Up to Lateral Step + Diagonal Arm Sweep | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 206 | sofia-original-206 | Kneeling Get-Up to Lateral Step + Slow Reverse Transition | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 207 | sofia-original-207 | Kneeling Get-Up to Lateral Step + Contralateral Lift | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |
| 208 | sofia-original-208 | Kneeling Get-Up to Lateral Step + Controlled Reach Reset | 9 | WARNING: all exercise instructions repeated per frame; generic joint-phase coach |

## Non-mutating conclusion

**FAIL** for approval to generate all exercise photos as-is. **PASS** for retaining original frame counts and slot ordering during this audit.

Priority checks: missing stored return aliases in 11 Hybrid, inverted left-kick order, bilateral middle-phase semantics for Xulene/Ruvexa, and combined-movement loss in 56 keyword-triggered squats. No code or exercise data has been edited.
