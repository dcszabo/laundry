// @ts-check
const dosageData = {
    small: {
        light: { dose: [10, 15] },
        normal: { dose: [15, 20] },
        heavy: { dose: [20, 25] }
    },
    medium: {
        light: { dose: [15, 20] },
        normal: { dose: [20, 25] },
        heavy: { dose: [25, 30] }
    },
    large: {
        light: { dose: [20, 25] },
        normal: { dose: [25, 30] },
        heavy: { dose: [30, 35] }
    }
};

const typeModifiers = {
    everyday: { doseAdjust: 0 },
    bedding: { doseAdjust: 5 },
    delicates: { doseAdjust: -5 }
};

const detergentTypes = {
    liquid: { doseMultiplier: 1, guideKey: 'liquid' },
    powder: { doseMultiplier: 0.9, guideKey: 'powder' },
    pods: { doseMultiplier: 1, guideKey: 'pods' }
};

const fallbackContent = {
    temps: {
        whites: '40–60°C',
        lights: '30–40°C',
        colours: '30°C',
        darks: '20–30°C',
        mixed: '30°C',
        bedding: '60°C',
        delicates: '20–30°C'
    },
    tips: {
        whites: 'Whites can handle higher temps. Use 60°C for towels/sheets to kill germs.',
        lights: 'Light colours have low bleed risk. 40°C is safe for most items.',
        colours: 'Wash bright colours at 30°C to prevent fading. Turn inside out.',
        darks: 'Cold water prevents fading and dye bleed. Always turn inside out!',
        mixed: 'Mixed loads work best at 30°C — safe for all colours.'
    },
    warnings: {
        delicatesHeavy: 'Delicates + heavy soil: pre-treat stains or switch to Everyday.',
        beddingDarks: 'Hot bedding cycles can fade darks/brights. Consider 40°C or split loads.',
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
    },
    quickReferenceFallback: [
        { label: 'Everyday', emoji: '👕', size: 'medium', soil: 'normal', colour: 'mixed', type: 'everyday' },
        { label: 'Bedding', emoji: '🛏️', size: 'large', soil: 'heavy', colour: 'whites', type: 'bedding' },
        { label: 'Towels', emoji: '🧺', size: 'large', soil: 'normal', colour: 'whites', type: 'bedding' },
        { label: 'Delicates', emoji: '🩱', size: 'small', soil: 'light', colour: 'mixed', type: 'delicates' },
        { label: 'Wool', emoji: '🧶', size: 'small', soil: 'light', colour: 'mixed', type: 'delicates' },
        { label: 'Activewear', emoji: '🏃', size: 'medium', soil: 'heavy', colour: 'darks', type: 'everyday' },
        { label: 'Jeans', emoji: '👖', size: 'medium', soil: 'heavy', colour: 'darks', type: 'everyday' },
        { label: 'Underwear', emoji: '🩲', size: 'small', soil: 'normal', colour: 'whites', type: 'everyday' }
    ]
};

const storageKeys = {
    concentration: 'laundry.concentrationFactor',
    detergent: 'laundry.detergentType',
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
    quickGrid: document.getElementById('quickGrid'),
    quickStatus: document.getElementById('quickStatus'),
    installNudge: document.getElementById('installNudge'),
    installDismiss: document.getElementById('installDismiss')
};

const state = {
    size: 'medium',
    soil: 'normal',
    colour: 'mixed',
    type: 'everyday',
    detergent: readStorage(storageKeys.detergent, 'liquid'),
    concentration: parseFloat(readStorage(storageKeys.concentration, '1')) || 1
};

function setStatus(message) {
    if (!ui.quickStatus) {
        return;
    }
    if (!message) {
        ui.quickStatus.textContent = '';
        ui.quickStatus.hidden = true;
        return;
    }
    ui.quickStatus.textContent = message;
    ui.quickStatus.hidden = false;
}

