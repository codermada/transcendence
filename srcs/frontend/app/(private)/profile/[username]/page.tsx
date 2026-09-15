import { NavAuth } from "@/components/Nav/NavAuth";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { ProfileTabs } from "@/components/Profile/ProfileTabs";
import { getUserProfile } from "../api/profileRequests";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

interface UserData {
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl: string | null;
  followerCount: number;
  location?: string;
  isOwner: boolean;
  isFollowing: boolean;
}

export default async function ProfilePage({
  params,
}: ProfilePageProps) {

  const userData = await getUserProfile(params.username);

  if (!userData) {
    return (
      <main className="min-h-dvh">
        <NavAuth />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="text-center text-lg font-semibold text-text">
            User not found
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh">
      <NavAuth />

      <ProfileHeader {...userData} />

      <ProfileTabs username={userData.username} />

      {/* contenu de l'onglet actif */}
    </main>
  );
}
