import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { Button, toast } from '../../components/ui';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const email = location.state?.email || '';

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Redirect back if no email is found in state
  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please sign up or log in again.');
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle typing inside boxes
  const handleChange = (index, value) => {
    const newVal = value.slice(-1); // Only take last char
    if (isNaN(newVal)) return; // Only numbers allowed

    const newOtpValues = [...otpValues];
    newOtpValues[index] = newVal;
    setOtpValues(newOtpValues);

    // Focus next input
    if (newVal && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Empty box and focus previous
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs[index - 1].current.focus();
      } else {
        const newOtpValues = [...otpValues];
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
    }
  };

  // Support copy/paste of full 6 digit string
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtpValues(pasteArray);
      inputRefs[5].current.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length < 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({ email, otp });
      const { user, accessToken } = response.data;

      setToken(accessToken);
      setUser(user);

      toast.success('Email verified successfully! Welcome!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check the OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsResending(true);
    try {
      await authService.resendOtp(email);
      toast.success('Verification code resent successfully.');
      setTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verify OTP
        </h2>
        <p className="text-sm text-muted-foreground">
          We have sent a verification code to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otpValues.map((val, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={val}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-12 text-center text-lg font-bold border rounded-lg bg-background border-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:bg-slate-800 dark:border-slate-700"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full font-bold"
          isLoading={isLoading}
        >
          Verify & Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Didn't receive the code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || isResending}
          className={`font-semibold transition-colors ${
            timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-primary hover:underline'
          }`}
        >
          {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
        </button>
      </div>
    </motion.div>
  );
}
