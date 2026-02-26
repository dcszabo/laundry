# Laundry Science Research

Context: Victorian Australian household, Wantirna South VIC (South East Water zone L590). Front-loading washing machine (Fisher & Paykel WH1060P4). Primary detergents: liquid/powder/pods. All temperatures in degrees Celsius. Research completed 2026-02-23.

---

## Water Quality — Wantirna South (South East Water 2023–24)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Total hardness | ~18 mg/L as CaCO₃ (system avg); ~12 mg/L (Wantirna L590 avg) | Very soft — well below 60 mg/L soft-water threshold |
| Calcium | ~5.3 mg/L (ionic) | |
| Magnesium | ~1.2 mg/L (ionic) | |
| Electrical conductivity | 83 µS/cm avg | Estimated TDS ~54 mg/L |
| Classification | **Very soft** | |

Soft water has minimal Ca²⁺/Mg²⁺ ions, so surfactants do not form insoluble calcium soaps. Effective cleaning concentration is maintained at significantly lower doses than manufacturer labels (calibrated for ~200 mg/L hard water). Over-dosing in soft water leaves surfactant residue on fabric (stiff towels, musty odour).

Source: South East Water Annual Drinking Water Quality Report 2023–24.

---

## Machine — Fisher & Paykel WH1060P4

### Confirmed Specifications

| Item | Value | Source |
|------|-------|--------|
| Brand / model | Fisher & Paykel WH1060P4 | F&P product page (AU) |
| Rated capacity | 10 kg | F&P product page |
| Spin speeds | 500 / 800 / 1100 / 1400 RPM + No Spin | F&P user manual p.22 |
| Available wash temperatures | Cold Tap / Cold (20°C) / 30°C / 40°C / 60°C / 90°C | F&P user manual p.21 |
| Energy rating | 4.5-star (WELS + energy) | F&P product page |
| Drive | SmartDrive™ direct drive, 10-year motor warranty | F&P product page |

**Temperature note:** "Cold" on this machine defaults to **Controlled Cold (20°C)** using the internal heater. "Cold Tap" (raw incoming water, typically 10–18°C in VIC) can be set as a user default. For dosage model purposes, Cold = ≤20°C.

**Delicate cycle temperature ceiling: 40°C** — confirmed in manual ("temperatures above 40°C on the DELICATE cycle" are explicitly locked out).

### Cycle Guide (from manufacturer — WH1060P4 user manual p.18)

| Load / Wash requirement | Recommended cycle | Suggested spin | Suggested temp |
|------------------------|------------------|----------------|---------------|
| Towels, sheets, pillowcases | Everyday | 1100–1400 RPM | 30–40°C |
| Doonas, duvets, sleeping bags | Bulky | — | 30–40°C |
| Shirts, pants, creasable items | Easy Iron or Steam Refresh | 800 RPM | 30–40°C |
| Woolens, silks | Wool | 500 RPM | 30–40°C |
| Delicates, fine fabrics | Delicate or Wool | — | 30°C |
| Jeans | Everyday or Heavy | — | Cold or 30°C |
| Highly coloured items | Everyday | — | Cold or 30°C |
| Whites, cotton items | Cottons | 1100–1400 RPM | 40–60°C |
| Hygiene (nappies, bedding, facemasks) | Sanitise | — | **75°C (fixed)** |
| Sensitive skin / allergy | Sanitise or Cottons + Rinse+ | 1400 RPM | 40–60°C |
| Lightly soiled items | Quick | — | 30°C |

**Sanitise cycle:** Fixed at 75°C, removes >99.99% of bacteria. Not user-temperature-adjustable. Recommended for hygiene-critical loads.

### Cycle Capacities

