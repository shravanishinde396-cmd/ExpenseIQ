import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { signupSchema, zodResolver } from '../../utils/validators';
import { Button, Input, toast } from '../../components/ui';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const [isLoading, setIsLoading] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'None', color: 'bg-slate-200' });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    resolver: zodResolver(signupSchema)
  });

  const passwordVal = watch('password', '');

  // Calculate Password Strength on change
  useEffect(() => {
    if (!passwordVal) {
      setPwdStrength({ score: 0, label: 'None', color: 'bg-slate-200' });
      return;
    }

    let score = 0;
    if (passwordVal.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordVal)) score += 1;
    if (/[0-9]/.test(passwordVal)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score += 1;

    let label = 'Weak';
    let color = 'bg-danger';

    if (score === 2 || score === 3) {
      label = 'Fair';
      color = 'bg-warning';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-success';
    }

    setPwdStrength({ score, label, color });
  }, [passwordVal]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      const { user, accessToken } = response.data;
      setToken(accessToken);
      setUser(user);

      toast.success('Registration successful. Welcome to ExpenseIQ!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
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
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign up to manage and track your finances
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="relative">
          <Input
            type="text"
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            className="pl-10"
            {...register('name')}
          />
          <User className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

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
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            className="pl-10"
            {...register('password')}
          />
          <Lock className="absolute left-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Password Strength Indicator */}
        {passwordVal && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Password Strength:</span>
              <span className={
                pwdStrength.label === 'Strong' ? 'text-success' :
                pwdStrength.label === 'Fair' ? 'text-warning' : 'text-danger'
              }>
                {pwdStrength.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${pwdStrength.color} transition-all duration-300`} 
                style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirm Password Field */}
        <div className="relative">
          <Input
            type="password"
            label="Confirm Password"
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
          Sign Up
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-semibold">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}
