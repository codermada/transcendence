import { NavAuth } from "@/components/Nav/NavAuth";
import { ProfilePopup } from "@/components/Profile/ProfilePopup";

export default function FeedPage() {
  return (
    <main className="min-h-dvh">
      <NavAuth />

      <div className="p-6">
        test
      </div>

      <ProfilePopup user={{ name: "azaria", username: "azaria", avatarUrl: "/Github.png", isOnline: true }} />
    </main>
  );
}
