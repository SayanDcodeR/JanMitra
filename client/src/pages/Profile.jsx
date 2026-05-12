import { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
    User as UserIcon, Mail, Calendar, Activity, 
    CheckCircle2, Clock, AlertCircle, FileText, 
    MapPin, ChevronRight, Loader2, PlusCircle
} from 'lucide-react';

const Profile = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const [profileRes, issuesRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/users/me/issues')
                ]);
                setProfile(profileRes.data.user);
                setIssues(issuesRes.data.issues);
            } catch (err) {
                console.error("Error fetching profile data:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Calculate stats
    const stats = {
        total: issues.length,
        pending: issues.filter(i => i.status === 'pending').length,
        inProgress: issues.filter(i => i.status === 'in-progress').length,
        resolved: issues.filter(i => i.status === 'resolved').length
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'resolved': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Resolved</span>;
            case 'in-progress': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1"><Activity className="w-3 h-3"/> In Progress</span>;
            case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Rejected</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
        }
    };

    const getPriorityColor = (prio) => {
        switch(prio) {
            case 'Critical': return 'text-red-600 bg-red-50 ring-red-100';
            case 'High': return 'text-orange-600 bg-orange-50 ring-orange-100';
            case 'Low': return 'text-slate-600 bg-slate-50 ring-slate-100';
            default: return 'text-blue-600 bg-blue-50 ring-blue-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                    <p className="text-slate-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
                <div className="card p-8 text-center max-w-md w-full">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Oops!</h3>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary w-full">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header / User Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-700 absolute top-0 left-0 right-0"></div>
                    <div className="px-6 sm:px-10 pb-8 pt-16 relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-md flex-shrink-0 relative">
                            <div className="w-full h-full bg-brand-100 rounded-xl flex items-center justify-center">
                                <span className="text-4xl sm:text-5xl font-bold text-brand-700">
                                    {profile?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                <div className="bg-brand-500 w-4 h-4 rounded-full ring-2 ring-white"></div>
                            </div>
                        </div>
                        
                        <div className="text-center sm:text-left flex-1 pb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{profile?.username}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-slate-600">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> {profile?.email}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400"/> Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md font-medium capitalize"><UserIcon className="w-4 h-4 text-slate-400"/> {profile?.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Total Reports</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Pending</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">In Progress</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">Resolved</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
                        </div>
                    </div>
                </div>

                {/* Issues Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">Your Reported Issues</h2>
                        {issues.length > 0 && (
                            <Link to="/report" className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" /> New Report
                            </Link>
                        )}
                    </div>

                    {issues.length === 0 ? (
                        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                <FileText className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No issues reported yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-6">
                                You haven't submitted any civic issues. Help improve your community by reporting potholes, broken streetlights, or other infrastructure problems.
                            </p>
                            <Link to="/report" className="btn-primary inline-flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" /> Report Your First Issue
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {issues.map(issue => (
                                <Link 
                                    to={`/issues/${issue._id || issue.id}`} 
                                    key={issue._id || issue.id}
                                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all group flex flex-col h-full"
                                >
                                    {/* Issue Image / Placeholder */}
                                    <div className="h-40 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                        {issue.image?.url ? (
                                            <img src={issue.image.url} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <FileText className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-xs font-medium">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            {getStatusBadge(issue.status)}
                                        </div>
                                    </div>
                                    
                                    {/* Issue Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{issue.title}</h3>
                                        </div>
                                        
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                                            {issue.description}
                                        </p>
                                        
                                        <div className="space-y-3 mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span className="truncate">{issue.address || 'Location pinned'}</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ring-1 ${getPriorityColor(issue.priority)}`}>
                                                        {issue.priority} Priority
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1 group-hover:text-brand-600 transition-colors">
                                                    View Details <ChevronRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