| Cycle | Capacity | Notes |
|-------|----------|-------|
| Cottons | 10 kg | Full drum |
| Everyday | 10 kg | |
| Heavy | 10 kg | |
| Bulky | 4 kg | Manual-confirmed (WH1060P4 cycle table). Earlier estimate of 10 kg was incorrect. |
| Easy Iron | 4 kg | Manual-confirmed (WH1060P4 cycle table). Earlier estimate of 10 kg was incorrect. |
| Delicate | 4 kg | Estimated — per-cycle limits not tabled in manual |
| Wool | 3 kg (2 kg recommended max) | App uses 3 kg as selector limit; 2 kg is practical safe max |
| Quick | 4 kg | Estimated |

*Per-cycle capacity limits are not explicitly tabled in the WH1060P4 manual. Values above are estimates for machine class except where noted.*

### Available Temperatures per Cycle (estimated)

| Cycle | Available temps | Basis |
|-------|----------------|-------|
| Cottons | Cold, 30, 40, 60, 90°C | Full range; whites/cotton spec |
| Everyday | Cold, 30, 40, 60°C | Manual suggests 30–40°C but 60°C available |
| Heavy | Cold, 30, 40, 60, 90°C | Heavy-duty; full range |
| Delicate | Cold, 30, 40°C | **Manual confirmed max 40°C** |
| Wool | Cold, 30, 40°C | Woolmark certified; 40°C absolute max |
| Quick | Cold, 30, 40°C | Short cycle; low-temp only |
| Bulky | Cold, 30, 40, 60, 90°C | Manual-confirmed range (Cold–90°C). Earlier estimate was incorrect. |
| Easy Iron | Cold, 30, 40, 60°C | Manual recommends 30–40°C for creasables; 60°C available for white cotton shirts |
| Sanitise | 75°C (fixed) | Not user-adjustable |

*Per-cycle temperature availability derived from manual guidelines and F&P design conventions. Only Delicate (max 40°C) and Sanitise (fixed 75°C) are explicitly confirmed in the manual.*

### Spin Speed Reference

| Cycle | Spin speed |
|-------|-----------|
| Cottons | 1100–1400 RPM |
| Everyday | 1100–1400 RPM |
| Heavy | 1100–1400 RPM |
| Delicate | 500–800 RPM |
| Wool | 500 RPM |
| Bulky | 800 RPM (higher spin risks tangling/damage) |
| Easy Iron | 800 RPM (reduced spin to minimise creasing) |
| Quick | 1100 RPM |

Source: F&P WH1060P4 user manual (AU/NZ/SG edition); The Good Guys AU product listing.

---

## Dosage Calculation Model

The app uses a deterministic dosage model: base dose × temperature modifier × concentration factor × detergent multiplier, rounded to the nearest 5 mL.

### Soft Water Dose Reduction

In soft water (~18 mg/L hardness), surfactants lather at lower concentrations and rinse more cleanly. No Ca²⁺/Mg²⁺ ions consume surfactant molecules before they can act on soil. All base doses represent approximately 25–30% of the manufacturer's label dose, which is calibrated for ~200 mg/L hard water.

### Base Dose Table

Base doses (mL) for soft water, front-loader, liquid detergent at 1.0× concentration. These are pre-modifier values stored in `dosageData`; cycle modifiers (see below) are applied on top.

| Load Size | Light Soil | Normal Soil | Heavy Soil |
|-----------|-----------|-------------|------------|
| Small (≤3 kg) | 10 mL | 15 mL | 20 mL |
| Medium (≤6 kg) | 15 mL | 20 mL | 25 mL |
| Large (≤10 kg) | 20 mL | 25 mL | 30 mL |

Approximately 25–30% of Australian manufacturer label doses (Omo, Cold Power), which are calibrated for harder water. Source: Canstar Blue AU laundry guide; soft-water dose reduction principle.

### Cycle Dose Modifier

Applied on top of the base dose before the temperature multiplier. Stored in `cycleModifiers`.

| Cycle | Adjustment |
|-------|-----------|
| Cottons | +5 mL |
| Everyday | ±0 mL |
| Heavy | +5 mL |
| Bulky | +5 mL |
| Delicate | −5 mL |
| Wool | −5 mL |
| Quick | −5 mL |
| Easy Iron | ±0 mL |

Hard cap: Cottons + heavy soil = 35 mL maximum (enforced in `getDoseAndTemp`).

