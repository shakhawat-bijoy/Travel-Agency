import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Image from '../components/common/Image';
import { travelBlogs } from '../data/travelBlogs';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';

const BlogDetail = () => {
    const { id } = useParams();
    const blog = travelBlogs.find(b => b.id === id || b.id === id.toLowerCase().replace(/\s+/g, '-'));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
                <Link to="/blogs" className="text-teal-600 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Blogs
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full">
                <Image
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center px-4 max-w-4xl">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-montserrat leading-tight">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-white/90 text-sm md:text-base font-montserrat">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                                <span>{blog.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 md:w-5 md:h-5" />
                                <span>{blog.author}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Container className="max-w-[1000px] mx-auto px-4 -mt-20 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-8 transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to All Blogs
                    </Link>

                    <div
                        className="prose prose-lg max-w-none prose-headings:font-montserrat prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-teal-600 font-montserrat"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Related Tags or Share buttons could go here */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2">
                            {['Travel', 'Guide', 'Adventure'].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs uppercase tracking-wider font-semibold">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>Share this article:</span>
                            {/* Social share buttons placeholders */}
                            <button className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors">f</button>
                            <button className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-200 transition-colors">t</button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default BlogDetail;
