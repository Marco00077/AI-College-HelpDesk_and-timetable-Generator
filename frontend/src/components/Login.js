import { useState } from 'react';
import axios from '../utils/axios';
import './Auth.css';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? formData : { email: formData.email, password: formData.password };
      
      const response = await axios.post(endpoint, payload);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          {isRegister && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <div className="role-selector">
                <label>Register as:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={handleChange}
                    />
                    <span>Student</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === 'admin'}
                      onChange={handleChange}
                    />
                    <span>Admin</span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          
          {isRegister && formData.role === 'user' && (
            <input
              type="text"
              name="studentId"
              placeholder="Student ID (optional)"
              value={formData.studentId}
              onChange={handleChange}
            />
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <p className="toggle-text">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span onClick={() => {
            setIsRegister(!isRegister);
            setError('');
            setFormData({ name: '', email: '', password: '', role: 'user', studentId: '' });
          }}>
            {isRegister ? ' Sign In' : ' Create Account'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