### Heat vs Detergent: Temperature Modifier

Higher temperature partially substitutes for chemical/enzyme cleaning action, allowing a modest dose reduction. Lower temperature reduces enzyme activity, requiring a dose increase to compensate.

| Temperature | Modifier | Basis | Source |
|-------------|----------|-------|--------|
| Cold / ≤20°C | ×1.12 | Enzyme activity low; thermal contribution negligible; more detergent needed | ACS Cold-Water Washing; Zymvol enzyme kinetics |
| 30–40°C | ×1.00 | Enzyme optimum range (protease, amylase, lipase); baseline dose | ACS; PMC 6151835 |
| ≥60°C | ×0.90 | Thermal denaturation of protein soils reduces enzyme dependency; modest reduction justified | ACS; Zymvol |

The ×1.12 cold modifier could be ×1.15–1.20 for sub-15°C water; ×1.12 is a conservative, defensible baseline. The ×0.90 at 60°C is conservative (×0.80–0.85 also defensible); ×0.90 errs toward not under-dosing.

### Detergent Type Multiplier

| Type | Multiplier | Notes | Source |
|------|-----------|-------|--------|
| Liquid | ×1.00 | Reference. Fully dissolves at all temperatures including cold | — |
| Powder | ×1.00 | Same dose by mL as liquid. Liquid is marginally more concentrated per mL (~0.15g active/mL vs ~0.12g active/mL for powder at ~0.6g/mL density), but many Australian powder formulations (Cold Power, Omo Active Clean) contain sodium percarbonate — adding whitening/hygiene benefit without requiring a dose increase. Net: equal by volume. | Cold Power AU FAQ; Omo AU product specs; Canstar Blue AU |
| Pods | N/A | Bypass dose model entirely: 1 pod for small/medium, 2 pods for large/heavy | — |

### Concentration Factor

User-adjustable slider (0.7–1.3×). Compensates for detergent concentration variations:
- **Below 1.0**: ultra-concentrated detergents (e.g., 3× concentrate) — user reduces for soft water
- **1.0**: standard concentration (default)
- **Above 1.0**: diluted or budget detergents with lower active ingredient content

### Rounding

All final doses rounded to nearest 5 mL via `roundToFive(n)` (max ±2.5 mL error; ≤10% on a typical 25 mL dose; matches standard measuring cap graduations).

---

## Temperature Matrix (Load Type × Colour)

| Load Type  | Whites | Lights | Colours | Darks | Mixed |
|------------|--------|--------|---------|-------|-------|
| Everyday   | 60°C ¹ | 40°C   | 30°C    | 30°C  | 30°C  |
| Towels     | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Bedding    | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Underwear  | 60°C   | 60°C   | 40°C    | 40°C  | 40°C  |
| Delicates  | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Wool       | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Activewear | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |
| Jeans      | 30°C   | 30°C   | 30°C    | 30°C  | 30°C  |

¹ **Everyday whites at 60°C applies to pure white 100% cotton only.** For white synthetic blends, jersey knits, items with elastane/Lycra, or screen-printed graphics: max 40°C (heat damages synthetic fibres, degrades elastane, cracks prints). Check care label. Source: WIN Detergent elastane guide; Asket jersey care guide.

**Matrix sources by load type:**
- Everyday: Choice AU temperature guide; F&P manual p.18
- Towels: Choice AU; NSW Health laundry hygiene; F&P manual p.18
- Bedding: Choice AU; PMC 4229498 (dust mites + 60°C); F&P manual p.18
- Underwear: Choice AU; NSW Health; In the Wash AU underwear guide
- Delicates: Woolmark AU; Heritage Park Laundry (enzyme risk)
- Wool: Woolmark AU washing guide; F&P manual p.18 (Wool 30–40°C)
- Activewear: Ariel UK elastane guide; Omo AU; Odorklenz softener study
- Jeans: Levi's Denim Care Guide; In the Wash AU jeans guide; F&P manual p.18

---

