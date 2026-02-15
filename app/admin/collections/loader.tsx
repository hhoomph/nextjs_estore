"use client";

import dynamic from "next/dynamic";

const AdminCollectionsClient = dynamic(() => import("./client"), {
  ssr: false,
});

export default function AdminCollectionsLoader() {
  return <AdminCollectionsClient />;
}
