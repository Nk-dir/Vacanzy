(() => {
  "use strict";
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

let taxSwitch = document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
  taxSwitch.addEventListener("click", () => {
    let taxInfo = document.getElementsByClassName("tax-info");
    for (let info of taxInfo) {
      if (info.style.display != "inline") {
        info.style.display = "inline";
      } else {
        info.style.display = "none";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");
  const filtersContainer = document.getElementById("filters-container");
  const filters = document.getElementById("filters");
  const filterElement = document.querySelector(".filter");

  // Only set up filter scrolling if all required elements exist
  if (leftBtn && rightBtn && filtersContainer && filterElement) {
    const filterWidth = filterElement.offsetWidth + 32;

    leftBtn.addEventListener("click", function () {
      filtersContainer.scrollLeft -= filterWidth;
    });

    rightBtn.addEventListener("click", function () {
      filtersContainer.scrollLeft += filterWidth;
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("filters-container");

  // Only set up touch events if container exists
  if (container) {
    let startX;
    let scrollLeft;

    container.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener("touchmove", (e) => {
      if (!startX) return;
      const x = e.touches[0].pageX;
      const distance = x - startX;
      container.scrollLeft = scrollLeft - distance;
    });

    container.addEventListener("touchend", () => {
      startX = null;
    });
  }
});

// Theme logic moved to theme.js
