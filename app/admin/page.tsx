/**
 * Server wrapper for Admin dashboard — loads client-only UI via loader
 */
import AdminLoader from "./loader";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AdminPage() {
  return <AdminLoader />;
}
