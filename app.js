// Dosage data based on soft water research
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

const colourData = {
    whites: {
        temp: '40–60°C',
        tempAdjust: 10,
        tip: 'Whites can handle higher temps. Use 60°C for towels/sheets to kill germs.'
    },
    lights: {
        temp: '30–40°C',
        tempAdjust: 0,
        tip: 'Light colours have low bleed risk. 40°C is safe for most items.'
    },
    colours: {
        temp: '30°C',
        tempAdjust: -5,
        tip: 'Wash bright colours at 30°C to prevent fading. Turn inside out.'
    },
    darks: {
        temp: '20–30°C',
        tempAdjust: -10,
        tip: 'Cold water prevents fading and dye bleed. Always turn inside out!'
    },
    mixed: {
        temp: '30°C',
        tempAdjust: 0,
        tip: 'Mixed loads work best at 30°C — safe for all colours.'
    }
};

const typeModifiers = {
    everyday: { doseAdjust: 0, tempOverride: null },
    bedding: { doseAdjust: 5, tempOverride: '60°C' },
    delicates: { doseAdjust: -5, tempOverride: '20–30°C' }
};

let currentSize = 'medium';
let currentSoil = 'normal';
let currentColour = 'mixed';
let currentType = 'everyday';

// Navigation
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.section).classList.add('active');
    });
});

// Collapsibles
document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
        header.parentElement.classList.toggle('open');
    });
});

// Key fact close buttons
document.querySelectorAll('.key-fact-close').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.parentElement.remove();
    });
});

// Calculator selectors
function setupSelector(groupId, variable, callback) {
    document.querySelectorAll(`#${groupId} .selector-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(`#${groupId} .selector-btn`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            callback(btn.dataset[variable]);
            updateResult();
        });
    });
}

setupSelector('sizeGroup', 'size', (val) => currentSize = val);
setupSelector('soilGroup', 'soil', (val) => currentSoil = val);
setupSelector('colourGroup', 'colour', (val) => currentColour = val);
setupSelector('typeGroup', 'type', (val) => currentType = val);

function updateResult() {
    const baseData = dosageData[currentSize][currentSoil];
    const colourInfo = colourData[currentColour];
    const modifier = typeModifiers[currentType];

    // Calculate dose
    let [low, high] = baseData.dose;
    low = Math.max(10, low + modifier.doseAdjust);
    high = Math.max(15, high + modifier.doseAdjust);

    // Clamp for bedding max
    if (currentType === 'bedding' && currentSoil === 'heavy') {
        high = Math.min(40, high);
    }

    // Determine temperature
    let tempStr = modifier.tempOverride || colourInfo.temp;

    // Special case: bedding overrides colour temp
    if (currentType === 'bedding') {
        tempStr = '60°C';
    } else if (currentType === 'delicates') {
        tempStr = '20–30°C';
    }

    const doseStr = `${low}–${high}`;

    document.getElementById('doseAmount').textContent = doseStr;
    document.getElementById('tempBadge').textContent = `🌡️ ${tempStr}`;
    document.getElementById('colourTipText').textContent = colourInfo.tip;

    // Update cup visual
    updateCup((low + high) / 2);

    // Update comparison text
    const avgDose = (low + high) / 2;
    const percentOfMax = Math.round((avgDose / 75) * 100);
    document.getElementById('cupComparison').textContent = `Only ${percentOfMax}% of a full cap!`;
}

function updateCup(amount) {
    // Cup visual: 75mL max, height maps from y=20 (75mL) to y=93 (0mL)
    // Total height range = 73px
    const maxHeight = 73;
    const fillHeight = (amount / 75) * maxHeight;
    const yPosition = 93 - fillHeight;

    const liquidFill = document.getElementById('liquidFill');
    liquidFill.setAttribute('y', yPosition);
    liquidFill.setAttribute('height', fillHeight);
}

// Quick reference card click handler
function setCalculator(size, soil, colour, type) {
    currentSize = size;
    currentSoil = soil;
    currentColour = colour;
    currentType = type;

    // Update UI
    document.querySelectorAll('#sizeGroup .selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
    document.querySelectorAll('#soilGroup .selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.soil === soil);
    });
    document.querySelectorAll('#colourGroup .selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.colour === colour);
    });
    document.querySelectorAll('#typeGroup .selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    updateResult();

    // Switch to calculator tab
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-section="calculator"]').classList.add('active');
    document.getElementById('calculator').classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize
updateResult();
