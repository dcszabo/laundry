# Laundry Science Research

Context: Soft-water UK household (~19 mg/L), front-loader washing machine, primary detergents liquid/powder/pods. Research completed 2026-02-22. All temperatures in degrees Celsius.

---

## Washing Machine Model — WH1060P4 Front-Loader

The app is calibrated for a **front-loading washing machine** (horizontal drum axis). All cycle temperatures, capacities, and dose guidance assume front-loader mechanics. The specific household machine referenced in research is the **WH1060P4** (or equivalent 10 kg front-loader with Euro/UK cycle set).

### Front-Loader vs Top-Loader: Detergent Implications

| Factor | Front-Loader | Top-Loader |
|--------|-------------|------------|
| Water usage | Low (15–40 L per cycle) | High (100–150 L) |
| Drum action | Tumble (gravity-assisted) | Agitator or impeller |
| Detergent contact time | High — low water concentrates surfactant | Low — surfactant diluted in large bath |
| HE detergent required? | Yes (low-suds formulation) | No |
| Soft-water dose reduction | ~25–30% vs. label | ~20–25% vs. label |

Front-loaders require High-Efficiency (HE / low-suds) detergent. Standard top-loader detergents produce excess foam in front-loaders, which insulates the drum, reduces mechanical cleaning action, and can trigger automatic rinse extensions that waste water and energy. All UK liquid and powder detergents sold since ~2010 are HE-compatible by default.

### Drum Capacity by Cycle (WH1060P4 reference)

| Cycle | Rated Capacity | Notes |
|-------|----------------|-------|
| Cottons | 10 kg | Full drum; high agitation |
| Everyday / Synthetics | 10 kg | Medium agitation; suitable for mixed fabrics |
| Heavy | 10 kg | Extended soak + agitation |
| Delicates | 4 kg | Minimal agitation; low spin (400–800 RPM) |
| Wool | 3 kg rated / 2 kg recommended | Near-zero agitation; horizontal oscillation only. 2 kg recommended max for safe wool washing. App uses 3 kg as the cycle capacity limit (so the Small/3 kg size button remains available) and displays 2 kg as the recommended max in the Wool preset card. |
| Quick | 4 kg | Short cycle; light soiling only |
| Bulky | 10 kg | Low agitation; measured in items (1–2 duvets), not kg |
| Easy Iron | 10 kg | Reduced spin to minimise creasing |

### Spin Speed Reference

| Cycle | Spin Speed |
|-------|-----------|
| Cottons | 1000–1400 RPM |
| Everyday | 800–1200 RPM |
| Delicates | 400–800 RPM |
| Wool | 400–600 RPM |
| Bulky | 600–800 RPM (too-high spin tangles/damages duvets) |

### Front-Loader Mechanical Cleaning

Front-loaders clean via **repeated lifting and dropping** of laundry (tumble action). Water enters the drum to a relatively shallow level; the rotating drum lifts clothes to the top and lets them fall back through the water. This mechanical action is:
- More aggressive than soaking (good for cottons, poor for delicates)
- Reduced to near-zero in Wool cycle (horizontal oscillation only — prevents felting)
- The reason agitation damages silk, fine wool, and elastane — these require low-agitation cycles

---

## Dosage Calculation Model

The app uses a deterministic dosage model: base dose × temperature modifier × concentration factor × detergent multiplier, rounded to the nearest 5 mL.

### Base Dose Table (`dosageData`)

Base doses (mL) for soft water, front-loader, liquid detergent at 100% concentration:

| Load Size | Light Soil | Normal Soil | Heavy Soil |
|-----------|-----------|-------------|------------|
| Small (≤3 kg) | 10 mL | 15 mL | 20 mL |
| Medium (≤6 kg) | 15 mL | 20 mL | 25 mL |
| Large (≤10 kg) | 20 mL | 25 mL | 35 mL |

These values represent approximately 25–30% of the manufacturer label dose, adjusted for soft water (~19 mg/L). The scientific basis: in soft water, surfactant molecules are not consumed by forming calcium/magnesium soaps (hard-water scum), so effective surfactant concentration is maintained at a lower total dose.

### Temperature Modifier

Temperature affects detergent efficacy through enzyme kinetics:

