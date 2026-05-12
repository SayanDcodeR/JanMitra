import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, User, Clock, Tag, AlertTriangle, Trash2, MessageSquare, ChevronLeft, Loader2, CheckCircle2, RefreshCcw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const StatusBadge = ({ status }) => {
    const map = {
        pending:      'badge-pending',
        resolved:     'badge-resolved',
        'in-progress': 'badge-in-progress',
    };
    const dot = {
        pending: 'bg-amber-400',
        resolved: 'bg-brand-500',
        'in-progress': 'bg-blue-500',
    };
    return (
        <span className={map[status] || 'badge-pending'}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || dot.pending}`} />
            {status?.replace('-', ' ') || 'pending'}
        </span>
    );
};

const MetaItem = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <p className="text-xs text-slate-400 uppercase font-medium tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">{icon}{value}</p>
    </div>
);

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const issueRes = await api.get(`/issues/${id}`);
                setIssue(issueRes.data.issue);
                
                try {
                    const commentsRes = await api.get(`/issues/${id}/comments`);
                    setComments(commentsRes.data.comments || []);
                } catch (commentErr) {
                    console.error("Failed to fetch comments:", commentErr);
                    setComments([]);
                }
            } catch (err) {
                console.error("Failed to fetch issue details:", err);
                setIssue(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleCommentSubmit = async e => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setCommentLoading(true);
        try {
            const res = await api.post(`/issues/${id}/comments`, { content: newComment });
            setComments([res.data.comment, ...comments]);
            setNewComment('');
        } catch (err) { console.error(err); }
        finally { setCommentLoading(false); }
    };

    const handleDeleteComment = async commentId => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await api.delete(`/issues/${id}/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) { console.error(err); }
    };

    const handleStatusToggle = async () => {
        setStatusLoading(true);
        try {
            const newStatus = issue.status === 'pending' ? 'resolved' : 'pending';
            await api.patch(`/issues/${id}/status`, { status: newStatus });
            setIssue({ ...issue, status: newStatus });
        } catch (err) { console.error(err); }
        finally { setStatusLoading(false); }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-500 gap-3">
                <AlertTriangle className="h-10 w-10 text-slate-300" />
                <p>Issue not found.</p>
                <Link to="/issues" className="btn-primary">Back to Issues</Link>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 page-enter">
            <div className="max-w-7xl mx-auto">
                <Link to="/issues" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Issues
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Main ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue card */}
                        <div className="card overflow-hidden">
                            {issue.image?.url && (
                                <img src={issue.image.url} alt={issue.title} className="w-full h-64 sm:h-80 object-cover" />
                            )}
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">{issue.title}</h1>
                                    <StatusBadge status={issue.status} />
                                </div>
                                <p className="text-slate-600 text-base leading-relaxed mb-6 whitespace-pre-wrap">{issue.description}</p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5 border-t border-slate-100">
                                    <MetaItem icon={<Tag className="h-3.5 w-3.5 text-slate-400" />} label="Category" value={issue.category} />
                                    <MetaItem
                                        icon={<AlertCircle className={`h-3.5 w-3.5 ${issue.priority === 'Critical' || issue.priority === 'High' ? 'text-red-500' : 'text-slate-400'}`} />}
                                        label="Priority" value={issue.priority}
                                    />
                                    <MetaItem icon={<User className="h-3.5 w-3.5 text-slate-400" />} label="Reported By" value={issue.user?.username || 'Deleted User'} />
                                    <MetaItem icon={<Clock className="h-3.5 w-3.5 text-slate-400" />} label="Date" value={new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                                </div>
                            </div>
                        </div>

                        {/* Comments */}
                        <div className="card p-6 sm:p-8">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                                <MessageSquare className="h-5 w-5 text-brand-500" />
                                Discussion
                                <span className="text-sm font-medium text-slate-400 ml-1">({comments.length})</span>
                            </h2>

                            {user ? (
                                <form onSubmit={handleCommentSubmit} className="mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-brand-700 font-bold text-sm">{user.username?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                rows={3} value={newComment} onChange={e => setNewComment(e.target.value)}
                                                placeholder="Share an update or comment…"
                                                className="input resize-none mb-2.5"
                                            />
                                            <button type="submit" disabled={commentLoading || !newComment.trim()} className="btn-primary text-sm">
                                                {commentLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Posting…</> : 'Post Comment'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center mb-6">
                                    <p className="text-sm text-slate-600">
                                        <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link> to join the discussion.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-center text-slate-400 text-sm py-8">No comments yet. Be the first!</div>
                                ) : comments.map(comment => (
                                    <div key={comment._id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-slate-600 font-bold text-sm">{comment.user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-semibold text-slate-900">{comment.user?.username || 'Unknown'}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    {(user && (user.id === comment.user?._id || user.role === 'admin')) && (
                                                        <button onClick={() => handleDeleteComment(comment._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-5">
                        {/* Location card */}
                        <div className="card p-5">
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-brand-500" /> Location
                            </h3>
                            {issue.address && <p className="text-sm text-slate-500 mb-3">{issue.address}</p>}
                            {issue.location?.lat && issue.location?.long && (
                                <div className="h-52 rounded-xl overflow-hidden border border-slate-100">
                                    <Map
                                        initialViewState={{ longitude: issue.location.long, latitude: issue.location.lat, zoom: 14 }}
                                        mapStyle="mapbox://styles/mapbox/streets-v12"
                                        mapboxAccessToken={MAPBOX_TOKEN}
                                        style={{ width: '100%', height: '100%' }}
                                        interactive={false}
                                    >
                                        <Marker longitude={issue.location.long} latitude={issue.location.lat}>
                                            <div className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-all duration-300 relative group flex items-center justify-center" style={{ 
                                                backgroundColor: issue.status === 'resolved' ? '#22c55e' : issue.status === 'in-progress' ? '#3b82f6' : '#f59e0b',
                                                boxShadow: `0 4px 12px ${issue.status === 'resolved' ? 'rgba(34, 197, 94, 0.4)' : issue.status === 'in-progress' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                                            }}>
                                                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: issue.status === 'resolved' ? '#22c55e' : issue.status === 'in-progress' ? '#3b82f6' : '#f59e0b' }}></div>
                                                <MapPin className="h-4 w-4 text-white drop-shadow-sm z-10" />
                                            </div>
                                        </Marker>
                                    </Map>
                                </div>
                            )}
                        </div>

                        {/* Admin controls */}
                        {user?.role === 'admin' && (
                            <div className="card p-5">
                                <h3 className="font-bold text-slate-900 mb-3">Admin Controls</h3>
                                <button
                                    onClick={handleStatusToggle}
                                    disabled={statusLoading}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 ${
                                        issue.status === 'pending'
                                            ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    }`}
                                >
                                    {statusLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : issue.status === 'pending'
                                            ? <><CheckCircle2 className="h-4 w-4" />Mark as Resolved</>
                                            : <><RefreshCcw className="h-4 w-4" />Mark as Pending</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* Quick info */}
                        <div className="card p-5 space-y-4">
                            <MetaItem icon={<Tag className="h-3.5 w-3.5 text-slate-400" />} label="Category" value={issue.category} />
                            <MetaItem
                                icon={<AlertCircle className={`h-3.5 w-3.5 ${['Critical','High'].includes(issue.priority) ? 'text-red-500' : 'text-slate-400'}`} />}
                                label="Priority" value={issue.priority}
                            />
                            <MetaItem icon={<User className="h-3.5 w-3.5 text-slate-400" />} label="Reported By" value={issue.user?.username || 'Deleted User'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetails;
