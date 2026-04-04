import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import useDebounce from '../hooks/useDebounce';

const initialForm = {
  fullName: '',
  email: '',
  username: '',
  password: '',
  phone: '',
  gender: 'other',
  dob: '',
  googleToken: ''
};

const SignupPage = () => {
  const [form, setForm] = useState(initialForm);
  const [profilePic, setProfilePic] = useState(null);
  const [usernameStatus, setUsernameStatus] = useState({ state: 'idle', message: '' });
  const [googleStatus, setGoogleStatus] = useState('Please verify your Google account before signup.');
  const [googleVerified, setGoogleVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debouncedUsername = useDebounce(form.username, 350);
  const navigate = useNavigate();

  const googleClientId = useMemo(() => import.meta.env.VITE_GOOGLE_CLIENT_ID || '', []);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    const username = debouncedUsername.trim();
    if (!username) {
      setUsernameStatus({ state: 'idle', message: '' });
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username) || username.length < 3 || username.length > 30) {
      setUsernameStatus({
        state: 'invalid',
        message: 'Username must be 3-30 chars and only use letters, numbers, underscores, or periods.'
      });
      return;
    }

    let active = true;
    setUsernameStatus({ state: 'checking', message: 'Checking username availability...' });

    api
      .get(`/auth/username-availability?username=${encodeURIComponent(username)}`)
      .then(({ data }) => {
        if (!active) return;
        setUsernameStatus(
          data.available
            ? { state: 'available', message: 'Username available.' }
            : { state: 'taken', message: 'Username already taken.' }
        );
      })
      .catch(() => {
        if (!active) return;
        setUsernameStatus({ state: 'error', message: 'Unable to check username right now.' });
      });

    return () => {
      active = false;
    };
  }, [debouncedUsername]);

  const updateField = (field) => (event) => {
    const value = field === 'profilePic' ? event.target.files?.[0] || null : event.target.value;
    if (field === 'profilePic') {
      setProfilePic(value);
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleGoogleSignup = () => {
    if (!googleClientId) {
      setGoogleStatus('Missing VITE_GOOGLE_CLIENT_ID in frontend environment.');
      return;
    }

    if (!window.google?.accounts?.id) {
      setGoogleStatus('Google SDK is still loading. Please wait and try again.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        try {
          const { data } = await api.post('/auth/google/verify', { googleToken: response.credential });
          setForm((current) => ({
            ...current,
            email: data.email,
            fullName: current.fullName || data.fullName || '',
            googleToken: response.credential
          }));
          setGoogleVerified(true);
          setGoogleStatus(`Verified: ${data.email}`);
        } catch (error) {
          setGoogleVerified(false);
          setGoogleStatus(error.response?.data?.message || 'Unable to verify Google account.');
        }
      }
    });

    window.google.accounts.id.prompt();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!googleVerified) {
      setGoogleStatus('Google verification is required before signup.');
      return;
    }
    if (usernameStatus.state === 'taken' || usernameStatus.state === 'checking' || usernameStatus.state === 'invalid') {
      return;
    }

    setSubmitting(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (profilePic) {
      payload.append('profilePic', profilePic);
    }

    try {
      await api.post('/auth/signup', payload);
      navigate('/dashboard');
    } catch (error) {
      setGoogleStatus(error.response?.data?.message || 'Unable to complete signup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card large">
        <span className="chip">Google-verified signup + Cloudinary avatar</span>
        <h1>Create your Zappy account</h1>
        <button type="button" className="full-width" onClick={handleGoogleSignup}>Sign up with Google</button>
        <p className="muted-copy">{googleStatus}</p>
        <form className="form-grid two-columns" onSubmit={handleSubmit}>
          <label className="form-field">
            <input placeholder="Enter your full name" value={form.fullName} onChange={updateField('fullName')} required />
          </label>
          <label className="form-field">
            <input type="email" placeholder="Verified email" value={form.email} onChange={updateField('email')} readOnly={googleVerified} required />
          </label>
          <label className="form-field">
            <input placeholder="Choose a unique username" value={form.username} onChange={updateField('username')} required />
            {usernameStatus.message && (
              <small className={`username-status ${usernameStatus.state}`}>{usernameStatus.message}</small>
            )}
          </label>
          <label className="form-field">
            <input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={updateField('password')} required />
            <button type="button" className="inline-link" onClick={() => setShowPassword((current) => !current)}>
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
          </label>
          <label className="form-field">
            <input placeholder="Enter your phone number" value={form.phone} onChange={updateField('phone')} required />
          </label>
          <label className="form-field">
            <input type="date" value={form.dob} onChange={updateField('dob')} required />
          </label>
          <label className="form-field">
            <select value={form.gender} onChange={updateField('gender')}>
              <option value="other">Other</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="file-field">
            <span>Profile Picture</span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={updateField('profilePic')} />
            <small className="field-hint">Selected image: {profilePic?.name || 'No image selected'}</small>
          </label>
          <button
            type="submit"
            className="full-width"
            disabled={submitting || !googleVerified || usernameStatus.state === 'taken' || usernameStatus.state === 'checking' || usernameStatus.state === 'invalid'}
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SignupPage;
