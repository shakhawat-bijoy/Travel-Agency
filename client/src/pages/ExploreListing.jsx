import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin, Sparkles, ChevronRight, Globe, Compass,
    Ship, Waves, Mountain, Search
} from 'lucide-react';
import Container from '../components/common/Container';
import Button from '../components/common/Buttton';

const ExploreListing = ({ type }) => {
    const isDestinations = type === 'destinations';

    const data = {
        destinations: [
            { name: "Canada", icon: <Globe className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=600&auto=format&fit=crop", description: "Vast wilderness and vibrant cities." },
            { name: "Alaska", icon: <Mountain className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=600&auto=format&fit=crop", description: "Untamed nature and glaciers." },
            { name: "France", icon: <MapPin className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop", description: "Art, history, and elegance." },
            { name: "Iceland", icon: <Sparkles className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=600&auto=format&fit=crop", description: "Landscape of fire and ice." }
        ],
        activities: [
            { name: "Northern Lights", icon: <Sparkles className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=600&auto=format&fit=crop", description: "A celestial dance in the sky." },
            { name: "Cruising & sailing", icon: <Ship className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=600&auto=format&fit=crop", description: "Luxury voyages on the open sea." },
            { name: "Multi-activities", icon: <Compass className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=600&auto=format&fit=crop", description: "The ultimate adventure blend." },
            { name: "Kayaking", icon: <Waves className="w-5 h-5" />, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop", description: "Paddle through pristine waters." }
        ]
    };

    const currentData = data[type] || [];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    return (
        <div className="min-h-screen bg-gray-50 py-16 md:py-24 px-2 lg:px-0">
            <Container>
                {/* Header Section */}
                <div className="mb-16 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                        <span className="w-12 h-[2px] bg-teal-500"></span>
                        <span className="text-teal-600 font-black uppercase tracking-[0.3em] text-sm">
                            {isDestinations ? 'Explore the World' : 'Thrilling Experiences'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 font-montserrat mb-6">
                        {isDestinations ? 'Our Top' : 'Signature'}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                            {isDestinations ? 'Destinations' : 'Activities'}
                        </span>
                    </h1>
                    <p className="max-w-2xl text-lg text-gray-500 font-montserrat leading-relaxed">
                        {isDestinations
                            ? "From snow-capped peaks to sun-drenched beaches, discover the most breathtaking locations carefully curated for your next escape."
                            : "Unforgettable adventures designed to push your boundaries and create memories that last a lifetime."}
                    </p>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {currentData.map((item, index) => (
                        <Link
                            key={index}
                            to={`/${type}/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                            className="group relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl shadow-gray-200 transition-all duration-500 hover:-translate-y-3"
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>

                            <div className="absolute inset-x-0 bottom-0 p-8">
                                <div className="flex items-center gap-2 text-teal-400 mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    {item.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isDestinations ? 'Destinations' : 'Activity'}</span>
                                </div>

                                <h3 className="text-3xl font-black text-white font-montserrat leading-tight mb-3">
                                    {item.name}
                                </h3>

                                <p className="text-white/70 text-sm font-medium mb-6 line-clamp-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                                    {item.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-teal-500 group-hover:border-teal-400 transition-all duration-500">
                                            <ChevronRight className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-white font-bold text-sm tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">View Details</span>
                                    </div>
                                    {isDestinations && (
                                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white uppercase tracking-tighter">
                                            Featured
                                        </div>
                                    )}
                                </div>

                                <div className="h-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full w-0 group-hover:w-full transition-all duration-700 mt-6 overflow-hidden"></div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-24 bg-gray-900 rounded-[50px] p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                    <h2 className="text-3xl md:text-5xl font-black text-white font-montserrat mb-8 relative z-10">
                        Can't find what you're looking for?
                    </h2>
                    <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto relative z-10">
                        Our travel experts are ready to design a custom itinerary just for you. Tell us your dreams, and we'll make them a reality.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                        <Button
                            text="Contact Travel Expert"
                            className="px-10 py-5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-teal-900/20"
                            to="https://shakhawat-bijoy.vercel.app/"
                            target="_blank"
                        />
                        <Button
                            text="Browse All Packages"
                            className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black text-lg backdrop-blur-sm transition-all"
                            to="/packages"
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ExploreListing;
