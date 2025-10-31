import React from 'react'
import Banner from '../components/home/Banner'
import FlightSearch from '../components/home/FlightSearch'
import TripPlan from '../components/home/TripPlan'
import FlightHotelCard from '../components/home/FlightHotelCard'
import Reviews from '../components/home/Reviews'

const Home = () => {
  return (
    <div className='md:mt-5 mt-0'>
        <Banner className='relative'/>
        <FlightSearch className='absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[10%]'/>
        <TripPlan className={'mt-[380px]'}/>
        <FlightHotelCard/>
        <Reviews/>
    </div>
  )
}

export default Home