| Temperature | Modifier | Scientific Basis |
|-------------|----------|-----------------|
| ≤20°C (cold) | ×1.12 | Enzyme activity near zero; surfactants less effective; more chemical agent needed to compensate |
| 30–40°C | ×1.00 | Enzyme optimum range (protease, amylase, lipase active); baseline dose |
| ≥60°C | ×0.90 | Thermal denaturation of proteins substitutes for enzyme action; mechanical and thermal cleaning reduce required chemical load |

The modifier is applied to the base dose before rounding. The ×1.12 at cold temperatures reflects the real-world guidance that users should add extra detergent when washing at low temperatures — this is especially relevant for body-contact textiles (underwear, towels) where bio enzyme activity is the primary hygiene mechanism.

### Detergent Type Multiplier

| Type | Multiplier | Notes |
|------|-----------|-------|
| Liquid | ×1.00 | Reference; fully dissolves at all temperatures including 30°C |
| Powder | ×0.90 | Marginally higher active surfactant concentration per gram in most UK formulations; also contains bleach precursors (TAED + sodium percarbonate) which add cleaning power without increasing dose |
| Pods | N/A | Bypass the dose model entirely; fixed count: 1 pod for small/medium, 2 pods for large/heavy |

### Concentration Factor

User-adjustable slider (0.7–1.3×). Intended to compensate for detergent concentration variations:
- **Below 1.0 (e.g. 0.7×)**: Ultra-concentrated detergents (e.g. 3× concentrate) where label dose is already very small — user reduces further for soft water
- **1.0**: Standard concentration (default)
- **Above 1.0 (e.g. 1.3×)**: Diluted or budget detergents with lower active ingredient content

### Rounding

All final doses are rounded to the nearest 5 mL via `roundToFive(n)`. This is a UX decision — it produces values that are meaningful on a measuring cap (most caps have 5 mL graduations). Rounding introduces at most ±2.5 mL error (≤10% on a typical 25 mL dose).

### Soft Water Context

Soft water (~19 mg/L total dissolved solids, predominantly sodium and potassium ions with minimal calcium/magnesium) interacts with detergent differently from hard water (~200–400 mg/L in SE England):

- **No calcium soap formation**: In hard water, Ca²⁺ and Mg²⁺ ions react with soap/surfactant molecules to form insoluble calcium stearate (scum), consuming surfactant before it can act on soil. This does not occur in soft water.
- **Lower critical micelle concentration (CMC)**: In soft water, surfactant molecules form cleaning micelles at lower concentrations, so less surfactant is needed to achieve the same soil-removal efficiency.
- **Residue risk**: Over-dosing in soft water leaves surfactant and builder residue on fabric (stiff towels, musty odour from trapped moisture). This is a greater risk than under-dosing.
- **Net effect**: The dosage table uses approximately 25–30% of the manufacturer label dose, consistent with guidance from Which?, In the Wash, and Persil UK for soft-water regions.

---

## Methodology

Each load type was researched using web search against UK sources (Which?, NHS, Persil UK, Woolmark, CDA Appliances, In the Wash, Ariel UK, and others). Guidance reflects the scientific consensus and mainstream UK recommendation, not manufacturer marketing.

---

## Key Findings

### Temperature Matrix (Load Type × Colour)

| Load Type  | Whites | Lights | Colours | Darks | Mixed |
|------------|--------|--------|---------|-------|-------|
| Everyday   | 60°C   | 40°C   | 30°C    | 30°C  | 30°C  |
| Towels     | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Bedding    | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Underwear  | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Delicates  | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Wool       | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Activewear | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Jeans      | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |

Notes: Everyday whites set to 60°C (default) — whites benefit from 60°C for brightness maintenance and thorough cleaning even without heavy soiling. Underwear whites: 60°C for pure cotton only; 40°C for synthetic-mix to protect elastic.

> Confirmed by science research agent. Sources: NHS, Which?, Woolmark, Persil UK, In the Wash, Heritage Park Laundry, CDA Appliances.

---

### Temperature Floor / Ceiling by Load Type

Temperature is derived from **Load Type + Colour**, not colour alone. Each Load Type has either a floor (hygiene-critical) or a ceiling (fabric-damage risk).

