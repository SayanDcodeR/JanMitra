import { useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, AlertCircle, Users, Map as MapIcon, Settings, LogOut, ChevronLeft, Menu, Bell, User } from 'lucide-react';

const AdminLayout = () => {
    const { pathname } = useLocation();
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/issues', icon: <AlertCircle className="w-5 h-5" />, label: 'Complaints' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
        { path: '/admin/map', icon: <MapIcon className="w-5 h-5" />, label: 'Map View' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            
            {/* Sidebar (Desktop) */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col h-screen sticky top-0">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="text-white font-bold text-lg tracking-tight">Jan<span className="text-brand-500">Mitra</span> Admin</span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                    pathname.startsWith(item.path) 
                                    ? 'bg-brand-600 text-white' 
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {item.icon}
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" /> Back to App
                    </Link>
                    <button onClick={handleLogout} className="w-full mt-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
                            {navItems.find(i => pathname.startsWith(i.path))?.label || 'Dashboard'}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.username}</span>
                        </div>
                    </div>
                </header>

                {/* Main scrollable content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
