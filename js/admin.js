(function () {

    "use strict";

    let client = null;
    let currentUser = null;
    let currentAdmin = null;

    const $ = (id) =>
        document.getElementById(id);

    function message(text, type) {

        const element =
            $("create-user-message");

        if (!element) return;

        element.textContent = text;
        element.className =
            type || "";

    }

    function isSuperAdmin() {

        return (
            currentAdmin &&
            currentAdmin.admin_level ===
                "super_admin"
        );

    }

    function isSubAdmin() {

        return (
            currentAdmin &&
            currentAdmin.admin_level ===
                "admin"
        );

    }

    async function initialize() {

        client =
            window.supabaseClient;

        if (!client) {

            console.error(
                "Supabase no está disponible."
            );

            return;

        }

        const {
            data: sessionData,
            error: sessionError
        } = await client.auth.getSession();

        if (
            sessionError ||
            !sessionData.session
        ) {

            window.location.href =
                "login.html";

            return;

        }

        currentUser =
            sessionData.session.user;

        const {
            data: admin,
            error
        } = await client
            .from("admin_profiles")
            .select(
                "user_id, admin_level, is_active"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .maybeSingle();

        if (
            error ||
            !admin ||
            !admin.is_active
        ) {

            await client.auth.signOut();

            window.location.href =
                "login.html";

            return;

        }

        currentAdmin = admin;

        applyPermissions();

        await loadUsers();

        await loadStats();

    }

    function applyPermissions() {

        const generateButton =
            $("generateCreditsButton");

        const createAdminButton =
            $("createSubAdminButton");

        const adminLabel =
            $("adminRoleLabel");

        if (adminLabel) {

            adminLabel.textContent =
                isSuperAdmin()
                    ? "SUPER ADMIN"
                    : "SUB ADMIN";

        }

        /*
         * SOLO SUPER ADMIN PUEDE EMITIR
         * CRÉDITOS.
         */

        if (generateButton) {

            generateButton.style.display =
                isSuperAdmin()
                    ? ""
                    : "none";

        }

        /*
         * SOLO SUPER ADMIN PUEDE CREAR
         * SUB ADMINISTRADORES.
         */

        if (createAdminButton) {

            createAdminButton.style.display =
                isSuperAdmin()
                    ? ""
                    : "none";

        }

    }

    async function loadUsers() {

        const list =
            $("users-list");

        if (!list) return;

        list.innerHTML =
            "<p>Cargando usuarios...</p>";

        const {
            data,
            error
        } = await client
            .from("game_users")
            .select(
                "id, username, role, balance, created_at"
            )
            .order(
                "created_at",
                { ascending: false }
            );

        if (error) {

            console.error(
                "Error cargando usuarios:",
                error
            );

            list.innerHTML =
                "<p class='error'>No se pudieron cargar los usuarios.</p>";

            return;

        }

        if (!data || !data.length) {

            list.innerHTML =
                "<p>No hay usuarios todavía.</p>";

            return;

        }

        const table =
            document.createElement("table");

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Saldo</th>
                    <th>Fecha</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody =
            table.querySelector("tbody");

        data.forEach((user) => {

            const row =
                document.createElement("tr");

            const name =
                user.username ||
                user.id.substring(0, 8);

            row.innerHTML = `
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(user.role || "user")}</td>
                <td>${Number(user.balance || 0)}</td>
                <td>
                    ${formatDate(user.created_at)}
                </td>
            `;

            tbody.appendChild(row);

        });

        list.innerHTML = "";

        list.appendChild(table);

    }

    async function loadStats() {

        const usersCount =
            $("usersCount");

        const creditsCount =
            $("creditsCount");

        if (!usersCount) return;

        const {
            count
        } = await client
            .from("game_users")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );

        usersCount.textContent =
            count || 0;

        if (creditsCount) {

            /*
             * El saldo total se consulta
             * solamente como información.
             */

            const {
                data
            } = await client
                .from("game_users")
                .select("balance");

            const total =
                (data || []).reduce(
                    (sum, user) =>
                        sum +
                        Number(
                            user.balance || 0
                        ),
                    0
                );

            creditsCount.textContent =
                total;

        }

    }

    async function transferCredits() {

        if (!currentAdmin) return;

        const target =
            $("targetUserId")?.value
            ?.trim();

        const amount =
            Number(
                $("creditAmount")?.value
            );

        if (!target || !Number.isFinite(amount)) {

            message(
                "Ingresá usuario y cantidad.",
                "error"
            );

            return;

        }

        if (amount <= 0) {

            message(
                "La cantidad debe ser mayor que cero.",
                "error"
            );

            return;

        }

        try {

            const {
                error
            } = await client.rpc(
                "transfer_credits",
                {
                    target_user_id:
                        target,
                    amount
                }
            );

            if (error) {
                throw error;
            }

            message(
                "Transferencia realizada correctamente.",
                "success"
            );

            await loadUsers();
            await loadStats();

        } catch (error) {

            console.error(
                "Transferencia:",
                error
            );

            message(
                error.message ||
                "No se pudo realizar la transferencia.",
                "error"
            );

        }

    }

    async function generateCredits() {

        /*
         * SEGUNDA BARRERA:
         * aunque alguien intente llamar esta
         * función desde la consola, el frontend
         * tampoco permite usarla si no es
         * super_admin.
         *
         * La protección definitiva debe estar
         * también en Supabase/RPC.
         */

        if (!isSuperAdmin()) {

            message(
                "Solo el Super Admin puede emitir créditos.",
                "error"
            );

            return;

        }

        const target =
            $("targetUserId")?.value
            ?.trim();

        const amount =
            Number(
                $("creditAmount")?.value
            );

        if (!target || !Number.isFinite(amount)) {

            message(
                "Ingresá usuario y cantidad.",
                "error"
            );

            return;

        }

        if (amount <= 0) {

            message(
                "La cantidad debe ser mayor que cero.",
                "error"
            );

            return;

        }

        try {

            const {
                error
            } = await client.rpc(
                "generate_credits",
                {
                    target_user_id:
                        target,
                    amount
                }
            );

            if (error) {
                throw error;
            }

            message(
                "Créditos emitidos correctamente.",
                "success"
            );

            await loadUsers();
            await loadStats();

        } catch (error) {

            console.error(
                "Emisión de créditos:",
                error
            );

            message(
                error.message ||
                "No se pudieron emitir los créditos.",
                "error"
            );

        }

    }

    async function logout() {

        if (client) {
            await client.auth.signOut();
        }

        window.location.href =
            "login.html";

    }

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

    function formatDate(value) {

        if (!value) return "—";

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            "es-AR"
        );

    }

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const transferButton =
                $("transferCreditsButton");

            const generateButton =
                $("generateCreditsButton");

            const logoutButton =
                $("logoutButton");

            if (transferButton) {

                transferButton.addEventListener(
                    "click",
                    transferCredits
                );

            }

            if (generateButton) {

                generateButton.addEventListener(
                    "click",
                    generateCredits
                );

            }

            if (logoutButton) {

                logoutButton.addEventListener(
                    "click",
                    logout
                );

            }

            initialize();

        }
    );

    window.RoyalAdmin = {
        loadUsers,
        loadStats
    };

})();
