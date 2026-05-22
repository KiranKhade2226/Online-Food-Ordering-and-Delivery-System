import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="restaurant-card restaurant-card-link">
      <div>
        <span className="pill">{restaurant.isApproved ? 'Open' : 'Pending'}</span>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.address}</p>
      </div>
      <div className="card-footer">
        <span>{restaurant.prepTimeMinutes || 30} min prep</span>
        <span className="primary-button">
          View Menu
        </span>
      </div>
    </Link>
  );
}
