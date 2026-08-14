document.addEventListener("DOMContentLoaded", () => {

    const logoutButton =
        document.getElementById("logoutButton");

    logoutButton?.addEventListener("click", () => {
        location.href = "login.html";
    });

});
