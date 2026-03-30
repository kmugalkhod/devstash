import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { EditorPreferencesProvider } from "@/components/settings/EditorPreferencesContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { getGlobalSearchData } from "@/lib/db/search";
import { getUserEditorPreferences } from "@/lib/db/editor-preferences";
import {
  getSystemItemTypes,
  getSidebarCollections,
  getSidebarUser,
  getAvailableCollections,
} from "@/lib/db/items";
import { getAuthUserId } from "@/lib/auth-utils";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();

  const [itemTypes, sidebarCollections, user, availableCollections, searchData, editorPreferences] = await Promise.all([
    getSystemItemTypes(),
    getSidebarCollections(userId),
    getSidebarUser(userId),
    getAvailableCollections(userId),
    getGlobalSearchData(userId),
    getUserEditorPreferences(userId),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <EditorPreferencesProvider initialPreferences={editorPreferences}>
          <div className="flex h-screen flex-col" suppressHydrationWarning>
            <div className="flex flex-1 overflow-hidden">
              <Sidebar
                itemTypes={itemTypes}
                favoriteCollections={sidebarCollections.favorites}
                recentCollections={sidebarCollections.recents}
                user={user}
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <ItemDrawerProvider>
                  <TopBar
                    itemTypes={itemTypes}
                    availableCollections={availableCollections}
                    searchData={searchData}
                  />
                  <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-8 py-6">{children}</div>
                  </main>
                </ItemDrawerProvider>
              </div>
            </div>
          </div>
        </EditorPreferencesProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}