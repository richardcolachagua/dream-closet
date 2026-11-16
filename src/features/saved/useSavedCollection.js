import { useCallback, useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../backend/firebase/firebase";
import { useAuth } from "../auth/AuthContext";
import { requireSavedDataUser } from "./savedDataService";

const PAGE_SIZE = 40;

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
    hasMore: false,
    loadingMore: false,
    loadMoreError: "",
  });
  const [revision, setRevision] = useState(0);
  const cursor = useRef(null);
  const generation = useRef(0);
  useEffect(() => {
    let active = true;
    const currentGeneration = ++generation.current;
    if (!uid) {
      cursor.current = null;
      setState({
        uid: null,
        records: [],
        loading: false,
        error: "",
        hasMore: false,
        loadingMore: false,
        loadMoreError: "",
      });
      return undefined;
    }
    cursor.current = null;
    setState({
      uid,
      records: [],
      loading: true,
      error: "",
      hasMore: false,
      loadingMore: false,
      loadMoreError: "",
    });
    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", uid, name),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE + 1),
      ),
      (snapshot) => {
        if (active) {
          const firstPage = snapshot.docs.slice(0, PAGE_SIZE);
          cursor.current = firstPage[firstPage.length - 1] || null;
          setState((previous) => {
            const firstPageRecords = firstPage.map((entry) => ({
              ...entry.data(),
              id: entry.id,
            }));
            const firstPageIds = new Set(
              firstPageRecords.map((record) => record.id),
            );
            const laterPages =
              previous.uid === uid
                ? previous.records.filter(
                    (record) => !firstPageIds.has(record.id),
                  )
                : [];
            return {
              uid,
              loading: false,
              error: "",
              records: [...firstPageRecords, ...laterPages],
              hasMore: snapshot.docs.length > PAGE_SIZE || laterPages.length > 0,
              loadingMore: false,
              loadMoreError: "",
            };
          });
        }
      },
      (failure) => {
        if (active)
          setState({
            uid,
            records: [],
            loading: false,
            error: failure.message,
            hasMore: false,
            loadingMore: false,
            loadMoreError: "",
          });
      },
    );
    return () => {
      active = false;
      if (generation.current === currentGeneration) generation.current += 1;
      unsubscribe();
    };
  }, [uid, name, revision]);

  const loadMore = useCallback(async () => {
    if (!uid || !state.hasMore || state.loadingMore || !cursor.current) return;
    const currentGeneration = generation.current;
    const after = cursor.current;
    setState((previous) => ({
      ...previous,
      loadingMore: true,
      loadMoreError: "",
    }));
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "users", uid, name),
          orderBy("createdAt", "desc"),
          startAfter(after),
          limit(PAGE_SIZE + 1),
        ),
      );
      if (generation.current !== currentGeneration) return;
      const page = snapshot.docs.slice(0, PAGE_SIZE);
      cursor.current = page[page.length - 1] || after;
      setState((previous) => {
        const existingIds = new Set(previous.records.map((record) => record.id));
        const newRecords = page
          .filter((entry) => !existingIds.has(entry.id))
          .map((entry) => ({ ...entry.data(), id: entry.id }));
        return {
          ...previous,
          records: [...previous.records, ...newRecords],
          hasMore: snapshot.docs.length > PAGE_SIZE,
          loadingMore: false,
          loadMoreError: "",
        };
      });
    } catch (failure) {
      if (generation.current === currentGeneration)
        setState((previous) => ({
          ...previous,
          loadingMore: false,
          loadMoreError: failure.message,
        }));
    }
  }, [uid, name, state.hasMore, state.loadingMore]);

  const remove = useCallback(
    async (id) => {
      await requireSavedDataUser(uid);
      if (typeof id !== "string" || !id || id.includes("/"))
        throw new Error("Invalid saved record ID.");
      await deleteDoc(doc(db, "users", uid, name, id));
      setState((previous) =>
        previous.uid === uid
          ? {
              ...previous,
              records: previous.records.filter((record) => record.id !== id),
            }
          : previous,
      );
    },
    [uid, name],
  );
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const current =
    state.uid === uid
      ? state
      : {
          records: [],
          loading: Boolean(uid),
          error: "",
          hasMore: false,
          loadingMore: false,
          loadMoreError: "",
        };
  return { ...current, remove, refresh, loadMore };
};
