// js/main.js

let currentUser = null;

// Verificar sesión al cargar la página
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        await loadUserData(session.user.id);
    } else {
        showLoginForm();
    }
}

// Cargar datos del usuario desde game_users
async function loadUserData(userId) {
    try {
        const { data, error } = await supabase
            .from('game_users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        currentUser = data;
        
        // Verificar si es administrador
        if (currentUser.role === 'admin') {
            showAdminPanel();
        } else {
            showUserPanel();
        }
        
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
        showLoginForm();
    }
}

// Mostrar formulario de login
function showLoginForm() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-panel').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';
}

// Mostrar panel de usuario normal
function showUserPanel() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-panel').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
    
    document.getElementById('user-email').textContent = currentUser.email || 'Usuario';
    document.getElementById('user-balance').textContent = currentUser.balance || 0;
}

// Mostrar panel de administrador
function showAdminPanel() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-panel').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    document.getElementById('admin-email').textContent = currentUser.email || 'Administrador';
    loadAllUsers();
}

// Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('login-message');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        await loadUserData(data.user.id);
        
    } catch (error) {
        messageDiv.textContent = '❌ Error: ' + error.message;
        messageDiv.style.color = 'red';
    }
}

// Logout
async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    showLoginForm();
}

// Cargar todos los usuarios (solo admin)
async function loadAllUsers() {
    try {
        const { data, error } = await supabase
            .from('game_users')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayUsersTable(data);
        
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

// Mostrar tabla de usuarios
function displayUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email || 'N/A'}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.balance || 0}</td>
            <td>${user.role || 'user'}</td>
            <td>
                <button onclick="editUserBalance('${user.id}', ${user.balance || 0})">Editar Balance</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Editar balance de usuario
async function editUserBalance(userId, currentBalance) {
    const newBalance = prompt('Nuevo balance para el usuario:', currentBalance);
    
    if (newBalance === null) return;
    
    try {
        const { error } = await supabase
            .from('game_users')
            .update({ balance: parseFloat(newBalance) })
            .eq('id', userId);
        
        if (error) throw error;
        
        alert('✅ Balance actualizado correctamente');
        loadAllUsers();
        
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// Inicializar cuando carga la página
window.addEventListener('DOMContentLoaded', checkSession);
      
