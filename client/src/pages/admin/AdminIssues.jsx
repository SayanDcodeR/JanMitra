import { useState, useEffect } from 'react';
import { Search, Edit2, MapPin, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All Categories', 'Pothole', 'Streetlight', 'Water Logging', 'Garbage', 'Sewer', 'Road Damage', 'Park', 'Other'];
const STATUSES = ['All Status', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['All Priority', 'Low', 'Medium', 'High', 'Critical'];

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ category: 'All Categories', status: 'All Status', priority: 'All Priority' });

    const fetchIssues = async () => {
        setLoading(true);
        try {
            // In a real scenario, backend should handle these filters.
            // For now, we'll fetch all and filter on frontend for simplicity if backend isn't ready.
            const res = await api.get('/issues');
            let data = res.data.issues || [];
            
            if (filters.category !== 'All Categories') data = data.filter(i => i.category === filters.category);
            if (filters.status !== 'All Status') {
                const sMap = { 'Pending': 'pending', 'In Progress': 'in-progress', 'Resolved': 'resolved', 'Rejected': 'rejected' };
                data = data.filter(i => i.status === sMap[filters.status]);
            }
            if (filters.priority !== 'All Priority') data = data.filter(i => i.priority === filters.priority);
            
            setIssues(data);
        } catch (error) {
            console.error("Error fetching issues:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [filters]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/issues/${id}/status`, { status: newStatus });
            setIssues(issues.map(i => i.id === id || i._id === id ? { ...i, status: newStatus } : i));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const filteredIssues = issues.filter(i => 
        i.title?.toLowerCase().includes(search.toLowerCase()) || 
        i.description?.toLowerCase().includes(search.toLowerCase()) ||
        i.address?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch(status) {
            case 'resolved': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Resolved</span>;
            case 'in-progress': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">In Progress</span>;
            case 'rejected': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>;
            default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>;
        }
    };

    const getPriorityBadge = (prio) => {
        switch(prio) {
            case 'Critical': return <span className="text-red-600 font-bold text-xs uppercase tracking-wider">{prio}</span>;
            case 'High': return <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">{prio}</span>;
            case 'Low': return <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">{prio}</span>;
            default: return <span className="text-blue-500 font-bold text-xs uppercase tracking-wider">{prio || 'Medium'}</span>;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Complaint Management</h2>
                    <p className="text-sm text-slate-500 mt-1">Review, filter, and manage citizen reports.</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 shadow-sm flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search issues by title, description or location..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    />
                </div>
                
                <select 
                    value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>

                <select 
                    value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>

                <select 
                    value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})}
                    className="py-2 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>

                <button 
                    onClick={() => { setSearch(''); setFilters({ category: 'All Categories', status: 'All Status', priority: 'All Priority' }); }}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-b-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">Complaint</th>
                                <th className="px-6 py-4">Area / Location</th>
                                <th className="px-6 py-4">Category & Priority</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                                        Loading issues...
                                    </td>
                                </tr>
                            ) : filteredIssues.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No complaints match your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredIssues.map(issue => (
                                    <tr key={issue._id || issue.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 text-sm mb-0.5 line-clamp-1">{issue.title}</div>
                                            <div className="text-xs text-slate-500">ID: {(issue._id || issue.id).substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 flex items-center gap-1.5 line-clamp-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                <span className="truncate max-w-[200px]">{issue.address || 'Location pinned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-800 font-medium">{issue.category}</div>
                                            <div className="mt-1">{getPriorityBadge(issue.priority)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(issue.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                <div className="relative">
                                                    <select 
                                                        className="appearance-none text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:border-brand-400 rounded-md pl-3 pr-8 py-1.5 outline-none shadow-sm transition-colors cursor-pointer"
                                                        value={issue.status}
                                                        onChange={(e) => handleStatusChange(issue._id || issue.id, e.target.value)}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                    </div>
                                                </div>
                                                <Link to={`/admin/issues/${issue._id || issue.id}/edit`} className="p-1.5 text-slate-600 hover:text-white bg-slate-100 hover:bg-brand-600 border border-slate-200 hover:border-brand-600 rounded-md shadow-sm transition-all" title="Edit Issue">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing {filteredIssues.length} issues</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Prev</button>
                        <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIssues;
