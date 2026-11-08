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

const inputTemplates = {
  mass: `
    <div class="field">
      <label for="mol">Amount of substance (mol)</label>
      <input type="number" id="mol" placeholder="For example, 2" step="any" min="0" inputmode="decimal">
    </div>
    <div class="field">
      <label for="molarMass">Molar mass (g/mol)</label>
      <input type="number" id="molarMass" placeholder="For example, 18" step="any" min="0" inputmode="decimal">
    </div>`,
  volume: `
    <div class="field">
      <label for="mol">Amount of substance (mol)</label>
      <input type="number" id="mol" placeholder="For example, 2" step="any" min="0" inputmode="decimal">
    </div>`,
  particles: `
    <div class="field">
      <label for="mol">Amount of substance (mol)</label>
      <input type="number" id="mol" placeholder="For example, 2" step="any" min="0" inputmode="decimal">
    </div>`,
  moles: `
    <div class="field">
      <label for="inputValue" id="inputValueLabel">Mass (g)</label>
      <input type="number" id="inputValue" placeholder="Enter the value from your question" step="any" min="0" inputmode="decimal">
    </div>
    <div class="field">
      <label for="moleMethod">Calculate moles from</label>
      <select id="moleMethod">
        <option value="mass">Mass</option>
        <option value="volume">Gas volume</option>
        <option value="particles">Number of particles</option>
      </select>
    </div>
    <div class="field" id="molarMassField">
      <label for="molarMass">Molar mass (g/mol)</label>
      <input type="number" id="molarMass" placeholder="For example, 18" step="any" min="0" inputmode="decimal">
    </div>`
};

function resetResult() {
  error.textContent = "";
  resultValue.textContent = "—";
  resultUnit.textContent = "Enter your values to calculate.";
  formula.textContent = "Formula: —";
}

function updateMoleMethod() {
  const method = document.getElementById("moleMethod")?.value;
  const massField = document.getElementById("molarMassField");
  const valueLabel = document.getElementById("inputValueLabel");
  const valueInput = document.getElementById("inputValue");

  conditionField.style.display = method === "volume" ? "flex" : "none";
  if (massField) massField.style.display = method === "mass" ? "flex" : "none";

  const details = {
    mass: { label: "Mass (g)", placeholder: "Enter mass in grams" },
    volume: { label: "Gas volume (L)", placeholder: "Enter volume in litres" },
    particles: { label: "Number of particles", placeholder: "Enter particle count" }
  }[method || "mass"];

  if (valueLabel) valueLabel.textContent = details.label;
  if (valueInput) valueInput.placeholder = details.placeholder;
}

modes.forEach(button => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    modes.forEach(mode => {
      const active = mode === button;
      mode.classList.toggle("active", active);
      mode.setAttribute("aria-pressed", String(active));
    });

    inputsContainer.innerHTML = inputTemplates[currentMode];
    conditionField.style.display = currentMode === "volume" ? "flex" : "none";
    if (currentMode === "moles") updateMoleMethod();
    resetResult();
  });
});

inputsContainer.addEventListener("change", event => {
  if (event.target.id === "moleMethod") {
    updateMoleMethod();
    resetResult();
  }
});

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

function formatNumber(number) {
  if (number === 0) return "0";
  if (Math.abs(number) >= 1e6 || Math.abs(number) < 0.001) {
    return number.toExponential(4);
  }
  return Number(number.toPrecision(7)).toString();
}

function calculate() {
  error.textContent = "";

  try {
    let answer;
    let unit;
    let formulaText;
    const condition = Number(document.getElementById("condition").value);

    switch (currentMode) {
      case "mass": {
        const mol = getInput("mol", "amount of substance");
        const molarMass = getInput("molarMass", "molar mass");
        answer = mol * molarMass;
        unit = "grams (g)";
        formulaText = `Mass = n × M = ${mol} × ${molarMass}`;
        break;
      }
      case "volume": {
        const mol = getInput("mol", "amount of substance");
        answer = mol * condition;
        unit = "litres (L)";
        formulaText = `Volume = n × Vₘ = ${mol} × ${condition}`;
        break;
      }
      case "particles": {
        const mol = getInput("mol", "amount of substance");
        answer = mol * AVOGADRO;
        unit = "particles";
        formulaText = `Particles = n × Nₐ = ${mol} × 6.02 × 10²³`;
        break;
      }
      case "moles": {
        const value = getInput("inputValue", "the value");
        const method = document.getElementById("moleMethod").value;

        if (method === "mass") {
          const molarMass = getInput("molarMass", "molar mass");
          answer = value / molarMass;
          formulaText = `n = m ÷ M = ${value} ÷ ${molarMass}`;
        } else if (method === "volume") {
          answer = value / condition;
          formulaText = `n = V ÷ Vₘ = ${value} ÷ ${condition}`;
        } else {
          answer = value / AVOGADRO;
          formulaText = `n = N ÷ Nₐ = ${value} ÷ (6.02 × 10²³)`;
        }
        unit = "moles (mol)";
        break;
      }
      default:
        throw new Error("Choose a valid calculation.");
    }

    if (!Number.isFinite(answer)) {
      throw new Error("The result is outside the supported range.");
    }

    resultValue.textContent = formatNumber(answer);
    resultUnit.textContent = unit;
    formula.textContent = `Formula: ${formulaText}`;
  } catch (err) {
    error.textContent = err.message || "Something went wrong. Check your values and try again.";
  }
}

calculateBtn.addEventListener("click", calculate);
