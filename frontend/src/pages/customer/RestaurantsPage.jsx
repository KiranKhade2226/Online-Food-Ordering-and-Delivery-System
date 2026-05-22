import { useEffect, useState } from 'react';
import client from '../../api/client';
import RestaurantCard from '../../components/RestaurantCard';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const fallbackLocation = { latitude: 28.5043955, longitude: 77.228939 };

  useEffect(() => {
    client
      .get(`/restaurants/nearby?latitude=${fallbackLocation.latitude}&longitude=${fallbackLocation.longitude}`)
      .then((response) => {
        setRestaurants(response.data.data || []);
      })
      .catch(() => setRestaurants([]));
  }, []);

  return (
    <div>
      <div className="section-heading">
        <h3>Restaurants</h3>
        <p>Search nearby kitchens and open menus.</p>
      </div>
      <div className="grid-cards">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}
