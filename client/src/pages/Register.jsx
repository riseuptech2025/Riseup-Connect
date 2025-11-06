import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone, MessageCircle, RotateCcw } from 'lucide-react';
import { authAPI } from '../services/api';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Send OTP
  const sendOtp = async () => {
    if (!formData.email) {
      alert('Please enter your email first');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authAPI.sendOtp(formData.email);
      if (response.data.success) {
        setStep(2);
        setCountdown(60); // 60 seconds countdown
        startCountdown();
      } else {
        alert(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    }
    setIsSendingOtp(false);
  };

  // Start countdown for resend OTP
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return;

    setIsSendingOtp(true);
    try {
      const response = await authAPI.resendOtp(formData.email);
      if (response.data.success) {
        setCountdown(60);
        startCountdown();
        alert('OTP sent successfully!');
      } else {
        alert(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resend OTP');
    }
    setIsSendingOtp(false);
  };

  // Handle basic info submission
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    await sendOtp();
  };

  // Handle OTP verification and registration
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        otp: otpString
      };

      const response = await authAPI.verifyOtp(registrationData);
      
      if (response.data.success) {
        const { data } = response.data;
        const token = data.token;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
        
        alert('Registration successful!');
        navigate('/');
      } else {
        alert(response.data.message || 'Registration failed');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Step 1: Basic Information Form
  const renderBasicInfoForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleBasicInfoSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Full Name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Email address"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="sr-only">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Phone Number (Optional)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="sr-only">
            Bio
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            <textarea
              id="bio"
              name="bio"
              rows="3"
              value={formData.bio}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              placeholder="Tell us about yourself... (Optional)"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Confirm Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          I agree to the{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Terms and Conditions
          </a>
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSendingOtp}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSendingOtp ? 'Sending OTP...' : 'Continue to Verification'}
        </button>
      </div>

      <div className="text-center">
        <span className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Sign in
          </Link>
        </span>
      </div>
    </form>
  );

  // Step 2: OTP Verification Form
  const renderOtpVerificationForm = () => (
    <form className="mt-8 space-y-6" onSubmit={handleOtpVerification}>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Verify Your Email
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We've sent a 6-digit verification code to<br />
          <strong>{formData.email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Enter Verification Code
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={resendOtp}
            disabled={countdown > 0 || isSendingOtp}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Verifying...' : 'Verify & Create Account'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">R</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {step === 1 ? 'Create your account' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {step === 1 ? 'Join Riseup-Connect today' : 'Enter the code we sent to your email'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
          <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
        </div>

        {/* Form */}
        {step === 1 ? renderBasicInfoForm() : renderOtpVerificationForm()}
      </motion.div>
    </div>
  );
};

export default Register;