import { getAuthUserId } from "@/lib/auth-utils";
import { getProfileUser, getProfileStats } from "@/lib/db/profile";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";

export default async function ProfilePage() {
  const userId = await getAuthUserId();
  const [user, stats] = await Promise.all([
    getProfileUser(userId),
    getProfileStats(userId),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileHeader user={user} />
      <ProfileStats stats={stats} />
    </div>
  );
}
