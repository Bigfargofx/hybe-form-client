document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ once: true });

  const onboardingModal = new bootstrap.Modal(document.getElementById("onboardingModal"));
  onboardingModal.show();

  const form = document.getElementById("subscription-form");
  const formMessage = document.getElementById("form-message");
  const referralCodeInput = document.getElementById("referral-code");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const dobInput = document.getElementById("dob");
  const genderSelect = document.getElementById("gender");
  const branchSelect = document.getElementById("branch");
  const groupSelect = document.getElementById("group");
  const artistSelect = document.getElementById("artist");
  const paymentTypeSelect = document.getElementById("payment-type");
  const installmentOptions = document.getElementById("installment-options");
  const paymentMethods = document.getElementById("payment-methods");
  const privacyPolicy = document.getElementById("privacy-policy");
  const subscriptionAgreement = document.getElementById("subscription-agreement");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner-border");
  const progressBar = document.querySelector(".progress-bar");
  const validationModal = new bootstrap.Modal(document.getElementById("validationModal"));
  const countdownElement = document.getElementById("countdown");
  const countrySelect = document.getElementById("country-select");
  const countryInput = document.getElementById("country");
  const currencyInput = document.getElementById("currency");
  const languageInput = document.getElementById("language");
  const permitIdInput = document.getElementById("permit-id");
  const submissionIdInput = document.getElementById("submission-id");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const branches = [
    { name: "BigHit Music", groups: ["BTS", "TXT"] },
    { name: "Pledis Entertainment", groups: ["SEVENTEEN", "fromis_9"] },
    { name: "Source Music", groups: ["LE SSERAFIM"] },
    { name: "ADOR", groups: ["NewJeans"] },
    { name: "KOZ Entertainment", groups: ["Zico", "BoyNextDoor"] }
  ];

  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "auto",
    geoIpLookup: (callback) => {
      fetch("https://ipapi.co/json/")
        .then(res => res.json())
        .then(data => callback(data.country_code))
        .catch(() => callback("us"));
    },
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
  });

  // Populate country dropdown
  fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
    .then(res => res.json())
    .then(countries => {
      countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country.cca2;
        option.textContent = country.name.common;
        countrySelect.appendChild(option);
      });
      const userCountry = iti.getSelectedCountryData().iso2.toUpperCase();
      countrySelect.value = userCountry;
      updateHiddenFields(userCountry);
    })
    .catch(() => {
      const option = document.createElement("option");
      option.value = "US";
      option.textContent = "United States";
      countrySelect.appendChild(option);
      countrySelect.value = "US";
      updateHiddenFields("US");
    });

  // Update hidden fields (country, currency, language)
  function updateHiddenFields(countryCode) {
    fetch(`https://restcountries.com/v3.1/alpha/${countryCode}?fields=currencies,languages`)
      .then(res => res.json())
      .then(data => {
        countryInput.value = countryCode;
        currencyInput.value = Object.keys(data.currencies)[0] || "USD";
        languageInput.value = Object.keys(data.languages)[0] || "en";
      })
      .catch(() => {
        countryInput.value = "US";
        currencyInput.value = "USD";
        languageInput.value = "en";
      });
  }

  countrySelect.addEventListener("change", () => {
    updateHiddenFields(countrySelect.value);
  });

  // Populate branch dropdown
  branches.forEach(branch => {
    const option = document.createElement("option");
    option.value = branch.name;
    option.textContent = branch.name;
    branchSelect.appendChild(option);
  });

  // Update group dropdown based on branch
  branchSelect.addEventListener("change", () => {
    const selectedBranch = branches.find(branch => branch.name === branchSelect.value);
    groupSelect.innerHTML = '<option value="" disabled selected>Select a Group</option>';
    artistSelect.innerHTML = '<option value="" disabled selected>Select an Artist</option>';
    if (selectedBranch) {
      selectedBranch.groups.forEach(group => {
        const option = document.createElement("option");
        option.value = group;
        option.textContent = group;
        groupSelect.appendChild(option);
      });
    }
    updateProgress();
  });

  // Update artist dropdown based on group
  groupSelect.addEventListener("change", () => {
    artistSelect.innerHTML = '<option value="" disabled selected>Select an Artist</option>';
    const selectedGroup = groupSelect.value;
    if (selectedGroup === "BTS") {
      ["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jungkook"].forEach(artist => {
        const option = document.createElement("option");
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
      });
    } else if (selectedGroup === "TXT") {
      ["Yeonjun", "Soobin", "Beomgyu", "Taehyun", "HueningKai"].forEach(artist => {
        const option = document.createElement("option");
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
      });
    } else if (selectedGroup === "SEVENTEEN") {
      ["S.Coups", "Jeonghan", "Joshua", "Jun", "Hoshi", "Wonwoo", "Woozi", "DK", "Mingyu", "The8", "Seungkwan", "Vernon", "Dino"].forEach(artist => {
        const option = document.createElement("option");
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
      });
    } else if (selectedGroup === "LE SSERAFIM") {
      ["Sakura", "Chaewon", "Yunjin", "Kazuha", "Eunchae"].forEach(artist => {
        const option = document.createElement("option");
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
      });
    } else if (selectedGroup === "NewJeans") {
      ["Minji", "Hanni", "Danielle", "Haerin", "Hyein"].forEach(artist => {
        const option = document.createElement("option");
        option.value = artist;
        option.textContent = artist;
        artistSelect.appendChild(option);
      });
    } else {
      const option = document.createElement("option");
      option.value = selectedGroup;
      option.textContent = selectedGroup;
      artistSelect.appendChild(option);
    }
    updateProgress();
  });

  // Update progress bar
  function updateProgress() {
    const totalFields = 11; // referral-code, full-name, email, phone, dob, gender, branch, group, artist, payment-type, contact-method
    let filledFields = 0;
    if (referralCodeInput.value) filledFields++;
    if (emailInput.value) filledFields++;
    if (phoneInput.value) filledFields++;
    if (dobInput.value) filledFields++;
    if (genderSelect.value) filledFields++;
    if (branchSelect.value) filledFields++;
    if (groupSelect.value) filledFields++;
    if (artistSelect.value) filledFields++;
    if (paymentTypeSelect.value) filledFields++;
    if (document.querySelector('input[name="contact-method"]:checked')) filledFields++;
    const progress = (filledFields / totalFields) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);
  }

  // Show installment options or payment methods
  paymentTypeSelect.addEventListener("change", () => {
    if (paymentTypeSelect.value === "Installment") {
      installmentOptions.classList.remove("d-none");
      paymentMethods.classList.remove("d-none");
      document.getElementById("installment-plan").required = true;
      document.querySelectorAll('input[name="payment-method"]').forEach(input => input.required = true);
    } else {
      installmentOptions.classList.add("d-none");
      paymentMethods.classList.remove("d-none");
      document.getElementById("installment-plan").required = false;
      document.querySelectorAll('input[name="payment-method"]').forEach(input => input.required = true);
    }
    updateProgress();
  });

  // Generate permit ID and submission ID
  function generatePermitId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `HYBE-FP-${timestamp}-${random}`;
  }

  function generateSubmissionId() {
    return `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    btnText.textContent = "Submitting...";
    spinner.classList.remove("d-none");
    formMessage.classList.add("d-none");

    // Validation
    if (referralCodeInput.value !== "HYBE2025") {
      showMessage("Invalid referral code. Use HYBE2025.", "danger");
      resetButton();
      return;
    }
    if (!emailRegex.test(emailInput.value)) {
      showMessage("Invalid email address.", "danger");
      resetButton();
      return;
    }
    if (!iti.isValidNumber()) {
      showMessage("Invalid phone number.", "danger");
      resetButton();
      return;
    }
    const phoneNumber = iti.getNumber(); // E.164 format
    phoneInput.value = phoneNumber;

    const dob = new Date(dobInput.value);
    if (isNaN(dob) || dobInput.value !== dob.toISOString().split("T")[0]) {
      showMessage("Invalid date of birth. Use YYYY-MM-DD format.", "danger");
      resetButton();
      return;
    }
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 13) {
      showMessage("You must be at least 13 years old to subscribe.", "danger");
      resetButton();
      return;
    }
    if (!genderSelect.value || genderSelect.value === "Select Gender") {
      showMessage("Please select your gender.", "danger");
      resetButton();
      return;
    }
    if (!branchSelect.value || branchSelect.value === "Select a HYBE Branch") {
      showMessage("Please select a HYBE branch.", "danger");
      resetButton();
      return;
    }
    if (!groupSelect.value || groupSelect.value === "Select a Group") {
      showMessage("Please select a group.", "danger");
      resetButton();
      return;
    }
    if (!artistSelect.value || artistSelect.value === "Select an Artist") {
      showMessage("Please select an artist.", "danger");
      resetButton();
      return;
    }
    if (!paymentTypeSelect.value || paymentTypeSelect.value === "Select Payment Type") {
      showMessage("Please select a payment type.", "danger");
      resetButton();
      return;
    }
    const contactMethods = document.querySelectorAll('input[name="contact-method"]:checked');
    if (contactMethods.length !== 1) {
      showMessage("Please select exactly one contact method.", "danger");
      resetButton();
      return;
    }
    if (!privacyPolicy.checked || !subscriptionAgreement.checked) {
      showMessage("You must agree to the privacy policy and subscription agreement.", "danger");
      resetButton();
      return;
    }

    // Set permit and submission IDs
    permitIdInput.value = generatePermitId();
    submissionIdInput.value = generateSubmissionId();

    // Show validation modal with countdown
    validationModal.show();
    let countdown = 5;
    countdownElement.textContent = countdown;
    const countdownInterval = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        validationModal.hide();
        submitForm();
      }
    }, 1000);
  });

  async function submitForm() {
    const formData = new FormData(form);
    try {
      const response = await fetch("/", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        showMessage("Submission successful! Check your email for confirmation.", "success");
        form.reset();
        progressBar.style.width = "0%";
        progressBar.setAttribute("aria-valuenow", 0);
        installmentOptions.classList.add("d-none");
        paymentMethods.classList.add("d-none");
      } else {
        throw new Error("Submission failed.");
      }
    } catch (error) {
      showMessage(`Submission failed: ${error.message}`, "danger");
    } finally {
      resetButton();
    }
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.classList.remove("d-none");
    formMessage.classList.add(`alert-${type}`);
  }

  function resetButton() {
    submitBtn.disabled = false;
    btnText.textContent = "Submit Subscription";
    spinner.classList.add("d-none");
  }

  // Update progress on input
  [referralCodeInput, emailInput, phoneInput, dobInput, genderSelect, branchSelect, groupSelect, artistSelect, paymentTypeSelect].forEach(input => {
    input.addEventListener("input", updateProgress);
  });
  document.querySelectorAll('input[name="contact-method"]').forEach(input => {
    input.addEventListener("change", updateProgress);
  });
});