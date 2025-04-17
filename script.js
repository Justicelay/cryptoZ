// Mobile menu toggle functionality
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const authButtons = document.querySelector(".auth-buttons");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", function () {
      this.classList.toggle("active");

      // Create mobile menu if it doesn't exist
      if (!document.querySelector(".mobile-menu")) {
        const mobileMenu = document.createElement("div");
        mobileMenu.className = "mobile-menu";

        // Clone navigation items
        const navClone = mainNav.cloneNode(true);

        // Clone auth buttons
        const authClone = authButtons.cloneNode(true);

        mobileMenu.appendChild(navClone);
        mobileMenu.appendChild(authClone);

        // Insert after header
        const header = document.querySelector(".header");
        header.parentNode.insertBefore(mobileMenu, header.nextSibling);
      }

      // Toggle mobile menu visibility
      const mobileMenu = document.querySelector(".mobile-menu");
      if (mobileMenu) {
        if (this.classList.contains("active")) {
          mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
          mobileMenu.style.opacity = "1";
        } else {
          mobileMenu.style.maxHeight = "0";
          mobileMenu.style.opacity = "0";
        }
      }
    });
  }

  // Date navigation functionality
  const prevDateBtn = document.querySelector(".date-nav.prev");
  const nextDateBtn = document.querySelector(".date-nav.next");
  const dateDisplay = document.querySelector(".date-selector span");

  if (prevDateBtn && nextDateBtn && dateDisplay) {
    let currentDate = new Date("2024-05-01");

    // Format the date as DD Month YYYY
    const formatDate = (date) => {
      const options = { day: "2-digit", month: "short", year: "numeric" };
      return date
        .toLocaleDateString("en-US", options)
        .replace(",", "")
        .toLowerCase();
    };

    prevDateBtn.addEventListener("click", function () {
      currentDate.setDate(currentDate.getDate() - 1);
      dateDisplay.textContent = formatDate(currentDate);
    });

    nextDateBtn.addEventListener("click", function () {
      currentDate.setDate(currentDate.getDate() + 1);
      dateDisplay.textContent = formatDate(currentDate);
    });
  }

  // Float animations for coins
  const floatingCoins = document.querySelectorAll(".floating-coin");
  floatingCoins.forEach((coin) => {
    // Add a slight random rotation
    const randomRotation = Math.random() * 20 - 10; // -10 to 10 degrees
    coin.style.transform = `rotate(${randomRotation}deg)`;
  });
});

// Currency value input formatting and handling
const currencyInputs = document.querySelectorAll(".currency-value");
currencyInputs[1].readOnly = true;

// Additional CSS for mobile menu and improved mobile styling
const style = document.createElement("style");
style.textContent = `
    .mobile-menu {
        background-color: white;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease;
        opacity: 0;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-menu .main-nav {
        display: block;
        padding: 20px;
    }
    
    .mobile-menu .main-nav ul {
        flex-direction: column;
        gap: 15px;
    }
    
    .mobile-menu .auth-buttons {
        display: flex;
        padding: 0 20px 20px;
        flex-direction: column;
        width: 100%;
    }
    
    .mobile-menu .auth-buttons a {
        width: 100%;
        margin-bottom: 10px;
    }
    
    .mobile-menu-toggle.active .material-icons {
        color: var(--primary-color);
    }
    
    .currency-shortcuts span.active {
        color: white;
        opacity: 1;
    }
    
    .currency-select.active {
        background-color: rgba(255, 255, 255, 0.3);
    }
    
    @media screen and (max-width: 576px) {
        .mobile-menu .main-nav ul {
            gap: 10px;
        }
        
        .mobile-menu .main-nav a {
            font-size: 14px;
        }
        
        .mobile-menu .auth-buttons a {
            padding: 10px;
            font-size: 14px;
        }
    }
`;
document.head.appendChild(style);

// Update currency configuration
window.currencyConfig = {
  supportedCurrencies: {
    USD: { symbol: "$", flag: "usd.jpeg" },
    EUR: { symbol: "€", flag: "eur.jpeg" },
    GBP: { symbol: "£", flag: "Frame 8766.png" },
    AUD: { symbol: "A$", flag: "Frame 8769.png" },
    BTC: { symbol: "₿", flag: "btc1.png" },
  },
};

