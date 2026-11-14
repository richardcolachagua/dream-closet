import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../backend/firebase/firebase";
import { useAuth } from "../auth/AuthContext";
import { requireSavedDataUser } from "./savedDataService";

export const useSavedCollection = (name, requestedUid) => {
  const { user, isRegistered } = useAuth();
  const uid =
    isRegistered && (!requestedUid || requestedUid === user.uid)
      ? user.uid
      : null;
  const [state, setState] = useState({
    uid: null,
    records: [],
    loading: false,
    error: "",
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (!uid) {
      setState({ uid: null, records: [], loading: false, error: "" });
      return undefined;
    }
    setState({ uid, records: [], loading: true, error: "" });
    const unsubscribe = onSnapshot(
      query(collection(db, "users", uid, name), orderBy("createdAt", "desc")),
      (snapshot) => {
        if (active)
          setState({
            uid,
            loading: false,
            error: "",
            records: snapshot.docs.map((entry) => ({
              ...entry.data(),
              id: entry.id,
            })),
          });
      },
      (failure) => {
        if (active)
          setState({
            uid,
            records: [],
            loading: false,
            error: failure.message,
          });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, name, revision]);
  const remove = useCallback(
    async (id) => {
      await requireSavedDataUser(uid);
      if (typeof id !== "string" || !id || id.includes("/"))
        throw new Error("Invalid saved record ID.");
      await deleteDoc(doc(db, "users", uid, name, id));
    },
    [uid, name],
  );
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const current =
    state.uid === uid
      ? state
      : { records: [], loading: Boolean(uid), error: "" };
  return { ...current, remove, refresh };
};
