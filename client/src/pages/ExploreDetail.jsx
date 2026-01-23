import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Calendar, Users, Star,
    CheckCircle2, Info, Compass, Sparkles,
    Camera, Plane, Clock, ShieldCheck
} from 'lucide-react';
import Container from '../components/common/Container';
import Image from '../components/common/Image';

const ExploreDetail = () => {
    const { type, slug } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    // Mock data for the explore items
    const exploreData = {
        destinations: {
            'canada': {
                title: "Canada: The Great North",
                subtitle: "Experience wilderness, vibrant cities, and majestic mountains.",
                image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1200",
                description: "Canada is a land of vast distances and rich natural beauty. From the rocky shores of the Atlantic to the majestic peaks of the Rockies, Canada offers a diverse range of experiences for every traveler.",
                highlights: [
                    "Visit the iconic Banff National Park",
                    "Explore the historic streets of Old Quebec",
                    "Witness the powerful Niagara Falls",
                    "Discovery the vibrant culture of Vancouver"
                ],
                stats: { duration: "10-14 Days", rating: "4.9", visitors: "15k+" },
                features: ["Wilderness Tours", "City Breaks", "Winter Sports", "Scenic Rail Journeys"]
            },
            'alaska': {
                title: "Alaska: The Last Frontier",
                subtitle: "Untamed wilderness and breathtaking glacial landscapes.",
                image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1200",
                description: "Alaska is a place of unbelievable scale and beauty. Known for its glaciers, mountains, and wildlife, it's a dream destination for adventurers and nature lovers alike.",
                highlights: [
                    "Glacier Bay National Park cruise",
                    "Wildlife viewing in Denali",
                    "Northern Lights in Fairbanks",
                    "Kayaking in Kenai Fjords"
                ],
                stats: { duration: "7-12 Days", rating: "4.8", visitors: "8k+" },
                features: ["Glacier Hikes", "Wildlife Safaris", "Cruise Expeditions", "Dog Sledding"]
            },
            'france': {
                title: "France: Art & Elegance",
                subtitle: "A journey through history, gastronomy, and romance.",
                image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200",
                description: "France is a country that seduces travelers with its unfailing combination of culture, history, and food. From the streets of Paris to the vineyards of Bordeaux.",
                highlights: [
                    "Climb the Eiffel Tower in Paris",
                    "Wine tasting in the Loire Valley",
                    "Stroll the beaches of the French Riviera",
                    "Visit the historic Mont Saint-Michel"
                ],
                stats: { duration: "8-15 Days", rating: "4.7", visitors: "25k+" },
                features: ["Art Galleries", "Gourmet Dining", "Historical Landmarks", "Fashion Hubs"]
            },
            'iceland': {
                title: "Iceland: Fire and Ice",
                subtitle: "A surreal landscape of volcanoes, hot springs, and auroras.",
                image: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1200",
                description: "Iceland is a Nordic island nation defined by its dramatic landscape with volcanoes, geysers, hot springs and lava fields. Massive glaciers are protected in Vatnajökull and Snæfellsjökull national parks.",
                highlights: [
                    "Bathe in the Blue Lagoon",
                    "Tour the Golden Circle",
                    "See the Black Sand Beach in Vik",
                    "Chase the Northern Lights"
                ],
                stats: { duration: "5-10 Days", rating: "4.9", visitors: "12k+" },
                features: ["Geothermal Spas", "Volcano Tours", "Waterfall Hikes", "Aurora Chasing"]
            }
        },
        activities: {
            'northern-lights': {
                title: "Celestial Magic: Northern Lights",
                subtitle: "Witness the dance of spirits in the polar sky.",
                image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=1200",
                description: "The Aurora Borealis, or Northern Lights, is one of nature's most spectacular displays. These dancing lights appear when charged particles from the sun collide with gases in Earth's atmosphere.",
                highlights: [
                    "Best viewing spots in Norway & Iceland",
                    "Professional photography guidance",
                    "Arctic wilderness camping",
                    "Overnight in a Glass Igloo"
                ],
                stats: { recommended: "Winter", rating: "5.0", effort: "Low-Medium" },
                features: ["Night Photography", "Thermal Gear Provided", "Expert Aurora Hunters", "Hot Drinks & Snacks"]
            },
            'cruising-sailing': {
                title: "Oceans & Horizons: Cruising",
                subtitle: "Set sail on a journey of luxury and discovery.",
                image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=1200",
                description: "Explore the world's most beautiful coastlines from the comfort of a luxury vessel. Whether it's the Mediterranean or the fjords of Norway, cruising offers a unique perspective.",
                highlights: [
                    "Luxury onboard amenities",
                    "Daily island excursions",
                    "Sunrise & sunset ocean views",
                    "International gourmet cuisine"
                ],
                stats: { recommended: "All Year", rating: "4.8", effort: "Low" },
                features: ["Private Cabins", "Shore Excursions", "Onboard Entertainment", "Inclusive Packages"]
            },
            'multi-activities': {
                title: "Ultimate Adventure Blend",
                subtitle: "Why choose one when you can do it all?",
                image: "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1200",
                description: "Our multi-activity trips are designed for those who want a bit of everything. From hiking and biking to cultural tours and cooking classes, every day is a new adventure.",
                highlights: [
                    "Curated mix of varied activities",
                    "Expert local guides",
                    "Flexible difficulty levels",
                    "Equipments provided"
                ],
                stats: { recommended: "Spring/Summer", rating: "4.9", effort: "Medium-High" },
                features: ["Guided Hiking", "City Cycling", "Local Life Experience", "Group Activities"]
            },
            'kayaking': {
                title: "Paddle & Peace: Kayaking",
                subtitle: "Get close to nature on the water's surface.",
                image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200",
                description: "Kayaking allows you to explore hidden coves, quiet rivers, and rugged coastlines that are unreachable by larger boats. It's a peaceful yet active way to connect with nature.",
                highlights: [
                    "Pristine lake and ocean routes",
                    "Safety certification training",
                    "Wildlife observation from water",
                    "Night kayaking experience"
                ],
                stats: { recommended: "Summer", rating: "4.6", effort: "High" },
                features: ["Quality Gear", "Safety Instructors", "Photo Packages", "Eco-friendly Travel"]
            }
        }
    };

    useEffect(() => {
        // Determine type from path if needed, or use the type param
        const resolvedType = type || (window.location.pathname.includes('destinations') ? 'destinations' : 'activities');
        const item = exploreData[resolvedType]?.[slug];

        if (item) {
            setData(item);
        } else {
            // Handle page not found or redirect
            console.log('Item not found:', type, slug);
        }
        window.scrollTo(0, 0);
    }, [type, slug]);

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 font-montserrat">Loading adventure...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                <Image
                    src={data.image}
                    alt={data.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>

                <Container className="absolute inset-0 flex flex-col justify-end pb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-4 lg:left-0 flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>

                    <div className="max-w-3xl px-4 lg:px-0">
                        <div className="flex items-center gap-2 text-teal-400 mb-4 animate-in slide-in-from-left duration-500">
                            <Sparkles className="w-5 h-5 fill-current" />
                            <span className="text-sm font-black uppercase tracking-widest">{type === 'destinations' ? 'Destination Spotlight' : 'Activity Experience'}</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white font-montserrat leading-tight mb-4 animate-in slide-in-from-left duration-700">
                            {data.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed animate-in slide-in-from-left duration-1000">
                            {data.subtitle}
                        </p>
                    </div>
                </Container>
            </div>

            {/* Content Section */}
            <Container className="py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-3xl font-black text-gray-900 font-montserrat mb-6 flex items-center gap-3">
                                <Info className="w-8 h-8 text-teal-500" />
                                Overview
                            </h2>
                            <p className="text-lg text-gray-600 leading-loose font-montserrat">
                                {data.description}
                            </p>
                        </section>

                        <section className="bg-gray-50 rounded-[40px] p-8 md:p-12 border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 font-montserrat mb-8">Trip Highlights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.highlights.map((highlight, idx) => (
                                    <div key={idx} className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium font-montserrat pt-1">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-black text-gray-900 font-montserrat mb-8">What's Included</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {data.features.map((feature, idx) => (
                                    <div key={idx} className="flex flex-col items-center p-6 bg-white border border-gray-100 rounded-3xl text-center hover:border-teal-500 hover:shadow-lg transition-all group">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 group-hover:bg-teal-500 transition-colors">
                                            <Compass className="w-6 h-6 text-teal-600 group-hover:text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900 uppercase tracking-tighter">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Quick Info */}
                    <div className="space-y-8">
                        <div className="bg-white border-2 border-teal-500 rounded-[32px] p-8 shadow-2xl shadow-teal-100 sticky top-24">
                            <h3 className="text-xl font-black text-gray-900 mb-6 font-montserrat">Quick Information</h3>

                            <div className="space-y-6">
                                {Object.entries(data.stats).map(([key, value], idx) => (
                                    <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{key}</span>
                                        <span className="text-lg font-black text-teal-600">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 space-y-4">
                                <button className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200">
                                    Book This Experience
                                </button>
                                <button className="w-full py-5 bg-white text-teal-600 border-2 border-teal-600 rounded-2xl font-black text-lg hover:bg-teal-50 transition-all">
                                    Inquiry Now
                                </button>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                                <div className="flex flex-col items-center gap-1">
                                    <ShieldCheck className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Secure</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Clock className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">24/7 Support</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Plane className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Best Price</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden">
                            <Sparkles className="absolute top-4 right-4 w-20 h-20 opacity-20 rotate-12" />
                            <h4 className="text-2xl font-black mb-4 relative z-10">Special Offer!</h4>
                            <p className="text-white/80 mb-6 relative z-10">Book within the next 48 hours and get a 15% discount on your first tour.</p>
                            <div className="text-4xl font-black mb-6 relative z-10">USE: DREAM15</div>
                            <Link to="/packages" className="inline-block px-8 py-3 bg-white text-teal-600 rounded-xl font-bold hover:scale-105 transition-transform">
                                Explore Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ExploreDetail;
