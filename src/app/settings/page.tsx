import { getAuthUserId } from "@/lib/auth-utils";
import { getProfileUser } from "@/lib/db/profile";
import { AccountActions } from "@/components/settings/AccountActions";

export default async function SettingsPage() {
  const userId = await getAuthUserId();
  const user = await getProfileUser(userId);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <AccountActions hasPassword={user.hasPassword} />
    </div>
  );
}