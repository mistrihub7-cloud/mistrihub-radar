"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { getMockAccount } from "@/lib/mock-store";

type BookWorkerLinkProps = {
  workerId: string;
  className: string;
  children: ReactNode;
};

export function BookWorkerLink({ workerId, className, children }: BookWorkerLinkProps) {
  const router = useRouter();
  const href = `/book/${workerId}`;

  return (
    <Link
      className={className}
      href={href}
      onClick={(event) => {
        const account = getMockAccount();
        if (account?.role !== "worker") return;
        event.preventDefault();
        router.push(`${href}?switch=user`);
      }}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
