import React, { createContext, useContext, useState, useCallback } from "react";
import { db } from "../backend/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const SavedSearchesContext = createContext();

export const useSavedSearches = () => useContext(SavedSearchesContext);

export function SavedSearchesProvider({ children }) {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedSearches = useCallback(async (userId) => {
    setLoading(true);
    const userQuery = query(
      collection(db, "saved-searches"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(userQuery);
    setSavedSearches(
      snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setLoading(false);
  }, []);

  const deleteSavedSearch = useCallback(async (id) => {
    await deleteDoc(doc(db, "saved-searches", id));
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <SavedSearchesContext.Provider
      value={{ savedSearches, loading, fetchSavedSearches, deleteSavedSearch }}
    >
      {children}
    </SavedSearchesContext.Provider>
  );
}
