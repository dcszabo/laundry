// @ts-check
const dosageData = {
    small: {
        light: { dose: 10 },
        normal: { dose: 15 },
        heavy: { dose: 20 }
    },
    medium: {
        light: { dose: 15 },
        normal: { dose: 20 },
        heavy: { dose: 25 }
    },
    large: {
        light: { dose: 20 },
        normal: { dose: 25 },
        heavy: { dose: 30 }
    }
};

const cycleModifiers = {
    cottons:   { doseAdjust: 5 },
    everyday:  { doseAdjust: 0 },
    heavy:     { doseAdjust: 5 },
    delicates: { doseAdjust: -5 },
    wool:      { doseAdjust: -5 },
    quick:     { doseAdjust: -5 },
    bulky:     { doseAdjust: 5 },
    easyiron:  { doseAdjust: 0 },
};

const tempMatrix = {
    everyday:   { whites: 60, lights: 40, colours: 30, darks: 30, mixed: 30 },
    towels:     { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    bedding:    { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    underwear:  { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    delicates:  { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    wool:       { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    activewear: { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    jeans:      { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
};

const cycleTemps = {
    cottons:   [20, 30, 40, 60, 90],
    everyday:  [20, 30, 40, 60],
    heavy:     [20, 30, 40, 60, 90],
    delicates: [20, 30, 40],
    wool:      [20, 30, 40],
    quick:     [20, 30, 40],
    bulky:     [20, 30, 40, 60],
    easyiron:  [20, 30, 40, 60],
};

const cycleMaxLoad = {
    cottons:   10,
    everyday:  10,
    heavy:     10,
    delicates:  4,
    wool:       3,
    quick:      4,
    bulky:     10,
    easyiron:  10,
};

const sizeKg = { small: 3, medium: 6, large: 10 };

const detergentTypes = {
    liquid: { doseMultiplier: 1, guideKey: 'liquid' },
    powder: { doseMultiplier: 1.0, guideKey: 'powder' },
    pods: { doseMultiplier: 1, guideKey: 'pods' }
};

const fallbackContent = {
    temps: {
        whites: '60°C',
        lights: '40°C',
        colours: '30°C',
        darks: '30°C',
        mixed: '30°C',
        wool: '30°C',
        delicates: '30°C'
    },
    tips: {
        whites: '60°C for pure white cotton. Blends, jersey or printed items: 40°C max.',
        lights: '40°C is safe for most light colours.',
        colours: 'Wash at 30°C to protect colour. Turn inside out.',
        darks: 'Cold water protects colour. Turn inside out.',
        mixed: '30°C works for all colours in a mixed load.'
    },
    warnings: {
        delicatesHeavy: 'Heavy soil with delicates: pre-treat stains or switch to Everyday cycle.',
        podsSmallLight: 'Pods may be too strong for very small or lightly soiled loads.'
    },
    guides: {
        liquid: 'Liquid is the default for front loaders.',
        powder: 'Same dose as liquid. Australian powders often contain whitening agents good for whites.',
        pods: 'Pods: 1 for small or medium loads, 2 for large or heavy loads.'
    },
    ui: {
        tempIcon: '🌡️',
        podsComparison: 'Pods do not use cap lines.',
        capComparison: 'Only {percent}% of a full cap!',
        detergentLabel: 'Detergent',
        tempLabel: 'Temp'
    },
    units: {
        ml: ' mL',
        podSingular: ' pod',
        podPlural: ' pods'
    },
};

const loadTypeMeta = {
    'everyday': {
        emoji: '👕', label: 'Everyday',
        defaultColour: 'mixed', defaultSoil: 'normal', defaultSize: 'medium',
        recommendedCycle: 'everyday',
        recDetergent: 'liquid',
        cycle: 'Everyday', maxLoad: '10 kg',
        tips: [
            'Empty pockets and close zips before washing.',
            'Turn clothes inside out to protect fabric and colour.',
            'Sort by colour when possible to extend garment life.'
        ],
        cautions: []
    },
    'bedding': {
        emoji: '🛏️', label: 'Bedding',
        defaultColour: 'whites', defaultSoil: 'normal', defaultSize: 'large',
        recommendedCycle: 'cottons',
        recDetergent: 'powder',
        cycle: 'Cottons 60°C', maxLoad: '10 kg',
        tips: [
            'Wash sheets every 1 to 2 weeks.',
            'Leave room to tumble. Don\'t overfill.',
            'Use Bulky cycle for duvets and large single items.'
        ],
        cautions: [
            'Skip fabric softener. It reduces breathability.'
        ]
    },
    'towels': {
        emoji: '🧺', label: 'Towels',
        defaultColour: 'whites', defaultSoil: 'normal', defaultSize: 'large',
        recommendedCycle: 'everyday',
        recDetergent: 'powder',
        cycle: 'Everyday', maxLoad: '10 kg',
        tips: [
            'Shake towels out before loading for better results.'
        ],
        cautions: [
            'No fabric softener. It coats fibres and ruins absorbency.'
        ]
    },
    'delicates': {
        emoji: '🩱', label: 'Delicates',
        defaultColour: 'mixed', defaultSoil: 'light', defaultSize: 'small',
        recommendedCycle: 'delicates',
        recDetergent: 'liquid',
        cycle: 'Delicate', maxLoad: '4 kg',
        tips: [
            'Turn inside out to protect the outer surface.',
            'Use mesh bags for bras, lingerie, and anything with hooks.'
        ],
        cautions: [
            'Never tumble dry delicates.',
            'Air dry flat and reshape while damp.',
            'Use non-bio detergent. Bio enzymes damage silk and fine fabrics.'
        ]
    },
    'wool': {
        emoji: '🧶', label: 'Wool',
        defaultColour: 'mixed', defaultSoil: 'light', defaultSize: 'small',
        recommendedCycle: 'wool',
        recDetergent: 'liquid',
        cycle: 'Wool', maxLoad: '2 kg',
        tips: [
            'Turn inside out to protect the outer texture.',
            'Lay flat to dry. Never hang or tumble dry.'
        ],
        cautions: [
            'Use wool-safe non-bio only. Bio enzymes digest keratin and cause holes.',
            'Never wring or twist woollen items.'
        ]
    },
    'activewear': {
        emoji: '🏃', label: 'Activewear',
        defaultColour: 'darks', defaultSoil: 'heavy', defaultSize: 'medium',
        recommendedCycle: 'everyday',
        recDetergent: 'liquid',
        cycle: 'Everyday', maxLoad: '10 kg',
        tips: [
            'Turn inside out before washing.',
            'Cold water preserves elasticity and wicking properties.'
        ],
        cautions: [
            'No fabric softener. It clogs wicking pores and causes permanent odour.',
            'Air dry rather than tumble drying.'
        ]
    },
    'jeans': {
        emoji: '👖', label: 'Jeans',
        defaultColour: 'darks', defaultSoil: 'normal', defaultSize: 'medium',
        recommendedCycle: 'everyday',
        recDetergent: 'liquid',
        cycle: 'Everyday', maxLoad: '10 kg',
        tips: [
            'Turn inside out to prevent fading and white streaks.',
            'Wash less often. Spot clean between washes.'
        ],
        cautions: [
            'Use cold water to preserve indigo dye and stretch.',
            'Use colour-protect detergent for dark or black denim.'
        ]
    },
    'underwear': {
        emoji: '🩲', label: 'Underwear',
        defaultColour: 'whites', defaultSoil: 'normal', defaultSize: 'small',
        recommendedCycle: 'cottons',
        recDetergent: 'liquid',
        cycle: 'Cottons', maxLoad: '10 kg',
        tips: [
            'Turn inside out.',
            'Synthetic underwear: Delicate cycle at 40°C max.'
        ],
        cautions: [
            '40°C is acceptable only with bio detergent.',
            'Synthetic underwear max 40°C. High heat damages elastane.'
        ]
    }
};

const storageKeys = {
    concentration: 'laundry.concentrationFactor',
    detergent: 'laundry.detergentType',
    loadType: 'laundry.loadType',
    installNudge: 'laundry.installNudgeDismissed',
    dismissPrefix: 'laundry.dismissed.v1.'
};

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ?? fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        return;
    }
}

function triggerHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

function syncSelectorGroup(groupId, dataKey, value) {
    document.querySelectorAll('#' + groupId + ' .selector-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset[dataKey] === value);
    });
}

function applyLoadTypeDefaults(loadType) {
    const meta = loadTypeMeta[loadType];
    if (!meta) return;

    state.colour = meta.defaultColour;
    state.soil   = meta.defaultSoil;
    state.size   = meta.defaultSize;
    state.cycle  = meta.recommendedCycle;

    syncSelectorGroup('colourGroup', 'colour', state.colour);
    syncSelectorGroup('soilGroup',   'soil',   state.soil);
    syncSelectorGroup('sizeGroup',   'size',   state.size);
    syncSelectorGroup('cycleGroup',  'cycle',  state.cycle);
    updateLoadTypePill();
    updateResult();
}

const ui = {
    doseAmount: document.getElementById('doseAmount'),
    doseUnit: document.getElementById('doseUnit'),
    tempBadge: document.getElementById('tempBadge'),
    cupComparison: document.getElementById('cupComparison'),
    concentrationRange: document.getElementById('concentrationRange'),
    concentrationValue: document.getElementById('concentrationValue'),
    detergentGuide: document.getElementById('detergentGuide'),
    detergentPill: document.getElementById('detergentPill'),
    loadTypePill: document.getElementById('loadTypePill'),
    loadTypeBackdrop: document.getElementById('loadTypeBackdrop'),
    loadTypeSheet: document.getElementById('loadTypeSheet'),
    loadTypeSheetDone: document.getElementById('loadTypeSheetDone'),
    cycleRec: document.getElementById('cycleRec'),
    installNudge: document.getElementById('installNudge'),
    installDismiss: document.getElementById('installDismiss'),
    presetTip: document.getElementById('presetTip'),
    presetTipToggle: document.getElementById('presetTipToggle'),
    presetTipTitle: document.getElementById('presetTipTitle'),
    presetTipBody: document.getElementById('presetTipBody'),
    presetTipInner: document.getElementById('presetTipInner'),
    detergentBar: document.getElementById('detergentBar'),
    detBarType: document.getElementById('detBarType'),
    detBarConc: document.getElementById('detBarConc'),
    detergentRec: document.getElementById('detergentRec'),
    detergentBackdrop: document.getElementById('detergentBackdrop'),
    detergentSheet: document.getElementById('detergentSheet'),
    sheetDone: document.getElementById('sheetDone'),
    sheetRec: document.getElementById('sheetRec')
};

const state = {
    size: 'medium',
    soil: 'normal',
    colour: 'mixed',
    cycle: 'everyday',
    detergent: readStorage(storageKeys.detergent, 'liquid'),
    concentration: parseFloat(readStorage(storageKeys.concentration, '1')) || 1,
    loadType: readStorage(storageKeys.loadType, 'everyday'),
};


function updateDetergentGuide() {
    if (!ui.detergentGuide) {
        return;
    }
    const info = detergentTypes[state.detergent] || detergentTypes.liquid;
    ui.detergentGuide.textContent = fallbackContent.guides[info.guideKey];
}

function updateSizeConstraints() {
    const maxKg = cycleMaxLoad[state.cycle] ?? 10;
    let sizeChanged = false;

    document.querySelectorAll('#sizeGroup .selector-btn').forEach(function(btn) {
        const kg = sizeKg[btn.dataset.size] ?? 10;
        if (kg > maxKg) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });

    // If current size is now disabled, switch to largest valid size
    if (sizeKg[state.size] > maxKg) {
        const validSizes = ['large', 'medium', 'small'].filter(function(s) {
            return (sizeKg[s] ?? 10) <= maxKg;
        });
        if (validSizes.length > 0) {
            state.size = validSizes[0];
            syncSelectorGroup('sizeGroup', 'size', state.size);
            sizeChanged = true;
        }
    }

    return sizeChanged;
}

function updateCycleIndicators() {
    const meta = loadTypeMeta[state.loadType];
    const rec = meta ? meta.recommendedCycle : null;
    document.querySelectorAll('#cycleGroup .selector-btn').forEach(function(btn) {
        btn.dataset.recommended = btn.dataset.cycle === rec ? 'true' : 'false';
    });
}

function updateCycleRec() {
    if (ui.cycleRec) ui.cycleRec.hidden = true;
}

function syncDetergentUI() {
    document.querySelectorAll('#detergentGroup .selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.detergent === state.detergent);
    });
    updateDetergentGuide();
}

function setupInstallNudge() {
    if (!ui.installNudge) {
        return;
    }
    const dismissed = readStorage(storageKeys.installNudge, 'no') === 'yes';
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (dismissed || isStandalone) {
        ui.installNudge.hidden = true;
        return;
    }

    ui.installNudge.hidden = false;
    if (ui.installDismiss) {
        ui.installDismiss.addEventListener('click', () => {
            ui.installNudge.hidden = true;
            writeStorage(storageKeys.installNudge, 'yes');
        });
    }
}

function getWarnings(size, soil, colour, cycle, detergentType) {
    const warnings = [];
    if (cycle === 'delicates' && soil === 'heavy') {
        warnings.push(fallbackContent.warnings.delicatesHeavy);
    }
    if (detergentType === 'pods' && size === 'small' && soil === 'light') {
        warnings.push(fallbackContent.warnings.podsSmallLight);
    }
    return warnings;
}

function getPodDose(size, soil) {
    let low = 1;
    let high = 1;
    if (size === 'large' || soil === 'heavy') {
        high = 2;
    }
    if (size === 'large' && soil === 'heavy') {
        low = 2;
    }
    return { low, high };
}

function roundToFive(value) {
    return Math.round(value / 5) * 5;
}

function snapToNearest(temp, available) {
    if (!available || available.length === 0) return temp;
    // Tie-break: returns the first closest match (arrays sorted ascending means lower wins).
    return available.reduce((prev, cur) =>
        Math.abs(cur - temp) < Math.abs(prev - temp) ? cur : prev
    );
}

function getDoseAndTemp(size, soil, colour, loadType, cycle, detergentType = state.detergent) {
    const baseData = dosageData[size][soil];
    const modifier = cycleModifiers[cycle] || cycleModifiers.everyday;
    const detergentInfo = detergentTypes[detergentType] || detergentTypes.liquid;

    let baseDose = Math.max(10, baseData.dose + modifier.doseAdjust);

    if (cycle === 'cottons' && soil === 'heavy') {
        baseDose = Math.min(35, baseDose);
    }

    // Derive temperature: Load Type x Colour -> recommended, then clamp to cycle range
    const loadTypeTemps = tempMatrix[loadType] || tempMatrix.everyday;
    const recommendedTemp = loadTypeTemps[colour] ?? 30;
    const available = cycleTemps[cycle] || cycleTemps.everyday;
    const tempNum = snapToNearest(recommendedTemp, available);
    const tempStr = tempNum + '\u00B0C';

    const tempMultiplier = tempNum <= 20 ? 1.12
                         : tempNum >= 60  ? 0.90
                         : 1.0;
    baseDose = baseDose * tempMultiplier;

    const warnings = getWarnings(size, soil, colour, cycle, detergentType);

    if (detergentType === 'pods') {
        const podDose = getPodDose(size, soil);
        const podAmount = podDose.low === podDose.high
            ? String(podDose.low)
            : podDose.low + '\u2013' + podDose.high;
        return {
            dose: 0,
            doseAmount: podAmount,
            doseUnit: podDose.low === 1 && podDose.high === 1
                ? fallbackContent.units.podSingular
                : fallbackContent.units.podPlural,
            tempStr,
            tip: fallbackContent.tips[colour],
            warnings,
            isPods: true
        };
    }

    const scaledDose = roundToFive(baseDose * state.concentration * detergentInfo.doseMultiplier);

    return {
        dose: scaledDose,
        doseAmount: String(scaledDose),
        doseUnit: fallbackContent.units.ml,
        tempStr,
        tip: fallbackContent.tips[colour],
        warnings,
        isPods: false
    };
}

function updateCup(amount) {
    try {
        const maxHeight = 73;
        const fillHeight = (amount / 75) * maxHeight;
        const yPosition = 93 - fillHeight;
        const liquidFill = document.getElementById('liquidFill');
        if (!liquidFill) {
            return;
        }
        liquidFill.setAttribute('y', yPosition);
        liquidFill.setAttribute('height', fillHeight);
    } catch (error) {
        return;
    }
}

let washerFillY = 56;
let washerAnimId = null;

function animateWasherFill(targetFillY, domeH) {
    const fill = document.getElementById('drumFill');
    if (!fill) return;

    if (washerAnimId) {
        cancelAnimationFrame(washerAnimId);
        washerAnimId = null;
    }

    const startFillY = washerFillY;
    const duration = 500;
    const startTime = performance.now();

    function step(now) {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const y = startFillY + (targetFillY - startFillY) * eased;
        fill.setAttribute('d', `M 17 ${y.toFixed(1)} Q 40 ${(y - domeH).toFixed(1)} 63 ${y.toFixed(1)} L 63 90 L 17 90 Z`);
        if (t < 1) {
            washerAnimId = requestAnimationFrame(step);
        } else {
            washerFillY = targetFillY;
            washerAnimId = null;
        }
    }

    washerAnimId = requestAnimationFrame(step);
}

function updateWasher(size, colour, soil) {
    const fill = document.getElementById('drumFill');
    if (!fill) return;

    const drumBottom = 81;
    const drumHeight = 46;
    const domeH = 7;
    const fillFractions = { small: 0.25, medium: 0.55, large: 0.80 };
    const targetFillY = Math.round(drumBottom - (fillFractions[size] || 0.55) * drumHeight);

    animateWasherFill(targetFillY, domeH);

    const colourFills = {
        whites:  { light: 'rgba(228, 240, 255, 0.90)', normal: 'rgba(212, 228, 252, 0.65)', heavy: 'rgba(198, 215, 242, 0.38)' },
        lights:  { light: 'rgba(255, 225, 65,  0.82)', normal: 'rgba(248, 210, 55,  0.56)', heavy: 'rgba(210, 168, 35,  0.30)' },
        colours: { light: 'rgba(248, 115, 180, 0.80)', normal: 'rgba(238, 98,  163, 0.52)', heavy: 'rgba(185, 52,  125, 0.27)' },
        darks:   { light: 'rgba(110, 90,  225, 0.86)', normal: 'rgba(80,  62,  178, 0.75)', heavy: 'rgba(52,  38,  128, 0.90)' },
        mixed:   { light: 'rgba(0,   225, 182, 0.70)', normal: 'rgba(0,   210, 168, 0.45)', heavy: 'rgba(0,   158, 125, 0.28)' }
    };
    const palette = colourFills[colour] || colourFills.mixed;
    fill.setAttribute('fill', palette[soil] || palette.normal);
}

function updateDetergentBar() {
    const label = state.detergent.charAt(0).toUpperCase() + state.detergent.slice(1);
    if (ui.detBarType) ui.detBarType.textContent = label;
    if (ui.detBarConc) ui.detBarConc.textContent = Math.round(state.concentration * 100) + '%';
    if (ui.detergentPill) ui.detergentPill.textContent = label;
}

function updateDetergentRec() {
    if (ui.detergentRec) ui.detergentRec.hidden = true;
}

function updateLoadTypePill() {
    if (!ui.loadTypePill) return;
    const meta = loadTypeMeta[state.loadType];
    if (meta) ui.loadTypePill.textContent = meta.label;
}

function syncLoadTypeSheetUI() {
    document.querySelectorAll('#loadTypeGrid .load-type-option').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.loadtype === state.loadType);
    });
}

