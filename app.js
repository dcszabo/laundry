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
    everyday:   { whites: 40, lights: 40, colours: 30, darks: 30, mixed: 30 },
    towels:     { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    bedding:    { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    underwear:  { whites: 60, lights: 60, colours: 40, darks: 40, mixed: 40 },
    delicates:  { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    wool:       { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    activewear: { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
    jeans:      { whites: 30, lights: 30, colours: 30, darks: 30, mixed: 30 },
};

// VERIFY these against the WH1060P4 manual before shipping — these are estimates.
const cycleTemps = {
    cottons:   [20, 30, 40, 60, 90],
    everyday:  [20, 30, 40, 60],
    heavy:     [20, 30, 40, 60, 90],
    delicates: [20, 30, 40],
    wool:      [30],
    quick:     [20, 30],
    bulky:     [30, 40, 60],
    easyiron:  [20, 30, 40, 60],
};

const detergentTypes = {
    liquid: { doseMultiplier: 1, guideKey: 'liquid' },
    powder: { doseMultiplier: 0.9, guideKey: 'powder' },
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
        whites: 'Use 60°C for towels, bedding and underwear to kill germs. 40°C is fine for everyday cotton shirts.',
        lights: 'Light colours have low bleed risk. 40°C is safe for most items.',
        colours: 'Wash bright colours at 30°C to prevent fading. Turn inside out.',
        darks: 'Cold water prevents fading and dye bleed. Always turn inside out!',
        mixed: 'Mixed loads work best at 30°C — safe for all colours.'
    },
    warnings: {
        delicatesHeavy: 'Delicates + heavy soil: pre-treat stains or switch to Everyday.',
        beddingDarks: 'High temp cotton cycles can fade darks/brights. Consider 40°C or split loads.',
        podsSmallLight: 'Pods may be too strong for very small/light loads.'
    },
    guides: {
        liquid: 'Liquid is the default for front loaders.',
        powder: 'Powder is slightly more concentrated. Use a bit less.',
        pods: 'Pods: 1 for small/medium, 2 for large or heavy loads.'
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
    meta: {
        soil: {
            light: { icon: 'L', label: 'Light', className: 'chip-soil-light' },
            normal: { icon: 'N', label: 'Normal', className: 'chip-soil-normal' },
            heavy: { icon: 'H', label: 'Heavy', className: 'chip-soil-heavy' }
        },
        colour: {
            whites: { icon: 'W', label: 'Whites', className: 'chip-colour-whites' },
            lights: { icon: 'L', label: 'Lights', className: 'chip-colour-lights' },
            colours: { icon: 'C', label: 'Colours', className: 'chip-colour-colours' },
            darks: { icon: 'D', label: 'Darks', className: 'chip-colour-darks' },
            mixed: { icon: 'M', label: 'Mixed', className: 'chip-colour-mixed' }
        }
    }
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
            'Wash sheets every 1–2 weeks.',
            'Ensure bedding has room to tumble freely — don\'t overfill.',
            'Use the Bulky cycle for duvets and large single items.'
        ],
        cautions: [
            'Use 60°C for whites to kill dust mites and bacteria.',
            'Skip fabric softener — it reduces breathability.'
        ]
    },
    'towels': {
        emoji: '🧺', label: 'Towels',
        defaultColour: 'whites', defaultSoil: 'normal', defaultSize: 'large',
        recommendedCycle: 'cottons',
        recDetergent: 'powder',
        cycle: 'Cottons', maxLoad: '10 kg',
        tips: [
            'Shake towels out before loading for better results.',
            'Whites: 60°C kills bacteria and dust mites. Colours: 40°C is the hygiene minimum.'
        ],
        cautions: [
            'Never use fabric softener — it coats fibres and ruins absorbency.'
        ]
    },
    'delicates': {
        emoji: '🩱', label: 'Delicates',
        defaultColour: 'mixed', defaultSoil: 'light', defaultSize: 'small',
        recommendedCycle: 'delicates',
        recDetergent: 'liquid',
        cycle: 'Delicate', maxLoad: '4 kg',
        tips: [
            'Use mesh bags for bras, lingerie, and anything with hooks.'
        ],
        cautions: [
            'Never tumble dry delicates.',
            'Air dry flat and reshape while damp.',
            'Use non-bio detergent — bio enzymes damage silk and fine fabrics.'
        ]
    },
    'wool': {
        emoji: '🧶', label: 'Wool',
        defaultColour: 'mixed', defaultSoil: 'light', defaultSize: 'small',
        recommendedCycle: 'wool',
        recDetergent: 'liquid',
        cycle: 'Wool', maxLoad: '2 kg',
        tips: [
            'Lay flat to dry — never hang or tumble dry.'
        ],
        cautions: [
            'Use wool-safe non-bio detergent only — bio enzymes digest keratin and cause holes.',
            'Never wring or twist woollen items.'
        ]
    },
    'activewear': {
        emoji: '🏃', label: 'Activewear',
        defaultColour: 'darks', defaultSoil: 'heavy', defaultSize: 'medium',
        recommendedCycle: 'everyday',
        recDetergent: 'liquid',
        cycle: 'Everyday Cold', maxLoad: '10 kg',
        tips: [
            'Turn inside out before washing.',
            'Cold water preserves elasticity and wicking properties.'
        ],
        cautions: [
            'Never use fabric softener — it clogs wicking pores and causes permanent odour.',
            'Air dry rather than tumble drying.'
        ]
    },
    'jeans': {
        emoji: '👖', label: 'Jeans',
        defaultColour: 'darks', defaultSoil: 'normal', defaultSize: 'medium',
        recommendedCycle: 'delicates',
        recDetergent: 'liquid',
        cycle: 'Delicate', maxLoad: '10 kg',
        tips: [
            'Turn inside out to prevent fading and white streaks.',
            'Wash less often — spot clean between washes.'
        ],
        cautions: [
            'Use cold water to preserve indigo dye and stretch.',
            'Delicate cycle reduces abrasion that accelerates fading.'
        ]
    },
    'underwear': {
        emoji: '🩲', label: 'Underwear',
        defaultColour: 'whites', defaultSoil: 'normal', defaultSize: 'small',
        recommendedCycle: 'cottons',
        recDetergent: 'liquid',
        cycle: 'Cottons', maxLoad: '10 kg',
        tips: [
            'NHS recommends 60°C for cotton underwear to kill bacteria.',
            'Synthetic underwear (nylon, microfibre): use Delicate cycle at 40°C max.'
        ],
        cautions: [
            '40°C is acceptable only with bio detergent.',
            'Synthetic underwear max 40°C — high heat damages elastane.'
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
}

const ui = {
    doseAmount: document.getElementById('doseAmount'),
    doseUnit: document.getElementById('doseUnit'),
    tempBadge: document.getElementById('tempBadge'),
    colourTipText: document.getElementById('colourTipText'),
    cupComparison: document.getElementById('cupComparison'),
    warningBanner: document.getElementById('warningBanner'),
    concentrationRange: document.getElementById('concentrationRange'),
    concentrationValue: document.getElementById('concentrationValue'),
    detergentGuide: document.getElementById('detergentGuide'),
    loadTypeSelect: document.getElementById('loadTypeSelect'),
    cycleRec: document.getElementById('cycleRec'),
    installNudge: document.getElementById('installNudge'),
    installDismiss: document.getElementById('installDismiss'),
    presetTip: document.getElementById('presetTip'),
    presetTipTitle: document.getElementById('presetTipTitle'),
    presetTipBody: document.getElementById('presetTipBody'),
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

function updateCycleIndicators() {
    const meta = loadTypeMeta[state.loadType];
    const rec = meta ? meta.recommendedCycle : null;
    document.querySelectorAll('#cycleGroup .selector-btn').forEach(function(btn) {
        btn.dataset.recommended = btn.dataset.cycle === rec ? 'true' : 'false';
    });
}

function updateCycleRec() {
    if (!ui.cycleRec) return;
    const meta = loadTypeMeta[state.loadType];
    if (!meta || state.cycle === meta.recommendedCycle) {
        ui.cycleRec.hidden = true;
        return;
    }
    const recLabel = meta.recommendedCycle.charAt(0).toUpperCase() + meta.recommendedCycle.slice(1);
    const curLabel = state.cycle.charAt(0).toUpperCase() + state.cycle.slice(1);
    ui.cycleRec.textContent = '\u{1F4A1} ' + recLabel + ' cycle recommended for ' + meta.label + ' \u2014 you\u2019re using ' + curLabel;
    ui.cycleRec.hidden = false;
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

function getWarnings(size, soil, colour, cycle, detergentType) {
    const warnings = [];
    if (cycle === 'delicates' && soil === 'heavy') {
        warnings.push(fallbackContent.warnings.delicatesHeavy);
    }
    if (cycle === 'cottons' && (colour === 'darks' || colour === 'colours')) {
        warnings.push(fallbackContent.warnings.beddingDarks);
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
    // Tie-break: prefers the lower value (arrays are expected sorted ascending).
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
    const soilGroup = document.getElementById('drumSoil');
    if (!fill) return;

    const drumBottom = 81;
    const drumHeight = 46;
    const domeH = 7;
    const fillFractions = { small: 0.25, medium: 0.55, large: 0.80 };
    const targetFillY = Math.round(drumBottom - (fillFractions[size] || 0.55) * drumHeight);

    animateWasherFill(targetFillY, domeH);

    const colourFills = {
        whites:  'rgba(210, 230, 255, 0.70)',
        lights:  'rgba(255, 215, 80,  0.55)',
        colours: 'rgba(240, 100, 170, 0.50)',
        darks:   'rgba(60,  50,  130, 0.78)',
        mixed:   'rgba(0,   212, 170, 0.45)'
    };
    fill.setAttribute('fill', colourFills[colour] || colourFills.mixed);

    if (soilGroup) {
        const counts = { light: 2, normal: 4, heavy: 6 };
        const count  = counts[soil] || 4;
        soilGroup.querySelectorAll('circle').forEach((dot, i) => {
            dot.style.display = i < count ? '' : 'none';
        });
    }
}

function updateDetergentBar() {
    if (ui.detBarType) ui.detBarType.textContent = state.detergent.charAt(0).toUpperCase() + state.detergent.slice(1);
    if (ui.detBarConc) ui.detBarConc.textContent = Math.round(state.concentration * 100) + '%';
}

function updateDetergentRec() {
    if (!ui.detergentRec) return;
    const meta = loadTypeMeta[state.loadType];
    if (!meta) {
        ui.detergentRec.hidden = true;
        return;
    }
    if (meta.recDetergent === state.detergent) {
        ui.detergentRec.hidden = true;
        return;
    }
    const rec = meta.recDetergent.charAt(0).toUpperCase() + meta.recDetergent.slice(1);
    const cur = state.detergent.charAt(0).toUpperCase() + state.detergent.slice(1);
    ui.detergentRec.textContent = '\u{1F4A1} ' + rec + ' recommended for ' + meta.label + ' \u2014 you\u2019re using ' + cur;
    ui.detergentRec.hidden = false;
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

    if (ui.presetTipTitle) {
        ui.presetTipTitle.textContent = meta.emoji + ' ' + meta.label + ' Tips';
    }

    if (ui.presetTipBody) {
        ui.presetTipBody.textContent = '';
        const allItems = meta.tips.map(function(t) { return { icon: '\u{1F4A1}', text: t }; })
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
            ui.presetTipBody.appendChild(row);
        });
    }

    ui.presetTip.hidden = false;
}

function updateResult() {
    if (!ui.doseAmount || !ui.doseUnit || !ui.tempBadge || !ui.colourTipText || !ui.cupComparison) {
        return;
    }

    const result = getDoseAndTemp(state.size, state.soil, state.colour, state.loadType, state.cycle, state.detergent);

    ui.doseAmount.textContent = result.doseAmount;
    ui.doseUnit.textContent = result.doseUnit;
    ui.tempBadge.textContent = `${fallbackContent.ui.tempIcon} ${result.tempStr}`;
    ui.colourTipText.textContent = result.tip;

    if (result.isPods) {
        updateCup(0);
        ui.cupComparison.textContent = fallbackContent.ui.podsComparison;
    } else {
        updateCup(result.dose);
        const percentOfMax = Math.round((result.dose / 75) * 100);
        ui.cupComparison.textContent = fallbackContent.ui.capComparison.replace('{percent}', String(percentOfMax));
    }

    if (ui.warningBanner) {
        if (result.warnings.length) {
            ui.warningBanner.textContent = result.warnings.join(' ');
            ui.warningBanner.hidden = false;
        } else {
            ui.warningBanner.textContent = '';
            ui.warningBanner.hidden = true;
        }
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
    quick:       'Quick reference presets',
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

function setupSelectors() {
    function setupSelector(groupId, variable, callback) {
        document.querySelectorAll(`#${groupId} .selector-btn`).forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                document.querySelectorAll(`#${groupId} .selector-btn`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                callback(btn.dataset[variable]);
                updateResult();
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

    if (ui.loadTypeSelect) {
        ui.loadTypeSelect.value = state.loadType;
        ui.loadTypeSelect.addEventListener('change', function() {
            state.loadType = ui.loadTypeSelect.value;
            writeStorage(storageKeys.loadType, state.loadType);
            triggerHaptic();
            applyLoadTypeDefaults(state.loadType);
            updateResult();
        });
    }

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
    if (ui.detergentBar) {
        ui.detergentBar.addEventListener('click', openDetergentSheet);
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
    if (ui.loadTypeSelect) {
        ui.loadTypeSelect.value = state.loadType;
    }
    applyLoadTypeDefaults(state.loadType);
    syncDetergentUI();
    updateResult();
    setupDetergentSheet();
}

init();