function updateDetergentGuide() {
    if (!ui.detergentGuide) {
        return;
    }
    const info = detergentTypes[state.detergent] || detergentTypes.liquid;
    ui.detergentGuide.textContent = fallbackContent.guides[info.guideKey];
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

function getWarnings(size, soil, colour, type, detergentType) {
    const warnings = [];
    if (type === 'delicates' && soil === 'heavy') {
        warnings.push(fallbackContent.warnings.delicatesHeavy);
    }
    if (type === 'bedding' && (colour === 'darks' || colour === 'colours')) {
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

function getDoseAndTemp(size, soil, colour, type, detergentType = state.detergent) {
    const baseData = dosageData[size][soil];
    const modifier = typeModifiers[type];
    const detergentInfo = detergentTypes[detergentType] || detergentTypes.liquid;

    let [low, high] = baseData.dose;
    low = Math.max(10, low + modifier.doseAdjust);
    high = Math.max(15, high + modifier.doseAdjust);

    if (type === 'bedding' && soil === 'heavy') {
        high = Math.min(40, high);
    }

    let tempStr = fallbackContent.temps[colour];
    if (type === 'bedding') {
        tempStr = fallbackContent.temps.bedding;
    } else if (type === 'delicates') {
        tempStr = fallbackContent.temps.delicates;
    }

    const warnings = getWarnings(size, soil, colour, type, detergentType);

    if (detergentType === 'pods') {
        const podDose = getPodDose(size, soil);
        const podAmount = podDose.low === podDose.high ? `${podDose.low}` : `${podDose.low}–${podDose.high}`;
        return {
            doseLow: 0,
            doseHigh: 0,
            doseAmount: podAmount,
            doseUnit: podDose.low === 1 && podDose.high === 1 ? fallbackContent.units.podSingular : fallbackContent.units.podPlural,
            tempStr,
            tip: fallbackContent.tips[colour],
            warnings,
            isPods: true
        };
    }

    const scaledLow = roundToFive(low * state.concentration * detergentInfo.doseMultiplier);
    const scaledHigh = roundToFive(high * state.concentration * detergentInfo.doseMultiplier);

    return {
        doseLow: scaledLow,
        doseHigh: scaledHigh,
        doseAmount: `${scaledLow}–${scaledHigh}`,
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

function updateResult() {
    if (!ui.doseAmount || !ui.doseUnit || !ui.tempBadge || !ui.colourTipText || !ui.cupComparison) {
        return;
    }

    const result = getDoseAndTemp(state.size, state.soil, state.colour, state.type, state.detergent);

    ui.doseAmount.textContent = result.doseAmount;
    ui.doseUnit.textContent = result.doseUnit;
    ui.tempBadge.textContent = `${fallbackContent.ui.tempIcon} ${result.tempStr}`;
    ui.colourTipText.textContent = result.tip;

    if (result.isPods) {
        updateCup(0);
        ui.cupComparison.textContent = fallbackContent.ui.podsComparison;
    } else {
        updateCup((result.doseLow + result.doseHigh) / 2);
        const avgDose = (result.doseLow + result.doseHigh) / 2;
        const percentOfMax = Math.round((avgDose / 75) * 100);
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
}

function bindNavTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            triggerHaptic();
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.section).classList.add('active');
            tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
            btn.parentElement.remove();
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
    setupSelector('typeGroup', 'type', (val) => state.type = val);
    setupSelector('detergentGroup', 'detergent', (val) => {
        state.detergent = val;
        writeStorage(storageKeys.detergent, val);
        updateDetergentGuide();
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

function renderQuickReference() {
    if (!ui.quickGrid) {
        return;
    }

    const data = fallbackContent.quickReferenceFallback;
    if (!Array.isArray(data) || data.length === 0) {
        setStatus('Quick reference is unavailable right now.');
        return;
    }

    setStatus('');
    const fragment = document.createDocumentFragment();
    ui.quickGrid.innerHTML = '';
    data.forEach(item => {
        const result = getDoseAndTemp(
            item.size,
            item.soil,
            item.colour,
            item.type
        );
        const soilInfo = fallbackContent.meta.soil[item.soil] || fallbackContent.meta.soil.normal;
        const colourInfo = fallbackContent.meta.colour[item.colour] || fallbackContent.meta.colour.mixed;
        const card = document.createElement('div');
        card.className = 'load-type-card';
        card.dataset.size = item.size;
        card.dataset.soil = item.soil;
        card.dataset.colour = item.colour;
        card.dataset.type = item.type;
        card.innerHTML = `
            <div class="load-type-header">
                <span class="load-type-name"><span class="emoji">${item.emoji}</span> ${item.label}</span>
            </div>
            <div class="quick-meta">
                <span class="quick-chip ${soilInfo.className}">${soilInfo.icon} ${soilInfo.label}</span>
                <span class="quick-chip ${colourInfo.className}">${colourInfo.icon} ${colourInfo.label}</span>
            </div>
            <div class="quick-dose">
                <div class="quick-dose-item">
                    <div class="quick-dose-label">${fallbackContent.ui.detergentLabel}</div>
                    <div class="quick-dose-value">${result.doseAmount}${result.doseUnit}</div>
                </div>
                <div class="quick-dose-item">
                    <div class="quick-dose-label">${fallbackContent.ui.tempLabel}</div>
                    <div class="quick-dose-value temp">${result.tempStr}</div>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    ui.quickGrid.appendChild(fragment);
    document.querySelectorAll('.load-type-card').forEach(card => {
        card.addEventListener('click', () => {
            triggerHaptic();
            state.size = card.dataset.size;
            state.soil = card.dataset.soil;
            state.colour = card.dataset.colour;
            state.type = card.dataset.type;

            document.querySelectorAll('#sizeGroup .selector-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.size === state.size);
            });
            document.querySelectorAll('#soilGroup .selector-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.soil === state.soil);
            });
            document.querySelectorAll('#colourGroup .selector-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.colour === state.colour);
            });
            document.querySelectorAll('#typeGroup .selector-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === state.type);
            });

            updateResult();

            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelector('[data-section="calculator"]').classList.add('active');
            document.getElementById('calculator').classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
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
    renderQuickReference();
    syncDetergentUI();
    updateResult();
}

init();
