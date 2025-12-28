import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Image from '../components/common/Image';
import { travelBlogs } from '../data/travelBlogs';
import { Calendar, User } from 'lucide-react';

const TravelBlogs = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <Container className="max-w-[1230px] mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold font-montserrat text-gray-900 mb-4">
                        Travel Blogs
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto font-montserrat">
                        Inspiring stories, expert guides, and essential tips for your next adventure.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {travelBlogs.map((blog) => (
                        <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                            <div className="h-48 overflow-hidden relative">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-montserrat">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{blog.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>{blog.author}</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold mb-3 text-gray-900 font-montserrat line-clamp-2">
                                    {blog.title}
                                </h2>

                                <p className="text-gray-600 text-sm mb-4 font-montserrat line-clamp-3">
                                    {blog.summary}
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <Link
                                        to={`/blog/${blog.id}`}
                                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#8DD3BB] text-black font-semibold rounded-lg hover:bg-[#7bc1a9] transition-colors font-montserrat text-sm"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default TravelBlogs;
