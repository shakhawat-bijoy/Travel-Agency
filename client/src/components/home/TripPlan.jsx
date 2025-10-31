import React from 'react'
import Container from '../common/Container'
import Button from '../common/Buttton'
import Image from '../common/Image'

const TripPlan = ({className}) => {
    const destinations = [
        {
            id: 1,
            name: "Istanbul, Turkey",
            image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Discover the magical blend of Europe and Asia"
        },
        {
            id: 2,
            name: "Sydney, Australia",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Experience the iconic harbor city"
        },
        {
            id: 3,
            name: "Baku, Azerbaijan",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Explore the land of fire and modern architecture"
        },
        {
            id: 4,
            name: "Malé, Maldives",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Paradise on earth with crystal clear waters"
        },
        {
            id: 5,
            name: "Paris, France",
            image: "https://ik.imagekit.io/abpj7jifz/4843.webp?updatedAt=1761921999829",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "The city of love and lights"
        },
        {
            id: 6,
            name: "New York, US",
            image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "The city that never sleeps"
        },
        {
            id: 7,
            name: "London, UK",
            image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Rich history meets modern culture"
        },
        {
            id: 8,
            name: "Tokyo, Japan",
            image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Where tradition meets innovation"
        },
        {
            id: 9,
            name: "Dubai, UAE",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
            services: ["Flights", "•", "Hotels", "•", "Resorts"],
            description: "Luxury and adventure in the desert"
        }
    ]

    return (
        <div className={`${className}`}>
            <Container className={`w-[1232px] py-20`}>
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Plan your perfect trip
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Search Flights & Places Hire to our most popular destinations
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            text="See more places"
                            className="bg-white border border-teal-500 text-gray-800 px-6 py-2 rounded-lg hover:bg-teal-500 hover:text-white transition-colors"
                            to="/"
                        />
                    </div>
                </div>

                <div className="flex justify-between flex-wrap gap-8">
                    {destinations.map((destination) => (
                        <div
                            key={destination.id}
                            className="rounded-2xl shadow-lg cursor-pointer group w-[389px] h-[122px]"
                        >
                            <div className="flex items-center p-4 gap-4">

                                <div className='w-[90px] h-[90px]'>
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>


                                <div className="flex flex-col gap-2">
                                    <h3 className="text-[#121] font-montserrat text-md font-semibold opacity-0.7">
                                        {destination.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {destination.services.map((service, index) => (
                                            <span
                                                key={index}
                                                className="text-[#121] font-montserrat text-sm font-medium"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>



                            </div>


                        </div>
                    ))}
                </div>
               
            </Container>
        </div>
    )
}

export default TripPlan