import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { loginSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../../components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved email if rememberMe was checked previously
  const savedEmail = localStorage.getItem('expenseiq-remember-email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: savedEmail,
      password: '',
      rememberMe: !!savedEmail
    },
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      const { user, accessToken } = response.data;

      // Handle "Remember Me"
      if (data.rememberMe) {
        localStorage.setItem('expenseiq-remember-email', data.email);
      } else {
        localStorage.removeItem('expenseiq-remember-email');
      }

      setToken(accessToken);
      setUser(user);
      
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please verify credentials.');
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
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to log in
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

        {/* Password Field */}
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="pl-10 pr-10"
            {...register('password')}
          />
          <Lock className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4 dark:bg-slate-800 dark:border-slate-700"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-primary hover:underline font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full font-bold"
          isLoading={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline font-semibold">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
}
