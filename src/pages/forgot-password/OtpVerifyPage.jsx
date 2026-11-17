import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword } from './ForgotPasswordContext';
import { ForgotPasswordLayout } from './ForgotPasswordLayout';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const OtpVerifyPage = () => {
  const navigate = useNavigate();
  const {
    email,
    otp,
    setOtp,
    verifyOtpCode,
    verifyCaptchaAndSendOtp,
    captchaAnswer,
    isSubmitting,
  } = useForgotPassword();

  const [digits, setDigits] = useState(() => {
    if (otp && otp.length === 6) {
      return otp.split('');
    }
    return ['', '', '', '', '', ''];
  });

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleanVal.length > 1) {
      const pastedChars = cleanVal.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedChars[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pastedChars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const newDigits = [...digits];
    const chars = pastedData.slice(0, 6).split('');
    for (let i = 0; i < 6; i++) {
      newDigits[i] = chars[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;
    if (!email) {
      toast.error('Session expired. Please restart.');
      navigate('/captch-page');
      return;
    }

    setCanResend(false);
    setResendTimer(60);

    const res = await verifyCaptchaAndSendOtp(email, captchaAnswer);
    if (res.success) {
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      navigate('/captch-page');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = digits.join('').trim();

    if (fullOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    const res = await verifyOtpCode(fullOtp);
    if (res.success) {
      setOtp(fullOtp);
      navigate('/set-new-password=page.');
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <ForgotPasswordLayout
      currentStep={3}
      title="Enter Verification Code"
      subtitle={email ? `Code sent to ${email}` : 'Enter the 6-digit code sent to your email.'}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-3">
        {/* 6 Digit Inputs Box */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold rounded-xl border border-gray-200 bg-gray-50 text-[#2C1810] focus:bg-white focus:border-[#8A3324] focus:ring-1 focus:ring-[#8A3324] outline-none transition-all"
            />
          ))}
        </div>

        {/* Resend Option */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isSubmitting}
              className="text-xs text-[#8A3324] font-semibold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend Code</span>
            </button>
          ) : (
            <p className="text-xs text-gray-500">
              Resend code in <span className="font-semibold text-gray-700">{resendTimer}s</span>
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="space-y-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !isComplete}
            className="w-full py-3 rounded-xl bg-[#4A151B] hover:bg-[#5C1A22] text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </span>
            ) : (
              <>
                <span>Verify OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-[#8A3324] font-medium px-1">
            <Link to="/captch-verify-page" className="hover:underline">
              ← Change Email
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
