import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';

const ForgotPasswordContext = createContext(null);

const STORAGE_KEY = 'art_by_radhika_forgot_password_state';

export const ForgotPasswordProvider = ({ children }) => {
  const [email, setEmail] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).email || '' : '';
    } catch {
      return '';
    }
  });

  const [captchaId, setCaptchaId] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).captchaId || '' : '';
    } catch {
      return '';
    }
  });

  const [captchaImage, setCaptchaImage] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).captchaImage || '' : '';
    } catch {
      return '';
    }
  });

  const [captchaSvg, setCaptchaSvg] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).captchaSvg || '' : '';
    } catch {
      return '';
    }
  });

  const [captchaAnswer, setCaptchaAnswer] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).captchaAnswer || '' : '';
    } catch {
      return '';
    }
  });

  const [otp, setOtp] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).otp || '' : '';
    } catch {
      return '';
    }
  });

  const [expiresInSeconds, setExpiresInSeconds] = useState(300);
  const [expiryTimestamp, setExpiryTimestamp] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).expiryTimestamp || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          email,
          captchaId,
          captchaImage,
          captchaSvg,
          captchaAnswer,
          otp,
          expiryTimestamp,
        })
      );
    } catch {
      // ignore
    }
  }, [email, captchaId, captchaImage, captchaSvg, captchaAnswer, otp, expiryTimestamp]);

  // Load / Refresh Captcha
  const loadCaptcha = useCallback(async (silent = false) => {
    setIsCaptchaLoading(true);
    try {
      const res = await authService.getCaptcha();
      if (res.success && res.data) {
        setCaptchaId(res.data.captchaId);
        setCaptchaImage(res.data.captchaImage || '');
        setCaptchaSvg(res.data.captchaSvg || '');
        const duration = res.data.expiresInSeconds || 300;
        setExpiresInSeconds(duration);
        setExpiryTimestamp(Date.now() + duration * 1000);
        setCaptchaAnswer(''); // Reset answer on refresh
        if (!silent) {
          toast.success('Fresh security captcha loaded! 🛡️');
        }
        return res.data;
      }
    } catch (err) {
      console.error('Failed to load captcha:', err);
      toast.error('Could not load captcha. Please check connection.');
    } finally {
      setIsCaptchaLoading(false);
    }
  }, []);

  // Send OTP (Verify Captcha)
  const verifyCaptchaAndSendOtp = async (customEmail, customAnswer) => {
    const targetEmail = (customEmail || email).trim();
    const targetAnswer = (customAnswer || captchaAnswer).trim();

    if (!targetEmail) {
      toast.error('Please enter your registered email address');
      return { success: false, message: 'Email required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      toast.error('Please enter a valid email address');
      return { success: false, message: 'Invalid email' };
    }

    if (!captchaId) {
      toast.error('Captcha has expired or was not loaded. Generating new captcha...');
      await loadCaptcha(true);
      return { success: false, message: 'Captcha reload required' };
    }

    if (!targetAnswer) {
      toast.error('Please enter the captcha characters');
      return { success: false, message: 'Captcha answer required' };
    }

    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword({
        email: targetEmail,
        captchaId,
        captchaAnswer: targetAnswer,
      });

      if (res.success) {
        setEmail(targetEmail);
        setCaptchaAnswer(targetAnswer);
        toast.success(res.message || 'Verification OTP sent to your email! ✨');
        return { success: true, data: res };
      } else {
        toast.error(res.message || 'Captcha verification failed. Please try again.');
        // Refresh captcha on failure
        loadCaptcha(true);
        return { success: false, message: res.message };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to verify captcha. Please try again.';
      toast.error(errorMsg);
      // Auto refresh captcha
      loadCaptcha(true);
      return { success: false, message: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const verifyOtpCode = async (customOtp) => {
    const code = (customOtp || otp).trim();
    if (!code || code.length < 4) {
      toast.error('Please enter the complete verification code');
      return { success: false, message: 'OTP required' };
    }

    if (!email) {
      toast.error('Email missing. Please restart recovery process.');
      return { success: false, message: 'Email missing' };
    }

    setIsSubmitting(true);
    try {
      const res = await authService.verifyForgotPasswordOtp({
        email: email.trim(),
        otp: code,
      });

      if (res.success) {
        setOtp(code);
        toast.success(res.message || 'OTP verified successfully! ✨');
        return { success: true, data: res };
      } else {
        toast.error(res.message || 'Invalid or expired OTP');
        return { success: false, message: res.message };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'OTP verification failed';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set New Password
  const resetPassword = async (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return { success: false, message: 'Weak password' };
    }

    if (!email || !otp) {
      toast.error('Session details incomplete. Please restart verification.');
      return { success: false, message: 'Session incomplete' };
    }

    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (res.success) {
        toast.success(res.message || 'Password reset successfully! You can now log in. ✨');
        clearFlow();
        return { success: true, data: res };
      } else {
        toast.error(res.message || 'Failed to reset password');
        return { success: false, message: res.message };
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to reset password';
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFlow = () => {
    setEmail('');
    setCaptchaId('');
    setCaptchaImage('');
    setCaptchaSvg('');
    setCaptchaAnswer('');
    setOtp('');
    setExpiryTimestamp(0);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <ForgotPasswordContext.Provider
      value={{
        email,
        setEmail,
        captchaId,
        captchaImage,
        captchaSvg,
        captchaAnswer,
        setCaptchaAnswer,
        otp,
        setOtp,
        expiresInSeconds,
        expiryTimestamp,
        isCaptchaLoading,
        isSubmitting,
        loadCaptcha,
        verifyCaptchaAndSendOtp,
        verifyOtpCode,
        resetPassword,
        clearFlow,
      }}
    >
      {children}
    </ForgotPasswordContext.Provider>
  );
};

export const useForgotPassword = () => {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error('useForgotPassword must be used within a ForgotPasswordProvider');
  }
  return context;
};
