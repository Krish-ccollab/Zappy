import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setStatus(data.message);
      setStep(2);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp, purpose: 'password_reset' });
      setStatus(data.message);
      setStep(3);
    } catch (error) {
      setStatus(error.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, ...passwordForm });
      setStatus(data.message);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card narrow">
        <span className="chip">Password recovery</span>
        <h1>Forgot Password</h1>
        <p className="muted-copy">Step {step} of 3</p>

        {step === 1 && (
          <form className="form-grid" onSubmit={sendOtp}>
            <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form className="form-grid" onSubmit={verifyOtp}>
            <input value={otp} maxLength={6} placeholder="Enter OTP" onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required />
            <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}

        {step === 3 && (
          <form className="form-grid" onSubmit={resetPassword}>
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              required
            />
            <button type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}

        {status && <p className="muted-copy">{status}</p>}
        <Link className="inline-link" to="/login">Back to Login</Link>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