## Temperature Floor / Ceiling by Load Type

| Load Type  | Floor | Ceiling | Rationale | Source |
|------------|-------|---------|-----------|--------|
| Everyday   | None  | 60°C cotton; 40°C synthetic blend | No hygiene floor for casual clothing | Choice AU |
| Towels     | 40°C  | 90°C white cotton (rarely needed) | Body-contact textile; cold wash insufficient for hygiene | NSW Health; Choice AU |
| Bedding    | 40°C; 60°C for whites/lights | 60°C for blends; 90°C white cotton only | Dust mites (Dermatophagoides sp.) die above ~55°C; 60°C achieves near-complete elimination | PMC 4229498; Choice AU |
| Underwear  | 40°C  | 40°C synthetic/elastane; 60°C pure cotton | Highest-risk category for bacterial transfer; heat degrades elastic | NSW Health; Choice AU |
| Delicates  | None  | 30°C (40°C machine ceiling confirmed) | Silk fibroin protein degradation above 30°C | Heritage Park Laundry; F&P manual p.21 |
| Wool       | None  | 40°C absolute max (Woolmark); 30°C preferred | Protein scale interlocking (felting) above 40°C — irreversible | Woolmark AU |
| Activewear | None  | 30°C | Elastane loses elasticity permanently; wicking micropores blocked | Ariel UK; WIN Detergent |
| Jeans      | None  | 40°C absolute max; 30°C preferred | Hot water weakens indigo-dye bond to cotton fibres | Levi's Denim Care; In the Wash AU |

---

## Methodology

Each load type researched against Australian sources (Choice AU, Canstar Blue, NSW Health, Fisher & Paykel manual, Woolmark AU) and international scientific sources (PMC, ACS) where no quality Australian equivalent exists. Guidance reflects scientific consensus, not manufacturer marketing. Maximum three sources cross-referenced per claim.

---

## Critical Rules

### Bio vs Non-Bio

| Load Type  | Detergent | Format preference |
|------------|-----------|------------------|
| Everyday   | Bio | Liquid (cold/30°C) or powder (40°C+) |
| Towels     | Bio | Powder preferred (sodium percarbonate adds whitening/deodorising) |
| Bedding    | Bio | Powder (whites), liquid (colours) |
| Underwear  | Bio | Liquid or powder |
| Delicates  | **Non-bio ONLY** | Specialist delicates liquid (pH-neutral) |
| Wool       | **Non-bio ONLY** | Woolmark-approved wool liquid |
| Activewear | Bio | Liquid (dissolves fully at 30°C) |
| Jeans      | Bio | Liquid; colour-protect formula for dark/black denim |

**Bio enzyme risk:** Biological enzymes (protease) cannot distinguish food-protein stains from protein fibres. On silk (fibroin), wool/cashmere (keratin): repeated bio washing causes invisible progressive fibre degradation → holes. **Bio NEVER on Delicates or Wool.** Source: Heritage Park Laundry — "Enzyme Detergent is No Friend to Washable Silk and Wool"; Nimble Cares bio vs non-bio guide.

**Bio essential for hygiene:** At 40°C, bio enzyme action is the primary hygiene mechanism for Underwear, Towels, and Bedding. Non-bio at 40°C provides inadequate bacterial kill without the Sanitise cycle. Source: NSW Health PD2015_008; Choice AU — How to Wash Laundry to Kill Bacteria.

### Softener Contraindications

| Load Type | Softener? | Reason | Source |
|-----------|-----------|--------|--------|
| Towels | **NEVER** | Silicone (PDMS) coats terry fibres → permanent loss of absorbency | Fine Cotton Company; Mira Showers guide |
| Activewear | **NEVER** | Clogs wicking micropores → permanent odour ("perma-stink") | Odorklenz study; Which? gym clothes guide |
| Wool | **NEVER** | Disrupts fibre structure and moisture management | Woolmark AU |
| Delicates | **NEVER** | Silk: alters natural sheen; Lace: loses crispness, distorts pattern | Kair Lingerie Care; Harlow & Fox hand-wash guide |
| Everyday cotton | Optional | Acceptable; avoid on moisture-wicking items | — |
| Bedding | Avoid | Residue aggravates sensitive skin; reduces fabric moisture regulation | Choice AU |