function openLoadTypeSheet() {
    if (!ui.loadTypeBackdrop || !ui.loadTypeSheet) return;
    ui.loadTypeBackdrop.hidden = false;
    ui.loadTypeSheet.hidden = false;
    void ui.loadTypeSheet.offsetHeight;
    ui.loadTypeBackdrop.classList.add('visible');
    ui.loadTypeSheet.classList.add('visible');
    syncLoadTypeSheetUI();
}

function closeLoadTypeSheet() {
    if (!ui.loadTypeBackdrop || !ui.loadTypeSheet) return;
    ui.loadTypeBackdrop.classList.remove('visible');
    ui.loadTypeSheet.classList.remove('visible');
    let cleaned = false;
    const onEnd = function() {
        if (cleaned) return;
        cleaned = true;
        ui.loadTypeSheet.hidden = true;
        ui.loadTypeBackdrop.hidden = true;
        ui.loadTypeSheet.removeEventListener('transitionend', onEnd);
    };
    ui.loadTypeSheet.addEventListener('transitionend', onEnd);
    setTimeout(onEnd, 350);
}

function setupLoadTypeSheet() {
    if (ui.loadTypePill) {
        ui.loadTypePill.addEventListener('click', openLoadTypeSheet);
    }
    if (ui.loadTypeSheetDone) {
        ui.loadTypeSheetDone.addEventListener('click', closeLoadTypeSheet);
    }
    if (ui.loadTypeBackdrop) {
        ui.loadTypeBackdrop.addEventListener('click', closeLoadTypeSheet);
    }
    document.querySelectorAll('#loadTypeGrid .load-type-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            state.loadType = btn.dataset.loadtype;
            writeStorage(storageKeys.loadType, state.loadType);
            triggerHaptic();
            syncLoadTypeSheetUI();
            applyLoadTypeDefaults(state.loadType);
            closeLoadTypeSheet();
        });
    });
}

