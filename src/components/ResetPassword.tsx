import { apiFetch } from '../lib/api';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  React.useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await apiFetch(`/api/auth/verify-reset-token/${token}`);
        if (res.ok) {
          setValidToken(true);
        } else {
          toast.error('Invalid or expired reset token');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        toast.error('Could not verify token');
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token, navigate]);

  const validatePassword = (pass: string) => {
    const errs = [];
    if (pass.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(pass)) errs.push('Uppercase letter required');
    if (!/[a-z]/.test(pass)) errs.push('Lowercase letter required');
    if (!/[0-9]/.test(pass)) errs.push('Number required');
    if (!/[^A-Za-z0-9]/.test(pass)) errs.push('Special character required');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    setLoading(true);
    try {
      const res = await apiFetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully');
        navigate('/login');
      } else {
        toast.error(data.error || 'Failed to reset password. Link may be expired.');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            {verifying ? 'Verifying link...' : validToken ? 'Please enter your new password below.' : 'This link is invalid or has expired.'}
          </p>
        </div>
        {verifying ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : validToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => {
                  setPassword(e.target.value);
                  setErrors([]);
                }} 
                required 
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {errors.length > 0 && (
            <div className="text-xs text-red-500 flex flex-col gap-1 mt-2">
              {errors.map((err, i) => (
                <span key={i}>• {err}</span>
              ))}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        ) : null}
      </div>
    </div>
  );
}
