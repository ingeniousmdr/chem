
const AVOGADRO = 6.02e23;

let currentMode = "mass";

const modes = document.querySelectorAll(".mode");
const inputsContainer = document.getElementById("inputs");
const conditionField = document.getElementById("conditionField");

const calculateBtn = document.getElementById("calculateBtn");
const resultValue = document.getElementById("resultValue");
const resultUnit = document.getElementById("resultUnit");
const formula = document.getElementById("formula");
const error = document.getElementById("error");

// Gas conditions are only relevant to gas-volume calculations.
conditionField.style.display = "none";

// Input templates for each calculation

const inputTemplates = {
    mass: `
        <div class="field">
            <label for="mol">Number of moles (mol)</label>
            <input type="number" id="mol" placeholder="e.g. 2" step="any">
        </div>

        <div class="field">
            <label for="molarMass">Molar mass (g/mol)</label>
            <input type="number" id="molarMass" placeholder="e.g. 18" step="any">
        </div>
    `,

    volume: `
        <div class="field">
            <label for="mol">Number of moles (mol)</label>
            <input type="number" id="mol" placeholder="e.g. 2" step="any">
        </div>
    `,

    particles: `
        <div class="field">
            <label for="mol">Number of moles (mol)</label>
            <input type="number" id="mol" placeholder="e.g. 2" step="any">
        </div>
    `,

    moles: `
        <div class="field">
            <label for="inputValue">Value</label>
            <input type="number" id="inputValue" placeholder="Enter value" step="any">
        </div>

        <div class="field">
            <label for="moleMethod">Calculate moles from</label>
            <select id="moleMethod">
                <option value="mass">Mass</option>
                <option value="volume">Volume</option>
                <option value="particles">Particles</option>
            </select>
        </div>

        <div class="field" id="molarMassField">
            <label for="molarMass">Molar mass (g/mol)</label>
            <input type="number" id="molarMass" placeholder="e.g. 18" step="any">
        </div>
    `
};

// Change calculation mode

modes.forEach(button => {
    button.addEventListener("click", () => {

        currentMode = button.dataset.mode;

        modes.forEach(mode => mode.classList.remove("active"));
        button.classList.add("active");

        inputsContainer.innerHTML = inputTemplates[currentMode];

        conditionField.style.display =
            currentMode === "volume" ||
            (currentMode === "moles" &&
             document.getElementById("moleMethod")?.value === "volume")
                ? "flex"
                : "none";

        error.textContent = "";

        resultValue.textContent = "---";
        resultUnit.textContent = "Enter your values to calculate.";
        formula.textContent = "Formula: ---";
    });
});

// Handle changes in mole calculation method

inputsContainer.addEventListener("change", (event) => {

    if (event.target.id === "moleMethod") {

        const method = event.target.value;

        conditionField.style.display =
            method === "volume" ? "flex" : "none";

        const massField = document.getElementById("molarMassField");

        if (massField) {
            massField.style.display =
                method === "mass" ? "flex" : "none";
        }

        const input = document.getElementById("inputValue");

        if (input) {
            input.placeholder = {
                mass: "Enter mass in grams",
                volume: "Enter volume in litres",
                particles: "Enter number of particles"
            }[method];
        }
    }
});

// Get a valid positive input

function getInput(id, label) {

    const element = document.getElementById(id);

    if (!element || element.value.trim() === "") {
        throw new Error(`Please enter ${label}.`);
    }

    const value = Number(element.value);

    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} must be greater than zero.`);
    }

    return value;
}

// Format large numbers

function formatNumber(number) {

    if (number === 0) return "0";

    if (Math.abs(number) >= 1e6 || Math.abs(number) < 0.001) {
        return number.toExponential(4);
    }

    return Number(number.toPrecision(7)).toString();
}

// Main calculation function

function calculate() {

    error.textContent = "";

    try {

        let answer;
        let unit;
        let formulaText;

        const condition = Number(
            document.getElementById("condition").value
        );

        switch (currentMode) {

            case "mass": {

                const mol = getInput("mol", "number of moles");
                const molarMass = getInput("molarMass", "molar mass");

                answer = mol * molarMass;
                unit = "grams (g)";
                formulaText = `Mass = ${mol} × ${molarMass}`;

                break;
            }

            case "volume": {

                const mol = getInput("mol", "number of moles");

                answer = mol * condition;
                unit = "litres (L)";
                formulaText = `Volume = ${mol} × ${condition}`;

                break;
            }

            case "particles": {

                const mol = getInput("mol", "number of moles");

                answer = mol * AVOGADRO;
                unit = "particles";
                formulaText = `Particles = ${mol} × 6.02 × 10²³`;

                break;
            }

            case "moles": {

                const value = getInput("inputValue", "value");

                const method = document.getElementById("moleMethod").value;

                if (method === "mass") {

                    const molarMass = getInput("molarMass", "molar mass");

                    answer = value / molarMass;
                    formulaText = `Moles = ${value} ÷ ${molarMass}`;

                } else if (method === "volume") {

                    answer = value / condition;
                    formulaText = `Moles = ${value} ÷ ${condition}`;

                } else {

                    answer = value / AVOGADRO;
                    formulaText = `Moles = ${value} ÷ 6.02 × 10²³`;
                }

                unit = "moles (mol)";

                break;
            }

            default:
                throw new Error("Invalid calculation mode.");
        }

        if (!Number.isFinite(answer)) {
            throw new Error("The result is outside the supported range.");
        }

        resultValue.textContent = formatNumber(answer);
        resultUnit.textContent = unit;
        formula.textContent = "Formula: " + formulaText;

    } catch (err) {

        error.textContent = err.message;

    }
}

// Calculate button

calculateBtn.addEventListener("click", calculate);
