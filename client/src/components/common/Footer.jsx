import { Link } from 'react-router-dom'
import { Facebook, Twitter, Youtube, Instagram } from 'lucide-react'
import Image from './Image'
import logoImage from '../../assets/images/logo.png'

const Footer = () => {
    const footerData = {
        destinations: [
            "Canada",
            "Alaska",
            "France",
            "Iceland"
        ],
        activities: [
            "Northern Lights",
            "Cruising & sailing",
            "Multi-activities",
            "Kayaking"
        ],
        travelBlogs: [
            "Bali Travel Guide",
            "Sri Lanka Travel Guide",
            "Peru Travel Guide",
            "Greece Travel Guide"
        ],
        aboutUs: [
            "Our Story",
            "Work with us"
        ],
        contactUs: [
            "Our Story",
            "Work with us"
        ]
    }

    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook" },
        { icon: Twitter, href: "#", label: "Twitter" },
        { icon: Youtube, href: "#", label: "YouTube" },
        { icon: Instagram, href: "#", label: "Instagram" }
    ]

    return (
        <footer className="bg-gradient-to-r from-teal-400 to-teal-500 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                    {/* Logo and Social Links */}
                    <div className="md:col-span-1">
                        <div className="flex items-center mb-6">
                            <Image
                                src={logoImage}
                                alt="Dream Holidays"
                                className="h-10 w-auto mr-3 filter brightness-0 invert"
                            />
                        </div>

                        {/* Social Media Links */}
                        <div className="flex space-x-3">
                            {socialLinks.map((social, index) => {
                                const IconComponent = social.icon
                                return (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                                        aria-label={social.label}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </a>
                                )
                            })}
                        </div>
                    </div>

                    {/* Our Destinations */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">Our Destinations</h3>
                        <ul className="space-y-2">
                            {footerData.destinations.map((destination, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/destinations/${destination.toLowerCase().replace(' ', '-')}`}
                                        className="text-sm hover:text-teal-100 transition-colors duration-200"
                                    >
                                        {destination}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Our Activities */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">Our Activities</h3>
                        <ul className="space-y-2">
                            {footerData.activities.map((activity, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/activities/${activity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        className="text-sm hover:text-teal-100 transition-colors duration-200"
                                    >
                                        {activity}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Travel Blogs */}
                    <div className="md:col-span-1">
                        <Link to="/blogs">
                            <h3 className="text-lg font-semibold mb-4">Travel Blogs</h3>
                        </Link>
                        <ul className="space-y-2">
                            {footerData.travelBlogs.map((blog, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/blog/${blog.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="text-sm hover:text-teal-100 transition-colors duration-200"
                                    >
                                        {blog}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About Us */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">About Us</h3>
                        <ul className="space-y-2">
                            {footerData.aboutUs.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/about/${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        className="text-sm hover:text-teal-100 transition-colors duration-200"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            {footerData.contactUs.map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/contact/${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                        className="text-sm hover:text-teal-100 transition-colors duration-200"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-white/20">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm opacity-80">
                            © {new Date().getFullYear()} Dream Holidays. All rights reserved.
                        </div>

                        <div className="flex space-x-6 text-sm">
                            <Link to="/terms-and-conditions" state={{ tab: 'terms' }} className="hover:text-teal-100 transition-colors duration-200">
                                Terms & Conditions
                            </Link>
                            <Link to="/terms-and-conditions" state={{ tab: 'privacy' }} className="hover:text-teal-100 transition-colors duration-200">
                                Privacy & Security
                            </Link>
                        </div>
                    </div>


                </div>
            </div>
        </footer>
    )
}

export default Footer