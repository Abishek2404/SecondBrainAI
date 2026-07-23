import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('OTP sent to your email');
        if (data.mockOtp) {
          toast.info(`Development Mode: Your OTP is ${data.mockOtp}`, {
            duration: 20000,
            action: {
              label: 'Copy',
              onClick: () => navigator.clipboard.writeText(data.mockOtp)
            },
          });
        }
        setResendCooldown(60);
        setStep(2);
      } else {
        toast.error(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifiedToken(data.verifiedToken);
        toast.success('OTP verified successfully');
        setStep(3);
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: verifiedToken, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset successfully');
        setStep(4);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/30 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center justify-center space-y-4"
        >
          <Logo className="h-16 w-auto" />
          <span className="text-2xl font-bold tracking-tight">SecondBrain AI</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border bg-card p-8 shadow-sm relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col space-y-2 text-center">
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to receive a 6-digit verification code.
                  </p>
                </div>
                
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-medium" disabled={loading}>
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col space-y-2 text-center">
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">Verify Code</h1>
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
                    It expires in 5 minutes.
                  </p>
                </div>
                
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter 6-digit code" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                      required 
                      className="h-11 rounded-xl text-center text-xl tracking-widest font-mono"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 rounded-xl font-medium" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </form>

                <div className="flex flex-col items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleRequestOtp}
                    disabled={loading || resendCooldown > 0}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep(1)} 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center transition-colors mt-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Email
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="flex flex-col space-y-2 text-center">
                  <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight">New Password</h1>
                  <p className="text-sm text-muted-foreground">
                    Create a strong, unique password for your account.
                  </p>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)} 
                        required 
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    Password must be at least 6 characters.
                  </div>

                  <Button type="submit" className="w-full h-11 rounded-xl font-medium mt-4" disabled={loading || !password || !confirmPassword}>
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Password Reset</h1>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully reset. You can now use your new password to sign in.
                </p>
                
                <Button 
                  onClick={() => navigate('/login')} 
                  className="w-full h-11 rounded-xl font-medium mt-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  Continue to Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
