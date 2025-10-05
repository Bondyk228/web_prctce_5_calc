const result = document.getElementById("result");
const buttons = document.querySelectorAll(".buttons button");

let currentInput = "";
let lastInput = "";
let operator = null;
let resetNext = false;

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.getAttribute("data-value");

        if (button.classList.contains("clear")) {
            clear();
        } else if (button.classList.contains("operator")) {
            handleOperator(value);
        } else if (button.classList.contains("equals")) {
            calculate();
        } else {
            handleNumber(value);
        }

        updateDisplay();
    });
});

document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!isNaN(key) || key === "," || key === ".") {
        handleNumber(key === "," ? "." : key);
    } else if (["+", "-", "*", "/"].includes(key)) {
        handleOperator(key);
    } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        calculate();
    } else if (key === "Escape" || key.toLowerCase() === "c") {
        clear();
    } else if (key === "Backspace") {
        handleBackspace();
    }

    updateDisplay();
});

function handleNumber(value) {
    if (resetNext) {
        currentInput = "";
        resetNext = false;
    }
    if (value === "." && currentInput.includes(".")) return;
    currentInput += value;
}

function handleOperator(op) {
    if (currentInput === "" && lastInput === "") return;

    if (operator && currentInput !== "") {
        calculate();
    } else if (currentInput !== "") {
        lastInput = currentInput;
    }

    operator = op;
    resetNext = true;
}

function calculate() {
    if (!operator || currentInput === "" || lastInput === "") return;

    const num1 = parseFloat(lastInput);
    const num2 = parseFloat(currentInput);

    let resultValue = 0;

    switch (operator) {
        case "+": resultValue = num1 + num2; break;
        case "-": resultValue = num1 - num2; break;
        case "*": resultValue = num1 * num2; break;
        case "/":
            resultValue = num2 !== 0 ? num1 / num2 : "Error";
            break;
    }

    result.value = resultValue;
    lastInput = resultValue.toString();
    currentInput = "";
    operator = null;
    resetNext = true;
}

function clear() {
    currentInput = "";
    lastInput = "";
    operator = null;
    resetNext = false;
    result.value = "0";
}

function handleBackspace() {
    if (!resetNext && currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
    }
}

function updateDisplay() {
    if (currentInput !== "") {
        result.value = currentInput;
    } else if (lastInput !== "") {
        result.value = lastInput;
    } else {
        result.value = "0";
    }
}
