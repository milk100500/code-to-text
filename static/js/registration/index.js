const usernameInput = document.querySelector(".form_username_input");
const emailInput = document.querySelector(".form_email_input");
const passwordInputs = document.querySelectorAll(".form_password_input");
const passwordIcons = document.querySelectorAll(".form_password_icon");
const checkbox = document.querySelector(".custom-checkbox input");
const submitButton = document.querySelector(".form_submit");

function togglePasswordVisibility() {
  const isVisible = passwordInputs[0].type === "password";
  passwordInputs.forEach((item) => {
    item.type = isVisible ? "text" : "password";
  });

  passwordIcons.forEach((icon) => {
    console.log(icon.style.display);
    icon.style.display = icon.style.display === "block" ? "none" : "block";
  });
}

function validateForm() {
  const isValidUsername = usernameInput.value.trim().length >= 5;
  const isValidEmail =
    emailInput.value.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
  const isValidPassword =
    passwordInputs[0].value.trim().length >= 5 &&
    passwordInputs[0].value === passwordInputs[1].value;
  const isCheckboxChecked = checkbox.checked;

  submitButton.disabled = !(
    isValidUsername &&
    isValidEmail &&
    isValidPassword &&
    isCheckboxChecked
  );
}

async function submitForm() {
  const formData = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInputs[0].value.trim(),
  };

  try {
    const response = await fetch("/registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);

      window.location.href = data.redirectUrl;
    } else {
      console.log("No access token received.");
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

submitButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (!submitButton.disabled) {
    submitForm();
  }
});

usernameInput.addEventListener("input", validateForm);
emailInput.addEventListener("input", validateForm);
passwordInputs.forEach((input) => {
  input.addEventListener("input", validateForm);
});
checkbox.addEventListener("change", validateForm);

passwordIcons.forEach((icon) => {
  icon.addEventListener("click", togglePasswordVisibility);
});

validateForm();
