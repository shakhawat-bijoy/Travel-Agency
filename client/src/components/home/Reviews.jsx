import Container from '../common/Container'
import Image from '../common/Image'
import Button from '../common/Buttton'
import reviews1 from '../../assets/images/reviews1.png'
import reviews2 from '../../assets/images/reviews2.png'
import reviews3 from '../../assets/images/reviews3.png'

import Slider from 'react-slick'
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";

function SampleNextArrow(props) {
  const { style, onClick } = props;
  return (
    <div
      className='w-14 h-14 absolute right-8 top-1/2 translate-y-[-50%] rounded-full !flex justify-center items-center cursor-pointer bg-transparent shadow-lg z-10'
      style={{ ...style, display: "block", }}
      onClick={onClick}
    >
      <FaArrowRightLong className='text-black' />
    </div>
  );
}

function SamplePrevArrow(props) {
  const { style, onClick } = props;
  return (
    <div
      className='w-14 h-14 absolute left-8 top-1/2 translate-y-[-50%] rounded-full !flex justify-center items-center z-50 cursor-pointer bg-transparent shadow-lg'
      style={{ ...style, display: "block", }}
      onClick={onClick}
    >
      <FaArrowLeftLong className='text-black' />
    </div>
  );
}

function SampleNextArrow2(props) {
  const { style, onClick } = props;
  return (
    <div
      className='lg:w-16 lg:h-16 w-10 h-10 absolute lg:right-8 right-4 top-1/2 translate-y-[-50%] rounded-full bg-white shadow-lg !flex justify-center items-center cursor-pointer z-10'
      style={{ ...style, display: "block", }}
      onClick={onClick}
    >
      <FaArrowRightLong className='text-black' />
    </div>
  );
}

function SamplePrevArrow2(props) {
  const { style, onClick } = props;
  return (
    <div
      className='lg:w-16 lg:h-16 w-10 h-10 absolute lg:left-8 left-4 top-1/2 translate-y-[-50%] rounded-full bg-white shadow-lg !flex justify-center items-center z-50 cursor-pointer'
      style={{ ...style, display: "block", }}
      onClick={onClick}
    >
      <FaArrowLeftLong className='text-black' />
    </div>
  );
}

const Reviews = () => {
  var settings = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: false,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 6000,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    swipeToSlide: true,
    touchMove: true,
    variableWidth: false,
    centerMode: false,

    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2.5,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1.2,
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1.1,
          slidesToScroll: 1,
          centerMode: false,
          variableWidth: false,
          nextArrow: <SampleNextArrow2 />,
          prevArrow: <SamplePrevArrow2 />,
        }
      }
    ]
  };

  return (
    <div className='my-20'>
      <Container className="flex mb-10 px-4 md:px-0 justify-between items-center">
        <div className='flex flex-col gap-4'>
          <h5 className='text-[#000000] text-[32px] leading-[44px] font-semibold font-montserrat tracking-[1.92px]'>Reviews</h5>
          <p className='font-montserrat text-[16px] leading-[24px] text-[#000000]'>What people says about Golobe facilities.</p>
        </div>
        <Button 
        text="View all" 
        className="px-4 py-2 border border-[#8DD3BB] rounded-sm font-medium text-sm font-montserrat text-[#121] cursor-pointer hover:bg-teal-500 hover:text-white transition-all duration-300" to="/" />
      </Container>

      <div className='w-full overflow-hidden'>
        <div className='pl-4 sm:pl-6 lg:pl-8 xl:pl-[calc((100vw-1200px)/2)] 2xl:pl-[calc((100vw-1400px)/2)]'>
          <Slider {...settings}>
            {/* Review Card 1 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "A real sense of community, nurtured"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Olga</h4>
                    <p className="text-gray-500 text-sm">Weave Studios - Kai Tak</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews1} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "The facilities are superb. Clean, slick, bright."
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    "A real sense of community, nurtured" Really appreciate the help and support from the staff...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Thomas</h4>
                    <p className="text-gray-500 text-sm">Weave Studios - Olympic</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews2} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "A real sense of community, nurtured"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Really appreciate the help and support from the staff during these tough times. Shoutout to Katie for...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Eliot</h4>
                    <p className="text-gray-500 text-sm">Weave Studios - Kai Tak</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews3} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 4 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "Highly recommend this place"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Great value for money and excellent customer service. Will definitely be coming back for another visit...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★☆</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Michael</h4>
                    <p className="text-gray-500 text-sm">Seaside Resort</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews1} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 5 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "Amazing experience overall"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    From booking to checkout, everything was smooth and professional. The facilities exceeded our expectations...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Emma</h4>
                    <p className="text-gray-500 text-sm">City Center Hotel</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews2} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 6 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "Outstanding hospitality"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    The staff made us feel like family. Every detail was taken care of and the service was impeccable...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">David</h4>
                    <p className="text-gray-500 text-sm">Luxury Retreat</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews3} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 7 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "Wonderful memories created"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Every moment was special and the team made sure we had everything we needed. Truly a memorable experience...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Lisa</h4>
                    <p className="text-gray-500 text-sm">Paradise Beach Resort</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews2} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 8 */}
            <div className="px-3">
              <div className="relative">
                <div className="bg-white rounded-[12px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    "Best vacation ever"
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    Everything was perfect from start to finish. The location, service, and amenities were all top-notch...
                  </p>
                  <div className="text-right mb-4">
                    <button className="text-gray-500 text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-4 gap-1">
                    <span className="text-yellow-400 text-lg">★★★★★</span>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-base">Robert</h4>
                    <p className="text-gray-500 text-sm">Ocean View Hotel</p>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-sm">Google</span>
                  </div>
                  <div className="relative -mx-6 -mb-6 mt-4">
                    <Image src={reviews2} alt="Review location" className="w-full h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-3 translate-y-3 -z-10"></div>
              </div>
            </div>

            {/* Review Card 9 */}
            <div className="px-3 md:px-4">
              <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto">
                <div className="bg-white rounded-[12px] p-4 md:p-6 shadow-sm border border-gray-100 min-h-[400px] md:min-h-[450px]">
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-2 md:mb-3 leading-tight line-clamp-2">
                    "Incredible attention to detail"
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed line-clamp-3">
                    The level of service exceeded all expectations. Every request was handled promptly and professionally. Truly outstanding experience...
                  </p>
                  <div className="text-right mb-3 md:mb-4">
                    <button className="text-gray-500 text-xs md:text-sm hover:text-gray-700 transition-colors">
                      View more
                    </button>
                  </div>
                  <div className="flex mb-3 md:mb-4 gap-1">
                    <span className="text-yellow-400 text-sm md:text-lg">★★★★★</span>
                  </div>
                  <div className="mb-3 md:mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Jessica</h4>
                    <p className="text-gray-500 text-xs md:text-sm">Grand Resort & Spa</p>
                  </div>
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-blue-600">G</span>
                    </div>
                    <span className="text-gray-500 text-xs md:text-sm">Google</span>
                  </div>
                  <div className="relative -mx-4 md:-mx-6 -mb-4 md:-mb-6 mt-auto">
                    <Image src={reviews3} alt="Review location" className="w-full h-28 md:h-40 object-cover rounded-b-[12px]" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-green-100 rounded-[12px] transform translate-x-2 md:translate-x-3 translate-y-2 md:translate-y-3 -z-10"></div>
              </div>
            </div>

          </Slider>
        </div>
      </div>
    </div>
  )
}

export default Reviews