
import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { ref, get, set, child } from 'firebase/database';
import { auth, db } from '../firebase';
import { Loader, ArrowRight, Phone, ShieldCheck, User, MapPin, AlertTriangle, ArrowLeft, LogIn, UserPlus, HelpCircle, Mail, Home } from 'lucide-react';
import { APP_NAME, TAGLINE } from '../constants';

// Professional Auth Modes
type AuthMode = 'LOGIN' | 'SIGNUP' | 'RECOVER';
type AuthStep = 'LANDING' | 'PHONE_INPUT' | 'OTP_VERIFY' | 'REGISTER_DETAILS';

// Extend window interface to handle global recaptcha verifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}

interface AuthPageProps {
    onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  // --- STATE ---
  const [step, setStep] = useState<AuthStep>('LANDING');
  const [mode, setMode] = useState<AuthMode>('LOGIN'); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data Inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  
  // Registration Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [addressFlat, setAddressFlat] = useState('');
  const [addressArea, setAddressArea] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Firebase Data
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Timer for OTP
  const [timer, setTimer] = useState(30);
  const [showResend, setShowResend] = useState(false);

  // --- EFFECTS ---
  
  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (step === 'OTP_VERIFY' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setShowResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Clean up verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        } catch (e) {
            console.error("Cleanup error", e);
        }
      }
    };
  }, []);

  // WebOTP API for Auto-detect
  useEffect(() => {
    if (step === 'OTP_VERIFY' && 'OTPCredential' in window) {
      const ac = new AbortController();
      navigator.credentials.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      } as any).then((otp: any) => {
        if (otp && otp.code) {
          setOtp(otp.code);
          handleVerifyOtp(null, otp.code); // Auto verify
        }
      }).catch(err => {
        // Silent catch for AbortError or NotSupportedError
      });
      return () => ac.abort();
    }
  }, [step]);

  // --- FUNCTIONS ---

  const startFlow = (selectedMode: AuthMode) => {
      setMode(selectedMode);
      setStep('PHONE_INPUT');
      setError('');
      setPhoneNumber('');
  };

  const initRecaptcha = () => {
    // CRITICAL FIX: Always clear any existing verifier to prevent 'auth/internal-error'
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Recaptcha clear error", e);
      }
      window.recaptchaVerifier = undefined;
    }

    const container = document.getElementById('recaptcha-container');
    if (!container) {
        console.error("Recaptcha container not found");
        return null;
    }
    
    // Clear DOM to ensure fresh mount
    container.innerHTML = '';

    try {
        // Use Modular SDK RecaptchaVerifier
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
                // ReCAPTCHA solved
                // console.log("Recaptcha Verified");
            },
            'expired-callback': () => {
                setError("Verification expired. Please try again.");
                setLoading(false);
            }
        });
        
        window.recaptchaVerifier = verifier;
        return verifier;
    } catch (e) {
        console.error("Recaptcha Init Error", e);
        return null;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const appVerifier = initRecaptcha();
      if (!appVerifier) {
          throw new Error("Could not initialize security check. Please refresh.");
      }

      const formatPh = `+91${phoneNumber}`;
      // Use Modular SDK signInWithPhoneNumber
      const confirmation = await signInWithPhoneNumber(auth, formatPh, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep('OTP_VERIFY');
      setTimer(30);
      setShowResend(false);

    } catch (err: any) {
      console.error("OTP Error Details:", err);
      
      // Cleanup on error so user can retry
      if (window.recaptchaVerifier) {
          try {
             window.recaptchaVerifier.clear();
             window.recaptchaVerifier = undefined;
          } catch(e) {}
      }

      if (err.code === 'auth/invalid-app-credential') {
          setError("App configuration error. Please check Firebase Console.");
      } else if (err.code === 'auth/quota-exceeded') {
          setError("SMS limit reached. Please try later.");
      } else if (err.code === 'auth/captcha-check-failed') {
          setError("Security check failed. Please refresh page.");
      } else if (err.code === 'auth/internal-error') {
          setError("Internal Error. Check Authorized Domains in Firebase.");
      } else if (err.message && err.message.includes('authorized domain')) {
          setError("Domain not authorized. Add localhost to Firebase.");
      } else {
          setError("Failed to send OTP. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent | null, autoCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = autoCode || otp;

    setError('');
    setLoading(true);

    if (codeToVerify.length !== 6) {
      setError("Enter valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      if (confirmationResult) {
        const result = await confirmationResult.confirm(codeToVerify);
        const user = result.user;
        
        // Check User Existence in DB
        const userRef = ref(db, `users/${user?.uid}`);
        const snapshot = await get(userRef);
        const userExists = snapshot.exists();

        if (mode === 'LOGIN') {
            if (userExists) {
                // Success - Auth listener in App.tsx will redirect
            } else {
                // Not a registered user -> Cleanup and force Register
                await user?.delete().catch(() => {}); 
                setError("Account not found. Please Create Account.");
                setStep('LANDING'); 
            }
        } 
        else if (mode === 'SIGNUP') {
            if (userExists) {
                setError("Account already exists. Please Login.");
                setStep('LANDING'); 
            } else {
                setStep('REGISTER_DETAILS');
            }
        }
        else if (mode === 'RECOVER') {
             if (userExists) {
                 // Recovery logic usually handled by just logging in
                 // For now, treat as login success
             } else {
                 await user?.delete().catch(() => {});
                 setError("No account found to recover.");
                 setStep('LANDING');
             }
        }
      }
    } catch (err: any) {
      console.error("Verify Error", err);
      if (err.code === 'auth/invalid-verification-code') setError("Incorrect OTP. Please try again.");
      else if (err.code === 'auth/code-expired') setError("OTP has expired. Please resend.");
      else setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fullName.trim() || !addressArea.trim() || !addressFlat.trim() || !pincode.trim()) {
          setError("Please fill all required fields");
          return;
      }
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
          try {
            await set(ref(db, `users/${currentUser.uid}`), {
                phone: phoneNumber,
                name: fullName,
                email: email,
                createdAt: new Date().toISOString(),
                address: { 
                    flat: addressFlat, 
                    area: addressArea,
                    pincode: pincode,
                    type: 'Home' 
                }
            });
            // Success
          } catch (e) {
              setError("Failed to save profile. Check internet.");
          } finally {
              setLoading(false);
          }
      }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-[80] bg-[#F5F7FD] flex flex-col items-center justify-center p-4">
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-scale-up border border-gray-100 relative">
        
        {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <Loader className="animate-spin text-green-600 mb-2" size={32} />
                <p className="text-sm font-bold text-gray-600">Please wait...</p>
            </div>
        )}

        {step === 'LANDING' && (
            <div className="flex flex-col h-full">
                <div className="bg-green-600 p-8 text-center relative overflow-hidden flex flex-col justify-center items-center h-48">
                     <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 z-20">
                        <ArrowLeft size={20} />
                     </button>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg animate-bounce">
                        <Phone className="text-green-600" size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight relative z-10">{APP_NAME}</h1>
                    <p className="text-green-100 text-xs font-medium mt-1 relative z-10">{TAGLINE}</p>
                </div>
                
                <div className="p-8 bg-white space-y-4">
                    <h2 className="text-center text-gray-800 font-bold text-lg mb-4">Welcome</h2>
                    
                    <button 
                        onClick={() => startFlow('LOGIN')}
                        className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-between px-6 active:scale-95"
                    >
                        <div className="flex items-center space-x-3">
                            <LogIn size={20} />
                            <span>Login</span>
                        </div>
                        <ArrowRight size={18} />
                    </button>

                    <button 
                        onClick={() => startFlow('SIGNUP')}
                        className="w-full bg-white text-gray-800 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between px-6 active:scale-95"
                    >
                        <div className="flex items-center space-x-3">
                            <UserPlus size={20} className="text-green-600" />
                            <span>Create New Account</span>
                        </div>
                        <ArrowRight size={18} className="text-gray-400" />
                    </button>

                    <button 
                        onClick={() => startFlow('RECOVER')}
                        className="w-full text-gray-500 font-medium py-2 rounded-xl text-sm hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                        <HelpCircle size={16} />
                        <span>Forgot Password? / Recover</span>
                    </button>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center text-center animate-shake">
                            <p className="text-red-600 text-xs font-bold">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {step === 'PHONE_INPUT' && (
            <div className="p-8 animate-slide-in-right">
                <button 
                    onClick={() => setStep('LANDING')} 
                    className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors text-sm font-bold"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {mode === 'LOGIN' && 'Login'}
                    {mode === 'SIGNUP' && 'Create Account'}
                    {mode === 'RECOVER' && 'Recover Account'}
                </h2>
                <p className="text-gray-500 text-sm mb-8">Enter your mobile number to proceed</p>

                <form onSubmit={handleSendOtp} className="space-y-6">
                    <div className="relative group">
                        <span className="absolute left-3 top-3.5 text-gray-500 font-bold border-r border-gray-300 pr-2 text-sm select-none">+91</span>
                        <input
                            type="tel"
                            required
                            autoFocus
                            value={phoneNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 10) setPhoneNumber(val);
                            }}
                            placeholder="00000 00000"
                            className="w-full pl-14 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900 font-bold text-xl tracking-widest"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || phoneNumber.length < 10}
                        className={`w-full font-bold text-lg py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2 ${
                            loading || phoneNumber.length < 10 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                        }`}
                    >
                        <span>Send OTP</span>
                    </button>
                </form>
            </div>
        )}

        {step === 'OTP_VERIFY' && (
            <div className="p-8 animate-slide-in-right">
                <button onClick={() => setStep('PHONE_INPUT')} className="text-xs font-bold text-green-600 hover:underline mb-6 flex items-center">
                    <ArrowLeft size={12} className="mr-1"/> Change Number
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify OTP</h2>
                <p className="text-gray-500 text-sm mb-8">Sent to <span className="font-bold text-gray-900">+91 {phoneNumber}</span></p>

                <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-6">
                   <div className="relative group">
                      <ShieldCheck className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-600 transition-colors" size={24} />
                      <input
                          type="text"
                          required
                          autoFocus
                          autoComplete="one-time-code"
                          value={otp}
                          onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 6) setOtp(val);
                          }}
                          placeholder="• • • • • •"
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all text-gray-900 font-bold text-2xl tracking-[0.5em] text-center"
                      />
                   </div>

                   <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className={`w-full font-bold text-lg py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center ${
                         loading || otp.length < 6
                         ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                         : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                      }`}
                   >
                      Verify & Proceed
                   </button>

                   <div className="text-center">
                      {showResend ? (
                          <button type="button" onClick={handleSendOtp} className="text-sm font-bold text-green-600 hover:underline">
                            Resend Code
                          </button>
                      ) : (
                          <p className="text-xs text-gray-400 font-medium">Resend in <span className="text-green-600">00:{timer < 10 ? `0${timer}` : timer}</span></p>
                      )}
                   </div>
                </form>
            </div>
        )}

        {step === 'REGISTER_DETAILS' && (
            <div className="p-8 animate-slide-in-right h-[500px] overflow-y-auto no-scrollbar">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Profile</h2>
                <p className="text-gray-500 text-sm mb-6">Setup your VegHaat account</p>
                
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium text-sm"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Email ID (Optional)</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium text-sm"
                                placeholder="e.g. rahul@gmail.com"
                            />
                        </div>
                    </div>
                    
                    {/* Address Fields */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Flat / House No *</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={addressFlat}
                                onChange={e => setAddressFlat(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium text-sm"
                                placeholder="e.g. Flat 101"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Area / Colony *</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={addressArea}
                                onChange={e => setAddressArea(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium text-sm"
                                placeholder="e.g. Indiranagar"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Pincode *</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="tel"
                                maxLength={6} 
                                required
                                value={pincode}
                                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 outline-none font-medium text-sm"
                                placeholder="e.g. 560038"
                            />
                        </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg mt-6 active:scale-95 transition-transform"
                    >
                       Save & Continue
                    </button>
                </form>
            </div>
        )}

        {/* Global Error Toast */}
        {error && step !== 'LANDING' && (
            <div className="mx-8 mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 animate-shake">
               <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
               <p className="text-red-600 text-xs font-medium leading-relaxed">{error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