| Load Type  | Floor | Ceiling | Rationale |
|------------|-------|---------|-----------|
| Everyday   | None  | 60°C (cotton only) | Standard colour logic applies. No hygiene override needed for regular clothing. |
| Towels     | 40°C  | 90°C white cotton (rarely needed) | Body-contact textile. 30°C insufficient for hygiene regardless of colour. |
| Bedding    | 40°C; 60°C for whites/lights | 60°C for blended fabrics; 90°C white cotton only | Same hygiene rationale as towels. NHS recommends 60°C for white bedding. Dust mites begin dying above ~55°C. |
| Underwear  | 40°C  | 40°C synthetic; 60°C pure cotton | Hygiene-critical. Heat above 40°C degrades elastic. |
| Delicates  | None (cold fine) | 30°C — fabric integrity ceiling | Silk, lace, lingerie — high heat destroys fabric. |
| Wool       | None (cold fine) | 30°C recommended; 40°C absolute max | Felting/shrinkage above 40°C. Wool cycle only. |
| Activewear | None (cold fine) | 30°C — elastane/wicking ceiling | Synthetic fibres degrade; elastane loses stretch; wicking channels damaged. |
| Jeans      | None  | 40°C absolute max; 30°C strongly preferred | Dye preservation and stretch (elastane) — cold wash preferred. |

---

### Critical Detergent Findings (Bio vs. Non-Bio)

**Key cross-cutting principles:**
- **Bio** contains enzymes (protease, amylase, lipase) that break down protein/starch/fat stains. Works well at 30–40°C. Suitable for most cotton, synthetics, mixed loads.
- **Non-bio** contains no enzymes. Safer for protein-based fibres (wool, silk) — enzymes cannot distinguish between a grass-stain protein and a wool-fibre protein, and will digest both over repeated washes.
- UK-specific: non-bio is widely recommended for sensitive skin and baby clothes (less irritating), though evidence for skin benefit is contested.

| Load Type  | Bio or Non-Bio | Format Preference |
|------------|----------------|-------------------|
| Everyday   | Bio | Liquid (30°C) or powder (40°C+) |
| Towels     | Bio | Powder preferred (whitening agents) |
| Bedding    | Bio (powder for whites) | Powder (whites), liquid (colours) |
| Underwear  | Bio | Liquid or powder |
| Delicates  | Non-bio ONLY | Specialist delicates liquid |
| Wool       | Non-bio ONLY | Specialist wool liquid |
| Activewear | Bio | Liquid (dissolves at 30°C) or sports detergent |
| Jeans      | Bio | Liquid; use colour-protect for dark denim |

**Critical rules:**
- **Bio NEVER on:** Delicates (silk, lace), Wool, Cashmere — bio protease enzymes digest protein fibres (fibroin, keratin) causing invisible progressive damage leading to holes.
- **Bio ESSENTIAL for:** Underwear, Towels, Bedding — enzyme action is the primary hygiene mechanism at 40°C.
- **Non-bio required for:** Delicates (liquid), Wool (Woolmark-approved liquid).

---

### Softener Contraindications

- **NEVER use fabric softener on:** Towels (silicone PDMS coats terry fibres → destroys absorbency), Activewear (clogs wicking pores → permanent odour), Wool (disrupts fibre structure), Silk (strips sheen), Delicates (lace loses crispness and distorts pattern).
- Safe to use on: Everyday cotton. Bedding (use with caution; avoid on pillowcases contacting skin directly).

---

### Cycle Corrections (vs. Current App)

| Load Type  | Current App | Correct (research-confirmed) |
|------------|-------------|------------------------------|
| Jeans      | Everyday Cold | **Delicate/Gentle** — lower agitation preserves indigo-dye bond to cotton fibres. Cottons/Everyday cause abrasion that accelerates fading. |
| Activewear | Everyday Cold | **Synthetics at 30°C** — no dedicated Sports cycle on WH1060P4. Avoid Cottons (excessive agitation destroys wicking). |

---

### NHS Hygiene Standard (confirmed)

Underwear, towels, and household linen: **60°C, OR 40°C with a bio (bleach-based) detergent**. This is the hygiene floor for body-contact textiles — 30°C is insufficient regardless of colour.

---

### App Conflict: Preset vs. Calculator Temperature

When a user selects the **Towels** preset and then changes the colour selector:
- The preset tip still says "60°C keeps towels hygienic and fresh"
- But the calculator's temperature output changes to 30°C (colours/darks)
- This is a **contradiction** — the tip and the dose/temp result disagree

