import React from 'react'
import Banner from '../components/home/Banner'
import FlightHotelSearch from '../components/home/FlightHotelSearch'
import TripPlan from '../components/home/TripPlan'
import FlightHotelCard from '../components/home/FlightHotelCard'
import Reviews from '../components/home/Reviews'
import Packeges from '../components/home/Packeges'
import ExploreTabs from '../components/common/ExploreTabs'

const Home = () => {
  return (
    <div className='md:mt-5 mt-0'>
      <Banner className='md:relative static' />
      <FlightHotelSearch className='static md:absolute md:top-1/2 md:left-1/2 md:translate-x-[-50%] md:translate-y-[15%]' />
      <TripPlan className={'md:mt-[380px]'} />
      <Packeges />
      <FlightHotelCard />
      <Reviews className={'md:mb-12 mb-8'} />
      <ExploreTabs />
    </div>
  )
}

export default Home