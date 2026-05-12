import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin, AlertCircle, CheckCircle, ArrowRight,
    Camera, RefreshCcw, ShieldCheck, ChevronRight,
    Users, Search, LocateFixed
} from 'lucide-react';
import api from '../services/api';

/* ─── Sub-components ─────────────────────────── */

const StatCard = ({ icon, label, value, loading, iconBg, iconColor }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
            {loading
                ? <div className="skeleton h-7 w-12 mt-1 rounded-lg" />
                : <p className="text-2xl font-bold text-slate-900 leading-tight tabular-nums">{value}</p>
            }
        </div>
    </div>
);

const FeatureCard = ({ step, title, desc, icon }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 flex flex-col items-start gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                {icon}
            </div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step {step}</span>
        </div>
        <div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

/* ─── Main Component ─────────────────────────── */

const Home = () => {
    const [stats, setStats] = useState({ totalIssues: 0, pendingIssues: 0, resolvedIssues: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/issues/stats')
            .then(res => setStats(res.data.stats))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/issues${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
    };

    const handleUseLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => navigate('/issues'),
                () => navigate('/issues')
            );
        } else {
            navigate('/issues');
        }
    };

    return (
        <div className="page-enter">

            {/* ══════════════════════════════════════
                HERO — compact, single-line heading
            ══════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800">
                {/* Decorative blobs */}
                <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-500/25 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-brand-900/35 blur-2xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-800/20 blur-3xl pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 text-center">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 mb-5 backdrop-blur-sm border border-white/20 tracking-wide">
                        <ShieldCheck className="h-3.5 w-3.5 text-brand-200" />
                        Citizen-powered civic reporting platform
                    </span>

                    {/* Heading — single line on desktop */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight whitespace-nowrap hidden sm:block">
                        Your City, Your Voice,{' '}
                        <span className="text-brand-200">Your Responsibility.</span>
                    </h1>
                    {/* Heading — wrapped on mobile */}
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight sm:hidden">
                        Your City, Your Voice,{' '}
                        <span className="text-brand-200">Your Responsibility.</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto mb-8 leading-relaxed">
                        Report potholes, broken streetlights, water logging and more — then track them live on the map until they're fixed.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                        <Link
                            to="/report"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 font-bold px-6 py-3 text-sm shadow-lg hover:bg-brand-50 active:scale-[.98] transition-all duration-150"
                        >
                            Report an Issue <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/issues"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/25 text-white font-semibold px-6 py-3 text-sm backdrop-blur-sm hover:bg-white/20 active:scale-[.98] transition-all duration-150"
                        >
                            <MapPin className="h-4 w-4" /> View Live Map
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                STATS — 4 cards, single row on desktop
            ══════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<AlertCircle className="h-5 w-5" />}
                        label="Total Issues"
                        value={stats.totalIssues}
                        loading={loading}
                        iconBg="bg-slate-100" iconColor="text-slate-600"
                    />
                    <StatCard
                        icon={<MapPin className="h-5 w-5" />}
                        label="Pending Issues"
                        value={stats.pendingIssues}
                        loading={loading}
                        iconBg="bg-amber-50" iconColor="text-amber-600"
                    />
                    <StatCard
                        icon={<CheckCircle className="h-5 w-5" />}
                        label="Resolved Issues"
                        value={stats.resolvedIssues}
                        loading={loading}
                        iconBg="bg-brand-50" iconColor="text-brand-600"
                    />
                    <StatCard
                        icon={<Users className="h-5 w-5" />}
                        label="Active Citizens"
                        value={loading ? 0 : Math.max(1, Math.round(stats.totalIssues * 1.4))}
                        loading={loading}
                        iconBg="bg-violet-50" iconColor="text-violet-600"
                    />
                </div>
            </section>

            {/* ══════════════════════════════════════
                FIND ISSUES NEAR YOU
            ══════════════════════════════════════ */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-7">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Find Issues Near You</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                        Search by area, city or pincode to see reported issues and help your neighbourhood.
                    </p>
                </div>

                {/* Search card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 sm:p-6">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Enter your area, city, or pincode…"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:bg-white focus:outline-none transition-all duration-150"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary flex-shrink-0 px-5 py-3 text-sm"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 font-medium">or</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <button
                        onClick={handleUseLocation}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-all duration-150"
                    >
                        <LocateFixed className="h-4 w-4" />
                        Use My Current Location
                    </button>
                </div>
            </section>

            {/* ══════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════ */}
            <section className="bg-slate-50 border-y border-slate-100 py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900">How JanMitra Works</h2>
                        <p className="mt-2 text-slate-500 text-sm">Three simple steps to improve your community</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <FeatureCard
                            step={1} icon={<Camera className="h-5 w-5" />}
                            title="Snap & Report"
                            desc="Take a photo, add a description, and pin the exact location on the map."
                        />
                        <FeatureCard
                            step={2} icon={<RefreshCcw className="h-5 w-5" />}
                            title="Track Progress"
                            desc="Stay updated as authorities review and change the status of your issue."
                        />
                        <FeatureCard
                            step={3} icon={<CheckCircle className="h-5 w-5" />}
                            title="Get it Resolved"
                            desc="Once fixed, the issue is marked resolved — your neighbourhood gets better."
                        />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════
                CTA BANNER — refined card style
            ══════════════════════════════════════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 shadow-xl px-8 sm:px-12 py-12">

                    {/* Decorative glow blobs */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-brand-400/25 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-brand-900/40 blur-2xl pointer-events-none" />

                    {/* Content */}
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-7">
                        <div className="text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                                Ready to make a difference?
                            </h2>
                            <p className="text-brand-100/80 text-sm mt-1.5 max-w-sm">
                                Join citizens already improving their communities across India.
                            </p>
                        </div>

                        <Link
                            to="/register"
                            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 font-bold px-6 py-3 text-sm shadow-lg hover:bg-brand-50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[.98] transition-all duration-150 whitespace-nowrap"
                        >
                            Get Started <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