**Vinegar:** Do not use white vinegar as a fabric softener alternative in front-loading machines — acetic acid degrades rubber door gaskets over time.

Alternative for wool: specialist wool conditioner or small amount of hair conditioner in rinse.


### Hygiene Standard (Australia)

Equivalent to AS/NZS 4146:2000 domestic guidance and Choice AU / NSW Health recommendations:

- **60°C** achieves 99.9% bacterial kill for domestic laundry. Source: Choice AU; PMC 4229498.
- **40°C + bio detergent** is an acceptable hygiene alternative for coloured/temperature-sensitive fabrics. Source: NSW Health PD2015_008; Choice AU.
- **Sanitise cycle (75°C)** — use for maximum hygiene (nappies, allergy/asthma bedding, illness recovery). Source: F&P WH1060P4 user manual p.18; F&P product page.
- **Tumble drying** adds a further 3–4 log bacterial reduction, partially compensating for lower-temperature washes. Source: PMC 4229498 — decontamination at 60°C/70°C followed by tumble drying.

### Cycle Assignments (vs Machine Cycle Names)

| Load Type | Recommended machine cycle | Notes |
|-----------|--------------------------|-------|
| Everyday clothing | Everyday | Contains synthetics/elastane → use Everyday not Cottons |
| Towels | Everyday | Manufacturer recommendation (1100–1400 RPM, 40–60°C) |
| Bedding / sheets | Everyday or Cottons | Long wash; full agitation; not Quick |
| Whites (cotton) | Cottons | Manufacturer recommendation for whites/cotton items |
| Underwear (cotton) | Cottons or Everyday | Cotton cycle; Synthetics/Delicate for elastane-heavy items |
| Delicates | Delicate | Max 40°C (machine-enforced) |
| Wool | Wool | 500 RPM; near-zero agitation; Woolmark certified |
| Activewear | Everyday | No dedicated Sports cycle on WH1060P4; avoid Cottons (excessive agitation damages wicking fibres) |
| Jeans | Everyday or Heavy | Cold or 30°C; manufacturer suggestion |
| Hygiene wash | Sanitise | Fixed 75°C; >99.99% bacteria kill |
| Freshening (no wash) | Steam Refresh | No water/detergent needed |

---

## Per-Load Reference

### Everyday

Mixed cotton casualwear: t-shirts, shirts, chinos, casual trousers.

| Colour | Temp | Notes |
|--------|------|-------|
| Whites | 60°C | Pure 100% cotton only — blends, jersey, elastane, prints: 40°C max |
| Lights | 40°C | |
| Colours | 30°C | |
| Darks | 30°C | Lower temp reduces dye loss |
| Mixed | 30°C | |

Cycle: Everyday. Fabric softener: optional (not on moisture-wicking items). Bio liquid (cold/30°C) or bio powder (40°C+).

---

### Towels

Cotton bath towels, hand towels, face cloths.

| Colour | Temp | Notes |
|--------|------|-------|
| Whites | 60°C | Kills bacteria; maintains brightness |
| Lights | 60°C | Hygiene benefit outweighs minor fade risk |
| Colours | 40°C | 40°C + bio meets hygiene threshold; 60°C risks fading |
| Darks | 40°C | Higher temps accelerate dye loss in dark terry |
| Mixed | 40°C | |

Cycle: Everyday (1100–1400 RPM). **No fabric softener.** Use Sanitise cycle for maximum hygiene (illness recovery, immune-compromised household). Bio powder preferred.

---

### Bedding

Cotton sheets, pillowcases, duvet covers.

| Colour | Temp | Notes |
|--------|------|-------|
| Whites | 60°C | Kills dust mites (die above ~55°C); maintains whiteness |
| Lights | 60°C | |
| Colours | 40°C | 40°C + bio meets hygiene needs |
| Darks | 40°C | |
| Mixed | 40°C | |

