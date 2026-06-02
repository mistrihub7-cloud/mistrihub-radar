import { redirect } from "next/navigation";

export default function RemovedWorkerDiscoveryRedirectPage() {
  redirect("/workers");
}
