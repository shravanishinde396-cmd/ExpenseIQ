import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { forgotPasswordSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../../components/ui';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      toast.success('If email exists, an OTP code has been sent.');
      // Navigate to Reset Password page, passing email in state
      navigate('/reset-password', { state: { email: data.email } });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
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
          Forgot Password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we'll send you an OTP to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="relative">
          <Input
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            error={errors.email?.message}
            className="pl-10"
            {...register('email')}
          />
          <Mail className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full font-bold"
          isLoading={isLoading}
        >
          Send Reset Code
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
