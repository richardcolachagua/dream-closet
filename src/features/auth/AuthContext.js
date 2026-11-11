import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onIdTokenChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../backend/firebase/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState({});
  const [loading, setLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsError, setClaimsError] = useState(null);

  const [profileState, setProfileState] = useState({
    uid: null,
    profile: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let active = true;
    let generation = 0;

    const unsubscribe = onIdTokenChanged(
      auth,
      async (firebaseUser) => {
        const currentGeneration = ++generation;

        setUser(firebaseUser || null);
        setClaims({});
        setClaimsError(null);

        if (!firebaseUser || firebaseUser.isAnonymous) {
          setClaimsLoading(false);
          setLoading(false);
          return;
        }

        setClaimsLoading(true);
        setLoading(false);

        try {
          const token = await firebaseUser.getIdTokenResult();

          if (!active || currentGeneration !== generation) {
            return;
          }

          setClaims(token.claims || {});
        } catch (error) {
          if (!active || currentGeneration !== generation) {
            return;
          }

          setClaims({});
          setClaimsError(error);
        } finally {
          if (active && currentGeneration === generation) {
            setClaimsLoading(false);
          }
        }
      },
      (error) => {
        if (!active) return;

        generation += 1;
        setUser(null);
        setClaims({});
        setClaimsError(error);
        setClaimsLoading(false);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      generation += 1;
      unsubscribe();
    };
  }, []);

  const uid = user?.uid || null;
  const isAnonymous = Boolean(user?.isAnonymous);
  const isRegistered = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    if (!uid || isAnonymous) {
      setProfileState({
        uid: null,
        profile: null,
        loading: false,
        error: null,
      });

      return undefined;
    }

    let active = true;

    setProfileState({
      uid,
      profile: null,
      loading: true,
      error: null,
    });

    const unsubscribe = onSnapshot(
      doc(db, "users", uid),
      (snapshot) => {
        if (!active) return;

        setProfileState({
          uid,
          profile: snapshot.exists() ? snapshot.data() : null,
          loading: false,
          error: null,
        });
      },
      (error) => {
        if (!active) return;

        setProfileState({
          uid,
          profile: null,
          loading: false,
          error,
        });
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, isAnonymous]);

  const currentProfileState =
    isRegistered && profileState.uid === uid
      ? profileState
      : {
          profile: null,
          loading: isRegistered,
          error: null,
        };

  const profile = currentProfileState.profile;
  const profileLoading = currentProfileState.loading;
  const profileError = currentProfileState.error;
  const isAdmin = isRegistered && !claimsLoading && claims.admin === true;

  const role = isAdmin
    ? "admin"
    : isRegistered && !claimsLoading && typeof claims.role === "string"
      ? claims.role
      : null;

  const value = useMemo(
    () => ({
      user,
      loading,
      claims,
      claimsLoading,
      claimsError,
      role,
      isAdmin,
      isAnonymous,
      isRegistered,
      isAuthenticated: isRegistered,
      hasAuthSession: Boolean(user),
      profile,
      profileLoading,
      profileError,
      hasProfile: Boolean(profile),
    }),
    [
      user,
      loading,
      claims,
      claimsLoading,
      claimsError,
      role,
      isAdmin,
      isAnonymous,
      isRegistered,
      profile,
      profileLoading,
      profileError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
