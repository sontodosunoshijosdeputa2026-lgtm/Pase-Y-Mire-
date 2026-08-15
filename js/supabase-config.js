// Configuración integrada con tus credenciales
const SUPABASE_URL = 'https://qjgvyrtkekwperlffdiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZ3Z5cnRrZWt3cGVybGZmZGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzE0NDIsImV4cCI6MjEwMTY0NzQ0Mn0.vleLfy7hw8gkD82yLTrb9yqLEaICWD5gsxQwTAvyP2U';

// Inicializar cliente de Supabase
try {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = supabase; // Lo guardamos globalmente para acceder desde otros archivos
    console.log('✅ Supabase conectado correctamente');
} catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
}
