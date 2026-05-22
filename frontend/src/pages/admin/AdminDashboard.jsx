import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../components/admin/MetricCard';
import TrendChart from '../../components/admin/TrendChart';
import SectionFrame from '../../components/admin/SectionFrame';
import {
  deleteAdminUser,
  getAdminOrders,
  getAdminRestaurants,
  getAdminStats,
  getAdminUsers,
  updateRestaurantApproval,
} from '../../api/adminApi';

const roleLabels = {
  customer: 'Customer',
  restaurantOwner: 'Restaurant Owner',
  deliveryPartner: 'Delivery Partner',
  admin: 'Admin',
};

const statusTone = {
  Delivered: 'success',
  'On The Way': 'warning',
  Preparing: 'warning',
  Accepted: 'warning',
  Pending: 'danger',
  Cancelled: 'danger',
};

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '-');

const flattenUsers = (groupedUsers) => Object.entries(groupedUsers || {}).flatMap(([role, users]) => (users || []).map((user) => ({ ...user, role })));

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [groupedUsers, setGroupedUsers] = useState({});
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [busyId, setBusyId] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, usersRes, restaurantsRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminRestaurants(),
        getAdminOrders(),
      ]);

      setStats(statsRes.data.data);
      setGroupedUsers(usersRes.data.data || {});
      setRestaurants(restaurantsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const users = useMemo(() => flattenUsers(groupedUsers), [groupedUsers]);
  const filteredUsers = roleFilter === 'all' ? users : users.filter((user) => user.role === roleFilter);
  const latestOrderTrend = stats?.dailyMetrics || [];

  const handleApproval = async (restaurantId, isApproved) => {
    setBusyId(restaurantId);
    try {
      const { data } = await updateRestaurantApproval(restaurantId, isApproved);
      setRestaurants((current) => current.map((restaurant) => (restaurant._id === restaurantId ? data.data : restaurant)));
    } catch (approvalError) {
      setError(approvalError.response?.data?.message || 'Unable to update restaurant approval');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteUser = async (userId) => {
    setBusyId(userId);
    try {
      await deleteAdminUser(userId);
      setGroupedUsers((current) => {
        const next = { ...current };
        Object.keys(next).forEach((role) => {
          next[role] = (next[role] || []).filter((user) => user._id !== userId);
        });
        return next;
      });
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete user');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-hero">
        <div>
          <span className="eyebrow eyebrow-light">Platform command center</span>
          <h2>Control the food network from one surface.</h2>
          <p>Monitor approval flows, user growth, and order movement without switching into a generic admin skin.</p>
        </div>
        <div className="admin-hero-rail">
          <MetricCard label="Approval queue" value={restaurants.filter((restaurant) => !restaurant.isApproved).length} hint="Pending restaurants" tone="amber" />
          <MetricCard label="Live orders" value={orders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled').length} hint="In motion" tone="teal" />
        </div>
      </header>

      {error ? <div className="admin-alert">{error}</div> : null}

      {loading ? (
        <div className="admin-loading">Loading dashboard data...</div>
      ) : (
        <>
          <section className="admin-metric-grid">
            <MetricCard label="Total Customers" value={stats?.totalCustomers ?? 0} hint="Registered buyers" tone="teal" />
            <MetricCard label="Total Restaurants" value={stats?.totalRestaurants ?? 0} hint="Restaurant records" tone="amber" />
            <MetricCard label="Delivery Partners" value={stats?.totalDeliveryPartners ?? 0} hint="Courier accounts" tone="violet" />
            <MetricCard label="Orders Today" value={stats?.ordersToday ?? 0} hint="Created today" tone="teal" />
            <MetricCard label="Revenue Today" value={`₹${stats?.revenueToday ?? 0}`} hint="Collected today" tone="amber" />
            <MetricCard label="Total Revenue" value={`₹${stats?.totalRevenue ?? 0}`} hint="All time revenue" tone="rose" />
            <MetricCard label="Completed Orders" value={stats?.completedOrders ?? 0} hint="Delivered successfully" tone="amber" />
            <MetricCard label="Pending Orders" value={stats?.pendingOrders ?? 0} hint="Waiting in queue" tone="rose" />
          </section>

          <SectionFrame title="Operations overview" description="A compact trend view for leadership meetings and quick daily checks.">
            <TrendChart points={latestOrderTrend} />
          </SectionFrame>

          <SectionFrame
            title="Manage users"
            description="Review accounts by role and remove risky accounts when needed."
            action={(
              <div className="admin-filters">
                {['all', 'customer', 'restaurantOwner', 'deliveryPartner', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`filter-chip ${roleFilter === role ? 'active' : ''}`}
                    onClick={() => setRoleFilter(role)}
                  >
                    {role === 'all' ? 'All roles' : roleLabels[role]}
                  </button>
                ))}
              </div>
            )}
          >
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{roleLabels[user.role] || user.role}</td>
                      <td>{user.phone || '-'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="table-action danger"
                          disabled={busyId === user._id || user.role === 'admin'}
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          {busyId === user._id ? 'Working...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredUsers.length ? (
                    <tr>
                      <td colSpan="6" className="empty-state">No users match this filter.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </SectionFrame>

          <SectionFrame title="Manage restaurants" description="Approve or reject registrations before they go live.">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Restaurant</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Prep Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant._id}>
                      <td>{restaurant.name}</td>
                      <td>{restaurant.ownerId?.name || '-'}</td>
                      <td>{restaurant.address}</td>
                      <td>
                        <span className={`status-pill ${restaurant.isApproved ? 'success' : 'warning'}`}>
                          {restaurant.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>{restaurant.prepTimeMinutes || 30} min</td>
                      <td>
                        <div className="table-actions-inline">
                          <button
                            type="button"
                            className="table-action"
                            disabled={busyId === restaurant._id || restaurant.isApproved}
                            onClick={() => handleApproval(restaurant._id, true)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="table-action danger"
                            disabled={busyId === restaurant._id || !restaurant.isApproved}
                            onClick={() => handleApproval(restaurant._id, false)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionFrame>

          <SectionFrame title="Orders management" description="Track the full order queue, delivery state, and fulfillment state.">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Restaurant</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{String(order._id).slice(-6)}</td>
                      <td>{order.customerId?.name || '-'}</td>
                      <td>{order.restaurantId?.name || '-'}</td>
                      <td>
                        <span className={`status-pill ${statusTone[order.status] || 'neutral'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>₹{order.totalAmount}</td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionFrame>
        </>
      )}
    </div>
  );
}
