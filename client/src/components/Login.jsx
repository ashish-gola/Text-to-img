import React from 'react'
import { assets } from '../assets/assets'
import { CiUser, CiLock  } from "react-icons/ci";
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { motion } from 'motion/react'
import { toast } from 'react-toastify';

const Login = () => {
  const [state, setState] = useState('Login')
  const { setShowLogin, login, register, loading } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (state === 'Sign Up' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (state === 'Sign Up' && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (state === 'Sign Up' && !validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters with letters and numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (state === 'Login') {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        // Form will be closed by context
        setFormData({ name: '', email: '', password: '' });
        setErrors({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleStateChange = (newState) => {
    setState(newState);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0.2, y: 50 }} 
      transition={{ duration: 0.3 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true }}
      className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm flex items-center justify-center bg-black/30'
    >
      <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 max-w-md w-full mx-4'>
        <h1 className='text-center text-2xl text-neutral-700 font-medium'>{state}</h1>
        <p className='text-sm text-center mb-6'>
          {state === 'Login' ? 'Welcome back! Please sign in to continue' : 'Create your account to get started'}
        </p>

        {state === 'Sign Up' && (
          <div className='mb-4'>
            <div className={`border px-6 py-2 flex items-center gap-2 rounded-full ${errors.name ? 'border-red-500' : ''}`}>
              <CiUser />
              <input 
                onChange={handleInputChange} 
                value={formData.name} 
                name="name"
                type="text" 
                placeholder='Enter your full name' 
                className='outline-none text-sm flex-1' 
                required
              />
            </div>
            {errors.name && <p className='text-red-500 text-xs mt-1 ml-2'>{errors.name}</p>}
          </div>
        )}

        <div className='mb-4'>
          <div className={`border px-6 py-2 flex items-center gap-2 rounded-full ${errors.email ? 'border-red-500' : ''}`}>
            <img src={assets.email_icon} alt="Email Icon" />
            <input 
              onChange={handleInputChange} 
              value={formData.email} 
              name="email"
              type="email" 
              placeholder='Enter your email' 
              className='outline-none text-sm flex-1' 
              required
            />
          </div>
          {errors.email && <p className='text-red-500 text-xs mt-1 ml-2'>{errors.email}</p>}
        </div>

        <div className='mb-4'>
          <div className={`border px-6 py-2 flex items-center gap-2 rounded-full ${errors.password ? 'border-red-500' : ''}`}>
            <CiLock />
            <input 
              onChange={handleInputChange} 
              value={formData.password} 
              name="password"
              type="password" 
              placeholder='Enter your password' 
              className='outline-none text-sm flex-1' 
              required
            />
          </div>
          {errors.password && <p className='text-red-500 text-xs mt-1 ml-2'>{errors.password}</p>}
        </div>

        {state === 'Login' && (
          <p className='text-sm text-blue-600 my-4 cursor-pointer hover:underline'>
            Forgot Password?
          </p>
        )}

        <button 
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded-full transition-colors ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Please wait...' : (state === 'Login' ? 'Sign In' : 'Create Account')}
        </button>

        {state === 'Login' ? (
          <p className='mt-5 text-center'>
            Don't have an account? 
            <span 
              className='text-blue-600 cursor-pointer hover:underline ml-1' 
              onClick={() => handleStateChange('Sign Up')}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className='mt-5 text-center'>
            Already have an account? 
            <span 
              className='text-blue-600 cursor-pointer hover:underline ml-1' 
              onClick={() => handleStateChange('Login')}
            >
              Sign In
            </span>
          </p>
        )}

        <img 
          onClick={() => setShowLogin(false)} 
          src={assets.cross_icon} 
          alt="Close" 
          className='absolute top-5 right-5 cursor-pointer hover:opacity-70' 
        />
      </form>
    </motion.div>
  )
}

export default Login

