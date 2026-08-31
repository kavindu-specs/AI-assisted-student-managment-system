
import React from 'react';
import { LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../lib/apiClient';

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    sessionStorage.removeItem('rms-admin-authenticated');
    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold/50">
      
      <LogOutIcon className="h-4 w-4" aria-hidden="true" />
      <span>Logout</span>
    </button>);

}