"use client";

import dynamic from "next/dynamic";

const AdminClient = dynamic(() => import("./client"), { ssr: false });

export default function AdminLoader() {
  return <AdminClient />;
}
