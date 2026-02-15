import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import axios from "axios";
import auth from "../../firebase/firebase-config";
import AuthContext from "./AuthContext";
import { API_BASE_URL } from "../../config/api";

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loader, setLoader] = useState(true);
  const [dbUserLoading, setDbUserLoading] = useState(true);
  const dbUserRef = useRef(null);

  const fetchDbUser = async (email) => {
    try {
      setDbUserLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { "x-user-email": email },
      });

      if (response.data.success) {
        setDbUser(response.data.data);
        dbUserRef.current = response.data.data;
      } else {
        setDbUser(null);
        dbUserRef.current = null;
      }
    } catch (error) {
      console.error("Error fetching DB user:", error);
      setDbUser(null);
      dbUserRef.current = null;
    } finally {
      setDbUserLoading(false);
    }
  };

  const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Fetch and wait for DB user data
      await fetchDbUser(result.user.email);

      // Return both Firebase auth result and DB user
      return {
        authResult: result,
        dbUser: dbUserRef.current
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Fetch and wait for DB user data
      await fetchDbUser(result.user.email);

      // Return both Firebase auth result and DB user
      return {
        authResult: result,
        dbUser: dbUserRef.current
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const updateUserProfile = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };

  const updateUser = (displayName, photoURL) => {
    return updateProfile(auth.currentUser, { displayName, photoURL });
  };

  const refreshDbUser = async () => {
    if (user?.email) {
      await fetchDbUser(user.email);
    }
  };

  const logoutUser = async () => {
    setDbUser(null);
    dbUserRef.current = null;
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoader(false);

      if (currentUser?.email && !dbUserRef.current) {
        await fetchDbUser(currentUser.email);
      } else if (!currentUser) {
        setDbUser(null);
        dbUserRef.current = null;
        setDbUserLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isSuperAdmin =
    dbUser?.isSuperAdmin || dbUser?.role === "super_admin";
  const userRole = dbUser?.role || null;
  const organizationId = dbUser?.organizationId || null;

  const authInfo = {
    user,
    dbUser,
    loader,
    dbUserLoading,
    registerUser,
    signInUser,
    signInWithGoogle,
    logoutUser,
    updateUserProfile,
    updateUser,
    refreshDbUser,
    isSuperAdmin,
    userRole,
    organizationId,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
