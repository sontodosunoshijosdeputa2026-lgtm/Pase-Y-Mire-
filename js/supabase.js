/*
 * ============================================================
 * SUPABASE CLIENT
 * ============================================================
 */

(function () {

    "use strict";


    if (!window.supabase) {

        console.error(
            "Supabase JS no está disponible."
        );

        return;

    }


    if (
        !window.APP_CONFIG ||
        !window.APP_CONFIG.SUPABASE_URL ||
        !window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY
    ) {

        console.warn(
            "Supabase todavía no está configurado."
        );

        window.supabaseClient = null;

        return;

    }


    window.supabaseClient =
        window.supabase.createClient(
            window.APP_CONFIG.SUPABASE_URL,
            window.APP_CONFIG.SUPABASE_PUBLISHABLE_KEY
        );


})();
