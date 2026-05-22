import { useEffect, useMemo, useState } from 'react';
import StatCard from '../../components/StatCard';
import {
  createOwnerRestaurant,
  addOwnerFoodItem,
  deleteOwnerFoodItem,
  getOwnerOrders,
  getOwnerRestaurants,
  updateOwnerFoodItem,
  updateOwnerOrderStatus,
  updatePrepTime,
} from '../../api/ownerApi';

const emptyFoodItem = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  isAvailable: true,
};

const emptyRestaurant = {
  name: '',
  prepTimeMinutes: 30,
  image: '',
  gpsLocation: null,
  locationLabel: '',
};

const statusOptions = ['Accepted', 'Preparing', 'On The Way', 'Delivered', 'Cancelled'];

const statusBadgeClass = (status) => `status-badge status-${String(status).toLowerCase().replace(/\s+/g, '-')}`;

export default function OwnerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [foodForm, setFoodForm] = useState(emptyFoodItem);
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const [prepTime, setPrepTime] = useState(30);
  const [editingFoodItemId, setEditingFoodItemId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [capturingLocation, setCapturingLocation] = useState(false);

  const loadOwnerData = async () => {
    setLoading(true);
    try {
      const [restaurantsRes, ordersRes] = await Promise.all([getOwnerRestaurants(), getOwnerOrders()]);
      const restaurantList = restaurantsRes.data.data || [];
      setRestaurants(restaurantList);
      setOrders(ordersRes.data.data || []);
      setSelectedRestaurantId((current) => current || restaurantList[0]?._id || '');
      setPrepTime(restaurantList[0]?.prepTimeMinutes || 30);
    } catch {
      setRestaurants([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant._id === selectedRestaurantId) || restaurants[0],
    [restaurants, selectedRestaurantId]
  );

  const restaurantOrders = useMemo(
    () => orders.filter((order) => String(order.restaurantId?._id || order.restaurantId) === String(selectedRestaurant?._id || selectedRestaurantId)),
    [orders, selectedRestaurant, selectedRestaurantId]
  );

  const menuItems = selectedRestaurant?.menu || [];

  useEffect(() => {
    setPrepTime(selectedRestaurant?.prepTimeMinutes || 30);
  }, [selectedRestaurant?._id]);

  const resetFoodForm = () => {
    setFoodForm(emptyFoodItem);
    setEditingFoodItemId('');
  };

  const resetRestaurantForm = () => {
    setRestaurantForm(emptyRestaurant);
  };

  const saveRestaurant = async () => {
    if (!restaurantForm.gpsLocation) {
      setMessage('Capture the restaurant location first.');
      return;
    }

    const payload = {
      name: restaurantForm.name,
      address: restaurantForm.locationLabel || 'Captured GPS location',
      prepTimeMinutes: Number(restaurantForm.prepTimeMinutes),
      image: restaurantForm.image,
      gpsLocation: restaurantForm.gpsLocation,
    };

    try {
      await createOwnerRestaurant(payload);
      setMessage('Restaurant created.');
      resetRestaurantForm();
      await loadOwnerData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create restaurant.');
    }
  };

  const saveFoodItem = async () => {
    if (!selectedRestaurant?._id) return;

    const payload = {
      ...foodForm,
      price: Number(foodForm.price),
      isAvailable: Boolean(foodForm.isAvailable),
    };

    try {
      if (editingFoodItemId) {
        await updateOwnerFoodItem(selectedRestaurant._id, editingFoodItemId, payload);
        setMessage('Menu item updated.');
      } else {
        await addOwnerFoodItem(selectedRestaurant._id, payload);
        setMessage('Menu item added.');
      }

      resetFoodForm();
      await loadOwnerData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save menu item.');
    }
  };

  const editFoodItem = (item) => {
    setEditingFoodItemId(item._id);
    setFoodForm({
      name: item.name || '',
      price: item.price || '',
      category: item.category || '',
      description: item.description || '',
      image: item.image || '',
      isAvailable: item.isAvailable ?? true,
    });
  };

  const updateOrder = async (orderId, status) => {
    try {
      await updateOwnerOrderStatus(orderId, { status });
      await loadOwnerData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update order.');
    }
  };

  const savePrepTime = async () => {
    if (!selectedRestaurant?._id) return;

    try {
      await updatePrepTime(selectedRestaurant._id, Number(prepTime));
      setMessage('Preparation time updated.');
      await loadOwnerData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update preparation time.');
    }
  };

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported in this browser.');
      return;
    }

    setCapturingLocation(true);
    setMessage('Capturing current GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setRestaurantForm((current) => ({
          ...current,
          gpsLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          locationLabel: `GPS location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
        }));
        setMessage('GPS location captured.');
        setCapturingLocation(false);
      },
      (error) => {
        setMessage(error.message || 'Unable to capture GPS location.');
        setCapturingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const deleteItem = async (foodItemId) => {
    if (!selectedRestaurant?._id) return;

    try {
      await deleteOwnerFoodItem(selectedRestaurant._id, foodItemId);
      setMessage('Menu item deleted.');
      await loadOwnerData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete menu item.');
    }
  };

  return (
    <div className="dashboard-stack">
      <section className="dashboard-hero compact-hero">
        <div>
          <span className="eyebrow">Restaurant owner</span>
          <h2>Manage menu items, incoming orders, and fulfillment status.</h2>
          <p>Everything here is backed by owner-scoped APIs, not placeholder text.</p>
        </div>
        <div className="stats-grid">
          <StatCard label="Restaurants" value={restaurants.length} hint="Owned locations" />
          <StatCard label="Incoming orders" value={restaurantOrders.length} hint="Queue size" />
        </div>
      </section>

      {message ? <div className="admin-alert">{message}</div> : null}

      {loading ? (
        <div className="page-center">Loading owner dashboard...</div>
      ) : (
        <>
          <section className="grid-cards two-up">
            <article className="info-card">
              <h3>Add restaurant</h3>
              <p>Create a new restaurant profile and it will appear in your list below.</p>
              <div className="auth-form owner-form">
                <label>
                  Restaurant name
                  <input type="text" value={restaurantForm.name} onChange={(event) => setRestaurantForm({ ...restaurantForm, name: event.target.value })} />
                </label>
                <div className="table-actions-inline">
                  <button className="primary-button" type="button" onClick={captureLocation} disabled={capturingLocation}>
                    {capturingLocation ? 'Capturing GPS...' : 'Use current GPS location'}
                  </button>
                </div>
                {restaurantForm.gpsLocation ? (
                  <div className="admin-alert">
                    {restaurantForm.locationLabel}
                  </div>
                ) : null}
                <label>
                  Prep time (minutes)
                  <input type="number" min="5" value={restaurantForm.prepTimeMinutes} onChange={(event) => setRestaurantForm({ ...restaurantForm, prepTimeMinutes: event.target.value })} />
                </label>
                <label>
                  Image URL
                  <input type="text" value={restaurantForm.image} onChange={(event) => setRestaurantForm({ ...restaurantForm, image: event.target.value })} />
                </label>
                <div className="table-actions-inline">
                  <button className="primary-button" type="button" onClick={saveRestaurant} disabled={!restaurantForm.name || !restaurantForm.gpsLocation}>
                    Add restaurant
                  </button>
                  <button className="ghost-button" type="button" onClick={resetRestaurantForm}>
                    Reset
                  </button>
                </div>
              </div>
            </article>

            <article className="info-card">
              <h3>Your restaurants</h3>
              <div className="stack-list">
                {restaurants.map((restaurant) => (
                  <article key={restaurant._id} className="restaurant-card owner-restaurant-card">
                    <div>
                      <span className={`pill ${restaurant.isApproved ? 'pill-approved' : 'pill-pending'}`}>
                        {restaurant.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      <h3>{restaurant.name}</h3>
                      <p>{restaurant.address}</p>
                    </div>
                    <div className="card-footer">
                      <strong>{restaurant.prepTimeMinutes || 30} min prep</strong>
                    </div>
                  </article>
                ))}
                {!restaurants.length ? <p>No restaurants yet. Create one on the left.</p> : null}
              </div>
            </article>
          </section>

          <section className="info-card">
            <div className="section-heading">
              <div>
                <h3>Restaurant settings</h3>
                <p>Pick a restaurant to manage its menu and prep time.</p>
              </div>
              <select className="filter-select" value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)}>
                {restaurants.map((restaurant) => (
                  <option key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="owner-settings-grid">
              <label>
                Prep time (minutes)
                <input type="number" min="5" value={prepTime} onChange={(event) => setPrepTime(event.target.value)} />
              </label>
              <button className="primary-button" onClick={savePrepTime} disabled={!selectedRestaurantId}>
                Save prep time
              </button>
            </div>
          </section>

          <section className="grid-cards two-up">
            <article className="info-card">
              <h3>Menu editor</h3>
              <div className="auth-form owner-form">
                <label>
                  Name
                  <input type="text" value={foodForm.name} onChange={(event) => setFoodForm({ ...foodForm, name: event.target.value })} />
                </label>
                <label>
                  Category
                  <input type="text" value={foodForm.category} onChange={(event) => setFoodForm({ ...foodForm, category: event.target.value })} />
                </label>
                <label>
                  Price
                  <input type="number" value={foodForm.price} onChange={(event) => setFoodForm({ ...foodForm, price: event.target.value })} />
                </label>
                <label>
                  Image URL
                  <input type="text" value={foodForm.image} onChange={(event) => setFoodForm({ ...foodForm, image: event.target.value })} />
                </label>
                <label>
                  Description
                  <textarea rows="3" value={foodForm.description} onChange={(event) => setFoodForm({ ...foodForm, description: event.target.value })} />
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={foodForm.isAvailable} onChange={(event) => setFoodForm({ ...foodForm, isAvailable: event.target.checked })} />
                  Available
                </label>
                <div className="table-actions-inline">
                  <button className="primary-button" onClick={saveFoodItem} disabled={!selectedRestaurantId}>
                    {editingFoodItemId ? 'Update item' : 'Add item'}
                  </button>
                  <button className="ghost-button" type="button" onClick={resetFoodForm}>
                    Reset
                  </button>
                </div>
              </div>
            </article>

            <article className="info-card">
              <h3>Menu items</h3>
              <div className="stack-list">
                {menuItems.map((item) => (
                  <article key={item._id} className="menu-card owner-menu-card">
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.category}</p>
                      <p>{item.description}</p>
                    </div>
                    <div className="card-footer">
                      <strong>₹{item.price}</strong>
                      <div className="table-actions-inline">
                        <button className="ghost-button" onClick={() => editFoodItem(item)}>Edit</button>
                        <button className="ghost-button" onClick={() => deleteItem(item._id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
                {!menuItems.length ? <p>No menu items yet.</p> : null}
              </div>
            </article>
          </section>

          <section className="info-card">
            <h3>Incoming orders</h3>
            <div className="stack-list">
              {restaurantOrders.map((order) => (
                <article key={order._id} className="order-card owner-order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{String(order._id).slice(-6)}</h3>
                      <p>{order.customerId?.name || 'Customer'} · {order.deliveryAddress}</p>
                    </div>
                    <span className={statusBadgeClass(order.status)}>{order.status}</span>
                  </div>
                  <div className="order-meta owner-order-meta">
                    <span>₹{order.totalAmount}</span>
                    <span>Payment: {order.paymentId?.status || 'pending'}</span>
                  </div>
                  <div className="table-actions-inline">
                    <button className="table-action" onClick={() => updateOrder(order._id, 'Accepted')}>Accept</button>
                    <button className="table-action danger" onClick={() => updateOrder(order._id, 'Cancelled')}>Reject</button>
                    {statusOptions.map((status) => (
                      <button key={status} className="table-action" onClick={() => updateOrder(order._id, status)}>
                        {status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
              {!restaurantOrders.length ? <p>No incoming orders yet.</p> : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
