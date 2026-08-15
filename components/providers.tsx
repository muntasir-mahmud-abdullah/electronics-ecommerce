"use client";

import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { store, AppDispatch } from "@/store";
import { setAuth, clearAuth } from "@/store/slices/auth";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function hydrateAuth() {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        const data = await res.json();
        
        if (res.ok && data.user) {
          dispatch(setAuth({ user: data.user, accessToken: data.token }));
        } else {
          // If refresh fails or no token, ensure state is clean
          dispatch(clearAuth());
        }
      } catch (error) {
        console.error("Auth hydration failed:", error);
        dispatch(clearAuth());
      }
    }
    
    hydrateAuth();
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>
        {children}
      </AuthHydrator>
    </Provider>
  );
}
