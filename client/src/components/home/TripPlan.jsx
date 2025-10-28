import React from 'react'
import Container from '../common/Container'
import Button from '../common/Buttton'
import Image from '../common/Image'

const TripPlan = () => {
    const destinations = [
        {
            id: 1,
            name: "Istanbul, Turkey",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Discover the magical blend of Europe and Asia"
        },
        {
            id: 2,
            name: "Sydney, Australia",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Experience the iconic harbor city"
        },
        {
            id: 3,
            name: "Baku, Azerbaijan",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Explore the land of fire and modern architecture"
        },
        {
            id: 4,
            name: "Malé, Maldives",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Paradise on earth with crystal clear waters"
        },
        {
            id: 5,
            name: "Paris, France",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "The city of love and lights"
        },
        {
            id: 6,
            name: "New York, US",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "The city that never sleeps"
        },
        {
            id: 7,
            name: "London, UK",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Rich history meets modern culture"
        },
        {
            id: 8,
            name: "Tokyo, Japan",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Where tradition meets innovation"
        },
        {
            id: 9,
            name: "Dubai, UAE",
             
            services: ["Flights", "Hotels", "Resorts"],
            description: "Luxury and adventure in the desert"
        }
    ]

    return (
        <div className="bg-gray-50 py-16">
            <Container>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Plan your perfect trip
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Search Flights & Places Hire to our most popular destinations
                    </p>
                    <div className="flex justify-end">
                        <Button
                            text="See more places"
                            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            to="/destinations"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinations.map((destination) => (
                        <div
                            key={destination.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={destination.image}
                                    alt={destination.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {destination.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {destination.description}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {destination.services.map((service, index) => (
                                        <span
                                            key={index}
                                            className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
                                        >
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button
                        text="Explore All Destinations"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        to="/destinations"
                    />
                </div>
            </Container>
        </div>
    )
}

export default TripPlan