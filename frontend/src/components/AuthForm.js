import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, error } = useAuth();
  
  const isLogin = location.pathname === '/login';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setLocalError('Name is required');
          setLoading(false);
          return;
        }
        result = await register(formData.email, formData.password, formData.name);
      }

      if (result.success) {
        navigate('/');
      } else {
        setLocalError(result.error);
      }
    } catch (error) {
      setLocalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    navigate(isLogin ? '/register' : '/login');
    setFormData({ email: '', password: '', name: '' });
    setLocalError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass p-8 rounded-2xl auth-form">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'স্বাগতম!' : 'নতুন অ্যাকাউন্ট'}
            </h1>
            <p className="text-white/70">
              {isLogin ? 'আপনার হোমপেজে প্রবেশ করুন' : 'একটি নতুন অ্যাকাউন্ট তৈরি করুন'}
            </p>
          </div>

          {(error || localError) && (
            <div className="error-message mb-4">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                  নাম
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                           text-white placeholder-white/60 focus:outline-none focus:ring-2 
                           focus:ring-white/50 transition-all input-focus"
                  placeholder="আপনার নাম লিখুন"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                ইমেইল
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                         text-white placeholder-white/60 focus:outline-none focus:ring-2 
                         focus:ring-white/50 transition-all input-focus"
                placeholder="আপনার ইমেইল লিখুন"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass border border-white/20 
                         text-white placeholder-white/60 focus:outline-none focus:ring-2 
                         focus:ring-white/50 transition-all input-focus"
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 
                       text-white py-3 px-6 rounded-xl font-semibold text-lg
                       hover:from-indigo-600 hover:to-purple-700 
                       transform hover:scale-105 transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       btn-hover shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  অপেক্ষা করুন...
                </div>
              ) : (
                isLogin ? 'লগইন করুন' : 'নিবন্ধন করুন'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              {isLogin ? 'নতুন ব্যবহারকারী?' : 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}
            </p>
            <button
              onClick={toggleMode}
              className="text-white font-semibold hover:text-white/80 transition-colors mt-1"
            >
              {isLogin ? 'এখানে নিবন্ধন করুন' : 'এখানে লগইন করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;