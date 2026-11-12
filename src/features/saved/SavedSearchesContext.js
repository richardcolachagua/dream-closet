import { createContext, useContext } from "react";
import { useAuth } from "../auth/AuthContext";
import { useSavedCollection } from "./useSavedCollection";
const SavedSearchesContext = createContext(null);
export const useSavedSearches = () => {
  const value = useContext(SavedSearchesContext);
  if (!value)
    throw new Error("useSavedSearches requires SavedSearchesProvider.");
  return value;
};
export function SavedSearchesProvider({ children }) {
  const { user } = useAuth();
  const { records, loading, error, refresh, remove } =
    useSavedCollection("savedSearches");
  const fetchSavedSearches = (uid) => {
    if (uid && uid !== user?.uid)
      throw new Error("Cannot load another account’s saved searches.");
    refresh();
  };
  return (
    <SavedSearchesContext.Provider
      value={{
        savedSearches: records,
        loading,
        error,
        fetchSavedSearches,
        deleteSavedSearch: remove,
      }}
    >
      {children}
    </SavedSearchesContext.Provider>
  );
}