function updateSheetRec() {
    if (!ui.sheetRec) return;
    const meta = loadTypeMeta[state.loadType];
    if (!meta) {
        ui.sheetRec.hidden = true;
        return;
    }
    const rec = meta.recDetergent.charAt(0).toUpperCase() + meta.recDetergent.slice(1);
    ui.sheetRec.textContent = '\u2713 ' + rec + ' recommended for ' + meta.label;
    ui.sheetRec.hidden = false;
}

function updateLoadTypeTips() {
    if (!ui.presetTip) return;
    const meta = loadTypeMeta[state.loadType];
    if (!meta) {
        ui.presetTip.hidden = true;
        return;
    }

    const wasHidden = ui.presetTip.hidden;

    if (ui.presetTipTitle) {
        ui.presetTipTitle.textContent = meta.emoji + ' ' + meta.label + ' Tips';
    }

    if (ui.presetTipInner) {
        ui.presetTipInner.textContent = '';
        const loadTemps = tempMatrix[state.loadType];
        const tempValues = loadTemps ? Object.values(loadTemps) : [];
        const hasColourVariation = tempValues.length > 0 && new Set(tempValues).size > 1;

        const dynamicItems = [];
        if (hasColourVariation && loadTemps[state.colour] !== undefined) {
            const t = loadTemps[state.colour];
            const isLight = state.colour === 'whites' || state.colour === 'lights';
            const tipText = t >= 60
                ? t + '\u00B0C kills bacteria and dust mites. Recommended for ' + meta.label.toLowerCase() + '.'
                : isLight
                    ? t + '\u00B0C for everyday soiling. Use 60\u00B0C for deep cleaning or heavy soil.'
                    : t + '\u00B0C protects colours and fibres for ' + meta.label.toLowerCase() + '.';
            dynamicItems.push({ icon: '\u{1F4A1}', text: tipText });
        }

        // Cycle off-recommendation
        if (meta && state.cycle !== meta.recommendedCycle) {
            const recLabel = meta.recommendedCycle.charAt(0).toUpperCase() + meta.recommendedCycle.slice(1);
            const curLabel = state.cycle.charAt(0).toUpperCase() + state.cycle.slice(1);
            dynamicItems.push({ icon: '\u26A0\uFE0F', text: recLabel + ' cycle recommended for ' + meta.label + '. Currently using ' + curLabel + '.' });
        }

        // Detergent off-recommendation
        if (meta && meta.recDetergent !== state.detergent) {
            const rec = meta.recDetergent.charAt(0).toUpperCase() + meta.recDetergent.slice(1);
            const cur = state.detergent.charAt(0).toUpperCase() + state.detergent.slice(1);
            dynamicItems.push({ icon: '\u26A0\uFE0F', text: rec + ' detergent recommended for ' + meta.label + '. Currently using ' + cur + '.' });
        }

        // Other warnings (delicates+heavy, pods+small+light)
        const activeWarnings = getWarnings(state.size, state.soil, state.colour, state.cycle, state.detergent);
        activeWarnings.forEach(function(w) {
            dynamicItems.push({ icon: '\u26A0\uFE0F', text: w });
        });

        const allItems = dynamicItems
            .concat(meta.tips.map(function(t) { return { icon: '\u{1F4A1}', text: t }; }))
            .concat(meta.cautions.map(function(c) { return { icon: '\u26A0\uFE0F', text: c }; }));

        allItems.forEach(function(item) {
            const row = document.createElement('div');
            row.className = 'tip-item';

            const icon = document.createElement('span');
            icon.className = 'tip-icon';
            icon.textContent = item.icon;

            const text = document.createElement('span');
            text.className = 'tip-text';
            text.textContent = item.text;

            row.appendChild(icon);
            row.appendChild(text);
            ui.presetTipInner.appendChild(row);
        });
    }

    ui.presetTip.hidden = false;
    if (wasHidden) {
        ui.presetTip.classList.add('open');
        ui.presetTipBody.style.height = 'auto';
    } else if (ui.presetTip.classList.contains('open')) {
        ui.presetTipBody.style.height = 'auto';
    }
}

