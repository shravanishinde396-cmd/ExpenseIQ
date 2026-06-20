import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { resetPasswordSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../../components/ui';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error('Session expired. Please request password reset again.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: ''
    },
    resolver: zodResolver(resetPasswordSchema)
  });

  // Keep react-hook-form's otp field in sync with individual inputs
  useEffect(() => {
    setValue('otp', otpValues.join(''));
  }, [otpValues, setValue]);

  // Handle typing inside boxes
  const handleChange = (index, value) => {
    const newVal = value.slice(-1);
    if (isNaN(newVal)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = newVal;
    setOtpValues(newOtpValues);

    if (newVal && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
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

  const onSubmit = async (data) => {
    if (data.otp.length < 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword
      });

      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setIsLoading(false);
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
          Reset Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter the code sent to your email and your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Input Section */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Verification Code
          </label>
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
          {errors.otp?.message && (
            <p className="text-xs text-danger font-medium mt-1">{errors.otp?.message}</p>
          )}
        </div>

        {/* New Password Field */}
        <div className="relative">
          <Input
            type="password"
            label="New Password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            className="pl-10"
            {...register('newPassword')}
          />
          <Lock className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            className="pl-10"
            {...register('confirmPassword')}
          />
          <ShieldCheck className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full font-bold"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
