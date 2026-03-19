export const dynamic = "force-dynamic";

import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getSystemItemTypes,
  getSidebarCollections,
  getSidebarUser,
} from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

// TODO: Replace with actual authenticated user ID
const DEMO_USER_ID = "demo-user-id";

async function getDemoUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: { id: true },
  });
  return user?.id ?? DEMO_USER_ID;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getDemoUserId();

  const [itemTypes, sidebarCollections, user] = await Promise.all([
    getSystemItemTypes(),
    getSidebarCollections(userId),
    getSidebarUser(userId),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col">
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              itemTypes={itemTypes}
              favoriteCollections={sidebarCollections.favorites}
              recentCollections={sidebarCollections.recents}
              user={user}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-8 py-6">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
