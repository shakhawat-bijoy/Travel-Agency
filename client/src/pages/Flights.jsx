import FlightHotelSearch from '../components/home/FlightHotelSearch'
import Banner from '../components/home/Banner'
import AttractionsMap from '../components/flights/AttractionsMap'
import Destinations from '../components/flights/Destinations'
import TouristDestinations from '../components/flights/TouristDestinations'


const Flights = () => {
  return (
    <div>
      <Banner />
      <FlightHotelSearch />
      <AttractionsMap/>
      <Destinations/>
      <TouristDestinations/>
    </div>
  )
}

export default Flights