Cycle: Everyday or Cottons. Long wash (not Quick). Fabric softener: avoid on pillowcases. Bio powder (whites), bio liquid (colours).

---

### Underwear

Cotton and synthetic-mix underwear, briefs, boxers, socks.

| Colour | Temp | Notes |
|--------|------|-------|
| Whites | 60°C | Pure cotton only; synthetic-mix: 40°C max to protect elastic |
| Lights | 40–60°C | Fabric-dependent; check label |
| Colours | 40°C | 40°C + bio is hygiene-sufficient |
| Darks | 40°C | |
| Mixed | 40°C | |

Cycle: Cottons (all-cotton); Everyday or Delicate (synthetic/elastane-containing). Bio detergent essential — enzyme action on proteins is the primary hygiene mechanism at 40°C. No softener on synthetic underwear.

---

### Delicates

Silk, lace, lingerie, chiffon, satin, fine knitwear.

| Colour | Temp | Notes |
|--------|------|-------|
| All | 30°C max | Machine locks out >40°C on Delicate cycle; science ceiling is 30°C for silk |

Cycle: Delicate (machine max 40°C enforced). **Non-bio ONLY** — bio protease digests silk fibroin and wool keratin. Specialist silk/delicates liquid (Woolite, pH-neutral). No fabric softener. Structured/wired bras: hand-wash only.

---

### Wool

Knitwear, merino, lambswool, cashmere.

| Colour | Temp | Notes |
|--------|------|-------|
| All | 30°C | 40°C absolute max (Woolmark); 30°C preferred |

Cycle: Wool (500 RPM, near-zero agitation — prevents felting). **Non-bio ONLY.** Woolmark-approved detergent. No fabric softener. Temperature shock (hot→cold) also causes felting — maintain consistent temperature.

---

### Activewear

Polyester, nylon, elastane (Lycra/Spandex), wicking gym gear, compression wear.

| Colour | Temp | Notes |
|--------|------|-------|
| All | 30°C | Elastane permanent damage above 30°C; wicking channels degraded |

Cycle: Everyday. **No fabric softener** — clogs wicking micropores → permanent odour. Bio liquid preferred (dissolves fully at 30°C). Sports detergent (e.g., Omo Active) effective for odour removal at low temperature.

---

### Jeans

Denim: blue jeans, black denim, stretch denim.

| Colour | Temp | Notes |
|--------|------|-------|
| All | 30°C | 40°C absolute max; cold preserves indigo-dye bond |

