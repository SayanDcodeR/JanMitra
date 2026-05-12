import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, Map, PlusCircle, Home, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLink = (to, label, icon) => (
        <Link
            to={to}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive(to)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {icon}
            {label}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                            <Leaf className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900 tracking-tight">
                            Jan<span className="text-brand-600">Mitra</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex items-center gap-1">
                        {navLink('/', 'Home', <Home className="h-3.5 w-3.5" />)}
                        {navLink('/issues', 'Issues Map', <Map className="h-3.5 w-3.5" />)}
                        {user && navLink('/report', 'Report Issue', <PlusCircle className="h-3.5 w-3.5" />)}
                    </div>

                    {/* Desktop auth */}
                    <div className="hidden sm:flex items-center gap-3">
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/profile'} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                                        <span className="text-brand-700 font-bold text-xs">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{user.username}</span>
                                    {user.role === 'admin' && (
                                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded-md">ADMIN</span>
                                    )}
                                </Link>
                                <button onClick={handleLogout} className="btn-ghost text-sm">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost text-sm">Log in</Link>
                                <Link to="/register" className="btn-primary text-sm">Sign up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile burger */}
                    <button
                        className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="sm:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 space-y-1">
                    {navLink('/', 'Home', <Home className="h-4 w-4" />)}
                    {navLink('/issues', 'Issues Map', <Map className="h-4 w-4" />)}
                    {user && navLink('/report', 'Report Issue', <PlusCircle className="h-4 w-4" />)}

                    <div className="pt-3 border-t border-slate-100 mt-2">
                        {user ? (
                            <div className="space-y-1">
                                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/profile'} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                    <UserIcon className="h-4 w-4" />
                                    {user.username}
                                    {user.role === 'admin' && (
                                        <span className="text-[10px] font-semibold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">ADMIN</span>
                                    )}
                                </Link>
                                <button onClick={handleLogout} className="btn-ghost w-full justify-start">
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">Log in</Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full">Sign up free</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
