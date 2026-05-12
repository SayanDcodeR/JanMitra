import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = ['Pothole', 'Streetlight', 'Water Logging', 'Garbage', 'Sewer', 'Road Damage', 'Park', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['pending', 'in-progress', 'resolved', 'rejected'];

const FormField = ({ label, required, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
    </div>
);

const AdminEditIssue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: '',
        status: '',
        address: ''
    });

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const res = await api.get(`/issues/${id}`);
                const issue = res.data.issue;
                setFormData({
                    title: issue.title || '',
                    description: issue.description || '',
                    category: issue.category || 'Other',
                    priority: issue.priority || 'Medium',
                    status: issue.status || 'pending',
                    address: issue.address || ''
                });
            } catch (err) {
                console.error("Failed to load issue", err);
                setError('Issue not found or failed to load. Ensure the issue ID is correct.');
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [id]);

    const handleInput = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (!formData.title.trim()) return "Title is required.";
        if (!formData.description.trim()) return "Description is required.";
        if (!formData.category.trim()) return "Category is required.";
        if (!formData.priority.trim()) return "Priority is required.";
        if (!formData.status.trim()) return "Status is required.";
        if (!formData.address.trim()) return "Location/Address is required.";
        return null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError('');
        setSuccess(false);
        
        try {
            // Using PUT method to ensure better proxy compatibility, though PATCH should also work.
            await api.put(`/issues/${id}`, formData);
            
            setSuccess(true);
            // Smooth redirect after short delay
            setTimeout(() => {
                navigate('/admin/issues');
            }, 1500);
            
        } catch (err) {
            console.error("Failed to update issue", err);
            setError(
                err.response?.data?.message || 
                err.message || 
                'Failed to update issue. Please try again.'
            );
            setSaving(false); // Only set saving to false on error, keep it true during success redirect
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (error && !formData.title && !loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <AlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-slate-800 font-medium">{error}</p>
                <Link to="/admin/issues" className="btn-secondary mt-2">Back to Complaints</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <Link to="/admin/issues" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Complaints
            </Link>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Edit Complaint Details</h2>
                    <p className="text-sm text-slate-500 mt-1">ID: {id}</p>
                </div>

                {/* Success Overlay */}
                {success && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="font-semibold">Issue updated successfully! Redirecting...</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <FormField label="Title" required>
                        <input
                            type="text" name="title" required value={formData.title} onChange={handleInput}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-colors"
                        />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Status" required>
                            <select 
                                name="status" value={formData.status} onChange={handleInput} 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-colors"
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Category" required>
                            <select 
                                name="category" value={formData.category} onChange={handleInput} 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-colors"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </FormField>
                        
                        <FormField label="Priority" required>
                            <select 
                                name="priority" value={formData.priority} onChange={handleInput} 
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-colors"
                            >
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormField label="Location / Address" required>
                        <input
                            type="text" name="address" required value={formData.address} onChange={handleInput}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-colors"
                        />
                    </FormField>

                    <FormField label="Description" required>
                        <textarea
                            name="description" rows={5} required value={formData.description} onChange={handleInput}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-brand-500 outline-none resize-y transition-colors"
                        />
                    </FormField>

                    <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
                        <Link to="/admin/issues" className="px-5 py-2.5 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={saving || success} className="btn-primary flex items-center gap-2">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditIssue;
