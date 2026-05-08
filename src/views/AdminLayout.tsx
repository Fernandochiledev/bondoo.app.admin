import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Users, Map, BarChart2, Box, Flag, CreditCard, Activity, LogOut, Package, Settings2 } from 'lucide-react';
import { authService } from '../services/auth';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    window.location.href = 'https://bondoo.app';
  };

  const languages = [
    { code: 'ES', flag: '🇪🇸' },
    { code: 'EN', flag: '🇺🇸' },
    { code: 'PT', flag: '🇧🇷' },
    { code: 'FR', flag: '🇫🇷' },
  ];

  const navItems = [
    { path: '/users', icon: <Users size={20} />, label: 'Usuarios' },
    { path: '/plans', icon: <Map size={20} />, label: 'Planes y Países' },
    { path: '/levels', icon: <BarChart2 size={20} />, label: 'Niveles' },
    { path: '/packs', icon: <Package size={20} />, label: 'Packs' },
    { path: '/objects', icon: <Box size={20} />, label: 'Objetos' },
    { path: '/challenges', icon: <Flag size={20} />, label: 'Desafíos' },
    { path: '/player-settings', icon: <Settings2 size={20} />, label: 'Ajustes Jugador' },
    { path: '/subscriptions', icon: <CreditCard size={20} />, label: 'Suscripciones' },
    { path: '/sessions', icon: <Activity size={20} />, label: 'Sesiones' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Bondoo Admin</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">Panel de Administración</div>
          <div className="topbar-actions">
            <div className="topbar-user">Administrador</div>
            <button className="btn-icon logout-top-btn" title="Cerrar Sesión" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
