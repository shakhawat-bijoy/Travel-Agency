import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Building2, Users, Rocket, Heart, Briefcase, Globe, Star, Mail } from 'lucide-react';

const About = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('story');

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const tabs = [
        { id: 'story', label: 'Our Story' },
        { id: 'work', label: 'Work with Us' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">

                        About Dream Holidays
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover who we are and join us in our mission to create unforgettable travel experiences for the world.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 inline-flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-teal-500 text-white shadow-md transform scale-105'
                                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px]">

                    {/* Our Story Content */}
                    {activeTab === 'story' && (
                        <div className="animate-fadeIn">
                            <div className="relative h-64 md:h-80 bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1951&q=80')] bg-cover bg-center opacity-20"></div>
                                <div className="relative z-10 text-center text-white px-4">
                                    <Heart className="w-16 h-16 mx-auto mb-4 text-white opacity-90 animate-pulse" />
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Crafting Memories Since 2020</h2>
                                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Born from a passion for exploration and a desire to connect the world.</p>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <Rocket className="w-6 h-6 text-teal-500" />
                                            Our Mission
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            At Dream Holidays, we believe that travel is more than just going places; it's about changing how you see the world. Our mission is to make premium travel accessible, seamless, and deeply personal for every adventurer out there.
                                        </p>

                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <Users className="w-6 h-6 text-teal-500" />
                                            Our Community
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            We've built a global community of travelers who share stories, tips, and inspiration. From solo backpackers to luxury seekers, our platform brings people together through the love of discovery.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                                            <Globe className="w-8 h-8 text-blue-500 mb-3" />
                                            <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
                                            <div className="text-sm text-gray-500">Countries Covered</div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                                            <Briefcase className="w-8 h-8 text-purple-500 mb-3" />
                                            <div className="text-3xl font-bold text-gray-900 mb-1">10k+</div>
                                            <div className="text-sm text-gray-500">Bookings Made</div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                                            <Star className="w-8 h-8 text-yellow-500 mb-3" />
                                            <div className="text-3xl font-bold text-gray-900 mb-1">4.9</div>
                                            <div className="text-sm text-gray-500">Average Rating</div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                                            <Building2 className="w-8 h-8 text-green-500 mb-3" />
                                            <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                                            <div className="text-sm text-gray-500">Support Available</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Work With Us Content */}
                    {activeTab === 'work' && (
                        <div className="animate-fadeIn">
                            <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
                                <div className="relative z-10 text-center text-white px-4">
                                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-white opacity-90" />
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Build the Future of Travel</h2>
                                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Join a team of dreamers, doers, and explorers.</p>
                                </div>
                            </div>

                            <div className="p-8 md:p-12">
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-12 text-center">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Work With Us?</h3>
                                        <p className="text-gray-600 max-w-2xl mx-auto">
                                            We offer more than just a job. We offer a chance to be part of a movement that connects people and cultures. Plus, who doesn't love travel perks?
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center group hover:bg-teal-50 transition-colors">
                                            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2">Remote First</h4>
                                            <p className="text-sm text-gray-500">Work from anywhere in the world. We believe in output, not hours in a chair.</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center group hover:bg-blue-50 transition-colors">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                                                <Heart className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2">Health & Wellness</h4>
                                            <p className="text-sm text-gray-500">Comprehensive health coverage and wellness stipends to keep you feeling your best.</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center group hover:bg-purple-50 transition-colors">
                                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white group-hover:scale-110 transition-transform">
                                                <Rocket className="w-6 h-6" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2">Growth Budget</h4>
                                            <p className="text-sm text-gray-500">Annual budget for courses, conferences, and travel to help you grow professionally.</p>
                                        </div>
                                    </div>

                                    <div className="text-center bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-300">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Open Positions Currently</h3>
                                        <p className="text-gray-600 mb-6">
                                            We're not actively hiring right now, but we're always looking for talent. Send us your resume and we'll keep it on file.
                                        </p>
                                        <a
                                            href="mailto:careers@dreamholidays.com"
                                            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                        >
                                            <Mail className="w-4 h-4" />
                                            Email Your Resume
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default About;
