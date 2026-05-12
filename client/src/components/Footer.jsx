import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const FooterHeading = ({ children }) => (
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">{children}</h3>
);

const FooterLink = ({ to, children, external }) =>
    external ? (
        <a href={to} className="block text-sm text-slate-500 hover:text-brand-600 transition-colors duration-150">
            {children}
        </a>
    ) : (
        <Link to={to} className="block text-sm text-slate-500 hover:text-brand-600 transition-colors duration-150">
            {children}
        </Link>
    );

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

                {/* ── 4-column grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* About */}
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                                <Leaf className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-bold text-base text-slate-900 tracking-tight">
                                Jan<span className="text-brand-600">Mitra</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Empowering citizens to report and track civic issues for a better tomorrow.
                        </p>
                        
                    </div>

                    {/* Quick Links */}
                    <div>
                        <FooterHeading>Quick Links</FooterHeading>
                        <div className="space-y-2.5">
                            <FooterLink to="/">Home</FooterLink>
                            <FooterLink to="/report">Report Issue</FooterLink>
                            <FooterLink to="/issues">Issues</FooterLink>
                            <FooterLink to="/register">Sign Up</FooterLink>
                            <FooterLink to="/login">Log In</FooterLink>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <FooterHeading>Resources</FooterHeading>
                        <div className="space-y-2.5">
                            <FooterLink to="#" external>Privacy Policy</FooterLink>
                            <FooterLink to="#" external>Terms &amp; Conditions</FooterLink>
                            <FooterLink to="#" external>Feedback</FooterLink>
                            <FooterLink to="#" external>Archives</FooterLink>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <FooterHeading>Contact Us</FooterHeading>
                        <div className="space-y-3">
                            <a
                                href="mailto:support@janmitra.org"
                                className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-brand-600 transition-colors duration-150"
                            >
                                <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-3.5 w-3.5 text-brand-600" />
                                </span>
                                support@janmitra.org
                            </a>
                            <a
                                href="tel:+919876543210"
                                className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-brand-600 transition-colors duration-150"
                            >
                                <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-3.5 w-3.5 text-brand-600" />
                                </span>
                                +91 98765 43210
                            </a>
                            <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                <span className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                                </span>
                                India
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div className="mt-12 pt-1 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        © {year} JanMitra. All Rights Reserved.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Made for civic change in India 🌿
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