**Correct behaviour (per science):**
- Towels (any colour) should have a temperature floor of 40°C
- White towels should be 60°C
- Coloured/dark towels should be 40°C (not 30°C)
- Tips should reflect the actual recommended temp for that colour+preset combination

**Broader pattern:** This conflict exists because temperatures are currently derived solely from colour group, with no consideration for fabric type or use-case (body-contact textile vs. clothing). Towels, bedding, and underwear are hygiene-critical items that warrant higher minimums than clothing of the same colour. One approach: presets (or load types applied to specific fabric categories) define a temperature floor that overrides the colour default when it would produce a lower value.

---

### Soft Water Context

Soft water (~19 mg/L) requires 25–50% less detergent than the label dose. The reduced mineral content means surfactants lather more aggressively and rinse more cleanly, so over-dosing causes residue, musty odour, and stiff towels. All dose guidance in this app already reflects this adjustment.

---

## Per-Load-Type Detail

### Load Type 1 — Everyday

Mixed cotton casualwear: t-shirts, shirts, chinos, casual trousers.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 40°C (60°C if heavily soiled) | 40°C with bio removes most stains; 60°C for stubborn staining or hygiene wash |
| Lights | 40°C | Standard; bio detergent effective |
| Colours | 30–40°C | 30°C preserves colour vibrancy and reduces dye bleed risk |
| Darks | 30°C | Lower temp reduces dye loss from open fibres |
| Mixed | 30°C | Limit of the most delicate colour present |

**Temperature floor:** None for casual cotton — hygiene not typically a concern.
**Temperature ceiling:** 60°C is the practical ceiling for cotton casualwear; higher risks shrinkage.

**Recommended cycle:** Cotton programme (high agitation, 1000–1400 RPM spin). Use synthetics/easy-care if the load contains elastane or jersey fabrics.

**Fabric softener:** Optional. Acceptable for cotton casualwear; adds softness. Avoid on items with moisture-wicking properties.

**Detergent notes:**
- Bio liquid or bio powder both suitable.
- Powder is marginally better for whites (optical brighteners, oxygen bleach agents in many UK powders).
- Liquid is easier at 30°C where powder may not fully dissolve.
- Soft water: reduce dose by ~30% vs. label.

