(function () {

    "use strict";

    function getClient() {
        return window.supabaseClient || null;
    }

    function showMessage(text, type) {

        const message =
            document.getElementById("authMessage");

        if (!message) return;

        message.textContent = text;
        message.className =
            "auth-message " + (type || "");

    }

    async function login(email, password) {

        const client = getClient();

        if (!client) {
            throw new Error(
                "Supabase no está configurado."
            );
        }

        const { data, error } =
            await client.auth.signInWithPassword({
                email: email.trim(),
                password
            });

        if (error) {
            throw error;
        }

        return data;

    }

    async function getProfile(userId) {

        const client = getClient();

        if (!client) return null;

        const { data, error } =
            await client
                .from("admin_profiles")
                .select(
                    "user_id, admin_level, is_active"
                )
                .eq("user_id", userId)
                .maybeSingle();

        if (error) {
            console.error(
                "Error consultando perfil:",
                error
            );

            return null;
        }

        return data;

    }

    async function redirectAfterLogin(user) {

        const profile =
            await getProfile(user.id);

        if (
            profile &&
            profile.is_active
        ) {

            window.location.href =
                "admin.html";

            return;

        }

        window.location.href =
            "games/index.html";

    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const loginForm =
                document.getElementById(
                    "loginForm"
                );

            if (!loginForm) return;

            loginForm.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    const email =
                        document
                            .getElementById("email")
                            ?.value || "";

                    const password =
                        document
                            .getElementById("password")
                            ?.value || "";

                    if (!email || !password) {

                        showMessage(
                            "Completá email y contraseña.",
                            "error"
                        );

                        return;

                    }

                    const button =
                        loginForm.querySelector(
                            "button[type='submit']"
                        );

                    if (button) {
                        button.disabled = true;
                    }

                    showMessage(
                        "Verificando acceso...",
                        ""
                    );

                    try {

                        const result =
                            await login(
                                email,
                                password
                            );

                        await redirectAfterLogin(
                            result.user
                        );

                    } catch (error) {

                        console.error(
                            "Error de login:",
                            error
                        );

                        showMessage(
                            error.message ||
                            "No se pudo iniciar sesión.",
                            "error"
                        );

                        if (button) {
                            button.disabled = false;
                        }

                    }

                }
            );

        }
    );

    window.RoyalAuth = {
        login,
        getProfile,
        redirectAfterLogin
    };

})();
