import Destinations from "../components/flights/Destinations"
import TouristDestinations from "../components/flights/TouristDestinations"
import Banner from "../components/home/Banner"
import FlightHotelSearch from "../components/home/FlightHotelSearch"
import RecentSearch from "../components/hotels/RecentSearch"

const Hotels = () => {
  return (
    <div>
      <Banner className={`mb-10`}/>
      <FlightHotelSearch initialTab="stays" />
      <RecentSearch/>
      <Destinations/>
      <TouristDestinations/>
    </div>
  )
}

export default Hotels