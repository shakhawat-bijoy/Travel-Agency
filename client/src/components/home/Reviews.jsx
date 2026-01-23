import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";
import { Quote, Star, ChevronRight, X, Trash2, MapPin, PenLine } from 'lucide-react';

import Container from '../common/Container';
import Image from '../common/Image';
import { reviewAPI, auth } from '../../utils/api';

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -right-2 lg:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-xl items-center justify-center text-gray-800 hover:text-teal-600 hover:scale-110 transition-all duration-300 border border-gray-100 hidden md:flex"
    aria-label="Next slide"
  >
    <FaArrowRightLong className="w-4 lg:w-5" />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -left-2 lg:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-xl items-center justify-center text-gray-800 hover:text-teal-600 hover:scale-110 transition-all duration-300 border border-gray-100 hidden md:flex"
    aria-label="Previous slide"
  >
    <FaArrowLeftLong className="w-4 lg:w-5" />
  </button>
);

const ReviewCard = ({ id, title, text, author, location, rating, image, color, isOwn, onDelete }) => (
  <div className="px-2 lg:px-4 pb-8 h-full">
    <div className="group relative bg-white rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Background Decoration */}
      <div className={`absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 opacity-10 rounded-full blur-3xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10 transition-all duration-500 group-hover:opacity-20 ${color || 'bg-teal-500'}`}></div>

      {/* Quote Icon & Delete Button */}
      <div className="flex justify-between items-start mb-4 lg:mb-6">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 ${(color || 'bg-teal-500').replace('bg-', 'bg-opacity-10 text-').replace('text-', '')}`}>
          <Quote className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
        {isOwn && (
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-30"
            title="Delete Review"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight line-clamp-2 mb-3">
        {title}
      </h3>

      {/* Rating */}
      <div className="flex gap-1 mb-3 lg:mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 lg:w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-600 text-[14px] lg:text-[15px] leading-relaxed mb-4 lg:mb-6 font-montserrat flex-1 line-clamp-4 lg:line-clamp-none">
        "{text}"
      </p>

      {/* Author */}
      <div className="flex items-center justify-between mt-auto pt-4 lg:pt-6 border-t border-gray-50">
        <div>
          <h4 className="font-bold text-gray-900 text-sm lg:text-base">{author}</h4>
          <p className="text-gray-400 text-[10px] lg:text-xs font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
          <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] lg:text-[10px] font-bold">
            G
          </div>
          <span className="text-[8px] lg:text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dream Holidays</span>
        </div>
      </div>

      {/* Bottom Image Overlay */}
      <div className="relative mt-6 lg:mt-8 group-hover:scale-105 transition-transform duration-700 h-32 lg:h-44">
        <Image
          src={image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"}
          alt={location}
          className="w-full h-full object-cover rounded-xl lg:rounded-2xl shadow-inner"
        />
        <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Hover Indicator */}
      <div className={`absolute bottom-0 left-0 h-1 lg:h-1.5 transition-all duration-500 group-hover:w-full w-0 ${color || 'bg-teal-500'}`}></div>
    </div>
  </div>
);

const Reviews = ({ className }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
    rating: 5
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const currentUser = auth.getUserData()?.user;

  const fetchReviews = async () => {
    const staticReviews = [
      {
        id: 's1',
        title: "A real sense of community, nurtured",
        text: "Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for always being there with a smile and helping us navigate our travel plans safely.",
        author: "Olga",
        location: "Weave Studios - Kai Tak",
        rating: 5,
        image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
        color: "bg-teal-500",
        userId: 'static'
      },
      {
        id: 's2',
        title: "The facilities are superb. Clean, slick, bright.",
        text: "The experience was beyond my expectations. Everything from the room aesthetics to the service was top-notch. I've already recommended Dream Holidays to all my coworkers!",
        author: "Thomas",
        location: "Weave Studios - Olympic",
        rating: 5,
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
        color: "bg-blue-500",
        userId: 'static'
      },
      {
        id: 's3',
        title: "Incredible attention to detail",
        text: "I was blown away by how seamless the entire booking process was. The itinerary was perfectly curated, and we didn't have to worry about a single thing during our 10-day trip.",
        author: "Eliot",
        location: "Grand Resort & Spa",
        rating: 5,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
        color: "bg-purple-500",
        userId: 'static'
      },
      {
        id: 's4',
        title: "Best vacation of my life!",
        text: "From start to finish, the team at Dream Holidays made sure every detail was perfect. The resort they recommended was a hidden paradise. Can't wait for my next trip.",
        author: "Sophia",
        location: "Paradise Bay Retreat",
        rating: 5,
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
        color: "bg-orange-500",
        userId: 'static'
      }
    ];

    try {
      setLoading(true);
      const response = await reviewAPI.getReviews();
      if (response.success) {
        // Map backend data to frontend format
        const formattedReviews = response.data.map(rev => ({
          id: rev._id,
          title: rev.title,
          text: rev.comment,
          author: rev.user?.name || 'Anonymous',
          location: rev.user?.location || 'Voyager',
          rating: rev.rating,
          image: rev.images?.[0]?.url || null,
          color: ['bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'][Math.floor(Math.random() * 4)],
          userId: rev.user?._id
        }));

        // Combine: New reviews (from backend) first, then static reviews
        setReviews([...formattedReviews, ...staticReviews]);
      } else {
        setReviews(staticReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(staticReviews); // Fallback to static reviews on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleWriteReview = () => {
    if (!auth.isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await reviewAPI.createReview({
        title: formData.title,
        comment: formData.comment,
        rating: formData.rating,
        reviewType: 'site'
      });

      if (response.success) {
        setShowModal(false);
        setFormData({ title: '', comment: '', rating: 5 });
        fetchReviews();
        alert('Thank you for your review!');
      }
    } catch (error) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const settings = {
    dots: true,
    infinite: reviews.length > 1,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    mobileFirst: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: dots => (
      <div className="mt-8">
        <ul className="flex justify-center gap-2 m-0 p-0"> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="w-2.5 h-2.5 rounded-full bg-gray-200 transition-all duration-300 hover:bg-teal-400 slick-active:w-8 slick-active:bg-teal-500"></div>
    )
  };

  return (
    <section className={`py-12 lg:py-24 bg-white overflow-hidden ${className}`}>
      <Container>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 lg:mb-16 gap-6 lg:gap-8 px-4 lg:px-0">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3 lg:mb-4">
              <div className="h-px w-6 lg:w-8 bg-teal-500"></div>
              <span className="text-teal-600 font-bold uppercase tracking-widest text-[10px] lg:text-xs">Testimonials</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 font-montserrat leading-tight mb-4 lg:mb-6">
              What our happy <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">travelers say</span>
            </h2>
            <p className="text-gray-500 text-base lg:text-lg font-montserrat leading-relaxed line-clamp-2 md:line-clamp-none">
              Discover authentic stories and experiences from explorers who have embarked on unforgettable journeys with us.
            </p>
          </div>

          <div className="relative flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
            <Link
              to="/reviews"
              className="group/link flex items-center gap-4 transition-all duration-500"
            >
              <div className="flex flex-col items-start md:items-end order-2 md:order-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600/60 mb-0.5">Explore Feed</span>
                <span className="font-black text-lg text-gray-900 group-hover/link:text-teal-600 transition-colors">See all reviews</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover/link:bg-teal-500 group-hover/link:border-teal-500 transition-all duration-500 group-hover/link:rotate-[360deg] group-hover/link:shadow-lg group-hover/link:shadow-teal-100 order-1 md:order-2">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover/link:text-white transition-colors" />
              </div>
            </Link>

            <button
              onClick={handleWriteReview}
              className="relative overflow-hidden group/btn px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-100 active:scale-[0.98] w-full md:w-auto text-center font-montserrat tracking-tight"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center justify-center gap-3">
                <PenLine className="w-5 h-5 transition-transform duration-500 group-hover/btn:-rotate-12" />
                Tell us your experience
              </span>
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative px-2 lg:-mx-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : reviews.length > 0 ? (
            <Slider {...settings}>
              {reviews.map((review, index) => (
                <ReviewCard
                  key={review.id || index}
                  {...review}
                  isOwn={currentUser?._id === review.userId}
                  onDelete={handleDeleteClick}
                />
              ))}
            </Slider>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-montserrat">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 lg:mt-20 flex flex-wrap justify-center items-center gap-6 lg:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 px-4">
          <div className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-[10px] lg:text-xs uppercase">G</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tighter text-sm lg:text-xl">Google Reviews</span>
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white font-bold text-[6px] lg:text-[8px] uppercase">TP</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tighter text-sm lg:text-xl">Trustpilot</span>
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2">
            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-[6px] lg:text-[8px] uppercase">TA</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tighter text-sm lg:text-xl">TripAdvisor</span>
          </div>
        </div>
      </Container>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-[32px] w-full max-w-xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-black text-gray-900 font-montserrat mb-2">Share Your Experience</h2>
            <p className="text-gray-500 mb-8 font-montserrat">Your feedback helps us and fellow travelers create better memories.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-1 transition-transform hover:scale-110 ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      <Star className={`w-8 h-8 ${formData.rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Review Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., An unforgettable journey!"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-montserrat"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Your Review</label>
                <textarea
                  required
                  rows="4"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Tell us about your experience..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-montserrat"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 hover:bg-teal-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}

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
    </section>
  );
};

export default Reviews;