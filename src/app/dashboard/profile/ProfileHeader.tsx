import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "lucide-react";
import type { ProfileUser } from "@/lib/db/profile";
import { getInitials } from "@/lib/utils";

export function ProfileHeader({ user }: { user: ProfileUser }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-white/5 bg-zinc-900/50 p-6">
      <Avatar className="size-16 text-lg">
        {user.image && <AvatarImage src={user.image} />}
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-zinc-400">{user.email}</p>
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Calendar className="size-3" />
          Member since{" "}
          {user.createdAt.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