Cycle: Everyday or Heavy (manufacturer recommendation; lower agitation than Cottons preserves dye). Wash inside-out. Bio liquid; use colour-protect formula for dark/black denim. Wash frequency: every 10 wears (Levi's guidance); airing preferred between wears.

---

## Cycle Options (Wash Modifiers)

Verified against F&P WH9060P4/WH1060P4 User Guide (NZ/AU/SG edition, pages 22–27). All eight options exist on this machine.

Options are accessed via three physical buttons on the control panel: **Optimise Wash** (Speed / ECO), **Wash Boost** (Pre Wash / Rinse+ / Wash+ / Soak), and a dedicated **Options** button (Wrinkle Free). Quiet has its own button. ECO and Speed cannot be selected together.

| Option | Group | Function | Cycle restrictions | Incompatible with |
|--------|-------|----------|--------------------|-------------------|
| ECO | Optimise Wash | Reduces wash temp slightly; alters wash & rinse programming to save water & energy | Everyday, Cottons, Heavy, Easy Iron, Bulky only | Speed, Pre Wash, Rinse+ |
| Speed | Optimise Wash | Shortens cycle while maintaining good wash performance. Selecting Speed on Quick runs the Quick 15 cycle. | Cottons, Heavy, Easy Iron only | ECO, Soak |
| Quiet | — | Reduces spin speed to limit noise — for night washing or timber floors. Automatically enables Wrinkle Free post-cycle. | No cycle restriction noted | — |
| Pre Wash | Wash Boost | Short cool-water wash before main cycle to remove excess soil. Requires detergent in pre-wash compartment (right side of drawer). Must be selected before cycle starts. | No cycle restriction noted | ECO |
| Rinse+ | Wash Boost | Adds an extra rinse; for heavily soiled loads or sensitive skin | No cycle restriction noted | ECO |
| Wash+ | Wash Boost | Extends wash time for extra tumbling on heavily soiled loads | No cycle restriction noted | — |
| Soak | Wash Boost | 30-minute soak mid-cycle (tumbling + soaking periods) to lift stubborn stains | "Selected wash cycles" per manual — not explicitly enumerated | ECO, Speed |
| Wrinkle Free | Options | Tumbles every 15 minutes for up to 12 hours post-cycle; machine beeps at intervals as reminders. Activates automatically under Quiet mode. | No cycle restriction noted | — |

Additional options confirmed in manual (not wash modifiers; not shown in app):
- **Delay Start** — delays cycle start by 15 minutes to 12 hours
- **Add a Garment** — pause during wash stage to add/remove items (available below 60°C)
- **Keylock** — locks control panel buttons

Source: F&P WH9060P4/WH1060P4 User Guide (NZ/AU/SG edition), pages 22–31.

---

## Sources

| Topic | Source |
|-------|--------|
| Machine specs, cycle guide | [Fisher & Paykel WH1060P4 user manual (AU/NZ/SG)](https://www.fisherpaykel.com/au/laundry/washing-machines/front-load/10kg-series-7-front-loader-washer-steam-care-wh1060p4-93292.html) |
| Machine retail specs | [The Good Guys AU — WH1060P4](https://www.thegoodguys.com.au/fisher-and-paykel-10kg-front-load-washer-wh1060p4) |
| Water quality | South East Water Annual Drinking Water Quality Report 2023–24 |
| Temperature guidance | [Choice AU — Washing Machine Temperature Guide](https://www.choice.com.au/home-and-living/laundry-and-cleaning/washing-machines) |
| Hygiene standard | [NSW Health Laundry Standards](https://www1.health.nsw.gov.au/pds/ActivePDSDocuments/PD2015_008.pdf); [Choice AU — How to Wash Laundry to Kill Bacteria](https://www.choice.com.au/home-and-living/laundry-and-cleaning/washing-machines/articles/how-to-wash-laundry-to-kill-virus-and-bacteria) |
| Temperature modifiers | [ACS — Chemistry of Cold-Water Washing](https://cen.acs.org/business/consumer-products/chemistry-cold-water-washing/102/i3); [Zymvol — Enzymes in Detergents](https://zymvol.com/knowledge-hub/how-enzymes-improved-detergents/) |
| Decontamination at 60°C vs 70°C | [PMC 4229498](https://pmc.ncbi.nlm.nih.gov/articles/PMC4229498/) |
| Wool care | [Woolmark — Machine Washing Wool (AU)](https://www.woolmark.com/care/can-i-wash-wool-in-the-washing-machine/) |
| Bio enzyme risk on silk/wool | [Heritage Park Laundry — Enzyme Detergent Danger](https://heritageparklaundry.com/blogs/the-laundry-lowdown/enzyme-detergent-is-no-friend-to-washable-silk-and-wool) |
| Activewear/elastane | [Ariel UK — Elastane](https://www.ariel.co.uk/en-gb/how-to-wash/washing-different-fabrics/elastane); [Omo AU](https://www.omo.com/au/) |
| Soft water detergent dosing | [Canstar Blue AU — Laundry Detergent Guide](https://www.canstarblue.com.au/home-garden/laundry-powders/) |
| Denim care | [Levi's Denim Care Guide](https://www.levi.com/US/en_US/blog/article/the-definitive-guide-to-denim); In the Wash AU |

*All temperatures in degrees Celsius. All guidance is for front-loader machines. Soft water context: ~18 mg/L total hardness (as CaCO₃) — reduce all detergent doses approximately 25–30% vs. manufacturer label.*
