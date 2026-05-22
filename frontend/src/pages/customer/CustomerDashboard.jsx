import { useEffect, useState } from 'react';
import client from '../../api/client';
import StatCard from '../../components/StatCard';
import RestaurantCard from '../../components/RestaurantCard';
import OrderCard from '../../components/OrderCard';
import { useSocket } from '../../context/SocketContext';

export default function CustomerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [location, setLocation] = useState(null);
  const socket = useSocket();
  const fallbackLocation = { latitude: 28.5043955, longitude: 77.228939 };

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => setLocation(null)
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      const nearbyLocation = location || fallbackLocation;
      const [restaurantsRes, ordersRes] = await Promise.all([
        client.get(`/restaurants/nearby?latitude=${nearbyLocation.latitude}&longitude=${nearbyLocation.longitude}`),
        client.get('/orders/my-orders'),
      ]);

      const nearbyRestaurants = restaurantsRes.data.data || [];
      if (nearbyRestaurants.length || !location) {
        setRestaurants(nearbyRestaurants);
      } else {
        const fallbackRes = await client.get(`/restaurants/nearby?latitude=${fallbackLocation.latitude}&longitude=${fallbackLocation.longitude}`);
        setRestaurants(fallbackRes.data.data || []);
      }

      setOrders(ordersRes.data.data || []);
    };

    load().catch(() => {
      setRestaurants([]);
      setOrders([]);
    });
  }, [location]);

  useEffect(() => {
    if (!socket) return undefined;

    const onOrderUpdate = (payload) => {
      setOrders((current) => current.map((order) => (order._id === payload._id ? payload : order)));
    };

    socket.on('order-updated', onOrderUpdate);
    socket.on('order-created', onOrderUpdate);

    return () => {
      socket.off('order-updated', onOrderUpdate);
      socket.off('order-created', onOrderUpdate);
    };
  }, [socket]);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-hero">
        <div>
          <span className="eyebrow">Customer dashboard</span>
          <h2>Nearby restaurants, live order tracking, and Razorpay checkout.</h2>
          <p>Location-aware discovery is driven from the browser GPS and the backend geo index.</p>
        </div>
        <div className="stats-grid">
          <StatCard label="Restaurants" value={restaurants.length} hint="Nearby options" />
          <StatCard label="Orders" value={orders.length} hint="Recent activity" />
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h3>Nearby restaurants</h3>
          <p>Browse approved restaurants around your current location.</p>
        </div>
        <div className="grid-cards">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h3>Recent orders</h3>
          <p>Order tracking updates arrive through Socket.io.</p>
        </div>
        <div className="stack-list">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      </section>
    </div>
  );
}