function updateResult() {
    if (!ui.doseAmount || !ui.doseUnit || !ui.tempBadge || !ui.cupComparison) {
        return;
    }

    updateSizeConstraints();

    const result = getDoseAndTemp(state.size, state.soil, state.colour, state.loadType, state.cycle, state.detergent);

    ui.doseAmount.textContent = result.doseAmount;
    ui.doseUnit.textContent = result.doseUnit;
    ui.tempBadge.textContent = `${fallbackContent.ui.tempIcon} ${result.tempStr}`;

    if (result.isPods) {
        updateCup(0);
        ui.cupComparison.textContent = fallbackContent.ui.podsComparison;
    } else {
        updateCup(result.dose);
        const percentOfMax = Math.round((result.dose / 75) * 100);
        ui.cupComparison.textContent = fallbackContent.ui.capComparison.replace('{percent}', String(percentOfMax));
    }

    updateWasher(state.size, state.colour, state.soil);
    updateLoadTypeTips();
    updateDetergentBar();
    updateDetergentRec();
    updateCycleIndicators();
    updateCycleRec();
}

const SECTION_SUBTITLES = {
    calculator:  'Calculate your dose',
    rules:       'Soft water guidelines',
    machine:     'Fisher & Paykel Series 7',
    maintenance: 'Keep your machine clean',
};

function bindNavTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            triggerHaptic();
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.section).classList.add('active');
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            const subtitle = SECTION_SUBTITLES[tab.dataset.section];
            if (subtitle) document.querySelector('.water-badge').textContent = subtitle;
        });
    });
}

function bindCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('open');
        });
    });
}

function bindKeyFactClose() {
    document.querySelectorAll('.key-fact-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.dismiss;
            if (key) {
                writeStorage(`${storageKeys.dismissPrefix}${key}`, 'yes');
            }
            const fact = btn.parentElement;
            fact.classList.add('key-fact-dismissing');
            fact.addEventListener('animationend', () => fact.remove(), { once: true });
        });
    });
}

function applyDismissedKeyFacts() {
    document.querySelectorAll('.key-fact').forEach((fact) => {
        const key = fact.dataset.key;
        if (!key) {
            return;
        }
        const dismissed = readStorage(`${storageKeys.dismissPrefix}${key}`, 'no') === 'yes';
        if (dismissed) {
            fact.remove();
        }
    });
}

function setupSelectors() {
    function setupSelector(groupId, variable, callback) {
        document.querySelectorAll(`#${groupId} .selector-btn`).forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                document.querySelectorAll(`#${groupId} .selector-btn`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(btn.dataset[variable]);
                updateResult();
                btn.blur();
            });
        });
    }

    setupSelector('sizeGroup', 'size', (val) => state.size = val);
    setupSelector('soilGroup', 'soil', (val) => state.soil = val);
    setupSelector('colourGroup', 'colour', (val) => state.colour = val);
    setupSelector('cycleGroup', 'cycle', (val) => { state.cycle = val; });
    setupSelector('detergentGroup', 'detergent', (val) => {
        state.detergent = val;
        writeStorage(storageKeys.detergent, val);
        updateDetergentGuide();
        updateDetergentBar();
        updateSheetRec();
    });

    if (ui.concentrationRange && ui.concentrationValue) {
        ui.concentrationRange.value = String(state.concentration);
        ui.concentrationValue.textContent = `${Math.round(state.concentration * 100)}%`;
        ui.concentrationRange.addEventListener('input', () => {
            state.concentration = parseFloat(ui.concentrationRange.value) || 1;
            ui.concentrationValue.textContent = `${Math.round(state.concentration * 100)}%`;
            writeStorage(storageKeys.concentration, String(state.concentration));
            updateResult();
        });
    }
}


