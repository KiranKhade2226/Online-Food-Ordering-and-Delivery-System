import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import {
  acceptDeliveryOrder,
  getAvailableDeliveryOrders,
  getMyDeliveries,
  rejectDeliveryOrder,
  updateDeliveryOrderStatus,
} from '../../api/deliveryApi';

const deliveryStatusOptions = ['On The Way', 'Delivered'];

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsError, setGpsError] = useState(null);

  // Capture delivery partner's GPS location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setGpsLocation({ latitude, longitude });
          setGpsError(null);
        },
        (error) => {
          setGpsError(`GPS Error: ${error.message}`);
          console.warn('GPS capture failed:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const loadDeliveryData = async () => {
    setLoading(true);
    try {
      // Pass GPS location to available orders query if available
      const availableRes = gpsLocation
        ? await getAvailableDeliveryOrders(gpsLocation.latitude, gpsLocation.longitude)
        : await getAvailableDeliveryOrders();
      
      const mineRes = await getMyDeliveries();
      setAvailableOrders(availableRes.data.data || []);
      setMyDeliveries(mineRes.data.data || []);
    } catch {
      setAvailableOrders([]);
      setMyDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveryData();
  }, [gpsLocation]);

  const completedDeliveries = useMemo(() => myDeliveries.filter((order) => order.status === 'Delivered'), [myDeliveries]);

  const handleAccept = async (orderId) => {
    try {
      await acceptDeliveryOrder(orderId);
      setMessage('Delivery accepted.');
      await loadDeliveryData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to accept delivery.');
    }
  };

  const handleReject = async (orderId) => {
    try {
      await rejectDeliveryOrder(orderId);
      setMessage('Delivery rejected.');
      await loadDeliveryData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to reject delivery.');
    }
  };

  const handleStatus = async (orderId, status) => {
    try {
      await updateDeliveryOrderStatus(orderId, status);
      setMessage(`Updated to ${status}.`);
      await loadDeliveryData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update delivery status.');
    }
  };

  return (
    <div className="dashboard-stack">
      <section className="dashboard-hero compact-hero">
        <div>
          <span className="eyebrow">Delivery partner</span>
          <h2>Nearby deliveries based on your GPS location.</h2>
          <p>
            {gpsLocation
              ? `Your location: ${gpsLocation.latitude.toFixed(5)}, ${gpsLocation.longitude.toFixed(5)}`
              : gpsError
              ? `GPS unavailable: ${gpsError}`
              : 'Detecting your location...'}
          </p>
        </div>
        <div className="stats-grid">
          <StatCard label="Available orders" value={availableOrders.length} hint="Near you" />
          <StatCard label="Active deliveries" value={myDeliveries.length} hint="In progress" />
        </div>
      </section>

      {message ? <div className="admin-alert">{message}</div> : null}

      {loading ? (
        <div className="page-center">Loading delivery dashboard...</div>
      ) : (
        <>
          <section className="info-card">
            <h3>Available orders (nearby)</h3>
            <div className="stack-list">
              {availableOrders.map((order) => (
                <article key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p>{order.restaurantId?.name || 'Restaurant'} · {order.restaurantId?.address || 'Address not found'}</p>
                      {order.distance && (
                        <p style={{ fontSize: '0.9em', color: '#666' }}>
                          📍 {(order.distance / 1000).toFixed(2)} km away
                        </p>
                      )}
                    </div>
                    <span className={`status-badge status-${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
                  </div>
                  <div className="order-meta">
                    <span>Customer: {order.customerId?.name || 'Customer'}</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                  <div className="delivery-addresses">
                    <p><strong>Restaurant location:</strong> {order.restaurantId?.address || 'Address not found'}</p>
                    {order.restaurantId?.gpsLocation?.coordinates && (
                      <p><strong>GPS:</strong> {order.restaurantId.gpsLocation.coordinates[1].toFixed(5)}, {order.restaurantId.gpsLocation.coordinates[0].toFixed(5)}</p>
                    )}
                    <p><strong>Customer delivery address:</strong> {order.deliveryAddress}</p>
                  </div>
                  <div className="table-actions-inline">
                    <button className="primary-button" onClick={() => handleAccept(order._id)}>Accept</button>
                    <button className="ghost-button" onClick={() => handleReject(order._id)}>Reject</button>
                  </div>
                </article>
              ))}
              {!availableOrders.length ? <p>No available deliveries near you right now.</p> : null}
            </div>
          </section>

          <section className="info-card">
            <h3>My deliveries</h3>
            <div className="stack-list">
              {myDeliveries.map((order) => (
                <article key={order._id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p>{order.restaurantId?.name || 'Restaurant'} · {order.customerId?.name || 'Customer'}</p>
                    </div>
                    <span className={`status-badge status-${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
                  </div>
                  <div className="order-meta">
                    <span>Restaurant: {order.restaurantId?.address || '-'}</span>
                    {order.restaurantId?.gpsLocation?.coordinates && (
                      <span>GPS: {order.restaurantId.gpsLocation.coordinates[1].toFixed(5)}, {order.restaurantId.gpsLocation.coordinates[0].toFixed(5)}</span>
                    )}
                    <span>Customer: {order.deliveryAddress}</span>
                  </div>
                  <div className="table-actions-inline">
                    {deliveryStatusOptions.map((status) => (
                      <button key={status} className="table-action" onClick={() => handleStatus(order._id, status)}>
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {!myDeliveries.length ? <p>No active or completed deliveries yet.</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
