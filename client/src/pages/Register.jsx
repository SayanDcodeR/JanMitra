import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, UserPlus, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', mobile: '', password: '', role: 'citizen'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const perks = [
        'Report issues directly on the map',
        'Track resolution status in real-time',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center px-4 py-12 page-enter">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Leaf className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Join JanMitra</h1>
                    <p className="text-slate-500 text-sm mt-1">Create your account and make a difference</p>
                </div>

                {/* Perks */}
                <div className="flex flex-col items-center gap-2 mb-6">
                    {perks.map(perk => (
                        <div key={perk} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0" />
                            {perk}
                        </div>
                    ))}
                </div>

                <div className="card p-8">
                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5">
                            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="label" htmlFor="reg-username">Username<span className="text-red-500 ml-0.5">*</span></label>
                                <input
                                    id="reg-username" type="text" name="username" required
                                    value={formData.username} onChange={handleChange}
                                    className="input" placeholder="johndoe" autoComplete="username"
                                />
                            </div>
                            <div>
                                <label className="label" htmlFor="reg-mobile">Mobile</label>
                                <input
                                    id="reg-mobile" type="tel" name="mobile"
                                    value={formData.mobile} onChange={handleChange}
                                    className="input" placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label" htmlFor="reg-email">Email<span className="text-red-500 ml-0.5">*</span></label>
                            <input
                                id="reg-email" type="email" name="email" required
                                value={formData.email} onChange={handleChange}
                                className="input" placeholder="john@example.com" autoComplete="email"
                            />
                        </div>

                        <div>
                            <label className="label" htmlFor="reg-password">Password<span className="text-red-500 ml-0.5">*</span></label>
                            <div className="relative">
                                <input
                                    id="reg-password" type={showPassword ? 'text' : 'password'} name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="input pr-10" placeholder="••••••••" autoComplete="new-password"
                                />
                                <button
                                    type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                            {loading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                            ) : (
                                <><UserPlus className="h-4 w-4" />Create Account</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
