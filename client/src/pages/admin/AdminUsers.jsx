import { useState, useEffect, useContext } from 'react';
import { Search, Shield, ShieldAlert, UserCheck, Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

/* ── Delete Confirmation Modal ─────────────────── */
const DeleteModal = ({ user, loading, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onCancel}
        />

        {/* Modal Card */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8">
                {/* Warning icon */}
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User Account</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Are you sure you want to delete <span className="font-semibold text-slate-800">{user?.username}</span>?
                        This action cannot be undone.
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        Their reported issues will be preserved and attributed to "Deleted User".
                    </p>
                </div>

                {/* User preview card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 font-bold text-sm">{user?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all duration-150 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 border border-red-600 transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
                        ) : (
                            <><Trash2 className="h-4 w-4" /> Delete User</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

/* ── Success Toast ─────────────────────────────── */
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            {message}
            <button onClick={onClose} className="ml-2 text-white/60 hover:text-white transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

/* ── Main Component ────────────────────────────── */
const AdminUsers = () => {
    const { user: currentAdmin } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data.users || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setToast('Failed to load users. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.patch(`/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            setToast(`Role updated successfully.`);
        } catch (error) {
            console.error("Error updating role:", error);
            setToast('Failed to update role. Ensure you have admin privileges.');
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/users/${userToDelete._id}`);
            setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
            setToast(`User "${userToDelete.username}" deleted successfully.`);
            setUserToDelete(null);
        } catch (error) {
            console.error("Error deleting user:", error);
            const status = error.response?.status;
            let msg;
            if (status === 401) {
                msg = 'Session expired. Please log in again.';
            } else if (status === 403) {
                msg = 'You do not have permission to delete users.';
            } else if (status === 404) {
                msg = 'User not found. They may have already been deleted.';
                setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
                setUserToDelete(null);
            } else if (status === 400) {
                msg = error.response?.data?.message || 'Cannot delete this user.';
            } else {
                msg = 'Failed to delete user. Please check your connection and try again.';
            }
            setToast(msg);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const isSelf = (userId) => currentAdmin?.id === userId;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
                <p className="text-sm text-slate-500 mt-1">Manage platform users and assign roles.</p>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 shadow-sm flex items-center">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by username or email..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-brand-500 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-b-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Current Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-brand-700 font-bold text-xs">{user.username?.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800 text-sm">{user.username}</div>
                                                    <div className="text-xs text-slate-500">ID: {user._id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600">{user.email}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{user.mobile || 'No mobile'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                                                    <Shield className="w-3.5 h-3.5" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                    <UserCheck className="w-3.5 h-3.5" /> Citizen
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.role === 'admin' ? (
                                                    <button 
                                                        onClick={() => handleRoleChange(user._id, 'citizen')}
                                                        disabled={isSelf(user._id)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title={isSelf(user._id) ? 'Cannot revoke your own admin role' : 'Revoke admin role'}
                                                    >
                                                        <ShieldAlert className="w-3.5 h-3.5" /> Revoke Admin
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleRoleChange(user._id, 'admin')}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                                                    >
                                                        <Shield className="w-3.5 h-3.5" /> Make Admin
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setUserToDelete(user)}
                                                    disabled={isSelf(user._id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title={isSelf(user._id) ? 'Cannot delete your own account' : 'Delete this user'}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span className="hidden lg:inline">Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
                    <span>Total {filteredUsers.length} users</span>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <DeleteModal
                    user={userToDelete}
                    loading={deleteLoading}
                    onConfirm={handleDeleteUser}
                    onCancel={() => { if (!deleteLoading) setUserToDelete(null); }}
                />
            )}

            {/* Toast Notification */}
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminUsers;
