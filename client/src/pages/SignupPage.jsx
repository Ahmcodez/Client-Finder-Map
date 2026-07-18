import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return errors;
}

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const validationErrors = validateSignupForm(form);
  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleChange = (field, value) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setServerError('');
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateSignupForm(nextForm)[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSignupForm(form);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setLoading(true);
      setServerError('');
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.request
          ? 'Cannot reach the server. Make sure the backend is running on http://localhost:5000.'
          : 'Signup failed. Please try again.');

      if (message.toLowerCase().includes('name')) {
        setErrors((current) => ({ ...current, name: message }));
      } else if (message.toLowerCase().includes('email')) {
        setErrors((current) => ({ ...current, email: message }));
      } else if (message.toLowerCase().includes('password')) {
        setErrors((current) => ({ ...current, password: message }));
      } else {
        setServerError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = (field) =>
    `input-base ${errors[field] ? 'border-red-500/70 bg-red-500/5 focus:border-red-400' : ''}`;

  return (
    <AuthShell
      title="Create your prospecting account"
      subtitle="Start tracking businesses without websites and build your next pipeline with better targeting."
      footerLabel="Log in"
      footerLink="/login"
      footerText="Already have an account?"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <input
            className={inputClassName('name')}
            placeholder="Full name"
            value={form.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
          {errors.name ? <p className="mt-2 text-sm text-red-300">{errors.name}</p> : null}
        </div>

        <div>
          <input
            className={inputClassName('email')}
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(event) => handleChange('email', event.target.value)}
            required
          />
          {errors.email ? <p className="mt-2 text-sm text-red-300">{errors.email}</p> : null}
        </div>

        <div>
          <input
            className={inputClassName('password')}
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => handleChange('password', event.target.value)}
            required
          />
          {errors.password ? <p className="mt-2 text-sm text-red-300">{errors.password}</p> : null}
        </div>

        {serverError ? <div className="text-sm text-red-300">{serverError}</div> : null}

        <button
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default SignupPage;
