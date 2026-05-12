// Filter
const filterButtons = document.querySelectorAll("#portfolio-filters button");
const items = document.querySelectorAll(".portfolio-item");
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    items.forEach((item) => {
      if (filter === "all" || item.getAttribute("data-category") === filter) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
});

// Contact Form 
const form = document.getElementById("contactForm");
if (form) {
  const submitBtn = document.getElementById("submitBtn");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      document.getElementById("errorAlert").classList.remove("d-none");
      document.getElementById("successAlert").classList.add("d-none");
      form.classList.add("was-validated");
      return;
    }
    form.classList.add("was-validated");
    document.getElementById("errorAlert").classList.add("d-none");
    document.getElementById("successAlert").classList.remove("d-none");
    form.reset();
    form.classList.remove("was-validated");
    setTimeout(() => {
      document.getElementById("successAlert").classList.add("d-none");
    }, 5000);
  });
}
