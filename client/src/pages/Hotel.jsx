import FlightHotelSearch from '../components/home/FlightHotelSearch.jsx'
import Banner from '../components/home/Banner'


const Hotels = () => {
  return (
    <div>
      <Banner className={`mb-10`}/>
      <FlightHotelSearch initialTab="stays" />
    </div>
  )
}

export default Hotels