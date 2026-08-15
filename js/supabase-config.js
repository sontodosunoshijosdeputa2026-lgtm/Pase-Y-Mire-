// js/supabase-config.js

const SUPABASE_URL = 'https://qjgvyrtkekwperlffdiy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ3Z5cnRrZWt3cGVybGZmZGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzE0NDIsImV4cCI6MjEwMTY0NzQ0Mn0.vleLfy7hw8gkD82yLTrb9yqLEaICWD5gsxQwTAvyP2U'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Función para obtener el balance del usuario
async function getUserBalance() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('No hay usuario logueado')
    return 0
  }

  const { data, error } = await supabase
    .from('game_users')
    .select('balance')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error al obtener balance:', error)
    return 0
  }

  return data?.balance || 0
}

// Función para actualizar el balance en pantalla
async function updateBalanceDisplay() {
  const balance = await getUserBalance()
  const balanceElement = document.getElementById('user-balance')
  if (balanceElement) {
    balanceElement.textContent = balance
  }
}

// Llamar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateBalanceDisplay)
} else {
  updateBalanceDisplay()
}
