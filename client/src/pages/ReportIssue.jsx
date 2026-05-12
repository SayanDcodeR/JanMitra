import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Upload, X, Search, Loader2, AlertCircle, ChevronLeft, LocateFixed, Droplets, Zap, Trash2, ShieldAlert, Car, TreePine, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CATEGORIES = [
    { id: 'Pothole', label: 'Road / Pothole', icon: <Car /> },
    { id: 'Water Logging', label: 'Water Logging', icon: <Droplets /> },
    { id: 'Streetlight', label: 'Electricity', icon: <Zap /> },
    { id: 'Garbage', label: 'Garbage', icon: <Trash2 /> },
    { id: 'Sewer', label: 'Drainage', icon: <ShieldAlert /> },
    { id: 'Road Damage', label: 'Traffic', icon: <Car /> },
    { id: 'Park', label: 'Park', icon: <TreePine /> },
    { id: 'Other', label: 'Other', icon: <MapIcon /> }
];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const FormField = ({ label, required, children }) => (
    <div>
        <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        {children}
    </div>
);

const ReportIssue = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [geocoding, setGeocoding] = useState(false);

    const [formData, setFormData] = useState({
        title: '', description: '', category: 'Pothole', priority: 'Medium', address: ''
    });
    const [location, setLocation] = useState(null);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [viewState, setViewState] = useState({ longitude: 78.9629, latitude: 20.5937, zoom: 4.5 });

    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeoutRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => { setImage(null); setImagePreview(null); };

    const onMarkerDragEnd = useCallback(event => {
        setLocation({ long: event.lngLat.lng, lat: event.lngLat.lat });
    }, []);

    const handleMapClick = useCallback(event => {
        setLocation({ long: event.lngLat.lng, lat: event.lngLat.lat });
    }, []);

    const handleGPS = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setGeocoding(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, long: pos.coords.longitude });
                setViewState({ longitude: pos.coords.longitude, latitude: pos.coords.latitude, zoom: 14 });
                setGeocoding(false);
            },
            () => {
                setError('Unable to retrieve your location. Please check browser permissions.');
                setGeocoding(false);
            }
        );
    };

    const handleAddressChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, address: value }));
        
        if (value.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            setGeocoding(true);
            try {
                const res = await api.post('/maps/forward-geocode', { address: value });
                setSuggestions(res.data.results || []);
                setShowDropdown(true);
            } catch (err) {
                console.error('Geocoding search failed', err);
                setSuggestions([]);
                setShowDropdown(true);
            } finally {
                setGeocoding(false);
            }
        }, 400);
    };

    const handleSelectSuggestion = (suggestion) => {
        const { lng, lat } = suggestion.coordinates;
        setFormData(prev => ({ ...prev, address: suggestion.formatted_address }));
        setLocation({ long: lng, lat });
        setViewState({ longitude: lng, latitude: lat, zoom: 15, transitionDuration: 1500 });
        setShowDropdown(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        if (!location) {
            setError('Please select a valid issue location by searching, clicking the map, or using GPS.');
            return;
        }

        setLoading(true);
        setError('');
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        data.append('location[lat]', location.lat);
        data.append('location[long]', location.long);
        if (image) data.append('image', image);
        try {
            await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/issues');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
                <div className="card p-10 text-center max-w-sm w-full">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-7 w-7 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
                    <p className="text-slate-500 text-sm mb-6">You must be logged in to report a civic issue.</p>
                    <Link to="/login" className="btn-primary w-full">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 page-enter">
            <div className="max-w-3xl mx-auto">

                {/* Back link */}
                <Link to="/issues" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back to Issues
                </Link>

                <div className="card overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-6 sm:px-8 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Report a Civic Issue</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Help us fix your community faster</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                        {error && (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        {/* Title */}
                        <FormField label="Issue Title" required>
                            <input
                                type="text" name="title" required value={formData.title} onChange={handleInput}
                                className="input" placeholder="e.g., Large pothole near bus stop on MG Road"
                            />
                        </FormField>

                        {/* Category + Priority */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-slate-800 mb-2">What type of issue is this? <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                                                formData.category === cat.id
                                                    ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-sm'
                                                    : 'bg-white border-slate-200 hover:border-brand-300 hover:bg-slate-50 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${formData.category === cat.id ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {React.cloneElement(cat.icon, { className: 'w-5 h-5' })}
                                            </div>
                                            <span className={`text-xs font-semibold text-center ${formData.category === cat.id ? 'text-brand-700' : 'text-slate-600'}`}>
                                                {cat.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FormField label="Priority Level">
                                <select name="priority" value={formData.priority} onChange={handleInput} className="input max-w-xs">
                                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </FormField>
                        </div>

                        {/* Description */}
                        <FormField label="Description">
                            <textarea
                                name="description" rows={4} value={formData.description} onChange={handleInput}
                                className="input resize-none" placeholder="Describe the issue in detail — size, danger level, how long it's been there…"
                            />
                        </FormField>

                        {/* Image upload */}
                        <FormField label="Photo Evidence" required>
                            {imagePreview ? (
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover rounded-xl border border-slate-200" />
                                    <button
                                        type="button" onClick={clearImage}
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl px-6 py-8 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all duration-150">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-slate-600 font-medium">
                                            <span className="text-brand-600">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5 MB</p>
                                    </div>
                                    <input type="file" required name="image" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </FormField>

                        {/* Location */}
                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-brand-600" /> Location Details
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <div className="relative flex-1" ref={dropdownRef}>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text" name="address" value={formData.address} onChange={handleAddressChange}
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:bg-white focus:outline-none transition-all duration-150 shadow-sm"
                                            placeholder="Search for an area, street, or landmark…"
                                            autoComplete="off"
                                        />
                                        {geocoding && (
                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                                            </div>
                                        )}
                                        {formData.address && !geocoding && (
                                            <button type="button" onClick={() => { setFormData(prev => ({...prev, address: ''})); setSuggestions([]); setShowDropdown(false); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showDropdown && formData.address.length >= 3 && (
                                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                            {suggestions.length > 0 ? (
                                                <ul className="divide-y divide-slate-50">
                                                    {suggestions.map((suggestion, idx) => (
                                                        <li key={idx}>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                                className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors flex items-start gap-3 group"
                                                            >
                                                                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5">
                                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
                                                                        {suggestion.formatted_address.split(',')[0]}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                                        {suggestion.formatted_address.substring(suggestion.formatted_address.indexOf(',') + 1).trim() || 'Location Area'}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="px-4 py-6 text-center text-slate-500 flex flex-col items-center gap-2">
                                                    <AlertCircle className="h-5 w-5 text-slate-300" />
                                                    <p className="text-sm font-medium text-slate-600">No matching locations found</p>
                                                    <p className="text-xs text-slate-400">Try searching for a nearby landmark or city</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={handleGPS} disabled={geocoding} className="btn-secondary flex-shrink-0 h-[46px] px-5 whitespace-nowrap border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 hover:border-brand-300 shadow-sm">
                                    <LocateFixed className="h-4 w-4" />
                                    <span className="hidden sm:inline">Use GPS</span>
                                </button>
                            </div>

                            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                Interactive Map: Search, use GPS, or click anywhere on the map to drop a pin.
                            </p>

                            {location && (
                                <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl p-3.5 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                    <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-brand-900">Location Selected Successfully</p>
                                        <p className="text-xs text-brand-700 mt-1 font-medium">{formData.address || `Coordinates: ${location.lat.toFixed(5)}, ${location.long.toFixed(5)}`}</p>
                                    </div>
                                </div>
                            )}

                            <div className="relative h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 group">
                                <Map
                                    {...viewState}
                                    onMove={evt => setViewState(evt.viewState)}
                                    onClick={handleMapClick}
                                    mapStyle="mapbox://styles/mapbox/streets-v12"
                                    mapboxAccessToken={MAPBOX_TOKEN}
                                    style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                                >
                                    <NavigationControl position="top-right" />
                                    {location && (
                                        <Marker
                                            longitude={location.long}
                                            latitude={location.lat}
                                            draggable
                                            onDragEnd={onMarkerDragEnd}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-brand-600 border-2 border-white cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-300 relative group flex items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)' }}>
                                                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-brand-600"></div>
                                                <MapPin className="h-4 w-4 text-white drop-shadow-sm z-10" />
                                            </div>
                                        </Marker>
                                    )}
                                </Map>
                            </div>

                            {!location && (
                                <p className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-100">
                                    <AlertCircle className="h-3.5 w-3.5" /> Location is required. Please drop a pin on the map.
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="border-t border-slate-100 pt-6">
                            <button type="submit" disabled={loading || !location} className={`btn-primary w-full py-3 text-sm ${!location ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                ) : (
                                    <><MapPin className="h-4 w-4" /> Submit Issue Report</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;
