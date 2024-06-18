const emailInput = document.querySelector(".form_email_input");
const passwordInput = document.querySelector(".form_password_input");
const passwordWrapper = document.querySelector(".form_password_wrapper");
const submitButton = document.querySelector(".form_submit");
const passwordIcons = document.querySelectorAll(".form_password_icon");

function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function togglePasswordVisibility() {
  const isVisible = passwordInput.type === "password";
  passwordInput.type = isVisible ? "text" : "password";

  passwordIcons.forEach((icon) => {
    icon.style.display = icon.style.display === "block" ? "none" : "block";
  });
}

function validateInput() {
  const isEmailValid = validateEmail(emailInput.value);
  const isPasswordValid = passwordInput.value.length >= 5;

  emailInput.style.borderColor = isEmailValid ? "rgb(255, 255, 255)" : "red";

  passwordWrapper.style.borderColor = isPasswordValid
    ? "rgb(255, 255, 255)"
    : "red";
  passwordWrapper.style.color = isPasswordValid
    ? "rgb(255, 255, 255)"
    : "inherit";
}

function handleSubmit(event) {
  event.preventDefault();

  if (submitButton.disabled) {
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, password: password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        window.location.href = "/about";
      } else {
        console.error("Login failed:", data.message);
        alert("Invalid email or password. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    });
}

function checkDisabledButton() {
  const isEmailValid = validateEmail(emailInput.value);
  const isPasswordValid = passwordInput.value.length >= 5;

  submitButton.disabled = !(isEmailValid && isPasswordValid);
}

emailInput.addEventListener("blur", validateInput);
passwordInput.addEventListener("blur", validateInput);
[emailInput, passwordInput].forEach((item) => {
  item.addEventListener("input", checkDisabledButton);
});
submitButton.addEventListener("click", handleSubmit);
passwordIcons.forEach((icon) => {
  icon.addEventListener("click", togglePasswordVisibility);
});
