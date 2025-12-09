import Container from '../common/Container'
import Image from '../common/Image'

const RecentSearch = () => {

    const destinations = [
        {
            id: 1,
            name: "Istanbul, Turkey",
            image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop",
            services: '325',
            description: "Discover the magical blend of Europe and Asia"
        },
        {
            id: 2,
            name: "Sydney, Australia",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            services: '185',
            description: "Experience the iconic harbor city"
        },
        {
            id: 3,
            name: "Baku, Azerbaijan",
            image: "https://ik.imagekit.io/abpj7jifz/baku.webp?updatedAt=1761928744307",
            services: '210',
            description: "Explore the land of fire and modern architecture"
        },
        {
            id: 4,
            name: "Malé, Maldives",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
            services: '160',
            description: "Paradise on earth with crystal clear waters"
        },

    ]

    return (
        <div>
            <Container className='max-w-[1230px] mx-auto md:my-20 px-4 flex flex-col flex-wrap'>

                <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">
                        Your recent searches
                    </h2>

                </div>

                <div className="flex flex-wrap justify-start gap-4 sm:gap-6 lg:gap-4">
                    {destinations.map((destination) => (
                        <div
                            key={destination.id}
                            className="rounded-2xl shadow-lg cursor-pointer group w-full sm:w-full lg:w-[300px] lg:h-[80px] hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center p-3 sm:p-4 gap-3 sm:gap-4">

                                <div className='w-12 h-12 flex-shrink-0'>
                                    <Image
                                        src={destination.image}
                                        alt={destination.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>


                                <div className="flex flex-col gap-1 sm:gap-2 min-w-0 flex-1">
                                    <h3 className="text-[#121] font-montserrat text-sm sm:text-base lg:text-md font-semibold opacity-70 truncate">
                                        {destination.name}
                                    </h3>

                                    <div className="flex flex-wrap gap-1 sm:gap-2">
                                        
                                        <p className='font-montserrat text-sm font-semibold text-[#121]'>{destination.services} Places</p>
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

export default RecentSearch