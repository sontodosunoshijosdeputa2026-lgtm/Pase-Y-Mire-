(function () {

    "use strict";

    let client = null;
    let currentUser = null;
    let currentAdmin = null;

    const $ = (id) =>
        document.getElementById(id);

    function message(text, type = "") {

        const element =
            $("create-user-message");

        if (!element) return;

        element.textContent = text;
        element.className =
            `admin-message ${type}`;

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

            message(
                "Supabase no está disponible.",
                "error"
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

        await loadAdminCount();

        await loadGamesCount();

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

        if (generateButton) {

            generateButton.style.display =
                isSuperAdmin()
                    ? ""
                    : "none";

        }

        if (createAdminButton) {

            createAdminButton.style.display =
                isSuperAdmin()
                    ? ""
                    : "none";

        }

        /*
         * El botón de transferencia queda
         * disponible para Super Admin y Sub Admin.
         */

        const transferButton =
            $("transferCreditsButton");

        if (transferButton) {

            transferButton.style.display =
                isSuperAdmin() || isSubAdmin()
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
                String(user.id).substring(0, 8);

            row.innerHTML = `
                <td>${escapeHtml(name)}</td>
                <td>${escapeHtml(user.role || "user")}</td>
                <td>${Number(user.balance || 0)}</td>
                <td>${formatDate(user.created_at)}</td>
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
            count,
            error
        } = await client
            .from("game_users")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );

        if (!error) {

            usersCount.textContent =
                count || 0;

        }

        if (creditsCount) {

            const {
                data,
                error: balanceError
            } = await client
                .from("game_users")
                .select("balance");

            if (!balanceError) {

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

    }

    async function loadAdminCount() {

        const element =
            $("adminsCount");

        if (!element) return;

        const {
            count,
            error
        } = await client
            .from("admin_profiles")
            .select(
                "user_id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "is_active",
                true
            );

        if (!error) {

            element.textContent =
                count || 0;

        }

    }

    async function loadGamesCount() {

        const element =
            $("gamesCount");

        if (!element) return;

        const {
            count,
            error
        } = await client
            .from("games")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );

        if (!error) {

            element.textContent =
                count || 0;

        }

    }

    async function getAccessToken() {

        const {
            data,
            error
        } = await client.auth.getSession();

        if (error ||
            !data.session) {

            throw new Error(
                "La sesión expiró. Volvé a iniciar sesión."
            );

        }

        return data.session.access_token;

    }

    async function callAdminEndpoint(
        path,
        payload
    ) {

        const token =
            await getAccessToken();

        const response =
            await fetch(
                path,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        "Authorization":
                            `Bearer ${token}`
                    },
                    body:
                        JSON.stringify(payload)
                }
            );

        const text =
            await response.text();

        let data = null;

        try {

            data =
                text
                    ? JSON.parse(text)
                    : null;

        } catch {

            data = null;

        }

        if (!response.ok) {

            throw new Error(
                data?.error ||
                data?.message ||
                "Error en la operación administrativa."
            );

        }

        return data;

    }

    async function transferCredits() {

        if (
            !isSuperAdmin() &&
            !isSubAdmin()
        ) {

            message(
                "No tenés permisos para transferir créditos.",
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

        if (
            !target ||
            !Number.isInteger(amount)
        ) {

            message(
                "Ingresá un UUID válido y una cantidad entera.",
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

            await callAdminEndpoint(
                "/api/admin/credits",
                {
                    action:
                        "transfer",
                    target_user_id:
                        target,
                    amount,
                    note:
                        "Transferencia administrativa"
                }
            );

            message(
                "Transferencia realizada correctamente.",
                "success"
            );

            clearCreditForm();

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

        if (
            !target ||
            !Number.isInteger(amount)
        ) {

            message(
                "Ingresá un UUID válido y una cantidad entera.",
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

            await callAdminEndpoint(
                "/api/admin/credits",
                {
                    action:
                        "generate",
                    target_user_id:
                        target,
                    amount,
                    note:
                        "Emisión de créditos por Super Admin"
                }
            );

            message(
                "Créditos emitidos correctamente.",
                "success"
            );

            clearCreditForm();

            await loadUsers();

            await loadStats();

        } catch (error) {

            console.error(
                "Emisión:",
                error
            );

            message(
                error.message ||
                "No se pudieron emitir los créditos.",
                "error"
            );

        }

    }

    function clearCreditForm() {

        const target =
            $("targetUserId");

        const amount =
            $("creditAmount");

        if (target) {
            target.value = "";
        }

        if (amount) {
            amount.value = "";
        }

    }

    function openAccountModal(
        mode
    ) {

        const existing =
            $("royalAccountModal");

        if (existing) {
            existing.remove();
        }

        const isAdmin =
            mode === "subadmin";

        if (
            isAdmin &&
            !isSuperAdmin()
        ) {

            message(
                "Solo el Super Admin puede crear Sub Admins.",
                "error"
            );

            return;

        }

        const title =
            isAdmin
                ? "CREAR SUB ADMIN"
                : "CREAR USUARIO";

        const description =
            isAdmin
                ? "Creá una cuenta administrativa subordinada."
                : "Creá una nueva cuenta de usuario.";

        const modal =
            document.createElement("div");

        modal.id =
            "royalAccountModal";

        modal.innerHTML = `
            <div class="royal-modal-backdrop">
                <div class="royal-modal">

                    <div class="royal-modal-header">
                        <div>
                            <span class="section-kicker">
                                ${isAdmin ? "SUB ADMIN" : "USUARIO"}
                            </span>

                            <h2>${title}</h2>

                            <p>${description}</p>
                        </div>

                        <button
                            type="button"
                            id="closeRoyalModal"
                            class="royal-modal-close"
                        >
                            ×
                        </button>
                    </div>

                    <form id="royalAccountForm">

                        <label>
                            USUARIO
                            <input
                                id="royalUsername"
                                type="text"
                                autocomplete="off"
                                required
                                maxlength="40"
                                placeholder="Nombre de usuario"
                            >
                        </label>

                        <label>
                            EMAIL
                            <input
                                id="royalEmail"
                                type="email"
                                autocomplete="email"
                                required
                                placeholder="correo@ejemplo.com"
                            >
                        </label>

                        <label>
                            CONTRASEÑA
                            <input
                                id="royalPassword"
                                type="password"
                                autocomplete="new-password"
                                minlength="8"
                                required
                                placeholder="Mínimo 8 caracteres"
                            >
                        </label>

                        <div
                            id="royalModalMessage"
                            class="admin-message"
                            aria-live="polite"
                        ></div>

                        <div class="royal-modal-actions">

                            <button
                                type="button"
                                id="cancelRoyalModal"
                                class="admin-secondary"
                            >
                                CANCELAR
                            </button>

                            <button
                                type="submit"
                                class="admin-primary"
                            >
                                CREAR CUENTA
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        `;

        document.body.appendChild(modal);

        $("closeRoyalModal")
            ?.addEventListener(
                "click",
                closeAccountModal
            );

        $("cancelRoyalModal")
            ?.addEventListener(
                "click",
                closeAccountModal
            );

        $("royalAccountForm")
            ?.addEventListener(
                "submit",
                async function (event) {

                    event.preventDefault();

                    await createAccount(
                        isAdmin
                    );

                }
            );

    }

    async function createAccount(
        isAdmin
    ) {

        const username =
            $("royalUsername")
                ?.value
                ?.trim();

        const email =
            $("royalEmail")
                ?.value
                ?.trim();

        const password =
            $("royalPassword")
                ?.value;

        const modalMessage =
            $("royalModalMessage");

        if (
            !username ||
            !email ||
            !password
        ) {

            if (modalMessage) {
                modalMessage.textContent =
                    "Completá todos los campos.";
                modalMessage.className =
                    "admin-message error";
            }

            return;

        }

        if (password.length < 8) {

            if (modalMessage) {
                modalMessage.textContent =
                    "La contraseña debe tener al menos 8 caracteres.";
                modalMessage.className =
                    "admin-message error";
            }

            return;

        }

        try {

            if (modalMessage) {
                modalMessage.textContent =
                    "Creando cuenta...";
                modalMessage.className =
                    "admin-message";
            }

            await callAdminEndpoint(
                isAdmin
                    ? "/api/admin/create-subadmin"
                    : "/api/admin/create-user",
                {
                    username,
                    email,
                    password
                }
            );

            if (modalMessage) {
                modalMessage.textContent =
                    isAdmin
                        ? "Sub Admin creado correctamente."
                        : "Usuario creado correctamente.";

                modalMessage.className =
                    "admin-message success";
            }

            await loadUsers();

            await loadStats();

            await loadAdminCount();

            setTimeout(
                closeAccountModal,
                1200
            );

        } catch (error) {

            console.error(
                "Creación de cuenta:",
                error
            );

            if (modalMessage) {
                modalMessage.textContent =
                    error.message ||
                    "No se pudo crear la cuenta.";

                modalMessage.className =
                    "admin-message error";
            }

        }

}
        
