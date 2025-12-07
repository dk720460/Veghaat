
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { Lock, User, ArrowRight, Loader, Eye, EyeOff, Phone, MapPin, Hash } from 'lucide-react';
import { APP_NAME, TAGLINE } from '../constants';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  // REMOVED EMAIL STATE - Phone is now the primary identifier
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate Phone Number strictly
    if (phone.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        setLoading(false);
        return;
    }

    // Generate a pseudo-email for Firebase Auth (Phone + Domain)
    const emailToUse = `${phone}@veghaat.com`;

    try {
      if (isLogin) {
        // Login Logic using Phone (as email) and Password
        await signInWithEmailAndPassword(auth, emailToUse, password);
      } else {
        // Validation for Sign Up
        if (pincode.length !== 6) {
            throw new Error("Pincode must be 6 digits.");
        }
        if (!flat || !area) {
            throw new Error("Please enter complete address details.");
        }

        // Sign Up Logic
        const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, password);
        const user = userCredential.user;
        
        // Update user profile with name
        await updateProfile(user, {
          displayName: name
        });

        // Prepare User Data for Firebase DB
        const userData = {
            name: name,
            email: emailToUse, // Storing the generated email
            phone: phone,      // Storing the actual phone number
            address: {
                flat: flat,
                area: area,
                pincode: pincode,
                type: 'Home'
            }
        };

        // Save to Firebase Realtime Database
        await set(ref(db, `users/${user.uid}`), userData);

        // Save Address to LocalStorage as fallback/cache for immediate UI
        const addressData = {
            name: name,
            phone: phone,
            flat: flat,
            area: area,
            pincode: pincode,
            type: 'Home'
        };
        localStorage.setItem('veghaat_user_address', JSON.stringify(addressData));
        
        // No reload needed. onAuthStateChanged in App.tsx detects the login automatically.
      }
    } catch (err: any) {
      // Suppress console error for expected auth failures to avoid confusion
      // console.error("Auth Error:", err); 
      
      let msg = "An error occurred. Please try again.";
      
      const errorCode = err.code || '';
      const errorMessage = err.message || '';

      // Handle Firebase specific error codes
      if (errorCode === 'auth/invalid-credential' || errorMessage.includes('invalid-credential')) {
          msg = "Invalid Mobile Number or Password.";
          setPassword(''); // Clear password on wrong credential
      } else if (errorCode === 'auth/user-not-found') {
          msg = "No account found with this mobile number.";
      } else if (errorCode === 'auth/wrong-password') {
          msg = "Incorrect password.";
          setPassword('');
      } else if (errorCode === 'auth/email-already-in-use') {
          msg = "Account already exists with this mobile number. Please Sign In.";
      } else if (errorCode === 'auth/network-request-failed') {
          msg = "Network error. Please check your internet connection.";
      } else if (errorCode === 'auth/too-many-requests') {
          msg = "Too many failed attempts. Try again later.";
      } else if (errorCode === 'auth/weak-password') {
          msg = "Password should be at least 6 characters.";
      } else if (err.message && !err.code) {
          msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FD] flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden my-4 animate-scale-up">
        
        {/* Header Section */}
        <div className="bg-green-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>
          <h1 className="text-3xl font-black text-white tracking-tight relative z-10">{APP_NAME}</h1>
          <p className="text-green-100 text-sm font-medium mt-1 relative z-10">{TAGLINE}</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {isLogin ? 'Sign in with your mobile number' : 'Sign up to start your grocery journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name - Only for Sign Up */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm"
                  />
                </div>
              </div>
            )}

            {/* Mobile Number - Used for BOTH Login and Signup */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <span className="absolute left-9 top-2.5 text-gray-400 font-medium text-sm border-r border-gray-200 pr-2 py-0.5">+91</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) setPhone(val);
                  }}
                  placeholder="0000000000"
                  maxLength={10}
                  className="w-full pl-20 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm tracking-widest"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-green-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Address Fields - Only for Sign Up */}
            {!isLogin && (
                <>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Flat / House No</label>
                        <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            required
                            value={flat}
                            onChange={(e) => setFlat(e.target.value)}
                            placeholder="e.g. Flat 402, Sunshine Apts"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm"
                        />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <div className="space-y-1 flex-1">
                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Area / Sector</label>
                            <input
                                type="text"
                                required
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="e.g. Unakoti, Tripura"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm"
                            />
                        </div>
                        <div className="space-y-1 w-28">
                            <label className="text-[10px] font-bold text-gray-500 ml-1 uppercase">Pincode</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={pincode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) setPincode(val);
                                    }}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all text-gray-900 font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold text-lg py-3 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                   setIsLogin(!isLogin);
                   setError('');
                   setPassword('');
                   // Do not clear phone number when switching modes for better UX
                }}
                className="ml-1 text-green-700 font-bold hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
