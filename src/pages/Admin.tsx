import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type GameUser = Database['public']['Tables']['game_users']['Row'];
type Transaction = Database['public']['Tables']['credit_transactions']['Row'];

export default function Admin() {
  const [users, setUsers] = useState<GameUser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminLevel, setAdminLevel] = useState<'admin' | 'super_admin' | null>(null);

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
    fetchTransactions();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('admin_profiles')
      .select('admin_level, is_active')
      .eq('user_id', user.id)
      .single();

    if (data?.is_active) {
      setAdminLevel(data.admin_level);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('game_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setTransactions(data);
  };

  const handleGenerateCredits = async () => {
    if (!selectedUser || !amount) {
      setMessage({ type: 'error', text: 'Selecciona un usuario e ingresa un monto' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('generate_credits', {
      target_user_id: selectedUser,
      amount: parseFloat(amount),
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: `Créditos generados exitosamente` });
      setAmount('');
      fetchUsers();
      fetchTransactions();
    }
  };

  const handleTransferCredits = async () => {
    if (!selectedUser || !amount) {
      setMessage({ type: 'error', text: 'Selecciona un usuario e ingresa un monto' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('transfer_credits', {
      target_user_id: selectedUser,
      amount: parseFloat(amount),
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: `Créditos transferidos exitosamente` });
      setAmount('');
      fetchUsers();
      fetchTransactions();
    }
  };

  if (!adminLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>No tienes permisos de administrador</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Generar Créditos */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Gestión de Créditos</h2>
          
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded mb-4"
          >
            <option value="">Seleccionar usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username || user.telegram_id} - Balance: {user.balance}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-700 p-3 rounded mb-4"
          />

          <div className="flex gap-4">
            {adminLevel === 'super_admin' && (
              <button
                onClick={handleGenerateCredits}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded font-semibold disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Generar Créditos'}
              </button>
            )}
            
            <button
              onClick={handleTransferCredits}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Transferir Créditos'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Usuarios ({users.length})</h2>
          <div className="max-h-96 overflow-y-auto">
            {users.map(user => (
              <div key={user.id} className="bg-gray-700 p-3 rounded mb-2">
                <p className="font-semibold">{user.username || 'Sin nombre'}</p>
                <p className="text-sm text-gray-400">ID: {user.telegram_id}</p>
                <p className="text-lg text-green-400">Balance: {user.balance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Últimas Transacciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="p-3">Tipo</th>
                <th className="p-3">Usuario Destino</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-700">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${tx.transaction_type === 'generate' ? 'bg-green-600' : 'bg-blue-600'}`}>
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="p-3">{tx.target_user_id.substring(0, 8)}...</td>
                  <td className="p-3 text-green-400">{tx.amount}</td>
                  <td className="p-3 text-sm text-gray-400">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
    }
      
