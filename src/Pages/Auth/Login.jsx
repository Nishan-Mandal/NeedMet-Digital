import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const recaptchaVerifierRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Redirect to home (or previous page) if already logged in
  useEffect(() => {
    if (currentUser) {
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

  // Helper to initialize or reuse RecaptchaVerifier
  const initRecaptcha = async () => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const container = document.getElementById("recaptcha-container");
    if (!container) return null;

    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal",
        callback: () => {
          setError("");
        },
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please check the box again.");
        },
      });

      const widgetId = await verifier.render();
      recaptchaWidgetIdRef.current = widgetId;
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.warn("reCAPTCHA initialization notice:", err);
      return null;
    }
  };

  // Mount RecaptchaVerifier on initial load
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        initRecaptcha();
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
        recaptchaWidgetIdRef.current = null;
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    // Standardize to Indian +91 format if they just typed 10 digits
    const formattedNumber = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+91${phoneNumber}`;

    const raw10Digit = phoneNumber.slice(-10);

    // Pre-check if user exists in Firestore
    try {
      const usersRef = collection(db, "users");
      const q1 = query(usersRef, where("phone", "==", formattedNumber));
      const querySnapshot1 = await getDocs(q1);
      let userExists = !querySnapshot1.empty;

      if (!userExists) {
        const q2 = query(usersRef, where("phone", "==", raw10Digit));
        const querySnapshot2 = await getDocs(q2);
        userExists = !querySnapshot2.empty;
      }

      if (!userExists) {
        setError("Account does not exist. Please sign up first.");
        setLoading(false);
        return;
      }
    } catch (firestoreError) {
      console.warn("Firestore precheck ignored (likely due to permissions):", firestoreError);
    }

    try {
      let appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        appVerifier = await initRecaptcha();
      }
      if (!appVerifier) {
        setError("reCAPTCHA container is not ready. Please refresh the page.");
        setLoading(false);
        return;
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.error("Phone Auth Error:", err);

      // Reset reCAPTCHA on error so the user can re-check without full page reload
      if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
        try {
          window.grecaptcha.reset(recaptchaWidgetIdRef.current);
        } catch (resetErr) {
          console.warn("Could not reset grecaptcha widget:", resetErr);
        }
      }

      if (err.code === "auth/invalid-app-credential") {
        setError(
          "App verification failed (auth/invalid-app-credential). Please ensure the 'I'm not a robot' box is checked, and verify Fraud Prevention / SMS settings in Firebase Console."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests sent. Please try again later or test with a registered test phone number.");
      } else if (err.code === "auth/quota-exceeded") {
        setError("SMS quota exceeded. Please configure test phone numbers in Firebase Console.");
      } else {
        setError(err.message || "Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otp);
      
      if (result.user) {
        // Definitive check if user exists in Firestore users collection
        const usersRef = collection(db, "users");
        const userDocRef = doc(usersRef, result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userExists = userDocSnap.exists();

        if (!userExists && result.user.phoneNumber) {
          try {
            const qPhone = query(usersRef, where("phone", "==", result.user.phoneNumber));
            const qSnap = await getDocs(qPhone);
            userExists = !qSnap.empty;
          } catch (ruleErr) {
            console.warn("Client-side phone query restricted by Firestore security rules, relying on UID existence:", ruleErr);
          }
        }

        if (!userExists) {
          await signOut(auth);
          setError("Account does not exist. Please sign up first.");
          setLoading(false);
          return;
        }
      }
      
      // Navigate back to where they came from, or home
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login OTP verification error:", err);
      if (err.message === "Account does not exist. Please sign up first.") {
        setError(err.message);
      } else if (err.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please check the code and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please request a new code.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex  min-h-[calc(100vh-9rem)] w-full flex-col lg:flex-row bg-[#fafdfb]">
      
      {/* Left Column (Marketing) - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0d3d2e] p-4 xl:p-20 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#1a8a5a]/20 blur-3xl" />
        <div className="absolute right-10 top-10 h-60 w-60 rounded-full bg-[#22c47a]/10 blur-3xl" />
         
        {/* Center Content */}
        <div className="max-w-md space-y-3  my-auto">
          <h1 className="text-4xl xl:text-5xl font-bold font-heading leading-tight text-white">
           Discover the right digital solutions.
          </h1>
          <p className="text-base xl:text-lg text-white/80 leading-relaxed font-primary">
          A one-stop platform where individuals and businesses can explore, compare, and choose the best digital plans for their needs.
          </p>
          
          <ul className="space-y-4 pt-6 text-sm xl:text-base font-primary">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#22c47a] bg-[#1a8a5a]/20 p-1.5 rounded-full text-lg">check</span>
              <span>Comprehensive plans across multiple categories</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#22c47a] bg-[#1a8a5a]/20 p-1.5 rounded-full text-lg">check</span>
              <span>Transparent pricing with real-time updates</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#22c47a] bg-[#1a8a5a]/20 p-1.5 rounded-full text-lg">check</span>
              <span>Secure OTP authentication for a trusted experience</span>
            </li>
          </ul>
        </div>
    
      </div>

      {/* Right Column (Login Card) */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Card Header */}
          <div className="space-y-3 text-left">
            <span className="text-xs font-bold tracking-widest text-[#0f5c3e] uppercase font-heading">
              {otpSent ? "STEP 2 OF 2" : "STEP 1 OF 2"}
            </span>
            <h2 className="text-3xl xl:text-4xl font-bold text-gray-900 font-heading">
              {otpSent ? "Verification Code" : "Welcome back"}
            </h2>
            <p className="text-sm text-gray-500 font-primary">
              {otpSent 
                ? `Enter the 6-digit OTP sent to +91 ${phoneNumber}` 
                : "Enter your phone number to receive a verification code."}
            </p>
          </div>

          {/* Recaptcha container */}
          <div 
            id="recaptcha-container" 
            className={`flex justify-center my-3 min-h-[78px] ${otpSent ? "hidden" : ""}`}
          ></div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-600 font-heading">
                  Mobile Number
                </label>
                <div className="flex rounded-xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#0f5c3e]/20 focus-within:border-[#0f5c3e]">
                  <span className="flex items-center bg-gray-50 px-4 text-gray-500 text-sm font-medium border-r border-gray-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="block w-full py-3.5 px-4 text-gray-900 placeholder-gray-400 focus:outline-none text-base font-primary"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium font-primary">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-[#0f5c3e] to-[#1a8a5a] py-3.5 px-4 text-sm font-bold text-white shadow-md hover:opacity-95 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider font-heading"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-gray-600 font-heading">
                  One-Time Password
                </label>
                <input
                  type="text"
                  name="otp"
                  id="otp"
                  className="block w-full rounded-xl border border-gray-200 px-4 py-3.5 text-center tracking-widest text-lg font-bold focus:border-[#0f5c3e] focus:outline-none focus:ring-2 focus:ring-[#0f5c3e]/20"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium font-primary">{error}</p>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-[#0f5c3e] to-[#1a8a5a] py-3.5 px-4 text-sm font-bold text-white shadow-md hover:opacity-95 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider font-heading"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    "Verify & Login"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setError("");
                    if (window.grecaptcha && recaptchaWidgetIdRef.current !== null) {
                      try {
                        window.grecaptcha.reset(recaptchaWidgetIdRef.current);
                      } catch (e) {}
                    }
                  }}
                  className="text-sm font-semibold text-[#0f5c3e] hover:text-[#1a8a5a] transition-colors font-heading text-center"
                >
                  Change Phone Number
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Link & Disclaimer */}
          <div className="space-y-6 pt-6 text-center border-t border-gray-100">
            <p className="text-sm text-gray-600 font-primary">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-[#0f5c3e] hover:text-[#1a8a5a] transition-colors font-heading">
                Sign up
              </Link>
            </p>
            
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed font-primary">
              By continung, you agree to our{" "}
              <a href="/terms-conditions" className="underline hover:text-[#0f5c3e] transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy-policy" className="underline hover:text-[#0f5c3e] transition-colors">
                Privacy Policy
              </a>.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
