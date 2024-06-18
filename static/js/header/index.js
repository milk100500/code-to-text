const headerUser = document.querySelector(".header_user");
const modal = document.getElementById("logoutModal");
const closeButton = document.querySelector(".close_button");
const logoutButton = document.getElementById("logoutButton");

headerUser.addEventListener("click", function () {
  modal.style.display = "block";
});

closeButton.addEventListener("click", function () {
  modal.style.display = "none";
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

logoutButton.addEventListener("click", function () {
  localStorage.clear();
  modal.style.display = "none";
});
