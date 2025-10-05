
(function () {
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const displayEl = findDisplayElement();
    const buttons = findButtons();

    const state = {
      displayValue: "0",
      firstOperand: null,
      operator: null,
      waitingForSecondOperand: false,
      lastDecimalChar: null, 
    };

    function updateDisplay() {
      if ("value" in displayEl) {
        displayEl.value = state.displayValue;
      }
      if ("textContent" in displayEl) {
        displayEl.textContent = state.displayValue;
      }
    }

    function inputDigit(digit) {
      if (state.waitingForSecondOperand) {
        state.displayValue = digit;
        state.waitingForSecondOperand = false;
      } else {
        state.displayValue =
          state.displayValue === "0" ? digit : state.displayValue + digit;
      }
      updateDisplay();
    }

    function inputDecimal(char) {
      const sep = char === "," ? "," : ".";
      const hasDecimal =
        state.displayValue.includes(".") || state.displayValue.includes(",");

      if (state.waitingForSecondOperand) {
        state.displayValue = "0" + sep;
        state.waitingForSecondOperand = false;
        state.lastDecimalChar = sep;
        updateDisplay();
        return;
      }

      if (!hasDecimal) {
        state.displayValue += sep;
        state.lastDecimalChar = sep;
        updateDisplay();
      }
    }

    function clearAll() {
      state.displayValue = "0";
      state.firstOperand = null;
      state.operator = null;
      state.waitingForSecondOperand = false;
      state.lastDecimalChar = null;
      updateDisplay();
    }

    function parseNumber(str) {
      return parseFloat(str.replace(",", "."));
    }

    function removeTrailingZeros(num) {
    
      let s = Number(num.toPrecision(12)).toString();
      if (s.includes("e") || s.includes("E")) {
        s = num.toFixed(12);
      }
    
      s = s.replace(/\.?0+$/, "");
      if (s === "" || s === "-0") s = "0";
      return s;
    }

    function formatNumber(num) {
      if (!isFinite(num)) return "Error";
      const raw = removeTrailingZeros(num);
      const preferredSep =
        state.lastDecimalChar || (state.displayValue.includes(",") ? "," : ".");
      return preferredSep === "," ? raw.replace(".", ",") : raw;
    }

    function calculate(a, b, op) {
      switch (op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "/":
          return b === 0 ? Infinity : a / b;
        default:
          return b;
      }
    }

    function mapOperator(text) {
      const t = (text || "").trim();
      if (t === "+" || t === "＋") return "+";
      if (t === "-" || t === "−") return "-";
      if (t === "×" || t.toLowerCase() === "x" || t === "*") return "*";
      if (t === "÷" || t === "∕" || t === "/") return "/";
      return null;
    }

    function handleOperator(op) {
      const inputValue = parseNumber(state.displayValue);

      
      if (state.operator && state.waitingForSecondOperand) {
        state.operator = op;
        return;
      }

      if (state.firstOperand == null) {
        state.firstOperand = inputValue;
      } else if (state.operator) {
        const result = calculate(state.firstOperand, inputValue, state.operator);
        state.firstOperand = result;
        state.displayValue = formatNumber(result);
      }

      state.operator = op;
      state.waitingForSecondOperand = true;
      updateDisplay();
    }

    function handleEquals() {
      if (state.operator == null || state.waitingForSecondOperand) return;

      const secondOperand = parseNumber(state.displayValue);
      const result = calculate(state.firstOperand, secondOperand, state.operator);

      state.displayValue = formatNumber(result);
      state.firstOperand = null;
      state.operator = null;
      state.waitingForSecondOperand = false;
      updateDisplay();
    }

   
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-value") || btn.textContent.trim();

        if (/^\d$/.test(value)) {
          inputDigit(value);
          return;
        }
        if (value === "." || value === ",") {
          inputDecimal(value);
          return;
        }
        if (/^ac$|^c$|^ce$/i.test(value)) {
          clearAll();
          return;
        }
        if (value === "=" || value === "＝") {
          handleEquals();
          return;
        }
        const op = mapOperator(value);
        if (op) {
          handleOperator(op);
          return;
        }

       
      });
    });

    
    document.addEventListener("keydown", (e) => {
      const key = e.key;

      if (/^\d$/.test(key)) {
        inputDigit(key);
        return;
      }
      if (key === "." || key === ",") {
        e.preventDefault();
        inputDecimal(key);
        return;
      }
      if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleEquals();
        return;
      }
      if (key === "Escape") {
        clearAll();
        return;
      }
      if (key === "+" || key === "-" || key === "*" || key === "/") {
        handleOperator(key);
        return;
      }
      if (key.toLowerCase() === "x") {
        handleOperator("*");
        return;
      }
      if (key === "Backspace") {
        if (!state.waitingForSecondOperand) {
          if (state.displayValue.length > 1) {
            state.displayValue = state.displayValue.slice(0, -1);
          } else {
            state.displayValue = "0";
          }
          updateDisplay();
        }
      }
    });

    updateDisplay();
  }

  
  function findDisplayElement() {
    const candidates = [
      "[data-display]",
      ".display",
      ".calculator-display",
      "#display",
      ".screen",
      ".output",
      "input[type='text']",
      "input[type='search']",
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    throw new Error(
      "Не знайдено елемент дисплея. Додайте атрибут data-display або клас .display до елемента відображення."
    );
  }

  function findButtons() {
    // Пробуємо знайти контейнер кнопок, інакше — всі button на сторінці
    const container =
      document.querySelector(".buttons") ||
      document.querySelector(".keys") ||
      document.querySelector(".keypad") ||
      document.querySelector(".calculator") ||
      document;
    const buttons = Array.from(container.querySelectorAll("button"));
    if (!buttons.length) {
      throw new Error(
        "Не знайдено жодної кнопки <button>. Переконайтеся, що у вашому HTML використовуються кнопки."
      );
    }
    return buttons;
  }
})();