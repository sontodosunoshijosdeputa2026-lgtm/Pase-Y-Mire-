document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("authMessage");

    function showMessage(text) {
        if (message) {
            message.textContent = text;
        }
    }

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();

            showMessage(
                "La conexión con Supabase se activará en la siguiente etapa."
            );

        });

    }

    if (registerForm) {

        registerForm.addEventListener("submit", event => {

            event.preventDefault();

            showMessage(
                "La creación de cuentas se activará con el backend."
            );

        });

    }

});
