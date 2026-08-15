(function () {

    "use strict";


    function getClient() {

        return window.supabaseClient || null;

    }


    function showMessage(
        text,
        type = ""
    ) {

        const message =
            document.getElementById(
                "authMessage"
            );

        if (!message) return;

        message.textContent =
            text;

        message.className =
            "auth-message" +
            (
                type
                    ? " " + type
                    : ""
            );

    }


    async function login(
        email,
        password
    ) {

        const client =
            getClient();

        if (!client) {

            throw new Error(
                "No se pudo inicializar Supabase. Recargá la página e intentá nuevamente."
            );

        }


        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();


        if (!cleanEmail) {

            throw new Error(
                "Ingresá tu email."
            );

        }


        if (!password) {

            throw new Error(
                "Ingresá tu contraseña."
            );

        }


        const {
            data,
            error
        } =
            await client.auth
                .signInWithPassword({

                    email:
                        cleanEmail,

                    password:
                        password

                });


        if (error) {

            throw error;

        }


        if (
            !data ||
            !data.user ||
            !data.session
        ) {

            throw new Error(
                "Supabase no devolvió una sesión válida."
            );

        }


        return data;

    }


    async function getProfile(
        userId
    ) {

        const client =
            getClient();

        if (
            !client ||
            !userId
        ) {

            return null;

        }


        const {
            data,
            error
        } =
            await client
                .from("admin_profiles")
                .select(
                    "user_id, admin_level, is_active"
                )
                .eq(
                    "user_id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error consultando perfil administrativo:",
                error
            );

            return null;

        }


        return data || null;

    }


    async function redirectAfterLogin(
        user
    ) {

        if (
            !user ||
            !user.id
        ) {

            throw new Error(
                "No se pudo identificar el usuario."
            );

        }


        const profile =
            await getProfile(
                user.id
            );


        /*
         * Cualquier cuenta administrativa
         * activa entra al panel.
         */

        if (
            profile &&
            profile.is_active
        ) {

            window.location.href =
                "admin.html";

            return;

        }


        /*
         * Las cuentas normales entran
         * al área de juegos.
         */

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


            if (!loginForm) {

                return;

            }


            loginForm.addEventListener(
                "submit",
                async function (
                    event
                ) {

                    event.preventDefault();


                    const email =
                        document
                            .getElementById(
                                "email"
                            )
                            ?.value ||
                        "";


                    const password =
                        document
                            .getElementById(
                                "password"
                            )
                            ?.value ||
                        "";


                    if (
                        !email.trim() ||
                        !password
                    ) {

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

                        button.disabled =
                            true;

                        button.dataset
                            .originalText =
                            button.textContent;

                        button.textContent =
                            "INGRESANDO...";

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


                        showMessage(
                            "Acceso correcto. Ingresando...",
                            "success"
                        );


                        await redirectAfterLogin(
                            result.user
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            "Error de login:",
                            error
                        );


                        let text =
                            error?.message ||
                            "No se pudo iniciar sesión.";


                        if (
                            error?.message ===
                            "Invalid login credentials"
                        ) {

                            text =
                                "Email o contraseña incorrectos.";

                        }


                        showMessage(
                            text,
                            "error"
                        );


                        if (button) {

                            button.disabled =
                                false;

                            button.textContent =
                                button.dataset
                                    .originalText ||
                                "INGRESAR";

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
