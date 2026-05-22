import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardRouteForRole } from '../../utils/roles';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await register(form);
      navigate(dashboardRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register');
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel hero-panel accent-panel">
        <span className="eyebrow">Create your role</span>
        <h1>Start as a customer, owner, delivery partner, or admin.</h1>
        <p>Register once and the app routes you into the right dashboard and permissions layer.</p>
      </section>

      <section className="auth-panel form-panel">
        <h2>Create account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="customer">Customer</option>
              <option value="restaurantOwner">Restaurant Owner</option>
              <option value="deliveryPartner">Delivery Partner</option>
            </select>
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">Register</button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already have an account?</Link>
        </div>
      </section>
    </div>
  );
}
