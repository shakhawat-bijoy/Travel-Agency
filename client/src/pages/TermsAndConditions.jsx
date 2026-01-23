import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Info, Lock, Eye, Bell, Globe } from 'lucide-react';

const TermsAndConditions = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('terms');

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        } else if (location.hash === '#privacy') {
            setActiveTab('privacy');
        } else if (location.hash === '#terms') {
            setActiveTab('terms');
        }
    }, [location]);

    const tabs = [
        { id: 'terms', label: 'Terms & Conditions', icon: <FileText className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy & Security', icon: <Shield className="w-5 h-5" /> }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Legal Information
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Everything you need to know about our terms, privacy, and security practices.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Tab Switcher */}
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="p-8 sm:p-12">
                        {activeTab === 'terms' ? (
                            <div className="prose prose-blue max-w-none">
                                <section>
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Info className="w-6 h-6 mr-3 text-blue-600" />
                                        1. Introduction
                                    </h2>
                                    <p>
                                        Welcome to Dream Holidays. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions of use. Please read these terms carefully before making any bookings.
                                    </p>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
                                        2. Booking & Payments
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                        <li>All bookings are subject to availability and confirmation by the service provider.</li>
                                        <li>Full payment is required at the time of booking unless otherwise specified.</li>
                                        <li>Prices are subject to change without notice but will not affect confirmed bookings.</li>
                                        <li>We use secure payment gateways to ensure your financial information is protected.</li>
                                    </ul>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <FileText className="w-6 h-6 mr-3 text-blue-600" />
                                        3. Cancellation & Refunds
                                    </h2>
                                    <p>
                                        Cancellation policies vary depending on the package or flight selected. Each booking will clearly display its specific cancellation terms during the checkout process. Generally:
                                    </p>
                                    <blockquote className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg italic">
                                        Cancellations made 30 days prior to departure may be eligible for a full refund (minus admin fees). Under 7 days may result in 100% loss of booking value.
                                    </blockquote>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Globe className="w-6 h-6 mr-3 text-blue-600" />
                                        4. User Responsibility
                                    </h2>
                                    <p>
                                        Users are responsible for providing accurate information during booking, ensuring they have valid travel documents (passports, visas), and adhering to the local laws of the destination country.
                                    </p>
                                </section>
                            </div>
                        ) : (
                            <div className="prose prose-blue max-w-none">
                                <section>
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Lock className="w-6 h-6 mr-3 text-green-600" />
                                        1. Data Security
                                    </h2>
                                    <p>
                                        We take security seriously. All personal data is encrypted using Industry Standard SSL (Secure Socket Layer) technology. Our servers are monitored 24/7 to prevent unauthorized access.
                                    </p>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Eye className="w-6 h-6 mr-3 text-green-600" />
                                        2. Information Collection
                                    </h2>
                                    <p>
                                        We collect information that you provide directly to us (name, email, payment details) and automated data (IP address, cookies) to improve your experience and provide our services.
                                    </p>
                                    <div className="bg-gray-50 p-6 rounded-xl mt-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">How we use your data:</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                                            <li>To process and manage your bookings</li>
                                            <li>To communicate important updates about your trip</li>
                                            <li>To improve our website functionality</li>
                                            <li>For legal and regulatory compliance</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Shield className="w-6 h-6 mr-3 text-green-600" />
                                        3. Third-Party Sharing
                                    </h2>
                                    <p>
                                        We only share your information with necessary third parties (airlines, hotels, insurance providers) to fulfill your booking requests. We never sell your personal data to advertisers.
                                    </p>
                                </section>

                                <section className="mt-10">
                                    <h2 className="flex items-center text-2xl font-bold text-gray-900">
                                        <Bell className="w-6 h-6 mr-3 text-green-600" />
                                        4. Your Choices
                                    </h2>
                                    <p>
                                        You have the right to access, update, or delete your personal information at any time through your account settings. You can also opt-out of marketing communications by clicking the unsubscribe link in our emails.
                                    </p>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Footer for the card */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            Last Updated: January 23, 2026. For further questions, contact our support team at <a href="mailto:legal@dreamholidays.com" className="text-blue-600 hover:underline">legal@dreamholidays.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
