import { useState } from 'react'
import Image from '../common/Image'
import Container from '../common/Container'
import Slider from 'react-slick'

import banner1 from '../../assets/images/banner1.png'
import banner2 from '../../assets/images/banner2.png'
import banner3 from '../../assets/images/banner3.png'
import banner4 from '../../assets/images/banner4.png'
import banner5 from '../../assets/images/banner5.jpg'
import banner6 from '../../assets/images/banner6.jpg'

const Banner = () => {

  let [active, setActive] = useState(0)

  const bannerData = [
    {
      id: 1,
      image: banner1,
      subtitle: "Helping Others",
      title: "Live & Travel",
      description: "Special offers to suit your plan"
    },
    {
      id: 2,
      image: banner2,
      subtitle: "Explore The World",
      title: "Dream Destinations",
      description: "Discover amazing places around the globe"
    },
    {
      id: 3,
      image: banner3,
      subtitle: "Adventure Awaits",
      title: "Create Memories",
      description: "Unforgettable experiences for every traveler"
    },
    {
      id: 4,
      image: banner4,
      subtitle: "Luxury Travel",
      title: "Premium Experience",
      description: "Indulge in world-class hospitality"
    },
    {
      id: 5,
      image: banner5,
      subtitle: "Beach Paradise",
      title: "Tropical Getaway",
      description: "Relax on pristine sandy beaches"
    },
    {
      id: 6,
      image: banner6,
      subtitle: "Mountain Escape",
      title: "Nature's Beauty",
      description: "Breathtaking views and fresh air"
    }
  ]

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    fade: true,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,

    beforeChange: (_, next) => {
      setActive(next);
    },

    appendDots: dots => (
      <div
        style={{
          position: "absolute",
          bottom: "-1%",
          left: "0",
          transform: "translateY(100%)",
        }}
      >
        <ul style={{
          margin: "0px",
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 0",
          listStyle: "none"
        }}> {dots} </ul>
      </div>
    ),
    // customPaging: i => (
    //   <div className="relative group cursor-pointer">
    //     {/* Progress Bar Container */}
    //     <div className={`
    //       relative w-16 h-1 rounded-full overflow-hidden transition-all duration-700 ease-in-out
    //       ${i === active ? 'bg-white/30' : 'bg-white/20 hover:bg-white/25'}
    //     `}>
    //       {/* Active Progress Bar */}
    //       <div className={`
    //         absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out
    //         ${i === active
    //           ? 'w-full bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-500/50'
    //           : 'w-0 bg-white/40'
    //         }
    //       `} />
    //     </div>

    //     {/* Slide Number */}
    //     <div className={`
    //       absolute -top-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-in-out
    //       ${i === active
    //         ? 'text-black font-bold text-sm opacity-100 scale-110'
    //         : 'text-gray/60 font-medium text-xs opacity-70 scale-100 group-hover:opacity-90 group-hover:scale-105'
    //       }
    //     `}>
    //       {String(i + 1).padStart(2, '0')}
    //     </div>

    //     {/* Hover Effect Circle */}
    //     <div className={`
    //       absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
    //       w-6 h-6 rounded-full border-2 transition-all duration-300 ease-in-out
    //       ${i === active
    //         ? 'border-white scale-100 opacity-100'
    //         : 'border-white/40 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-60'
    //       }
    //     `} />

    //     {/* Active Dot */}
    //     <div className={`
    //       absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
    //       w-2 h-2 rounded-full transition-all duration-300 ease-in-out
    //       ${i === active
    //         ? 'bg-white scale-100 opacity-100 shadow-lg shadow-white/50'
    //         : 'bg-white/60 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-80'
    //       }
    //     `} />
    //   </div>
    // ),

    responsive: [
      {
        breakpoint: 1024,
        settings: {}
      },
      {
        breakpoint: 600,
        settings: {}
      },
      {
        breakpoint: 480,
        settings: {
          appendDots: dots => (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "20px",
                transform: "translateX(-50%)",
                width: "100%",
                display: "flex",
                justifyContent: "center"
              }}
            >
              <ul
                style={{
                  margin: "0px",
                  display: "flex",
                  gap: "15px",
                  justifyContent: "center",
                  alignItems: "center",
                  listStyle: "none",
                  padding: "0px"
                }}
              >
                {dots}
              </ul>
            </div>
          ),
          customPaging: i => (
            <div className="relative group cursor-pointer px-2">
              {/* Mobile Progress Bar */}
              <div className={`
                relative w-12 h-0.5 rounded-full overflow-hidden transition-all duration-500 ease-in-out
                ${i === active ? 'bg-white/40' : 'bg-white/20'}
              `}>
                <div className={`
                  absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-in-out
                  ${i === active
                    ? 'w-full bg-gradient-to-r from-blue-400 to-purple-500'
                    : 'w-0 bg-white/40'
                  }
                `} />
              </div>

              {/* Mobile Slide Number */}
              <div className={`
                absolute -top-6 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out
                ${i === active
                  ? 'text-white font-bold text-xs opacity-100'
                  : 'text-white/60 font-medium text-xs opacity-70'
                }
              `}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Mobile Active Dot */}
              <div className={`
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                w-1.5 h-1.5 rounded-full transition-all duration-300 ease-in-out
                ${i === active
                  ? 'bg-white scale-100 opacity-100'
                  : 'bg-white/60 scale-0 opacity-0'
                }
              `} />
            </div>
          ),
        }
      }
    ],
  };



  return (
    <div>
      <Container className="relative pb-16 sm:pb-20 md:pb-24 lg:pb-[92px] rounded-3xl">


        <Slider {...settings}>
          {bannerData.map((banner) => (
            <div key={banner.id}>
              <div className='h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[581px] flex items-center justify-center'>
                <div className='w-full h-full relative'>
                  <Image src={banner.image} className="w-full h-full object-cover md:rounded-3xl rounded-b-lg" />
                  <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4 sm:px-6 lg:px-8 max-w-6xl w-full'>
                    <p className='text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[35px] 2xl:text-[40px] font-bold font-league mb-2 sm:mb-3 lg:mb-4'>
                      {banner.subtitle}
                    </p>
                    <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[60px] 2xl:text-[75px] font-bold font-league tracking-wide uppercase leading-tight mb-3 sm:mb-4 lg:mb-6'>
                      {banner.title}
                    </h1>
                    <p className='text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-[18px] 2xl:text-[20px] font-semibold font-montserrat max-w-3xl mx-auto leading-relaxed'>
                      {banner.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>



      </Container>
    </div>
  )
}

export default Banner