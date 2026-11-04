import { createContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // 1. Check custom claims
          const tokenResult = await user.getIdTokenResult();
          const claimRole = tokenResult?.claims?.role;

          // 2. Fetch user document from Firestore
          const userDocSnap = await getDoc(doc(db, "users", user.uid));
          const userData = userDocSnap.exists() ? userDocSnap.data() : null;
          setUserProfile(userData);

          const rawRole = claimRole || userData?.role;
          const normalizedRole = String(rawRole || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
          const isUserAdmin = normalizedRole === "admin" || normalizedRole === "salesadmin" || normalizedRole === "superadmin" || userData?.isAdmin === true || userData?.isSalesAdmin === true;
          setIsAdmin(isUserAdmin);
          setIsStaff(isUserAdmin || normalizedRole === "sales");
        } catch (err) {
          console.warn("Could not resolve user role:", err);
          setIsAdmin(false);
          setIsStaff(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setIsStaff(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    // 1. Immediately reset state in memory so UI and routing update with 0ms delay
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsStaff(false);

    // 2. Invalidate Firebase session in the background
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signOut error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isStaff,
        authLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

