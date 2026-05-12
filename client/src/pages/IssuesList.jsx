import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, ChevronRight, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const statusConfig = {
    pending:     { label: 'Pending',     cls: 'badge-pending',  dot: 'bg-amber-400' },
    resolved:    { label: 'Resolved',    cls: 'badge-resolved', dot: 'bg-brand-500' },
    'in-progress': { label: 'In Progress', cls: 'badge-in-progress', dot: 'bg-blue-500' },
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || statusConfig.pending;
    return (
        <span className={cfg.cls}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const IssueCard = ({ issue, selected, onClick }) => (
    <div
        onClick={onClick}
        className={`p-4 cursor-pointer border-l-2 transition-all duration-150 hover:bg-slate-50 group ${
            selected ? 'border-brand-500 bg-brand-50/60' : 'border-transparent'
        }`}
    >
        <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-brand-700 transition-colors">
                {issue.title}
            </h3>
            <StatusBadge status={issue.status} />
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 mb-2.5 leading-relaxed">{issue.description}</p>
        <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3 w-3" />
                {issue.address ? issue.address.substring(0, 28) + (issue.address.length > 28 ? '…' : '') : 'Location pinned'}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
        </div>
    </div>
);

const IssuesList = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [viewState, setViewState] = useState({ longitude: 77.2090, latitude: 20.5937, zoom: 4.5 });
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        api.get('/maps/data')
            .then(res => {
                const data = res.data.issues || [];
                setIssues(data);
                if (data.length > 0) {
                    setViewState({ longitude: data[0].coordinates[0], latitude: data[0].coordinates[1], zoom: 10 });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = issues.filter(issue => {
        const matchSearch = issue.title?.toLowerCase().includes(search.toLowerCase()) ||
                            issue.description?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || issue.status === filter;
        return matchSearch && matchFilter;
    });

    const flyTo = useCallback((issue) => {
        setViewState({ longitude: issue.coordinates[0], latitude: issue.coordinates[1], zoom: 14 });
        setSelectedIssue(issue);
    }, []);

    const markerColor = (status) => status === 'resolved' ? '#22c55e' : status === 'in-progress' ? '#3b82f6' : '#f59e0b';
    const markerGlow = (status) => status === 'resolved' ? 'rgba(34, 197, 94, 0.4)' : status === 'in-progress' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)';

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">

            {/* ── Sidebar ── */}
            <div className="w-full max-w-sm flex-shrink-0 flex flex-col bg-white border-r border-slate-100 shadow-soft hidden md:flex">

                {/* Header */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="section-title text-base">Reported Issues</h2>
                            <p className="section-subtitle">{filtered.length} of {issues.length} shown</p>
                        </div>
                        <Link to="/report" className="btn-primary text-xs py-1.5 px-3">
                            + Report
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search issues…"
                            className="input pl-8 py-2 text-xs"
                        />
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        {['all', 'pending', 'resolved'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 capitalize ${
                                    filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                            <span className="text-sm">Loading issues…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 px-6 text-center">
                            <AlertTriangle className="h-8 w-8 text-slate-300" />
                            <p className="text-sm font-medium text-slate-500">No issues match your filters</p>
                            <button onClick={() => { setSearch(''); setFilter('all'); }} className="btn-secondary text-xs py-1.5 px-3">Clear filters</button>
                        </div>
                    ) : (
                        filtered.map(issue => (
                            <IssueCard
                                key={issue.id || issue._id}
                                issue={issue}
                                selected={(selectedIssue?.id || selectedIssue?._id) === (issue.id || issue._id)}
                                onClick={() => flyTo(issue)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Map ── */}
            <div className="flex-1 relative p-4 bg-gray-50 flex flex-col">
                <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-slate-100">
                {!MAPBOX_TOKEN && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                        <p className="text-slate-500 text-sm">Mapbox token missing. Add VITE_MAPBOX_TOKEN to client/.env</p>
                    </div>
                )}
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    style={{ width: '100%', height: '100%' }}
                >
                    <NavigationControl position="top-right" />
                    <FullscreenControl position="top-right" />

                    {filtered.map(issue => (
                        <Marker
                            key={`marker-${issue.id || issue._id}`}
                            longitude={issue.coordinates[0]}
                            latitude={issue.coordinates[1]}
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                flyTo(issue);
                            }}
                        >
                            <div
                                className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-all duration-300 relative group"
                                style={{ 
                                    backgroundColor: markerColor(issue.status),
                                    boxShadow: `0 4px 12px ${markerGlow(issue.status)}`
                                }}
                                title={issue.title}
                            >
                                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: markerColor(issue.status) }}></div>
                                <MapPin className="h-3.5 w-3.5 text-white drop-shadow-sm z-10" />
                            </div>
                        </Marker>
                    ))}

                    {selectedIssue && (
                        <Popup
                            longitude={selectedIssue.coordinates[0]}
                            latitude={selectedIssue.coordinates[1]}
                            anchor="bottom"
                            offset={20}
                            onClose={() => setSelectedIssue(null)}
                            closeOnClick={false}
                            className="z-50"
                            maxWidth="260px"
                        >
                            <div className="p-3">
                                {selectedIssue.imageUrl && (
                                    <img src={selectedIssue.imageUrl} alt={selectedIssue.title} className="w-full h-28 object-cover rounded-lg mb-2.5" />
                                )}
                                <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug">{selectedIssue.title}</h3>
                                {selectedIssue.address && (
                                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                        <MapPin className="h-3 w-3 flex-shrink-0" /> {selectedIssue.address}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mb-3">
                                    <StatusBadge status={selectedIssue.status} />
                                    <span className="text-xs text-slate-400">by {selectedIssue.reportedBy || 'Citizen'}</span>
                                </div>
                                <Link
                                    to={`/issues/${selectedIssue.id || selectedIssue._id}`}
                                    className="flex items-center justify-center gap-1 w-full text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 py-1.5 rounded-lg transition-colors"
                                >
                                    View Full Details <ChevronRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </Popup>
                    )}
                </Map>

                {/* Map legend */}
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md rounded-xl shadow-card border border-white/40 px-3.5 py-2.5 flex flex-col gap-2 text-xs z-10">
                    {[['#f59e0b','Pending'], ['#3b82f6','In Progress'], ['#22c55e','Resolved']].map(([color, label]) => (
                        <div key={label} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-slate-600 font-medium">{label}</span>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
};

export default IssuesList;
