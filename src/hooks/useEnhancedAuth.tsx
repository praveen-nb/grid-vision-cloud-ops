import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthAttempt {
  timestamp: Date;
  success: boolean;
  ip?: string;
  userAgent?: string;
}

interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireStrongPassword: boolean;
}

export const useEnhancedAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);

  const securitySettings: SecuritySettings = {
    maxFailedAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 60,
    requireStrongPassword: true
  };

  // Check if account is locked out
  const checkLockout = useCallback(() => {
    const recentAttempts = authAttempts.filter(
      attempt => 
        !attempt.success && 
        Date.now() - attempt.timestamp.getTime() < securitySettings.lockoutDuration * 60 * 1000
    );

    if (recentAttempts.length >= securitySettings.maxFailedAttempts) {
      const lockoutEnd = new Date(
        recentAttempts[0].timestamp.getTime() + securitySettings.lockoutDuration * 60 * 1000
      );
      
      if (Date.now() < lockoutEnd.getTime()) {
        setIsLocked(true);
        setLockoutEndTime(lockoutEnd);
        return true;
      }
    }
    
    setIsLocked(false);
    setLockoutEndTime(null);
    return false;
  }, [authAttempts, securitySettings.lockoutDuration, securitySettings.maxFailedAttempts]);

  // Record authentication attempt
  const recordAuthAttempt = useCallback((success: boolean) => {
    const attempt: AuthAttempt = {
      timestamp: new Date(),
      success,
      userAgent: navigator.userAgent,
      // Note: IP address would need to be obtained from server-side
    };
    
    setAuthAttempts(prev => [...prev.slice(-9), attempt]); // Keep last 10 attempts
  }, []);

  // Validate password strength
  const validatePasswordStrength = useCallback((password: string): boolean => {
    if (!securitySettings.requireStrongPassword) return true;
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }, [securitySettings.requireStrongPassword]);

  // Enhanced sign up with security validation
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (checkLockout()) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again after ${lockoutEndTime?.toLocaleTimeString()}`,
        variant: "destructive"
      });
      return { error: new Error('Account temporarily locked') };
    }

    if (!validatePasswordStrength(password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        variant: "destructive"
      });
      return { error: new Error('Password does not meet security requirements') };
    }

    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        recordAuthAttempt(false);
        throw error;
      }

      recordAuthAttempt(true);
      
      // Log security event
      if (data.user) {
        await supabase.from('security_events').insert({
          event_type: 'user_registration',
          severity: 'low',
          event_details: {
            user_id: data.user.id,
            email: email,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          },
          status: 'logged'
        });
      }

      return { data, error: null };
    } catch (error) {
      recordAuthAttempt(false);
      return { error };
    }
  }, [checkLockout, lockoutEndTime, validatePasswordStrength, recordAuthAttempt]);

  // Enhanced sign in with security monitoring
  const signIn = useCallback(async (email: string, password: string) => {
    if (checkLockout()) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again after ${lockoutEndTime?.toLocaleTimeString()}`,
        variant: "destructive"
      });
      return { error: new Error('Account temporarily locked') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        recordAuthAttempt(false);
        throw error;
      }

      recordAuthAttempt(true);
      
      // Log successful login
      if (data.user) {
        await supabase.from('security_events').insert({
          event_type: 'user_login',
          severity: 'low',
          event_details: {
            user_id: data.user.id,
            email: email,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            success: true
          },
          status: 'logged'
        });
      }

      return { data, error: null };
    } catch (error) {
      recordAuthAttempt(false);
      
      // Log failed login attempt
      await supabase.from('security_events').insert({
        event_type: 'failed_login',
        severity: 'medium',
        event_details: {
          email: email,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          error: error.message
        },
        status: 'logged'
      });

      return { error };
    }
  }, [checkLockout, lockoutEndTime, recordAuthAttempt]);

  // Enhanced sign out with security logging
  const signOut = useCallback(async () => {
    if (user) {
      await supabase.from('security_events').insert({
        event_type: 'user_logout',
        severity: 'low',
        event_details: {
          user_id: user.id,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        },
        status: 'logged'
      });
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out properly",
        variant: "destructive"
      });
    }
    return { error };
  }, [user]);

  // Session validation and monitoring
  const validateSession = useCallback(async () => {
    if (!session) return false;

    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        toast({
          title: "Session Invalid",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive"
        });
        return false;
      }

      // Check session timeout using expires_at
      const expiresAt = new Date(currentSession.expires_at! * 1000);
      const now = new Date();
      const sessionRemaining = expiresAt.getTime() - now.getTime();

      if (sessionRemaining <= 0) {
        toast({
          title: "Session Expired",
          description: "Your session has timed out for security reasons.",
          variant: "destructive"
        });
        await signOut();
        return false;
      }

      // Check if session expires soon (within 5 minutes)
      const fiveMinutes = 5 * 60 * 1000;

      if (expiresAt.getTime() - Date.now() < fiveMinutes) {
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire soon. Please save your work.",
          variant: "destructive"
        });
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, [session, securitySettings.sessionTimeout, signOut]);

  // Initialize auth state and monitoring
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Log auth state changes
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            supabase.from('security_events').insert({
              event_type: 'session_created',
              severity: 'low',
              event_details: {
                user_id: session.user.id,
                event: event,
                timestamp: new Date().toISOString()
              },
              status: 'logged'
            });
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Periodic session validation
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [user, validateSession]);

  // Check lockout status
  useEffect(() => {
    checkLockout();
  }, [authAttempts, checkLockout]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isLocked,
    lockoutEndTime,
    authAttempts: authAttempts.length,
    failedAttempts: authAttempts.filter(a => !a.success).length,
    signUp,
    signIn,
    signOut,
    validateSession,
    validatePasswordStrength
  };
};