**Sources:** [Which? Temperature Guide](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d) | [Persil UK](https://www.persil.com/uk/laundry/laundry-tips/washing-tips/temperature-use-wash-clothes-towels.html) | [In the Wash](https://inthewash.co.uk/laundry-and-ironing/what-temperature-should-you-wash-clothes-at/) | [CDA Appliances](https://www.cda.co.uk/laundry/washing-machine-temperature-guide/)

---

### Load Type 2 — Towels

Cotton bath towels, hand towels, face cloths.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 60°C | Kills bacteria, removes yellowing, maintains brightness |
| Lights | 60°C | Hygiene benefit outweighs minor fade risk at this temp |
| Colours | 40°C | 40°C + bio detergent meets NHS hygiene threshold; 60°C risks fading |
| Darks | 40°C | Higher temps accelerate dye loss in dark terry cotton |
| Mixed | 40°C | Governed by the darkest/most colour-sensitive item present |

**Temperature floor:** 40°C minimum (NHS: 60°C or 40°C with bio bleach-based product). Towels accumulate bacteria, dead skin cells, and mould spores — cold washing is insufficient for hygiene.
**Temperature ceiling:** 90°C is safe for white cotton but rarely necessary and energy-intensive; 60°C achieves 99.9% bacterial kill.

**Recommended cycle:** Cotton programme. Full wash, not quick wash — towels are dense and need adequate agitation time and rinsing.

**Fabric softener:** DO NOT USE. Fabric softener (PDMS silicone oil) coats cotton terry fibres, permanently reducing absorbency. Buildup accumulates over washes and cannot be easily reversed. Use white vinegar in the rinse compartment instead (1–2 tbsp) to soften without coating fibres.

**Detergent notes:**
- Bio powder preferred — contains oxygen bleach precursors that whiten and deodorise.
- Bio liquid also effective with a pre-soak for heavy odour.
- Do not use non-bio: enzyme action is beneficial for breaking down body oils and proteins in towel fibres.

**Sources:** [Which? Temperature Guide](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d) | [Happy Home Shop](https://happyhomeshop.co.uk/blogs/inspiration/how-hot-to-wash-towels) | [Fine Cotton Company](https://www.thefinecottoncompany.com/blogs/bedroom-styling/tips-for-washing-towels-whilst-keeping-them-soft-and-fluffy) | [Mira Showers Guide](https://www.mirashowers.co.uk/blog/how-to/the-ultimate-guide-to-washing-your-towels) | [NHS via Which?](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d)

---

### Load Type 3 — Bedding

Cotton sheets, pillowcases, duvet covers.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 60°C | Kills dust mites, bacteria; maintains whiteness |
| Lights | 60°C | Hygiene priority; pale colours tolerate 60°C well |
| Colours | 40°C | 40°C + bio meets hygiene needs; 60°C risks fading in coloured cotton |
| Darks | 40°C | 60°C accelerates dye loss in dark bedding |
| Mixed | 40°C | Governed by the most colour-sensitive item |

**Temperature floor:** 60°C for whites/lights (NHS-aligned). For colours: 40°C minimum. Studies confirm dust mites (Dermatophagoides sp.) begin dying above ~55°C; a full 60°C cycle achieves near-complete elimination. A 40°C wash removes allergens physically but does not reliably kill live mites.
**Temperature ceiling:** 90°C is safe for white cotton bedding but rarely warranted. Avoid for polyester-cotton blends — 60°C is the ceiling for blends.

**Recommended cycle:** Cotton programme. Use a long wash (90+ min) to allow full water penetration into dense cotton weaves. Avoid quick wash — sheets need thorough agitation and rinsing.

**Fabric softener:** Avoid on pillowcases and sheet material that contacts skin directly — softener residue can aggravate sensitive skin and reduces moisture regulation of the fabric. Skip or use sparingly on duvet covers.

**Detergent notes:**
- Bio powder or bio liquid both effective.
- Bio powder has slight edge for whites due to bleaching agents.
- Non-bio adequate if using 60°C (thermal cleaning compensates for enzyme absence).

**Sources:** [King of Cotton](https://www.kingofcotton.com/blogs/advice/at-what-temperatures-should-you-wash-your-bedding) | [Cotton House](https://cottonhouse.com/what-temperature-should-bedding-be-washed-at/) | [BugWise Pest Control](https://bugwisepestcontrol.co.uk/what-temperature-wash-to-kill-dust-mites/) | [Allure Clinic](https://allureclinic.co.uk/winter-laundry-mistakes/) | [My Unique Home](https://www.myuniquehome.co.uk/wash-bedding-without-compromising-colours/) | [In the Wash Bedding Guide](https://inthewash.co.uk/laundry-and-ironing/what-temperature-should-you-wash-bedding-at/)

---

### Load Type 4 — Underwear

Cotton and synthetic-mix underwear, briefs, boxers, socks.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 60°C (cotton) / 40°C (synthetic) | Pure white cotton: 60°C meets NHS hygiene floor. Synthetic-mix: 40°C max to protect elastic |
| Lights | 40–60°C | Fabric-dependent; check label |
| Colours | 40°C | NHS: 40°C + bio is the acceptable hygiene alternative to 60°C |
| Darks | 40°C | Protects colour; bio detergent provides hygiene |
| Mixed | 40°C | Governed by synthetic content and darkest colour |

**Temperature floor:** 40°C minimum (NHS guidance: 60°C, or 40°C with bio bleach-based detergent). Underwear is the single highest-risk laundry category for faecal bacteria transfer.
**Temperature ceiling:** 40°C for synthetics and elastane-containing underwear — heat above 40°C degrades elastic fibres and accelerates loss of shape. 60°C only safe for 100% cotton items confirmed by label.

**Recommended cycle:** Cotton programme for all-cotton items. Synthetics or delicates programme for synthetic-mix or elastane-containing items (lower spin, lower agitation).

**Fabric softener:** Avoid on synthetic underwear (degrades moisture-wicking, traps bacteria). Optional on 100% cotton underwear.

**Detergent notes:**
- Bio detergent strongly recommended — enzyme action on proteins is critical for hygiene in this category.
- NHS specifically references "bio washing powder" as the bleach-equivalent alternative to 60°C.
- Non-bio is acceptable at 60°C only.

**Sources:** [In the Wash](https://inthewash.co.uk/laundry-and-ironing/what-temperature-to-wash-underwear/) | [Persil UK Underwear Guide](https://www.persil.com/uk/laundry/laundry-tips/fabrics/keep-your-familys-undies-clean-with-this-guide-on-how-to-wash-underwear.html) | [Check Appliance](https://checkappliance.co.uk/what-temperature-do-you-wash-underwear-at/) | [CDA Appliances](https://www.cda.co.uk/laundry/washing-machine-temperature-guide/) | [NHS via Which?](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d)

---

### Load Type 5 — Delicates

Silk, lace, lingerie, chiffon, satin, fine knitwear.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 30°C max | Cool wash preserves silk protein structure |
| Lights | 30°C max | Colour is irrelevant — temperature ceiling is fabric-driven |
| Colours | 30°C max | Cold / 20–30°C ideal for preserving dyes in silk and lace |
| Darks | 30°C max | Same ceiling; dark silk particularly prone to sheen loss from heat |
| Mixed | 30°C max | All delicate fabrics share the same ceiling |

**Temperature floor:** None — cold wash (20°C) is entirely acceptable and preferable for silk and very fine lace.
**Temperature ceiling:** 30°C absolute maximum for silk and lace. Heat above 30°C causes protein fibre degradation in silk; lace fibres distort and weaken. Many labels recommend hand wash only.

**Recommended cycle:** Delicates / Hand Wash programme. Uses minimal drum agitation, very slow spin (400–600 RPM max), and short cycle time. If hand-washing: lukewarm water (max 30°C), soak up to 30 minutes, do not wring — press water out gently. Structured items (padded bras, wired bras) should always be hand-washed.

**Fabric softener:** Avoid on silk — silicone coatings alter the natural sheen and drape of silk fibres. For lace: also avoid; softener can cause lace to lose its crispness and distort pattern.

**Detergent notes:**
- Non-bio ONLY — this is critical. Biological enzymes (particularly protease) cannot distinguish between food protein stains and the protein structure of silk (fibroin) or fine wool. Repeated bio washing causes invisible progressive fibre damage that manifests as holes after several washes.
- Use a specialist silk/delicates detergent (e.g., Woolite, Soak, The Laundress Delicate Wash, or pH-neutral non-bio).
- Never use standard bio liquid or bio powder on silk or lace.

**Sources:** [Kair Lingerie Care](https://kair.care/blogs/news/how-to-wash-silk-and-lace-underwear-in-partnership-with-coco-de-mer) | [Harlow & Fox Hand Wash Guide](https://www.harlowandfox.com/pages/how-to-wash-lingerie) | [Laundry Sauce](https://laundrysauce.com/blogs/news/how-to-wash-lingerie) | [Heritage Park — Enzyme Detergent Danger](https://heritageparklaundry.com/blogs/the-laundry-lowdown/enzyme-detergent-is-no-friend-to-washable-silk-and-wool) | [Nimble Cares Bio vs Non-Bio](https://nimblecares.co.uk/blogs/blog/bio-vs-non-bio-laundry-detergent-which-one-is-right-for-you)

---

### Load Type 6 — Wool

Knitwear, merino wool, lambswool, cashmere sweaters.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 30°C max | Cool wash; 40°C is the absolute ceiling per Woolmark |
| Lights | 30°C max | Same ceiling; heat causes felting/shrinkage |
| Colours | 30°C max | Cold or 30°C — colour is not the governing factor; fabric is |
| Darks | 30°C max | Same ceiling |
| Mixed | 30°C max | All wool shares this ceiling |

**Temperature floor:** None — cold wash acceptable. 30°C is the optimal temperature for effective cleaning without triggering felting.
**Temperature ceiling:** 30°C strongly recommended; 40°C is the absolute maximum per Woolmark. Above 40°C, the overlapping protein scales on wool fibres interlock irreversibly (felting), causing permanent, irreversible shrinkage. Temperature shock (hot then cold) also causes felting — maintain consistent temperature throughout.

**Recommended cycle:** Wool programme. Dedicated wool cycles use minimal agitation (often horizontal drum oscillation only rather than full rotation), low spin speed (600–800 RPM max), and consistent temperature. If no wool cycle: use coldest delicates programme. Wool is uniquely vulnerable to felting from agitation, not just temperature.

**Fabric softener:** DO NOT USE. Conventional fabric softener disrupts wool's natural fibre structure and moisture management. Fabric softener makes fibres "too soft" and causes them to slide apart under stress.
- Alternative: specialist wool conditioner or a small amount of hair conditioner in the rinse — conditioning agents smooth the protein scales and soften the handle without coating fibres.

**Detergent notes:**
- Non-bio ONLY — biological enzymes (protease) will digest wool protein (keratin) over repeated washes.
- Use a specialist wool wash detergent: Woolmark-approved products are confirmed safe. Woolite, Ecover Delicate, or Fairy Non-Bio (enzyme-free) are acceptable UK options.
- Never use bio powder, bio liquid, or any product labelled "enzyme" or "biological" on wool or cashmere.

**Sources:** [Woolmark — How to Wash Wool](https://www.woolmark.com/care/can-i-wash-wool-in-the-washing-machine/) | [Woolmark — Wash a Sweater](https://www.woolmark.com/care/how-to-wash-wool-sweater/) | [House of Bruar Knitwear Care](https://www.houseofbruar.com/knitwear-care-guide/) | [In the Wash — Best Detergents for Wool](https://inthewash.co.uk/laundry-and-ironing/best-detergents-for-washing-wool/) | [Heritage Park — Bio vs Non-Bio](https://heritageparklaundry.com/blogs/the-laundry-lowdown/bio-versus-non-bio-detergents-what-s-the-difference) | [Whitegoodshelp Bio Damage](https://www.whitegoodshelp.co.uk/biological-detergents-damage-laundry/)

---

### Load Type 7 — Activewear

Synthetic sportswear: polyester, nylon, elastane (Lycra/Spandex), moisture-wicking gym gear, compression wear.

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites | 30°C | Heat damages synthetic fibres and degrades wicking channels |
| Lights | 30°C | Same ceiling; colour is not the governing factor |
| Colours | 30°C | 30°C or lower is universally recommended for synthetics |
| Darks | 30°C | Cooler wash also protects dark dyes in polyester |
| Mixed | 30°C | All synthetic activewear shares this ceiling |

**Temperature floor:** None — cold wash (even 20°C) is adequate for removing sweat/odour from synthetic fibres when paired with bio detergent.
**Temperature ceiling:** 30°C absolute maximum. Heat above 30°C: (1) causes elastane to lose elasticity permanently, (2) can melt or distort polyester micro-fibres, (3) degrades the moisture-wicking micro-channels, reducing breathability. Never hot-wash activewear.

**Recommended cycle:** Synthetics programme (also called Easy Care on some machines): lower temperature, medium agitation, lower spin speed (800–1000 RPM). If available, use a dedicated Sports programme — longer wash time for odour removal at lower temperature and spin. Do NOT use the cotton programme — full agitation and high spin damages synthetic fibres.

**Fabric softener:** NEVER USE on activewear. This is the single most damaging care mistake for synthetic sportswear.
- Fabric softener's silicone coating clogs the micro-pores responsible for moisture wicking, making the garment less breathable and causing sweat to sit against the skin.
- Trapped moisture in the coated fabric creates a warm, humid environment that accelerates bacterial growth and causes permanent odour ("perma-stink").
- No alternatives recommended — activewear does not benefit from softening.

**Detergent notes:**
- Bio liquid preferred — liquid dissolves fully at 30°C (powder may leave residue at low temperatures in a front-loader).
- Specialist sports detergents (e.g., Dylon Sport, Smol Sport) are formulated to remove sweat odour and oils at low temperatures — a worthwhile choice for dedicated gym loads.
- A single capful of white vinegar in the drum (not the dispenser) can help strip odour-causing bacteria without softener residue.

**Sources:** [Dylon UK — Washing Sportswear](https://www.dylon.co.uk/detergents/how-to/washing-tips/sports-clothes-wash-that-should-you-take-note.html) | [Which? Gym Clothes Tips](https://www.which.co.uk/news/article/tips-for-washing-gym-clothes-amQXH2R0mcbw) | [Domestic & General](https://www.domesticandgeneral.com/blog/washing-machine-tips/how-to-wash-your-workout-wear-and-gym-clothes) | [Odorklenz — Avoid Fabric Softener](https://www.odorklenz.com/blogs/all/why-to-avoid-using-fabric-softener-on-workout-clothes-1) | [Clevercare](https://clevercare.info/matieres/how-to-wash-your-sports-clothes-in-the-washing-machine/) | [Ariel UK — Elastane](https://www.ariel.co.uk/en-gb/how-to-wash/washing-different-fabrics/elastane)

---

### Load Type 8 — Jeans

Denim: blue jeans, black denim, stretch denim (denim + elastane).

| Colour Group | Recommended Temp | Notes |
|---|---|---|
| Whites / Raw white denim | 30°C max | Rare; treat as light colour |
| Lights / Light-wash | 30°C | Cold wash best for preserving the light-wash fade pattern |
| Colours / Blue denim | 30°C | Industry consensus: cold wash preserves indigo dye bonds |
| Darks / Black denim | 30°C | Hot water opens cotton fibres and accelerates dye loss; black denim fades fastest |
| Stretch denim (elastane) | 30°C | Elastane ceiling applies — treat as activewear fabric ceiling |

**Temperature floor:** None. Cold wash at 20–30°C is ideal. Jeans do not have a hygiene-critical floor.
**Temperature ceiling:** 40°C absolute maximum; 30°C strongly preferred. Above 40°C, hot water weakens the bond between indigo dye and cotton fibres — dye molecules escape as the fibres open, causing irreversible fading. Stretch denim (elastane content): 30°C ceiling applies for fibre integrity.

**Recommended cycle:** Delicates / Gentle programme. Despite denim being a robust fabric, expert and industry consensus (Levi's, In the Wash, Currys, MasterClass) is to avoid the cotton programme — lower agitation and slower spin preserve the dye and structure. Turn jeans inside-out before washing to further reduce surface dye abrasion.

**Fabric softener:** Not recommended. Denim is a structured fabric that does not benefit from softening, and softener can alter the natural drape and feel of denim.

**Detergent notes:**
- Bio liquid preferred at 30°C (dissolves fully; enzyme action on any organic staining).
- For dark/black jeans: use a detergent formulated for darks (e.g., Persil Colour, Ariel Colour) — these omit optical brighteners that can cause a grey cast on dark denim.
- Wash frequency: denim does not need frequent washing. Airing jeans between wears is preferable. Levi's (the original manufacturer) recommends washing jeans every 10 wears.

**Sources:** [In the Wash — How to Wash Jeans](https://inthewash.co.uk/laundry-and-ironing/how-to-wash-jeans/) | [Currys — How to Wash Jeans](https://www.currys.co.uk/techtalk/kitchen-and-home/laundry-advice/how-to-wash-jeans.html) | [Which? Temperature Guide](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d) | [Laundry Sauce Jeans Guide](https://laundrysauce.com/blogs/news/how-to-wash-jeans) | [ShunVogue Temperature Guide](https://shunvogue.com/article/how-hot-can-you-wash-jeans) | [Levi's Denim Care](https://www.levi.com/US/en_US/blog/article/the-definitive-guide-to-denim)

---

## Sources

All sources cited inline per section above. Consolidated list of primary reference domains:

- [NHS / Which? Temperature Guide](https://www.which.co.uk/reviews/washing-machines/article/washing-machine-temperature-guide-aLiyf2p96y4d)
- [Persil UK Laundry Tips](https://www.persil.com/uk/laundry/laundry-tips/)
- [In the Wash](https://inthewash.co.uk/)
- [CDA Appliances Temperature Guide](https://www.cda.co.uk/laundry/washing-machine-temperature-guide/)
- [Woolmark Care Guides](https://www.woolmark.com/care/)
- [Heritage Park Laundry — Bio vs Non-Bio / Enzyme Danger](https://heritageparklaundry.com/blogs/the-laundry-lowdown/)
- [Which? Gym Clothes Tips](https://www.which.co.uk/news/article/tips-for-washing-gym-clothes-amQXH2R0mcbw)
- [Ariel UK](https://www.ariel.co.uk/en-gb/how-to-wash/)
- [Dylon UK](https://www.dylon.co.uk/)
- [Levi's Denim Care Guide](https://www.levi.com/US/en_US/blog/article/the-definitive-guide-to-denim)

*All temperatures in degrees Celsius. Guidance is for front-loader machines. Soft-water context: ~19 mg/L total dissolved solids — reduce all detergent doses by approximately 25–30% vs. manufacturer label.*
