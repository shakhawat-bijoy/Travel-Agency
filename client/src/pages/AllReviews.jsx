import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Container from '../components/common/Container';
import Image from '../components/common/Image';
import { Star, ChevronDown, Filter, Search, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { reviewAPI, auth } from '../utils/api';

const AllReviews = () => {
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const reviewsPerPage = 6;

    const currentUser = auth.getUserData()?.user;
    const location = useLocation();

    const fetchReviews = async () => {
        const staticReviews = [
            {
                _id: 's1',
                title: "A real sense of community, nurtured",
                comment: "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for always being there with a smile and helping us navigate our travel plans safely.",
                rating: 5,
                createdAt: '2023-01-01T00:00:00.000Z',
                user: {
                    name: "Olga",
                    location: "Weave Studios - Kai Tak",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's2',
                title: "The facilities are superb. Clean, slick, bright.",
                comment: "The experience was beyond my expectations. Everything from the room aesthetics to the service was top-notch. I've already recommended Dream Holidays to all my coworkers!",
                rating: 5,
                createdAt: '2023-01-02T00:00:00.000Z',
                user: {
                    name: "Thomas",
                    location: "Weave Studios - Olympic",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's3',
                title: "Incredible attention to detail",
                comment: "I was blown away by how seamless the entire booking process was. The itinerary was perfectly curated, and we didn't have to worry about a single thing during our 10-day trip.",
                rating: 5,
                createdAt: '2023-01-03T00:00:00.000Z',
                user: {
                    name: "Eliot",
                    location: "Grand Resort & Spa",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's4',
                title: "Best vacation of my life!",
                comment: "From start to finish, the team at Dream Holidays made sure every detail was perfect. The resort they recommended was a hidden paradise. Can't wait for my next trip.",
                rating: 5,
                createdAt: '2023-01-04T00:00:00.000Z',
                user: {
                    name: "Sophia",
                    location: "Paradise Bay Retreat",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's5',
                title: "Exceeded all expectations!",
                comment: "I've traveled with many agencies before, but Dream Holidays is on another level. The local guides were knowledgeable and the accommodation was luxurious. 10/10 would recommend.",
                rating: 5,
                createdAt: '2023-02-15T00:00:00.000Z',
                user: {
                    name: "Marcus",
                    location: "Berlin, Germany",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's6',
                title: "Perfect romantic getaway",
                comment: "The Maldives package was dream come true. Everything from the seaplane transfer to the candlelit dinners on the beach was perfectly organized. Thank you for making our anniversary special.",
                rating: 5,
                createdAt: '2023-03-10T00:00:00.000Z',
                user: {
                    name: "Elena",
                    location: "Rome, Italy",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's7',
                title: "Seamless and stress-free",
                comment: "Moving our family of five across countries is usually a nightmare, but Dream Holidays made it look easy. The kids loved the activities and we loved the peace of mind.",
                rating: 5,
                createdAt: '2023-04-05T00:00:00.000Z',
                user: {
                    name: "David",
                    location: "Sydney, Australia",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's8',
                title: "The only agency I trust",
                comment: "I've booked three trips with them so far, and each time has been better than the last. Their customer support team is available 24/7 and they really go the extra mile.",
                rating: 5,
                createdAt: '2023-05-20T00:00:00.000Z',
                user: {
                    name: "Sarah",
                    location: "London, UK",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's9',
                title: "Adventure of a lifetime",
                comment: "The Safari package in Kenya was breathtaking. Seeing the Big Five up close was a humbling experience. The wildlife guides were incredible. Highly professional agency.",
                rating: 5,
                createdAt: '2023-06-12T00:00:00.000Z',
                user: {
                    name: "James",
                    location: "Toronto, Canada",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's10',
                title: "Best value for money",
                comment: "I was skeptical about the low price, but the quality of the hotels and transport was top-tier. You really get more than what you pay for with these guys. Will book again.",
                rating: 4,
                createdAt: '2023-07-25T00:00:00.000Z',
                user: {
                    name: "Liam",
                    location: "Dublin, Ireland",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's11',
                title: "Stunning locations",
                comment: "Our trip to Santorini was magical. Oia's sunset is something everyone should see once. Dream Holidays picked the best hotel with a direct caldera view. Unforgettable.",
                rating: 5,
                createdAt: '2023-08-30T00:00:00.000Z',
                user: {
                    name: "Chloe",
                    location: "Paris, France",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's12',
                title: "Fantastic cultural experience",
                comment: "The Japan tour was so well thought out. We saw everything from Tokyo's neon lights to Kyoto's serene temples. The tea ceremony was a personal highlight. Great job!",
                rating: 5,
                createdAt: '2023-09-18T00:00:00.000Z',
                user: {
                    name: "Hiroshi",
                    location: "Osaka, Japan",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's13',
                title: "Great customer service",
                comment: "We had a small issue with our airport transfer, but a quick call to the Dream Holidays team solved it in 5 minutes. Their responsiveness is what builds trust. Good experience.",
                rating: 4,
                createdAt: '2023-10-05T00:00:00.000Z',
                user: {
                    name: "Aisha",
                    location: "Dubai, UAE",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's14',
                title: "Unique and authentic",
                comment: "What I loved most was that we didn't just visit tourist traps. We met locals, ate at hidden gems, and really felt the soul of the place. A very authentic way to travel.",
                rating: 5,
                createdAt: '2023-11-14T00:00:00.000Z',
                user: {
                    name: "Noah",
                    location: "New York, USA",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" }]
            },
            {
                _id: 's15',
                title: "Life-changing trip",
                comment: "The hiking tour in Patagonia was challenging but incredibly rewarding. The scenery is out of this world. Everything was safe and professionally handled. Highly recommended.",
                rating: 5,
                createdAt: '2023-12-20T00:00:00.000Z',
                user: {
                    name: "Isabella",
                    location: "Madrid, Spain",
                    _id: 'static'
                },
                images: [{ url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=800&auto=format&fit=crop" }]
            }
        ];

        try {
            setLoading(true);
            const response = await reviewAPI.getReviews();
            if (response.success) {
                // Combine: New reviews first, then static
                setAllReviews([...response.data, ...staticReviews]);
            } else {
                setAllReviews(staticReviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setAllReviews(staticReviews); // Fallback
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedReviews = useMemo(() => {
        let result = allReviews.filter(review =>
            review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'highest') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'lowest') {
            result.sort((a, b) => a.rating - b.rating);
        }

        return result;
    }, [allReviews, searchQuery, sortBy]);

    useEffect(() => {
        fetchReviews();
    }, []);

    // Handle initial scrolling/page selection for linked review
    useEffect(() => {
        if (location.hash && filteredAndSortedReviews.length > 0) {
            const reviewId = location.hash.replace('#review-', '');
            const index = filteredAndSortedReviews.findIndex(r => r._id === reviewId);
            if (index !== -1) {
                const page = Math.floor(index / reviewsPerPage) + 1;
                if (page !== currentPage) {
                    setCurrentPage(page);
                }

                // Scroll to the element after a brief delay to ensure it's rendered
                setTimeout(() => {
                    const element = document.getElementById(`review-${reviewId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-4', 'ring-teal-500', 'ring-opacity-50');
                        setTimeout(() => {
                            element.classList.remove('ring-4', 'ring-teal-500', 'ring-opacity-50');
                        }, 3000);
                    }
                }, 500);
            }
        }
    }, [location.hash, filteredAndSortedReviews]);

    const handleDeleteClick = (id) => {
        setReviewToDelete(id);
        setIsDeleteModalOpen(true);
        setDeleteConfirmText('');
    };

    const confirmDelete = async () => {
        if (deleteConfirmText !== 'DELETE') return;
        try {
            const response = await reviewAPI.deleteReview(reviewToDelete);
            if (response.success) {
                setIsDeleteModalOpen(false);
                fetchReviews();
            }
        } catch (error) {
            alert(error.message || 'Failed to delete review');
        } finally {
            setReviewToDelete(null);
            setDeleteConfirmText('');
        }
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage);
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredAndSortedReviews.slice(indexOfFirstReview, indexOfLastReview);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Container>
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-bold font-montserrat text-gray-900 mb-4">Guest Reviews</h1>
                    <p className="text-lg text-gray-600 font-montserrat max-w-2xl">
                        Discover why travelers love Dream Holidays. Read genuine experiences from our community of explorers worldwide.
                    </p>
                </div>

                {/* Filters and Search Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search reviews, authors or content..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-montserrat"
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none bg-white border border-gray-200 px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer text-gray-700 font-montserrat"
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>

                        <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium text-gray-700 font-montserrat">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>
                </div>

                {/* Reviews Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentReviews.map((review) => (
                            <div key={review._id} id={`review-${review._id}`} className="group flex flex-col h-full">
                                <div className="relative flex-1">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col transition-all duration-300 group-hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-1 text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-gray-400 font-montserrat">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                                {currentUser?._id === review.user?._id && (
                                                    <button
                                                        onClick={() => handleDeleteClick(review._id)}
                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight font-montserrat">
                                            "{review.title}"
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-4 font-montserrat">
                                            {review.comment}
                                        </p>

                                        <div className="mt-auto pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
                                                    {review.user?.avatar?.url ? (
                                                        <img src={review.user.avatar.url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-teal-700 font-bold uppercase">{review.user?.name?.[0] || 'U'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm font-montserrat">{review.user?.name || 'Anonymous'}</h4>
                                                    <p className="text-gray-500 text-xs font-montserrat">{review.user?.location || 'Global Traveler'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                                        <span className="text-[10px] font-bold text-blue-600">D</span>
                                                    </div>
                                                    <span className="text-gray-400 text-xs font-montserrat">Dream Holidays</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative -mx-6 -mb-6 mt-6 overflow-hidden">
                                            <Image
                                                src={review.images?.[0]?.url || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"}
                                                alt="Review location"
                                                className="w-full h-48 object-cover rounded-b-2xl transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-teal-50 rounded-2xl transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredAndSortedReviews.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 font-montserrat">No reviews found</h3>
                        <p className="text-gray-500 font-montserrat">Be the first to share your experience or adjust your filter.</p>
                    </div>
                )}

                {/* Pagination */}
                {filteredAndSortedReviews.length > 0 && totalPages > 1 && (
                    <div className="mt-16 flex justify-center">
                        <nav className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pageNumber = i + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all font-montserrat font-bold ${currentPage === pageNumber
                                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-200'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </nav>
                    </div>
                )}
            </Container>

            {/* Inline Delete Confirmation Pop-up */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
                    <div className="relative bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 font-montserrat mb-2">Delete Review?</h2>
                            <p className="text-gray-500 mb-8 font-montserrat text-sm">
                                This action is permanent and cannot be undone. To confirm, please type <span className="font-bold text-red-600">DELETE</span> below.
                            </p>

                            <div className="w-full space-y-4">
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder="Type DELETE to confirm"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-montserrat text-center font-bold"
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold transition-all hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleteConfirmText !== 'DELETE'}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-700 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        Delete Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllReviews;
