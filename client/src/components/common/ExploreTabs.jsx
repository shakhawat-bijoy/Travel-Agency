import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ChevronRight, Globe, Compass, Ship, Waves, Mountain } from 'lucide-react';
import Container from './Container';

const ExploreTabs = () => {
    const [activeTab, setActiveTab] = useState('destinations');

    const data = {
        destinations: [
            { name: "Canada", icon: <Globe className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=400&auto=format&fit=crop" },
            { name: "Alaska", icon: <Mountain className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=400&auto=format&fit=crop" },
            { name: "France", icon: <MapPin className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop" },
            { name: "Iceland", icon: <Sparkles className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=400&auto=format&fit=crop" }
        ],
        activities: [
            { name: "Northern Lights", icon: <Sparkles className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=400&auto=format&fit=crop" },
            { name: "Cruising & sailing", icon: <Ship className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=400&auto=format&fit=crop" },
            { name: "Multi-activities", icon: <Compass className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=400&auto=format&fit=crop" },
            { name: "Kayaking", icon: <Waves className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop" }
        ]
    };

    return (
        <div className="lg:pb-20 pb-8 bg-white">
            <Container className='px-4 lg:px-0'>
                <div className="flex flex-col items-center mb-12">
                    <span className="text-teal-600 font-black uppercase tracking-[0.3em] text-sm mb-4">Start Exploring</span>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 font-montserrat text-center">
                        Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Adventure</span>
                    </h2>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-8 md:mb-12 px-4">
                    <div className="flex w-full max-w-md p-1 bg-gray-100 rounded-2xl shadow-inner overflow-hidden">
                        <button
                            onClick={() => setActiveTab('destinations')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 md:px-8 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeTab === 'destinations'
                                ? 'bg-white text-gray-900 shadow-md transform scale-[1.02] md:scale-105'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <MapPin className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === 'destinations' ? 'text-teal-500' : ''}`} />
                            <span className="whitespace-nowrap">Destinations</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('activities')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 md:px-8 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeTab === 'activities'
                                ? 'bg-white text-gray-900 shadow-md transform scale-[1.02] md:scale-105'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Compass className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === 'activities' ? 'text-teal-500' : ''}`} />
                            <span className="whitespace-nowrap">Activities</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data[activeTab].map((item, index) => (
                        <Link
                            key={index}
                            to={activeTab === 'destinations'
                                ? `/destinations/${item.name.toLowerCase()}`
                                : `/activities/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`
                            }
                            className="group relative h-80 rounded-[32px] overflow-hidden shadow-xl shadow-gray-200 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-100"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>

                            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 transform translate-y-2 md:translate-y-4 lg:group-hover:translate-y-0 transition-transform duration-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-teal-400 mb-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 translate-y-0 lg:translate-y-2 lg:group-hover:translate-y-0">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-white font-montserrat leading-tight mb-2">
                                            {item.name}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-500 transform scale-100 lg:scale-50 lg:group-hover:scale-100 border border-white/30">
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                    </div>
                                </div>
                                <div className="h-1 lg:h-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full w-full lg:w-0 lg:group-hover:w-full transition-all duration-700 mt-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"></div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default ExploreTabs;
