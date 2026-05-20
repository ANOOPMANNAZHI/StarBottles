import { redirect } from "next/navigation";

export default function Home() {
  // Middleware will redirect unauthenticated users to /login.
  // Authenticated users hitting / get sent to their role dashboard.
  redirect("/login");
}
