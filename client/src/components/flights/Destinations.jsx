
import Button from '../common/Buttton'
import Container from '../common/Container'
import Image from '../common/Image'

// JSON data extracted from the image
const destinationsData = [
  {
    id: 1,
    city: "Melbourne",
    description: "An amazing journey",
    price: 700,
    image: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80",
    buttonColor: "#8DD3BB"
  },
  {
    id: 2,
    city: "Paris",
    description: "A Paris Adventure",
    price: 600,
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80",
    buttonColor: "#8DD3BB"
  },
  {
    id: 3,
    city: "London",
    description: "London eye adventure",
    price: 350,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    buttonColor: "#8DD3BB"
  },
  {
    id: 4,
    city: "Columbia",
    description: "Amazing streets",
    price: 700,
    image: "https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&q=80",
    buttonColor: "#8DD3BB"
  }
]

const Destinations = () => {
    

    return (
        <>
            <Container className='max-w-[1230px] mx-auto md:my-20 my-8 px-4 flex flex-col md:gap-10 gap-5 flex-wrap'>

                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                    <div className='flex flex-col gap-4'>
                        <h1 className='text-[#000] text-xl sm:text-2xl md:text-[32px] font-semibold font-montserrat'>
                            Fall into travel
                        </h1>
                        <p className='text-sm md:text-base font-normal font-montserrat md:w-[800px] w-full'>
                            Going somewhere to celebrate this season? Whether you're going home or somewhere to roam, we've got the travel tools to get you to your destination.
                        </p>
                    </div>
                    <div className='flex-shrink-0'>
                        <Button
                            text='See All'
                            className='px-4 py-2 text-black rounded-md border border-[#8DD3BB] text-sm font-medium whitespace-nowrap'
                        />
                    </div>
                </div>

                  <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4 md:gap-6">
                    {destinationsData.map((destination) => (
                        <div key={destination.id} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[280px] max-w-[396px] h-[420px] relative">
                            <Image
                                src={destination.image}
                                alt={destination.city}
                                className="w-full h-full object-cover rounded-xl hover:scale-105 overflow-hidden transition-transform duration-300"
                            />

                            <div className="absolute bottom-0 right-0 left-0 p-5 rounded-b-xl flex flex-col gap-4 bg-gradient-to-t from-black/60 to-transparent">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-white text-lg font-semibold font-montserrat">
                                            {destination.city}
                                        </h1>
                                        <p className="text-white text-sm font-normal font-montserrat">
                                            {destination.description}
                                        </p>
                                    </div>
                                    <p className="text-white text-2xl font-semibold font-montserrat">
                                        $ {destination.price}
                                    </p>
                                </div>

                                <Button 
                                    text='Book Flight' 
                                    className='w-full h-[48px] text-black rounded-md bg-[#8DD3BB] text-sm font-medium whitespace-nowrap' 
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </Container>
        </>
    )
}

export default Destinations