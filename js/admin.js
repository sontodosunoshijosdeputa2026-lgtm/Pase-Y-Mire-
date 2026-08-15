// Elementos del panel admin
const createUserForm = document.getElementById('create-user-form');
const createUserMessage = document.getElementById('create-user-message');
const usersList = document.getElementById('users-list');
const logoutAdminBtn = document.getElementById('logout-admin');

// Crear nuevo usuario
createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    createUserMessage.textContent = '';
    createUserMessage.className = '';

    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    try {
        console.log('📝 Creando usuario...');

        // 1. Crear usuario en auth.users usando la API de admin
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) throw authError;

        // 2. Insertar en game_users con el rol
        const { error: dbError } = await supabase
            .from('game_users')
            .insert([
                { id: authData.user.id, role: role }
            ]);

        if (dbError) throw dbError;

        createUserMessage.textContent = `✅ Usuario ${email} creado con rol ${role}`;
        createUserMessage.className = 'success';
        createUserForm.reset();
        loadUsers();

    } catch (error) {
        console.error('Error al crear usuario:', error);
        createUserMessage.textContent = `❌ Error: ${error.message}`;
        createUserMessage.className = 'error';
    }
});

// Cargar lista de usuarios
async function loadUsers() {
    try {
        const { data, error } = await supabase
            .from('game_users')
            .select('id, role');

        if (error) throw error;

        usersList.innerHTML = '<table><tr><th>ID</th><th>Rol</th></tr>';
        data.forEach(user => {
            usersList.innerHTML += `<tr><td>${user.id.substring(0, 8)}...</td><td>${user.role}</td></tr>`;
        });
        usersList.innerHTML += '</table>';

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        usersList.innerHTML = '<p class="error">Error al cargar usuarios</p>';
    }
}

// Cerrar sesión
logoutAdminBtn.addEventListener('click', logout);
            
