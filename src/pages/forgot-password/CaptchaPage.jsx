import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword } from './ForgotPasswordContext';
import { ForgotPasswordLayout } from './ForgotPasswordLayout';
import { Mail, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const CaptchaPage = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    captchaId,
    captchaImage,
    captchaSvg,
    captchaAnswer,
    setCaptchaAnswer,
    loadCaptcha,
    isCaptchaLoading,
    expiryTimestamp,
  } = useForgotPassword();

  const [inputEmail, setInputEmail] = useState(email || '');
  const [inputAnswer, setInputAnswer] = useState(captchaAnswer || '');
  const [timeLeft, setTimeLeft] = useState(300);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!captchaId) {
      loadCaptcha(true);
    }
  }, [captchaId, loadCaptcha]);

  useEffect(() => {
    if (!expiryTimestamp) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanEmail = inputEmail.trim();
    if (!cleanEmail) {
      setEmailError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Enter a valid email address');
      return;
    }

    if (timeLeft === 0) {
      toast.error('Captcha expired. Reloading a new one...');
      loadCaptcha(false);
      return;
    }

    if (!inputAnswer.trim()) {
      toast.error('Please enter the captcha characters');
      return;
    }

    setEmail(cleanEmail);
    setCaptchaAnswer(inputAnswer.trim());
    navigate('/captch-verify-page');
  };

  return (
    <ForgotPasswordLayout
      currentStep={1}
      title="Forgot Password"
      subtitle="Enter your registered email and solve the captcha to continue."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-[#4A151B] mb-1.5">
            Registered Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8A3324] absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={inputEmail}
              onChange={(e) => {
                setInputEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-[#2C1810] focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324] outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          {emailError && (
            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        {/* Captcha Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#4A151B]">
              Security Verification
            </label>
            <span className={`text-[11px] ${timeLeft <= 30 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {timeLeft > 0 ? `Expires in ${formatTimer(timeLeft)}` : 'Expired'}
            </span>
          </div>

          {/* Captcha Image & Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-14 flex items-center justify-center overflow-hidden p-1">
              {isCaptchaLoading ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#8A3324]" />
                  <span>Loading...</span>
                </div>
              ) : timeLeft === 0 ? (
                <button
                  type="button"
                  onClick={() => loadCaptcha(false)}
                  className="text-xs text-[#8A3324] font-medium underline"
                >
                  Reload Captcha
                </button>
              ) : captchaImage ? (
                <img
                  src={captchaImage}
                  alt="Captcha"
                  className="max-h-12 w-auto object-contain select-none"
                  draggable="false"
                />
              ) : captchaSvg ? (
                <div
                  className="w-full flex items-center justify-center select-none"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => loadCaptcha(false)}
                  className="text-xs text-[#8A3324] underline"
                >
                  Load Captcha
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadCaptcha(false)}
              disabled={isCaptchaLoading}
              className="w-14 h-14 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#8A3324] flex items-center justify-center transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh Captcha"
            >
              <RefreshCw className={`w-5 h-5 ${isCaptchaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Captcha Answer Input */}
        <div>
          <input
            type="text"
            required
            maxLength={6}
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="ENTER CAPTCHA"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-center font-mono text-base font-bold tracking-widest text-[#2C1810] focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324] outline-none transition-all placeholder:font-sans placeholder:text-xs placeholder:tracking-normal placeholder:text-gray-400 uppercase"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isCaptchaLoading || timeLeft === 0 || !inputAnswer.trim() || !inputEmail.trim()}
            className="w-full py-3 rounded-xl bg-[#4A151B] hover:bg-[#5C1A22] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center">
            <Link
              to="/profile"
              className="text-xs text-[#8A3324] hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </form>
    </ForgotPasswordLayout>
  );
};
