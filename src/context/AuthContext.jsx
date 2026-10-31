import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
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

          const effectiveRole = claimRole || userData?.role;
          setIsAdmin(effectiveRole === "admin");
          setIsStaff(effectiveRole === "admin" || effectiveRole === "sales");
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isStaff,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

