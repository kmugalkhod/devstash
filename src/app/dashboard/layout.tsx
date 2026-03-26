import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import {
  getSystemItemTypes,
  getSidebarCollections,
  getSidebarUser,
} from "@/lib/db/items";
import { getAuthUserId } from "@/lib/auth-utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();

  const [itemTypes, sidebarCollections, user] = await Promise.all([
    getSystemItemTypes(),
    getSidebarCollections(userId),
    getSidebarUser(userId),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col" suppressHydrationWarning>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              itemTypes={itemTypes}
              favoriteCollections={sidebarCollections.favorites}
              recentCollections={sidebarCollections.recents}
              user={user}
            />
            <div className="flex flex-1 flex-col overflow-hidden">
              <TopBar itemTypes={itemTypes} />
              <main className="flex-1 overflow-y-auto">
              <ItemDrawerProvider>
                <div className="mx-auto max-w-7xl px-8 py-6">{children}</div>
              </ItemDrawerProvider>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
