import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import client from '../../api/client';
import { createPaymentOrder, verifyPayment } from '../../api/paymentApi';
import loadScript from '../../utils/loadScript';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, refreshCart } = useCart();
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = (cart.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = async () => {
    const restaurantId = cart.items?.[0]?.restaurantId;
    if (!restaurantId) {
      setCheckoutStatus('Cart is empty or restaurant is missing.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutStatus('Creating payment session...');

    try {
      const orderResponse = await client.post('/orders', {
        restaurantId,
        deliveryAddress: 'Use user profile address',
      });

      const paymentResponse = await createPaymentOrder(orderResponse.data.data._id);
      const checkoutConfig = paymentResponse.data.data;
      const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      if (!scriptLoaded || !window.Razorpay) {
        setCheckoutStatus('Unable to load Razorpay checkout. Payment is pending.');
        return;
      }

      setCheckoutStatus('Opening Razorpay checkout...');

      const options = {
        key: checkoutConfig.keyId,
        amount: checkoutConfig.razorpayOrder.amount,
        currency: checkoutConfig.razorpayOrder.currency,
        name: 'FoodFlow',
        description: 'Food order payment',
        order_id: checkoutConfig.razorpayOrder.id,
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId: orderResponse.data.data._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setCheckoutStatus('Payment paid successfully.');
            await clearCart();
            await refreshCart();
          } catch (error) {
            setCheckoutStatus(error.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutStatus('Payment pending. Checkout was closed before completion.');
          },
        },
        prefill: {
          name: 'FoodFlow Customer',
          email: 'customer1@example.com',
        },
        theme: {
          color: '#d94f2a',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        setCheckoutStatus('Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (error) {
      setCheckoutStatus(error.response?.data?.message || 'Checkout failed.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="dashboard-stack">
      <section className="dashboard-hero compact-hero">
        <div>
          <span className="eyebrow">Cart</span>
          <h2>Your items and checkout flow</h2>
          <p>Apply coupons, create the order, and hand off payment to Razorpay.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><p>Total</p><h3>₹{total}</h3><span>Before coupons</span></div>
        </div>
      </section>

      <div className="stack-list">
        {(cart.items || []).map((item) => (
          <article key={item._id || item.foodItemId} className="cart-row">
            <div>
              <h3>{item.name}</h3>
              <p>Qty {item.quantity}</p>
            </div>
            <div className="card-footer">
              <strong>₹{item.price * item.quantity}</strong>
              <button className="ghost-button" onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          </article>
        ))}
      </div>

      <div className="checkout-panel">
        <button className="primary-button" onClick={checkout} disabled={!cart.items?.length || isCheckingOut}>Checkout with Razorpay</button>
        <button className="ghost-button" onClick={clearCart} disabled={!cart.items?.length}>Clear cart</button>
      </div>
      {checkoutStatus ? <p className="success-text">{checkoutStatus}</p> : null}
    </div>
  );
}
