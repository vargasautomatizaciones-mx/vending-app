import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    QrCode,
    Package,
    Settings as SettingsIcon,
    LogOut,
    History,
    Coffee,
    BarChart3,
    UserCircle,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon: Icon, label, mobile = false }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            flex flex-col md:flex-row items-center md:space-x-4 p-3 md:px-6 md:py-4 rounded-[24px] transition-all duration-300 group
            ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 md:shadow-blue-500/20'
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
            ${mobile ? 'flex-1 justify-center' : 'w-full'}
        `}
    >
        <Icon className={`w-6 h-6 md:w-5 md:h-5 transition-transform group-hover:scale-110 ${mobile ? 'mb-1 md:mb-0' : ''}`} />
        <span className={`text-[10px] md:text-sm font-black uppercase tracking-widest md:tracking-tight ${mobile ? '' : 'hidden md:block'}`}>
            {label}
        </span>
    </NavLink>
);

const MainLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/inventario', icon: Package, label: 'Inventario' },
        { to: '/gestion-maquinas', icon: Coffee, label: 'Máquinas' },
        { to: '/reportes', icon: BarChart3, label: 'Ventas' },
        { to: '/historial', icon: History, label: 'Audit' },
    ];

    const operatorLinks = [
        { to: '/ruta-chofer', icon: QrCode, label: 'Escanear' },
        { to: '/inventario', icon: Package, label: 'Mi Carga' },
    ];

    const superAdminLinks = [
        { to: '/super-admin', icon: ShieldCheck, label: 'Empresas' },
        { to: '/ajustes', icon: SettingsIcon, label: 'Ajustes' },
    ];

    const links = user?.role === 'superadmin'
        ? superAdminLinks
        : user?.role === 'admin'
            ? adminLinks
            : operatorLinks;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-8 fixed h-full z-30">
                <div className="flex items-center space-x-3 px-2 mb-12">
                    <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center">
                        <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">VENDING<span className="text-blue-600">HUB</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {links.map(link => (
                        <NavItem key={link.to} {...link} />
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-[28px] p-5 mb-4 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                            <UserCircle className="w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 p-4 text-red-500 hover:bg-red-50 rounded-[24px] transition-all font-black text-sm uppercase tracking-tight"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 pb-24 md:pb-8 flex flex-col min-h-screen">
                {/* Mobile Top Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black text-slate-900 tracking-tighter uppercase">VendingHub</span>
                    </div>
                    <button onClick={handleLogout} className="p-3 bg-slate-50 text-slate-400 rounded-xl">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="p-6 md:p-12 w-full max-w-7xl mx-auto flex-1 h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-4 py-3 flex items-center justify-around z-50">
                {links.map(link => (
                    <NavItem key={link.to} {...link} mobile />
                ))}
            </nav>
        </div>
    );
};

export default MainLayout;
