import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';
import { motion } from 'motion/react';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="mr-2">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await apiFetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        const data = await res.json();
        
        if (res.ok) {
          localStorage.setItem('token', data.token);
          login(data.user);
          toast.success('Logged in with Google');
          navigate('/');
        } else {
          setErrorMsg(data.error || 'Google login failed');
          toast.error(data.error || 'Google login failed');
        }
      } catch (error) {
        setErrorMsg('An error occurred during Google login');
        toast.error('An error occurred during Google login');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMsg('Google login failed');
      toast.error('Google login failed');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        login(data.user);
        toast.success('Logged in successfully');
        navigate('/');
      } else {
        setErrorMsg(data.error || 'Login failed');
        toast.error(data.error || 'Login failed');
      }
    } catch (error) {
      setErrorMsg('An error occurred during login. Please check your connection.');
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 flex flex-col items-center justify-center space-y-4"
      >
        <Logo className="h-20 w-auto" />
        <span className="text-2xl font-bold tracking-tight">SecondBrain AI</span>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-md rounded-2xl border bg-card p-6 sm:p-8 shadow-sm sm:shadow-md"
      >
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={loading}
                autoComplete="email"
                className="pl-9 h-10 transition-shadow focus-visible:ring-primary/20"
                aria-invalid={!!errorMsg}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-primary hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1 -mx-1 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
                autoComplete="current-password"
                className="pl-9 pr-10 h-10 transition-shadow focus-visible:ring-primary/20"
                aria-invalid={!!errorMsg}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:text-foreground transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase font-medium tracking-wider">
            <span className="bg-card px-3 text-muted-foreground/70">Or continue with</span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-10 bg-background hover:bg-muted/50 transition-colors font-medium" 
          onClick={() => googleLogin()} 
          disabled={loading}
        >
          <GoogleIcon /> 
          Continue with Google
        </Button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-medium text-primary hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1 -mx-1 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
