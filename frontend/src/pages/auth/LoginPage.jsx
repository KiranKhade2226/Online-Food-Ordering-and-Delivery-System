import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardRouteForRole } from '../../utils/roles';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = await login(form);
      const destination = location.state?.from?.pathname || dashboardRouteForRole(user.role);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in');
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel hero-panel">
        <span className="eyebrow">FoodFlow</span>
        <h1>Fast ordering for customers, kitchens, riders, and admins.</h1>
        <p>JWT auth, live order updates, payment capture, and role-aware dashboards in one stack.</p>
      </section>

      <section className="auth-panel form-panel">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button className="primary-button" type="submit">Login</button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </section>
    </div>
  );
}
