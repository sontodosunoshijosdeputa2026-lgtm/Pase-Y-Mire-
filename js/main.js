// Estado de la aplicación
let currentUser = null;
let currentRole = null;

// Elementos del DOM
const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const userSection = document.getElementById('user-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔍 Verificando sesión...');
    await checkSession();
});

// Verificar sesión activa
async function checkSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            console.log('✅ Sesión activa encontrada');
            currentUser = session.user;
            await loadUserRole();
        } else {
            console.log('❌ No hay sesión activa');
            showLogin();
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        showLogin();
    }
}

// Cargar rol del usuario desde game_users
async function loadUserRole() {
    try {
        const { data, error } = await supabase
            .from('game_users')
            .select('role')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        currentRole = data.role;
        console.log(`👤 Usuario con rol: ${currentRole}`);
        
        if (currentRole === 'admin') {
            showAdminPanel();
        } else {
            showUserPanel();
        }
    } catch (error) {
        console.error('Error al cargar rol:', error);
        loginError.textContent = 'Error: Usuario no registrado en la base de datos';
        await supabase.auth.signOut();
        showLogin();
    }
}

// Manejar login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        console.log('🔐 Intentando login...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        currentUser = data.user;
        console.log('✅ Login exitoso');
        await loadUserRole();

    } catch (error) {
        console.error('Error en login:', error);
        loginError.textContent = error.message || 'Credenciales incorrectas';
    }
});

// Mostrar secciones
function showLogin() {
    loginSection.style.display = 'block';
    adminSection.style.display = 'none';
    userSection.style.display = 'none';
}

function showAdminPanel() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    userSection.style.display = 'none';
    if (typeof loadUsers === 'function') loadUsers();
}

function showUserPanel() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'none';
    userSection.style.display = 'block';
    document.getElementById('user-email').textContent = `Email: ${currentUser.email}`;
}

// Cerrar sesión (usado por admin.js y user.js)
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentRole = null;
    showLogin();
    console.log('👋 Sesión cerrada');
            }
    
