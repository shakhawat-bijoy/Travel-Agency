import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate, Link, useLocation, useParams } from 'react-router-dom'
import {
    MapPin, Star, Wifi, Coffee, Car, Wind, Shield,
    Clock, ChevronLeft, Calendar, Users, Building,
    Share2, Heart, Info, Check, Image as ImageIcon,
    AlertTriangle, Sparkles, Navigation, Zap,
    Dumbbell, Utensils, Wine, Tv, ThermometerSnowflake,
    Waves, Key, Fan, Laptop, PhoneCall
} from 'lucide-react'
import { hotelAPI } from '../utils/api'
import Container from '../components/common/Container'
import { convertAndFormatToUSD, formatUSD, convertToUSD } from '../utils/currency'
import GoogleMap from '../components/GoogleMap'

const DUMMY_REVIEWS = [
    {
        _id: 'd1',
        title: 'Absolutely Breathtaking Experience!',
        comment: 'From the moment we arrived, we were treated like royalty. The room offered a stunning view and the amenities were top-notch. The staff went above and beyond to make our wedding anniversary special. Highly recommend the breakfast buffet!',
        rating: 9.8,
        createdAt: '2024-01-15T10:00:00Z',
        user: { firstName: 'Sarah' },
        images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' }, { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' }]
    },
    {
        _id: 'd2',
        title: 'Modern Luxury at its Best',
        comment: 'Clean, sleek, and very professional. The business center was perfect for my needs and the gym is one of the best I have seen in a hotel. Centrally located with easy access to the subway.',
        rating: 8.9,
        createdAt: '2023-12-10T14:30:00Z',
        user: { firstName: 'Michael' },
        images: []
    },
    {
        _id: 'd3',
        title: 'Perfect City Getaway',
        comment: 'The location is unbeatable. We walking to almost all major landmarks. The bed was incredibly comfortable—best sleep I have had in months. Will definitely stay here again on my next trip!',
        rating: 9.2,
        createdAt: '2024-01-05T09:15:00Z',
        user: { firstName: 'Emily' },
        images: [{ url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' }]
    }
];

const PropertyDetails = () => {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const navigate = useNavigate()

    const { hotelId: paramHotelId } = useParams()

    // 1. Try to get data from location.state (set during navigation)
    // 2. Try to recover from localStorage (set by HotelActionRouter)
    // 3. Fallback to URL params (/hotels/:hotelId)
    // 4. Fallback to searchParams (for direct links/bookmark support)
    const selectionData = useMemo(() => {
        if (location.state?.hotelId) return location.state

        // If we have a URL param, prioritize it
        if (paramHotelId) {
            return {
                hotelId: paramHotelId,
                offerId: searchParams.get('offerId'),
                tab: searchParams.get('tab'),
                searchParams: Object.fromEntries(searchParams)
            }
        }

        const stored = localStorage.getItem('selectedHotelForDetails')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                // Only use stored data if it's fresh (e.g., last 30 mins)
                if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                    return parsed
                }
            } catch (e) {
                console.error('Failed to parse stored hotel details', e)
            }
        }

        // Final fallback: construct from searchParams
        return {
            hotelId: searchParams.get('hotelId') || paramHotelId,
            offerId: searchParams.get('offerId'),
            tab: searchParams.get('tab'),
            searchParams: Object.fromEntries(searchParams)
        }
    }, [location.state, searchParams, paramHotelId])

    const hotelId = selectionData.hotelId
    const offerId = selectionData.offerId

    // Extract query params from selectionData.searchParams
    const query = selectionData.searchParams || {}
    const cityCode = query.cityCode
    const checkInDate = query.checkInDate
    const checkOutDate = query.checkOutDate
    const adults = parseInt(query.adults || '2')
    const roomQuantity = parseInt(query.roomQuantity || '1')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hotelData, setHotelData] = useState(selectionData.hotel || null)
    const [offers, setOffers] = useState([])
    const [reviews, setReviews] = useState({ averageRating: 0, total: 0, reviews: [] })

    // UI State
    const [activeTab, setActiveTab] = useState(selectionData.tab || 'overview')
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        const fetchAllData = async () => {
            if (!hotelId) return;

            try {
                setLoading(true)
                setError(null)

                // 1. Fetch Hotel Basic Info & Reviews in parallel
                console.log(`[PropertyDetails] Fetching info for ${hotelId}`)
                const [hotelRes, reviewsRes] = await Promise.all([
                    hotelAPI.getAmadeusHotel(hotelId).catch(err => ({ success: false, error: err })),
                    hotelAPI.getHotelReviews(hotelId).catch(err => ({ success: false, error: err }))
                ])

                if (hotelRes.success) {
                    setHotelData(hotelRes.data)
                } else {
                    console.warn('[PropertyDetails] Hotel info fetch failed:', hotelRes.error)
                }

                if (reviewsRes.success) {
                    const apiReviews = reviewsRes.data?.reviews || [];
                    const mergedReviews = [...apiReviews, ...DUMMY_REVIEWS];
                    setReviews({
                        averageRating: reviewsRes.data?.averageRating || 9.3,
                        total: mergedReviews.length,
                        reviews: mergedReviews
                    })
                } else {
                    setReviews({
                        averageRating: 9.3,
                        total: DUMMY_REVIEWS.length,
                        reviews: DUMMY_REVIEWS
                    })
                }

                // 2. Fetch Offers
                let offersData = []

                // Priority 1: Search for all offers with dates
                if (checkInDate && checkOutDate) {
                    console.log(`[PropertyDetails] Searching offers for dates ${checkInDate} to ${checkOutDate}`)

                    const searchParamsObj = {
                        hotelIds: hotelId,
                        checkInDate,
                        checkOutDate,
                        adults,
                        roomQuantity,
                        includeOffers: true
                    }
                    if (cityCode) searchParamsObj.cityCode = cityCode

                    const offersSearchRes = await hotelAPI.searchHotelOffers(searchParamsObj)
                        .catch(err => ({ success: false, error: err }))

                    if (offersSearchRes.success && offersSearchRes.data?.length > 0) {
                        offersData = offersSearchRes.data[0].offers || []
                    }
                }

                // Priority 2: If no offers found with date search, try specific offerId if provided
                if (offersData.length === 0 && offerId) {
                    console.log(`[PropertyDetails] No offers from full search, trying specific offerId: ${offerId}`)
                    const singleOfferRes = await hotelAPI.getHotelOffer(offerId).catch(err => ({ success: false, error: err }))
                    if (singleOfferRes.success && singleOfferRes.data?.offers) {
                        offersData = singleOfferRes.data.offers
                    }
                }

                setOffers(offersData)

                // If we found NO data at all (no hotel detail and no offers)
                if (!hotelRes.success && offersData.length === 0) {
                    throw new Error('Hotel properties could not be found. It might be unavailable for the selected dates.')
                }

            } catch (err) {
                console.error('[PropertyDetails] Error:', err)
                setError(err.message || 'Failed to load property details.')
            } finally {
                setLoading(false)
            }
        }

        fetchAllData()
    }, [hotelId, checkInDate, checkOutDate, cityCode, adults, roomQuantity, offerId])

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && tab !== activeTab) {
            setActiveTab(tab)
        }
    }, [searchParams])

    const handleTabChange = (tabId) => {
        setActiveTab(tabId)
        const newParams = new URLSearchParams(searchParams)
        newParams.set('tab', tabId)
        navigate(`?${newParams.toString()}`, { replace: true })

        if (tabId === 'rooms') {
            document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const calculateNights = (start, end) => {
        if (!start || !end) return 1
        const s = new Date(start)
        const e = new Date(end)
        const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 1
    }

    const nights = useMemo(() => calculateNights(checkInDate, checkOutDate), [checkInDate, checkOutDate])

    const amenityMap = {
        'WIFI': { icon: <Wifi className="w-5 h-5" />, label: 'High-Speed WiFi' },
        'WIRELESS_INTERNET': { icon: <Wifi className="w-5 h-5" />, label: 'Wireless Internet' },
        'PARKING': { icon: <Car className="w-5 h-5" />, label: 'Private Parking' },
        'RESTAURANT': { icon: <Utensils className="w-5 h-5" />, label: 'Gourmet Restaurant' },
        'FITNESS_CENTER': { icon: <Dumbbell className="w-5 h-5" />, label: 'Fitness Center' },
        'GYM': { icon: <Dumbbell className="w-5 h-5" />, label: 'Professional Gym' },
        'SWIMMING_POOL': { icon: <Waves className="w-5 h-5" />, label: 'Luxury Pool' },
        'AIR_CONDITIONING': { icon: <ThermometerSnowflake className="w-5 h-5" />, label: 'Air Conditioning' },
        'ROOM_SERVICE': { icon: <PhoneCall className="w-5 h-5" />, label: '24/7 Room Service' },
        'BAR': { icon: <Wine className="w-5 h-5" />, label: 'Premium Bar' },
        'SPA': { icon: <Sparkles className="w-5 h-5" />, label: 'Wellness Spa' },
        'BUSINESS_CENTER': { icon: <Laptop className="w-5 h-5" />, label: 'Business Center' },
        'TELEVISION': { icon: <Tv className="w-5 h-5" />, label: 'Smart TV' },
        'COFFEE_SHOP': { icon: <Coffee className="w-5 h-5" />, label: 'Coffee House' },
        'SAFE': { icon: <Shield className="w-5 h-5" />, label: 'In-Room Safe' },
        'CONCIERGE': { icon: <Key className="w-5 h-5" />, label: 'Elite Concierge' },
        'AIR_CONDITIONER': { icon: <Fan className="w-5 h-5" />, label: 'Climate Control' }
    }

    const defaultAmenities = [
        'WIFI', 'AIR_CONDITIONING', 'ROOM_SERVICE',
        'FITNESS_CENTER', 'RESTAURANT', 'SWIMMING_POOL'
    ]

    const amenities = useMemo(() => {
        const apiAmenities = hotelData?.amenities || []
        // Blend API amenities with some high-end defaults if the list is short
        const combined = [...new Set([...apiAmenities, ...defaultAmenities])]
        return combined.map(key => {
            const normalized = key.toUpperCase().replace(/\s+/g, '_')
            return amenityMap[normalized] || {
                icon: <Check className="w-5 h-5" />,
                label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace(/_/g, ' ')
            }
        })
    }, [hotelData?.amenities])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                </div>
                <p className="mt-6 text-gray-500 font-medium animate-pulse">Designing your stay...</p>
            </div>
        )
    }

    if (error) {
        return (
            <Container className="py-20">
                <div className="max-w-xl mx-auto bg-white rounded-3xl p-10 text-center shadow-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Discovery Failed</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/hotels')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Return to Search
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Container>
        )
    }

    const address = hotelData?.address
    const fullAddress = address?.lines
        ? [...address.lines, address.cityName, address.countryCode].filter(Boolean).join(', ')
        : (hotelData?.cityCode || '')

    const sampleImages = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800"
    ]
    return (
        <div className="bg-[#F8FAFC] min-h-screen">
            {/* Super Header / Navigation */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
                <Container>
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-bold transition-all group px-4 py-2 hover:bg-blue-50 rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>

                        <div className="hidden md:flex items-center gap-6">
                            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-bold transition-all">
                                <Heart className="w-5 h-5" />
                                Save
                            </button>
                            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all">
                                <Share2 className="w-5 h-5" />
                                Share
                            </button>
                        </div>

                        <div className="md:hidden flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </Container>
            </div >

            <Container className="py-6 sm:py-10">
                {/* Header Information */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-blue-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-widest">
                                    Hotel
                                </span>
                                <div className="flex items-center gap-1 text-orange-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < (hotelData?.rating || 4) ? 'fill-current' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                {hotelData?.name || 'Property Details'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4">
                                <div className="flex items-center gap-2 text-gray-600 font-medium">
                                    <MapPin className="w-5 h-5 text-red-500" />
                                    {hotelData?.cityCode}, {address?.countryCode || ''}
                                </div>
                                {reviews.total > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-600 text-white px-2 py-1 rounded-lg text-sm font-black">
                                            {reviews.averageRating || '8.5'}
                                        </div>
                                        <div className="text-sm font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => handleTabChange('reviews')}>
                                            {reviews.total} Guest Reviews
                                        </div>
                                    </div>
                                )}
                                <div className="text-blue-600 font-bold flex items-center gap-2 cursor-pointer hover:underline" onClick={() => handleTabChange('location')}>
                                    <Navigation className="w-4 h-4" />
                                    Show on Map
                                </div>
                            </div>
                        </div>

                        {/* Quick Price Display - Desktop only */}
                        <div className="hidden lg:block text-right pb-1">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Starting From</p>
                            <div className="flex items-baseline justify-end gap-2">
                                <span className="text-4xl font-black text-blue-600">
                                    {offers[0]?.price?.total ? convertAndFormatToUSD(offers[0].price.total, offers[0].price.currency) : '—'}
                                </span>
                                <span className="text-gray-500 font-bold">/ night</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                    <div className="lg:col-span-8">
                        <div className="relative aspect-[16/9] bg-gray-200 rounded-3xl overflow-hidden shadow-2xl group">
                            <img
                                src={sampleImages[selectedImage]}
                                alt="Property Detail"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8">
                                <div className="flex gap-2">
                                    {sampleImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`h-1.5 rounded-full transition-all ${selectedImage === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl hover:bg-white/40 transition-all font-bold text-sm flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                All Photos
                            </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-4 mt-4">
                            {sampleImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-4 transition-all ${selectedImage === idx ? 'border-blue-600 ring-4 ring-blue-50' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Booking Control Panel */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-100/50 border border-blue-50 sticky top-28">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 mb-1">Book Your Stay</h3>
                                    <p className="text-sm text-gray-500 font-medium">Safe & Secure Instant Confirmation</p>
                                </div>
                                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                                    <Zap className="w-6 h-6 fill-current" />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Stay Schedule</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {checkInDate ? `${checkInDate} → ${checkOutDate}` : 'Select Dates'}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <Users className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Travelers</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {adults} Adults, {roomQuantity} Room
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 font-bold">{nights} Night{nights > 1 ? 's' : ''} Stay</span>
                                    <span className="text-gray-900 font-black">
                                        {offers[0]?.price?.total ? convertAndFormatToUSD(offers[0].price.total, offers[0].price.currency) : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                                    <span>Taxes & Fees</span>
                                    <span>Included</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleTabChange('rooms')}
                                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0"
                            >
                                SEE AVAILABLE ROOMS
                            </button>

                            <div className="mt-8 flex items-center justify-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Free Cancel</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Trusted</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Best Price</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        {/* Tabs */}
                        <div className="flex items-center gap-8 border-b border-gray-200 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'rooms', label: 'Rooms & Rates' },
                                { id: 'amenities', label: 'Amenities' },
                                { id: 'reviews', label: 'Reviews' },
                                { id: 'location', label: 'Location' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* OverView Content */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-50">
                                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <Building className="w-7 h-7 text-blue-600" />
                                        Property Description
                                    </h3>
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-loose">
                                        <p className="mb-4">
                                            Discover unparalleled comfort at <span className="font-bold text-gray-900">{hotelData?.name}</span>,
                                            strategically positioned in the vibrant district of <span className="font-bold text-gray-900">{hotelData?.cityCode}</span>.
                                        </p>
                                        <p>
                                            {hotelData?.description?.text || "This premium establishment offers world-class service combined with modern luxury. Whether you are visiting for business or leisure, our facilities are designed to exceed your expectations with elegant design and exceptional hospitality."}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-50">
                                    <h3 className="text-2xl font-black text-gray-900 mb-8">Popular Amenities</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        {amenities.slice(0, 6).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-blue-100 group">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {item.icon}
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleTabChange('amenities')} className="mt-8 text-blue-600 font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-2">
                                        View All Amenities
                                        <ChevronLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rooms Content */}
                        <div id="rooms-section" className={activeTab === 'rooms' ? 'block' : 'hidden'}>
                            <h3 className="text-3xl font-black text-gray-900 mb-8">Available Rooms</h3>
                            {offers.length > 0 ? (
                                <div className="space-y-6">
                                    {offers.map((offer, idx) => (
                                        <div key={offer.id || idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:border-blue-200 transition-all group hover:shadow-xl hover:shadow-blue-100/20">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="md:w-1/3 relative">
                                                    <img
                                                        src={sampleImages[(idx % 4) + 1]}
                                                        className="h-full w-full object-cover min-h-[200px]"
                                                        alt="Room View"
                                                    />
                                                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {offer.room?.typeEstimated?.category || 'Standard'}
                                                    </div>
                                                </div>
                                                <div className="p-8 flex-1">
                                                    <div className="flex flex-col h-full">
                                                        <div className="mb-4">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Users className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sleeps {offer.adults || 2} Adults</span>
                                                                {offer.boardType && (
                                                                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest"> • {offer.boardType}</span>
                                                                )}
                                                            </div>
                                                            <h4 className="text-xl font-black text-gray-900 mb-2">
                                                                {offer.room?.typeEstimated?.bedType} {offer.room?.typeEstimated?.category || 'Luxury Room'}
                                                            </h4>
                                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                                {offer.room?.description?.text || 'Featuring modern decor, high-speed WiFi, and a marble bathroom with premium essentials.'}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 mt-auto pt-6">
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">
                                                                <Check className="w-3 h-3" />
                                                                Free Cancellation
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                                                                <Zap className="w-3 h-3" />
                                                                Instant Booking
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-8 bg-gray-50 md:w-1/4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 text-center">
                                                    <div className="mb-6">
                                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">{nights} Night Total</p>
                                                        <div className="text-3xl font-black text-gray-900">
                                                            {convertAndFormatToUSD(offer.price.total, offer.price.currency)}
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1 font-medium">Best Price Guarantee</p>
                                                    </div>
                                                    <Link
                                                        to="/confirm-hotel-booking"
                                                        state={{
                                                            hotel: {
                                                                hotelId,
                                                                name: hotelData?.name || 'Hotel',
                                                                address: hotelData?.address,
                                                                cityCode: hotelData?.cityCode,
                                                                latitude: hotelData?.geoCode?.latitude,
                                                                longitude: hotelData?.geoCode?.longitude
                                                            },
                                                            offer: {
                                                                ...offer,
                                                                checkInDate,
                                                                checkOutDate,
                                                                adults,
                                                                roomQuantity
                                                            }
                                                        }}
                                                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                                    >
                                                        Book Room
                                                    </Link>
                                                    <button className="mt-4 text-xs font-bold text-gray-500 hover:text-blue-600 uppercase tracking-widest">
                                                        Room Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Building className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900 mb-2">Sold Out for these dates</h4>
                                    <p className="text-gray-500 font-medium mb-8">Try adjusting your dates or searching in nearby cities.</p>
                                    <button
                                        onClick={() => navigate('/hotels')}
                                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                                    >
                                        Change Search Parameters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Amenities Tab */}
                        {activeTab === 'amenities' && (
                            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-50 scale-in-center">
                                <h3 className="text-2xl font-black text-gray-900 mb-10">All Property Facilities</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {amenities.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 text-gray-700 group">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                {item.icon}
                                            </div>
                                            <span className="text-[13px] font-bold uppercase tracking-wider">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Content */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-8 animate-in fade-in transition-all">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black text-gray-900">Guest Experience</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Score</p>
                                            <p className="text-xl font-black text-green-600">{reviews.averageRating || '8.5'}/10</p>
                                        </div>
                                    </div>
                                </div>

                                {reviews.total > 0 ? (
                                    <div className="space-y-6">
                                        {reviews.reviews.map((review, idx) => (
                                            <div key={review._id || idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-100">
                                                            {review.user?.firstName?.[0] || 'G'}
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-black text-gray-900">{review.title || 'Exceptional Experience'}</div>
                                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        {review.rating || '9.0'}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 leading-relaxed font-medium">{review.comment}</p>
                                                {review.images?.length > 0 && (
                                                    <div className="flex gap-4 mt-6 overflow-x-auto pb-4 scrollbar-hide">
                                                        {review.images.map((img, i) => (
                                                            <img
                                                                key={i}
                                                                src={img.url}
                                                                alt="Guest Upload"
                                                                className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-all"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest">No reviews yet. Be the first to share your experience!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location Content */}
                        {activeTab === 'location' && (
                            <div className="space-y-8 animate-in zoom-in-95 duration-300">
                                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                                                <MapPin className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location Address</p>
                                                <p className="text-lg font-black text-gray-900">{fullAddress}</p>
                                            </div>
                                        </div>
                                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                                            Open in Google Maps
                                        </button>
                                    </div>
                                    <div className="h-[500px] relative">
                                        <GoogleMap
                                            center={{
                                                lat: parseFloat(hotelData?.geoCode?.latitude || 0),
                                                lng: parseFloat(hotelData?.geoCode?.longitude || 0)
                                            }}
                                            zoom={16}
                                            markers={[
                                                {
                                                    position: {
                                                        lat: parseFloat(hotelData?.geoCode?.latitude || 0),
                                                        lng: parseFloat(hotelData?.geoCode?.longitude || 0)
                                                    },
                                                    title: hotelData?.name
                                                }
                                            ]}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Rails / Info Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-8 uppercase tracking-widest text-sm underline decoration-blue-500 decoration-4 underline-offset-8">Property Rules</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Check-In / Check-Out</div>
                                        <p className="text-xs text-gray-500 mt-1">Check-in from 3:00 PM. Check-out by 12:00 PM.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Children & Extra Beds</div>
                                        <p className="text-xs text-gray-500 mt-1">Age-specific policies and additional bed charges may apply.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Smoking Policy</div>
                                        <p className="text-xs text-gray-500 mt-1">Designated smoking areas provided. No-smoking inside rooms.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-blue-200">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-500" />
                            <h4 className="text-2xl font-black mb-4 relative z-10">Exclusive Travel Assistant</h4>
                            <p className="text-blue-100 text-sm mb-8 leading-relaxed relative z-10">Our luxury travel specialists are on standby 24/7 to personalize your experience and assist with bespoke requests.</p>
                            <button
                                onClick={() => window.open('https://wa.me/yournumber', '_blank')}
                                className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10 shadow-lg"
                            >
                                Chat with Specialist
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm underline decoration-blue-500 decoration-2 underline-offset-8">Location Highlights</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Great Location</div>
                                        <p className="text-xs text-gray-500 mt-1">Guests loved the area for walking and transit access.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                        <Wind className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase tracking-tight">Quiet Neighborhood</div>
                                        <p className="text-xs text-gray-500 mt-1">Perfect for a good night's sleep while staying central.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-sm">Nearby Landmarks</h4>
                            <div className="space-y-4">
                                {[
                                    { name: "City Center", dist: "0.5 km" },
                                    { name: "Main Station", dist: "1.2 km" },
                                    { name: "Airport", dist: "18.0 km" },
                                    { name: "Culture Museum", dist: "0.8 km" }
                                ].map((place, i) => (
                                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                        <span className="text-sm font-bold text-gray-700">{place.name}</span>
                                        <span className="text-xs font-black text-blue-600">{place.dist}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mobile Sticky Book Now bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex items-center justify-between">
                <div>
                    <div className="text-lg font-black text-blue-600">
                        {offers[0]?.price?.total ? convertAndFormatToUSD(offers[0].price.total, offers[0].price.currency) : '—'}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total with Taxes</span>
                </div>
                <button
                    onClick={() => handleTabChange('rooms')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-200"
                >
                    Book Now
                </button>
            </div>
        </div >
    )
}

export default PropertyDetails
