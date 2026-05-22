import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function RestaurantMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    client.get(`/restaurants/${id}`).then((response) => setRestaurant(response.data.data));
  }, [id]);

  if (!restaurant) {
    return <div className="page-center">Loading menu...</div>;
  }

  return (
    <div className="dashboard-stack">
      <section className="dashboard-hero compact-hero">
        <div>
          <span className="eyebrow">Restaurant menu</span>
          <h2>{restaurant.name}</h2>
          <p>{restaurant.address}</p>
        </div>
        <div className="table-actions-inline">
          <Link to="/cart" className="primary-button">
            Go to cart
          </Link>
        </div>
      </section>

      <section className="info-card">
        <h3>Start ordering</h3>
        <p>Add items from this menu to begin checkout. Your cart keeps the restaurant selected for the order flow.</p>
      </section>

      <div className="grid-cards">
        {(restaurant.menu || []).map((item) => (
          <article key={item._id} className="menu-card">
            <div>
              <h3>{item.name}</h3>
              <p>{item.description || item.category}</p>
            </div>
            <div className="menu-footer">
              <strong>₹{item.price}</strong>
              <button
                className="primary-button"
                onClick={() =>
                  addToCart({
                    foodItemId: item._id,
                    restaurantId: restaurant._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                  })
                }
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