function initializeCurrencyConverter() {
  const selects = document.querySelectorAll(".currency-select");
  const values = document.querySelectorAll(".currency-value");
  const shortcuts = document.querySelectorAll(".currency-shortcuts span");
  let lastTimeout;

  // Track current selections
  const currentSelections = {
    from: "USD",
    to: "AUD",
  };

  async function updateConversion() {
    values[1].value = "Converting...";
    values[1].style.opacity = "0.7";

    if (lastTimeout) clearTimeout(lastTimeout);

    lastTimeout = setTimeout(async () => {
      try {
        const amount = parseFloat(values[0].value) || 0;
        const response = await fetch(
          `${window.exchangeRateConfig.baseUrl}${window.exchangeRateConfig.apiKey}/pair/${currentSelections.from}/${currentSelections.to}/${amount}`
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.conversion_result) {
          values[1].value = data.conversion_result.toFixed(5);
          values[1].style.opacity = "1";
        } else {
          throw new Error("Invalid conversion result");
        }
      } catch (error) {
        console.error("Conversion error:", error);
        values[1].value = "Error - Try again";
        values[1].style.opacity = "1";
      }
    }, 500);
  }

  function updateCurrencyDisplay(select, currency) {
    const config = window.currencyConfig.supportedCurrencies[currency];
    if (!config) return;

    const flag = select.querySelector(".current-flag");
    const text = select.querySelector(".current-currency");
    const type = select.dataset.type;

    flag.src = config.flag;
    flag.alt = currency;
    text.textContent = currency;

    // Update tracked selections
    currentSelections[type] = currency;

    // Update conversion
    updateConversion();
  }

  // Setup currency selectors
  selects.forEach((select) => {
    const type = select.dataset.type;

    select.addEventListener("click", (e) => {
      if (!e.target.closest(".currency-option")) {
        e.stopPropagation();
        selects.forEach(
          (other) => other !== select && other.classList.remove("active")
        );
        select.classList.toggle("active");
      }
    });

    // Handle currency selection
    select.querySelectorAll(".currency-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        const currency = option.dataset.currency;

        updateCurrencyDisplay(select, currency);
        select.classList.remove("active");

        // Update shortcuts active state only for "to" currency
        if (type === "to") {
          shortcuts.forEach((s) =>
            s.classList.toggle("active", s.dataset.currency === currency)
          );
        }
      });
    });
  });

  // Handle shortcuts (affects only "to" currency)
  shortcuts.forEach((shortcut) => {
    shortcut.addEventListener("click", function () {
      const currency = this.dataset.currency;
      if (!currency) return;

      const toSelect = selects[1];
      updateCurrencyDisplay(toSelect, currency);
      shortcuts.forEach((s) => s.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Improved input validation
  values[0].addEventListener("input", (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");

    if (parts.length > 2) {
      e.target.value = parts[0] + "." + parts.slice(1).join("");
    } else if (parts[1]?.length > 5) {
      e.target.value = parts[0] + "." + parts[1].slice(0, 5);
    } else {
      e.target.value = value;
    }

    if (value) updateConversion();
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".currency-select")) {
      selects.forEach((select) => select.classList.remove("active"));
    }
  });

  // Initialize with default values
  updateConversion();
}

// Remove duplicate initialization code and use a single entry point
document.addEventListener("DOMContentLoaded", () => {
  initializeCurrencyConverter();
  initFooterCollapsible();
});

// Add resize event handler for responsive updates
window.addEventListener("resize", function () {
  // Update currency converter layout
  const converterWidth = window.innerWidth;
  const currencyInputs = document.querySelectorAll(".currency-input");

  currencyInputs.forEach((input) => {
    if (converterWidth < 576) {
      input.style.flexDirection = "column";
    } else {
      input.style.flexDirection = "row";
    }
  });
});

// Add performance monitoring
const performanceMonitor = {
  init() {
    this.measureCLS();
    this.measureFCP();
    this.measureTTI();
  },

  measureCLS() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log("Layout Shift:", entry.value, entry.sources);
      });
    }).observe({ entryTypes: ["layout-shift"] });
  },

  measureFCP() {
    new PerformanceObserver((list) => {
      const [entry] = list.getEntries();
      console.log("FCP:", entry.startTime);
    }).observe({ entryTypes: ["paint"] });
  },

  measureTTI() {
    if (window.performance.timing) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const tti = timing.domInteractive - timing.navigationStart;
          console.log("TTI:", tti);
        }, 0);
      });
    }
  },
};

// Initialize performance monitoring
performanceMonitor.init();

// Footer mobile collapsible sections
function initFooterCollapsible() {
  const footerColumns = document.querySelectorAll(".footer-column");

  footerColumns.forEach((column) => {
    const heading = column.querySelector("h3");

    heading.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        column.classList.toggle("active");

        // Close other columns
        footerColumns.forEach((otherColumn) => {
          if (otherColumn !== column) {
            otherColumn.classList.remove("active");
          }
        });
      }
    });
  });
}
