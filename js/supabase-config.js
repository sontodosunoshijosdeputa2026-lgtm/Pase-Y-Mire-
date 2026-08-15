// ===================================
// CONFIGURACIÓN DE SUPABASE
// ===================================

const SUPABASE_URL = 'TU_URL_AQUI'
const SUPABASE_ANON_KEY = 'TU_CLAVE_ANON_AQUI'

// Crear cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Función para obtener el usuario actual
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Función para obtener el balance de créditos
async function getUserCredits(userId) {
  const { data, error } = await supabase
    .from('game_users')
    .select('balance')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error al obtener créditos:', error)
    return 0
  }
  
  return data?.balance || 0
}

// Actualizar balance en pantalla
async function updateCreditDisplay() {
  const user = await getCurrentUser()
  const balanceElement = document.getElementById('creditBalance')
  
  if (user) {
    const credits = await getUserCredits(user.id)
    balanceElement.textContent = credits.toLocaleString('es-AR')
  } else {
    balanceElement.textContent = '0'
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', updateCreditDisplay)
