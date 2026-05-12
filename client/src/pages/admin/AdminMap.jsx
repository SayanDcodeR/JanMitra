import { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const AdminMap = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState({ longitude: 77.2090, latitude: 20.5937, zoom: 4.5 });
    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res = await api.get('/issues');
                const data = res.data.issues || [];
                setIssues(data);
                if (data.length > 0 && data[0].location) {
                    setViewState({ longitude: data[0].location.long, latitude: data[0].location.lat, zoom: 10 });
                }
            } catch (error) {
                console.error("Error fetching map issues:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const markerColor = (status) => status === 'resolved' ? '#22c55e' : status === 'in-progress' ? '#3b82f6' : '#f59e0b';
    const markerGlow = (status) => status === 'resolved' ? 'rgba(34, 197, 94, 0.4)' : status === 'in-progress' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(245, 158, 11, 0.4)';

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-5 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Global Map View</h2>
                    <p className="text-sm text-slate-500 mt-1">Spatial analysis of all reported civic issues.</p>
                </div>
            </div>

            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-card border border-slate-200 bg-slate-100">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                    </div>
                )}
                {!MAPBOX_TOKEN && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                        <p className="text-slate-500 text-sm">Mapbox token missing.</p>
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

                    {issues.map(issue => issue.location && issue.location.long && issue.location.lat && (
                        <Marker
                            key={issue._id || issue.id}
                            longitude={issue.location.long}
                            latitude={issue.location.lat}
                            onClick={e => {
                                e.originalEvent.stopPropagation();
                                setSelectedIssue(issue);
                                setViewState({ longitude: issue.location.long, latitude: issue.location.lat, zoom: 14 });
                            }}
                        >
                            <div
                                className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-all duration-300 relative group"
                                style={{ 
                                    backgroundColor: markerColor(issue.status),
                                    boxShadow: `0 4px 12px ${markerGlow(issue.status)}`
                                }}
                            >
                                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: markerColor(issue.status) }}></div>
                                <MapPin className="h-3.5 w-3.5 text-white drop-shadow-sm z-10" />
                            </div>
                        </Marker>
                    ))}

                    {selectedIssue && (
                        <Popup
                            longitude={selectedIssue.location.long}
                            latitude={selectedIssue.location.lat}
                            anchor="bottom"
                            offset={20}
                            onClose={() => setSelectedIssue(null)}
                            closeOnClick={false}
                            className="z-50"
                        >
                            <div className="p-2 w-48">
                                <h3 className="font-bold text-sm text-slate-900 mb-1 leading-snug truncate">{selectedIssue.title}</h3>
                                <p className="text-xs text-slate-500 mb-2 truncate">{selectedIssue.address}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full bg-slate-100">{selectedIssue.status}</span>
                                    <Link to={`/issues/${selectedIssue._id || selectedIssue.id}`} className="text-xs text-brand-600 hover:underline">View</Link>
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>
        </div>
    );
};

export default AdminMap;
