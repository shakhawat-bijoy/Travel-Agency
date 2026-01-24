import { useRef } from 'react';
import {
    Printer,
    Cpu,
    Database,
    Layout,
    Box,
    Server,
    Code,
    BrainCircuit,
    Cloud,
    Globe
} from 'lucide-react';
const ProjectDocumentation = () => {

    const handlePrint = () => {
        window.print();
    };

    const TechSection = ({ icon: Icon, title, children }) => (
        <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-2">
                <Icon className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </div>
        </div>
    );

    const ItemCard = ({ name, desc, badge }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                {badge && <span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">{badge}</span>}
            </div>
            {desc && <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <style>
                {`
                    @media print {
                        @page { margin: 10mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                `}
            </style>

            {/* Control Bar */}
            <div className="max-w-7xl mx-auto px-4 mb-8 flex justify-end print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
                >
                    <Printer className="w-5 h-5" />
                    Print / Save as PDF
                </button>
            </div>

            {/* Document Content */}
            <div className="max-w-7xl mx-auto px-8 py-12 bg-white shadow-xl rounded-xl" id="printable-content">

                {/* Header */}
                <div className="text-center mb-16 border-b-2 border-teal-500 pb-8">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Dream Holidays</h1>
                    <p className="text-xl text-gray-500 font-light">Technical Documentation & Architecture Overview</p>
                    <div className="mt-4 text-sm text-gray-400">Generated on {new Date().toLocaleDateString()}</div>
                </div>

                {/* 1. Architecture Overview */}
                <TechSection icon={Server} title="Architecture Stack">
                    <ItemCard name="Frontend" desc="React 19 (Vite), Redux Toolkit, Tailwind CSS" badge="Client" />
                    <ItemCard name="Backend" desc="Node.js, Express.js, REST API Architecture" badge="Server" />
                    <ItemCard name="Database" desc="MongoDB (Mongoose ODM) with schemas for Users, Bookings, Flights, etc." badge="Data" />
                </TechSection>

                {/* 2. Client-Side Libraries */}
                <TechSection icon={Box} title="Client Libraries & Packages">
                    <ItemCard name="React Router DOM" desc="v7.9.4 - Handling client-side routing" />
                    <ItemCard name="Redux Toolkit" desc="State management for Auth, Flights, bookings" />
                    <ItemCard name="Tailwind CSS" desc="v4 - Utility-first CSS styling framework" />
                    <ItemCard name="Lucide React" desc="Modern scalable vector icons" />
                    <ItemCard name="React Icons" desc="Comprehensive icon library (Fa, Md, Io5)" />
                    <ItemCard name="Framer Motion" desc="(Implied) Used for smooth animations" />
                    <ItemCard name="Auth0 React" desc="Authentication integration wrapper" />
                    <ItemCard name="Axios" desc="HTTP client for API requests" />
                    <ItemCard name="Google Maps React" desc="Maps integration for location services" />
                    <ItemCard name="Leaflet / React-Leaflet" desc="Open-source interactive maps" />
                    <ItemCard name="Swiper / React Slick" desc="Carousels for featured destinations" />
                    <ItemCard name="React Snowfall" desc="Visual effect component for winter themes" />
                    <ItemCard name="jspdf / html2canvas" desc="PDF generation for bookings/tickets" />
                    <ItemCard name="jspdf-autotable" desc="Table generation plugin for PDFs" />
                </TechSection>

                {/* 3. Frontend Architecture & Patterns */}
                <TechSection icon={Code} title="Frontend Architecture & Patterns">
                    <ItemCard
                        name="State Management"
                        desc="Centralized store using Redux Toolkit. Slices for 'flights' (handling search params, results, loading states) and 'auth' (user sessions)."
                        badge="Redux"
                    />
                    <ItemCard
                        name="Component Structure"
                        desc="Atomic design principles: Common reusable UI components (Buttons, Inputs, Modals) vs Feature-specific Smart components (FlightBooking, SearchResults)."
                        badge="Design"
                    />
                    <ItemCard
                        name="Routing & Protections"
                        desc="React Router v6+ with robust ProtectedRoute wrappers checking authentication status before access to sensitive pages (Account, Payments)."
                        badge="Security"
                    />
                    <ItemCard
                        name="API Abstraction"
                        desc="Dedicated 'api/' layer separating HTTP logic from UI components. Uses Axios interceptors for handling auth tokens and global error responses."
                        badge="Pattern"
                    />
                    <ItemCard
                        name="Performance Optimization"
                        desc="Code splitting via lazy loading routes. Memoization of expensive calculations. Debounced search inputs for airport autocomplete."
                        badge="Performance"
                    />
                </TechSection>

                {/* 4. Server-Side Technologies */}
                <TechSection icon={Cpu} title="Server & Backend">
                    <ItemCard name="Node.js & Express" desc="Core server runtime and web framework" />
                    <ItemCard name="MongoDB & Mongoose" desc="NoSQL Database and object modeling" />
                    <ItemCard name="JWT (JsonWebToken)" desc="Secure stateless authentication" />
                    <ItemCard name="Bcryptjs" desc="Password hashing for security" />
                    <ItemCard name="Nodemailer" desc="Email sending service (reset password, confirmations)" />
                    <ItemCard name="Multer & Cloudinary" desc="File upload handling and cloud storage" />
                    <ItemCard name="Amadeus SDK" desc="Flight and Hotel search API integration" />
                </TechSection>

                {/* 4. Database Models & Schema */}
                <TechSection icon={Database} title="Database & Schema Architecture">
                    <div className="col-span-full mb-6 p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-4">
                            <Database className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Primary Database: MongoDB</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    The application utilizes <strong>MongoDB</strong>, a NoSQL database, for its flexibility and scalability.
                                    Data is modeled using <strong>Mongoose</strong> schemas to enforce structure and validation while allowing for complex nested documents
                                    (like flight itineraries and passenger details).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* User Schema */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-lg text-teal-700 mb-3 border-b pb-2">User Schema</h4>
                            <ul className="text-sm space-y-2 text-gray-600 font-mono">
                                <li>_id: ObjectId</li>
                                <li>name: String (Required)</li>
                                <li>email: String (Unique, Indexed)</li>
                                <li>password: String (Hashed Bcrypt)</li>
                                <li>role: Enum ['user', 'admin']</li>
                                <li>avatar: Object (URL, publicId)</li>
                                <li>rewardPoints: Number (Default: 0)</li>
                                <li>isVerified: Boolean</li>
                            </ul>
                        </div>

                        {/* Booking Schema */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-lg text-teal-700 mb-3 border-b pb-2">Flight Booking Schema</h4>
                            <ul className="text-sm space-y-2 text-gray-600 font-mono">
                                <li>bookingReference: String (Unique)</li>
                                <li>userId: Ref('User')</li>
                                <li>status: Enum ['confirmed', 'cancelled']</li>
                                <li>totalAmount: Number</li>
                                <li>passenger: Object (Name, Passport, etc)</li>
                                <li>flight: Object (Itineraries, Stops, Seats)</li>
                                <li>payment: Object (Card Masked, TransID)</li>
                            </ul>
                        </div>

                        {/* Package Booking Schema */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-lg text-teal-700 mb-3 border-b pb-2">Package Booking Schema</h4>
                            <ul className="text-sm space-y-2 text-gray-600 font-mono">
                                <li>bookingReference: String (Unique)</li>
                                <li>packageData: Object (Snapshot of Deal)</li>
                                <li>selectedDate: Date</li>
                                <li>travelers: Array [Object]</li>
                                <li>numberOfTravelers: Number</li>
                                <li>totalPrice: Number</li>
                                <li>status: Enum ['pending', 'confirmed']</li>
                            </ul>
                        </div>
                    </div>
                </TechSection>

                {/* 5. Key Pages & Components */}
                <TechSection icon={Layout} title="Key Frontend Components">
                    <ItemCard name="Home" desc="Landing page with TripPlanner, Reviews, Banner" />
                    <ItemCard name="Flight Search" desc="Complex form with autocomplete and date pickers" />
                    <ItemCard name="Package Details" desc="Dynamic routing for tour packages" />
                    <ItemCard name="User Dashboard" desc="Profile, Booking History, Settings (Account.jsx)" />
                    <ItemCard name="Auth Pages" desc="Login, Register, Forgot Password" />
                    <ItemCard name="Common UI" desc="Navbar, Footer, Modal, Button, Autocomplete" />
                </TechSection>

                {/* 6. API Ecosystem & Advanced Features */}
                <TechSection icon={Globe} title="API Ecosystem & Features">
                    <ItemCard
                        name="Enhanced Flight Search"
                        desc="Real-time pricing with detailed breakdown of taxes, supplier fees, and automatic discount detection."
                        badge="Core"
                    />
                    <ItemCard
                        name="Intelligent Price Analysis"
                        desc="Statistical analysis of flight options providing min/max/average prices and 'Best Value' vs 'Cheapest' recommendations."
                        badge="Analytics"
                    />
                    <ItemCard
                        name="Hybrid Airport Data"
                        desc="Combines live Amadeus API data with a local MongoDB cache for optimized performance and fallback reliability."
                        badge="Hybrid"
                    />
                    <ItemCard
                        name="Regional Specialization"
                        desc="Dedicated endpoints for Bangladesh airports (Domestic/International) and popular regional routes."
                        badge="Localization"
                    />
                    <ItemCard
                        name="Database Syncing"
                        desc="Automated scripts to synchronize airport data, track search usage, and update outdated records."
                        badge="Automation"
                    />
                    <ItemCard
                        name="Smart Caching"
                        desc="Caches flight results and search queries to reduce API costs and improve response times for frequent searches."
                        badge="Performance"
                    />
                </TechSection>

                {/* 6. AI & Development Tools */}
                <TechSection icon={BrainCircuit} title="AI & Development Assistants">
                    <div className="col-span-full md:col-span-1 lg:col-span-3">
                        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">

                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <Cloud className="w-6 h-6" />
                                AI
                            </h3>
                            <p className="mb-4 opacity-90">
                                This application was architected and refined using cutting-edge AI technologies.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="bg-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                                    <span className="block font-bold">Google Gemini</span>
                                    <span className="text-xs opacity-75">Reasoning & Code</span>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                                    <span className="block font-bold">OpenAI GPT</span>
                                    <span className="text-xs opacity-75">Logic & Creative</span>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                                    <span className="block font-bold">Anthropic Claude</span>
                                    <span className="text-xs opacity-75">Complex Refactoring</span>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg text-center backdrop-blur-sm">
                                    <span className="block font-bold">AWS KIRO</span>
                                    <span className="text-xs opacity-75">Infrastructure Ideas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TechSection>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-400">
                    <p className="flex items-center justify-center gap-2">
                        <Code className="w-4 h-4" />
                        Shakhawat Bijoy
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ProjectDocumentation;
