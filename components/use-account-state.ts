"use client";

import { useEffect, useState } from "react";
import { getMockAccount, type MockAccount } from "@/lib/mock-store";

export function useAccountState() {
  const [account, setAccount] = useState<MockAccount | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refreshAccount = () => {
      setAccount(getMockAccount());
      setReady(true);
    };

    refreshAccount();
    window.addEventListener("storage", refreshAccount);
    window.addEventListener("mistrihub-mock-change", refreshAccount);
    return () => {
      window.removeEventListener("storage", refreshAccount);
      window.removeEventListener("mistrihub-mock-change", refreshAccount);
    };
  }, []);

  return { account, ready };
}
