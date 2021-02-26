import "@babel/polyfill";
import { login, logout } from "./auth";
import { updateSettingData, updatePasswordData } from "./updateSettings";

import stripe from "stripe";

console.log(
  stripe(
    "sk_test_51IMOAIIAMKHowpZalkIzHJND1kaYy84zXSMi7j8lhm4b5UkAnoK81SZ951sSwOSVio7GygOWgvhJFuo3nKOxZ2Zy00e263c0wr"
  )
);

//Dom elements
const loginForm = document.querySelector(".form--login");
const logoutEl = document.getElementById("logout");
const userDataForm = document.querySelector(".form-user-data");
const userPassForm = document.querySelector(".form-user-settings");
const bookTour = document.getElementById("book-tour");

// delegation

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    login(email, password);
  });
}

if (logoutEl) {
  logoutEl.addEventListener("click", logout);
}

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    updateSettingData(name, email);
  });
}

if (userPassForm) {
  userPassForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").innerHTML = "Updating...";

    const oldPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const newPasswordConfirm = document.getElementById("password-confirm")
      .value;

    await updatePasswordData(oldPassword, newPassword, newPasswordConfirm);

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
    document.querySelector(".btn--save-password").innerHTML = "Save password";
  });
}

console.log(bookTour);
