import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword } from './ForgotPasswordContext';
import { ForgotPasswordLayout } from './ForgotPasswordLayout';
import { Mail, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const CaptchaVerifyPage = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    captchaId,
    captchaImage,
    captchaSvg,
    captchaAnswer,
    setCaptchaAnswer,
    verifyCaptchaAndSendOtp,
    loadCaptcha,
    isCaptchaLoading,
    isSubmitting,
  } = useForgotPassword();

  const [verifyEmail, setVerifyEmail] = useState(email || '');
  const [verifyAnswer, setVerifyAnswer] = useState(captchaAnswer || '');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (!captchaId) {
      loadCaptcha(true);
    }
  }, [captchaId, loadCaptcha]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = verifyEmail.trim();
    if (!cleanEmail) {
      setEmailError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!verifyAnswer.trim()) {
      toast.error('Please enter the captcha answer');
      return;
    }

    setEmail(cleanEmail);
    setCaptchaAnswer(verifyAnswer.trim());

    const res = await verifyCaptchaAndSendOtp(cleanEmail, verifyAnswer.trim());
    if (res.success) {
      navigate('/otp-vairfy-page');
    }
  };

  return (
    <ForgotPasswordLayout
      currentStep={2}
      title="Confirm & Send OTP"
      subtitle="We will send a 6-digit verification code to your email."
    >
      <form onSubmit={handleVerifySubmit} className="space-y-4 pt-2">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-[#4A151B] mb-1.5">
            Recipient Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8A3324] absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={verifyEmail}
              onChange={(e) => {
                setVerifyEmail(e.target.value);
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

        {/* Captcha Preview & Code */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#4A151B]">
              Verification Code
            </label>
            <button
              type="button"
              onClick={() => loadCaptcha(false)}
              disabled={isCaptchaLoading}
              className="text-[11px] text-[#8A3324] hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isCaptchaLoading ? 'animate-spin' : ''}`} />
              <span>Change Captcha</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-14 flex items-center justify-center overflow-hidden p-1">
              {captchaImage ? (
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
                <span className="text-xs text-gray-400">Loading code...</span>
              )}
            </div>
          </div>

          <input
            type="text"
            required
            maxLength={6}
            value={verifyAnswer}
            onChange={(e) => setVerifyAnswer(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="ENTER CAPTCHA CODE"
            className="w-full py-2.5 px-4 rounded-xl border border-gray-200 text-center font-mono text-base font-bold tracking-widest text-[#2C1810] focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324] outline-none transition-all placeholder:font-sans placeholder:text-xs placeholder:tracking-normal placeholder:text-gray-400 uppercase"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || isCaptchaLoading || !verifyEmail.trim() || !verifyAnswer.trim()}
            className="w-full py-3 rounded-xl bg-[#4A151B] hover:bg-[#5C1A22] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Sending OTP...</span>
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Verification OTP</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-[#8A3324] font-medium px-1">
            <Link to="/captch-page" className="hover:underline">
              ← Back to Captcha
            </Link>
            <Link to="/profile" className="hover:underline text-gray-500">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </ForgotPasswordLayout>
  );
};
