import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');

  const sendOtp = async (event) => {
    event.preventDefault();
    const { data } = await client.post('/auth/forgot-password', { email: form.email });
    setSent(true);
    setMessage(data.message);
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    const { data } = await client.post('/auth/reset-password', form);
    setMessage(data.message);
  };

  return (
    <div className="auth-page single-column">
      <section className="auth-panel form-panel wide-panel">
        <h2>Forgot password</h2>
        {!sent ? (
          <form onSubmit={sendOtp} className="auth-form">
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <button className="primary-button" type="submit">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="auth-form">
            <label>
              OTP
              <input type="text" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />
            </label>
            <label>
              New password
              <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
            </label>
            <button className="primary-button" type="submit">Reset password</button>
          </form>
        )}
        {message ? <p className="success-text">{message}</p> : null}
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </section>
    </div>
  );
}
