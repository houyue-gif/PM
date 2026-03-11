import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Providers } from "@/components/providers";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </Providers>
  );
}
