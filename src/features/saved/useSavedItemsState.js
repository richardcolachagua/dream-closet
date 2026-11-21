import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
import { useAuth } from "../auth/AuthContext";
import { savedItemReference } from "./savedDataService";

export default function useSavedItemState(userId, item) {
  const { user, isRegistered } = useAuth();

  const source = item?.source;
  const productUrl = item?.productUrl;

  const enabled = Boolean(
    isRegistered && userId && user?.uid === userId && source && productUrl,
  );

  const key = JSON.stringify([
    userId || null,
    source || null,
    productUrl || null,
  ]);

  const [state, setState] = useState({
    key: null,
    saved: false,
    checking: false,
    error: "",
  });

  useEffect(() => {
    let active = true;
    let unsubscribe;

    setState({
      key,
      saved: false,
      checking: enabled,
      error: "",
    });

    if (!enabled) {
      return undefined;
    }

    savedItemReference(userId, {
      source,
      productUrl,
    })
      .then((reference) => {
        if (!active) return;

        unsubscribe = onSnapshot(
          reference,
          (snapshot) => {
            if (!active) return;

            setState({
              key,
              saved: snapshot.exists(),
              checking: false,
              error: "",
            });
          },
          (failure) => {
            if (!active) return;

            setState({
              key,
              saved: false,
              checking: false,
              error:
                failure.message ||
                "Could not check whether this item is saved.",
            });
          },
        );
      })
      .catch((failure) => {
        if (!active) return;

        setState({
          key,
          saved: false,
          checking: false,
          error:
            failure.message || "Could not check whether this item is saved.",
        });
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [enabled, key, userId, source, productUrl]);

  if (!enabled) {
    return {
      saved: false,
      checking: false,
      error: "",
    };
  }

  if (state.key !== key) {
    return {
      saved: false,
      checking: true,
      error: "",
    };
  }

  return {
    saved: state.saved,
    checking: state.checking,
    error: state.error,
  };
}
