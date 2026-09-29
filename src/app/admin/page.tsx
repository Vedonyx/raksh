import type { Metadata } from "next";
import { hasAdminSession } from "../../lib/admin-auth";
import AdminPanel from "../../components/AdminPanel";
import "./admin.css";

export const runtime = "nodejs";
export const metadata: Metadata = { title: "Admin | Raksh Jain", robots: { index: false, follow: false } };

export default async function AdminPage() {
  return <AdminPanel signedIn={await hasAdminSession()} />;
}