function openDetergentSheet() {
    if (!ui.detergentBackdrop || !ui.detergentSheet) return;
    ui.detergentBackdrop.hidden = false;
    ui.detergentSheet.hidden = false;
    // Trigger reflow before adding visible class for transition
    void ui.detergentSheet.offsetHeight;
    ui.detergentBackdrop.classList.add('visible');
    ui.detergentSheet.classList.add('visible');
    syncDetergentUI();
    updateSheetRec();
}

function closeDetergentSheet() {
    if (!ui.detergentBackdrop || !ui.detergentSheet) return;
    ui.detergentBackdrop.classList.remove('visible');
    ui.detergentSheet.classList.remove('visible');
    let cleaned = false;
    const onEnd = () => {
        if (cleaned) return;
        cleaned = true;
        ui.detergentSheet.hidden = true;
        ui.detergentBackdrop.hidden = true;
        ui.detergentSheet.removeEventListener('transitionend', onEnd);
    };
    ui.detergentSheet.addEventListener('transitionend', onEnd);
    setTimeout(onEnd, 350);
    updateDetergentBar();
    updateResult();
}

function setupDetergentSheet() {
    if (ui.detergentPill) {
        ui.detergentPill.addEventListener('click', openDetergentSheet);
    }
    if (ui.sheetDone) {
        ui.sheetDone.addEventListener('click', closeDetergentSheet);
    }
    if (ui.detergentBackdrop) {
        ui.detergentBackdrop.addEventListener('click', closeDetergentSheet);
    }
}

function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    bindNavTabs();
    bindCollapsibles();
    bindKeyFactClose();
    applyDismissedKeyFacts();
    setupInstallNudge();
    setupSelectors();
    applyLoadTypeDefaults(state.loadType);
    syncDetergentUI();
    updateResult();
    setupDetergentSheet();
    setupLoadTypeSheet();
    if (ui.presetTipToggle) {
        ui.presetTipToggle.addEventListener('click', function() {
            const body = ui.presetTipBody;
            if (ui.presetTip.classList.contains('open')) {
                body.style.height = body.scrollHeight + 'px';
                void body.offsetHeight;
                requestAnimationFrame(function() {
                    body.style.height = '0';
                });
                ui.presetTip.classList.remove('open');
            } else {
                ui.presetTip.classList.add('open');
                body.style.height = body.scrollHeight + 'px';
                let done = false;
                const finish = function() {
                    if (done) return;
                    done = true;
                    body.style.height = 'auto';
                    body.removeEventListener('transitionend', finish);
                };
                body.addEventListener('transitionend', finish);
                setTimeout(finish, 350);
            }
        });
    }
}

init();
