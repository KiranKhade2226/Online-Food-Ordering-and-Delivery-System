import { useEffect, useState } from 'react';
import client from '../../api/client';
import OrderCard from '../../components/OrderCard';
import { useSocket } from '../../context/SocketContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    client.get('/orders/my-orders').then((response) => setOrders(response.data.data || [])).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const syncOrder = (payload) => {
      setOrders((current) => current.map((order) => {
        if (payload?.order?._id && order._id === payload.order._id) {
          return { ...payload.order, paymentId: payload.payment || order.paymentId };
        }

        if (payload?._id && order._id === payload._id) {
          return payload;
        }

        return order;
      }));
    };

    socket.on('payment-updated', syncOrder);
    socket.on('order-updated', syncOrder);

    return () => {
      socket.off('payment-updated', syncOrder);
      socket.off('order-updated', syncOrder);
    };
  }, [socket]);

  return (
    <div>
      <div className="section-heading">
        <h3>Orders</h3>
        <p>Monitor payment and delivery states in real time.</p>
      </div>
      <div className="stack-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}
