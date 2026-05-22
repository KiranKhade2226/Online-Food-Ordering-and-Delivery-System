export default function OrderCard({ order }) {
  const paymentStatus = order.paymentId?.status || 'pending';

  return (
    <article className="order-card">
      <div className="order-header">
        <div>
          <h3>Order #{String(order._id).slice(-6)}</h3>
          <p>{order.restaurantId?.name || 'Restaurant'}</p>
        </div>
        <div className="order-badges">
          <span className={`status-badge status-${String(order.status).toLowerCase().replace(/\s+/g, '-')}`}>{order.status}</span>
          <span className={`status-badge payment-${paymentStatus}`}>{paymentStatus}</span>
        </div>
      </div>
      <div className="order-meta">
        <span>₹{order.totalAmount}</span>
        <span>{new Date(order.createdAt).toLocaleString()}</span>
      </div>
    </article>
  );
}
