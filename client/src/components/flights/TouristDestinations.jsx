
import Button from '../common/Buttton'
import Container from '../common/Container'
import Image from '../common/Image'

import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// JSON data for tourist destinations
const touristDestinationsData = {

    images: [
        {
            id: 1,
            src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
            alt: "Sri Lanka landscape"
        },
        {
            id: 2,
            src: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
            alt: "Sri Lanka coast"
        },
        {
            id: 3,
            src: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800&q=80",
            alt: "Sri Lanka nature"
        },
        {
            id: 4,
            src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80",
            alt: "Sri Lanka resort"
        }
    ]
}

const TouristDestinations = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleBookFlight = () => {
        // Navigate to the flights page with pre-filled parameters in state
        navigate('/flights', {
            state: {
                departure_id: 'DAC',
                arrival_id: 'CMB',
                from_query: 'Dhaka (DAC)',
                to_query: 'Colombo (CMB)'
            }
        })
    }

    return (
        <>
            <Container className='max-w-[1230px] mx-auto md:my-20 my-8 px-4 flex flex-col md:gap-10 gap-5'>

                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div className='flex flex-col gap-4'>
                        <h1 className='text-[#000] text-xl sm:text-2xl md:text-[32px] font-semibold'>
                            Fall into travel
                        </h1>
                        <p className='text-sm md:text-base font-normal md:w-[800px] w-full'>
                            Going somewhere to celebrate this season? Whether you're going home or somewhere to roam, we've got the travel tools to get you to your destination.
                        </p>
                    </div>
                    {/* <div className='flex-shrink-0'>
                        <Button
                            text='See All'
                            className='px-4 py-2 text-black rounded-md border border-[#8DD3BB] text-sm font-medium whitespace-nowrap'
                        />
                    </div> */}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Card - Left Side */}
                    <div
                        className="rounded-3xl p-6 md:p-8 flex flex-col justify-between min-h-[400px] md:min-h-[460px] lg:w-1/2 bg-[#8DD3BB]"
                    >
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex justify-between items-start gap-4">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black leading-tight max-w-[250px] md:max-w-[300px]">
                                    Backpacking <br /> Sri Lanka
                                </h2>
                                <div className="bg-white rounded-lg px-3 md:px-4 py-2 flex flex-col items-center flex-shrink-0">
                                    <span className="text-xs font-normal text-black">From</span>
                                    <span className="text-lg md:text-xl font-bold text-black">$700</span>
                                </div>
                            </div>

                            <p className="text-sm md:text-base font-normal text-black leading-relaxed">
                                Traveling is a unique experience as it's the best way to unplug from the pushes and pulls of daily life. It helps us to forget about our problems, frustrations, and fears at home. During our journey, we experience life in different ways. We explore new places, cultures, cuisines, traditions, and ways of living.
                            </p>
                        </div>

                        <Button
                            text='Book Flight'
                            className='w-full h-[48px] text-black bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors mt-4'
                            to='/flight-results'
                            onClick={handleBookFlight}
                        />
                    </div>

                    {/* Image Grid - Right Side */}
                    <div className="flex flex-wrap gap-3 md:gap-4 lg:w-1/2">
                        {touristDestinationsData.images.map((image) => (
                            <div key={image.id} className="relative overflow-hidden rounded-2xl w-[calc(50%-6px)] md:w-[calc(50%-8px)] flex-grow">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-[180px] md:h-[220px] object-cover hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </Container>
        </>
    )
}

export default TouristDestinations;