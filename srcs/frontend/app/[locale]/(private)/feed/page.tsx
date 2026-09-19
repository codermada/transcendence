import { FeedSectionProps } from "./_components/feed-section/feed-section.types";
import { FeedSection } from "./_components/feed-section/FeedSection";
import { NetworkSidebar } from "./_components/network-sidebar/NetworkSidebar";
import { ProfileSidebar } from "./_components/profile-sidebar/ProfileSidebar";

export default async function FeedPage() {
  const currentUser = {
    name: "Alex User",
    username: "alex_hb",
    initials: "HB",
    stats: {
      friendsCount: 0,
      postsCount: 0,
      reactionsCount: 0,
    },
  };

  const posts: FeedSectionProps = {
    posts: [
      {
        id: '1',
        author: 'Rakoto',
        initials: 'R',
        timeAgo: '2 hours ago',
        content: 'test',
        likesCount: 4,
        commentsCount: 0,
      }, {
        id: '2',
        author: 'John Doe',
        initials: 'JD',
        timeAgo: '5 minutes ago',
        content: 'Hello world!',
        likesCount: 0,
        commentsCount: 0,
      }
    ]
  }
  
  const networkData = {
    receivedRequests: [],
    sentRequests: [],
    suggestions: [],
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex h-dvh max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-12">
          <ProfileSidebar user={currentUser} />
          <FeedSection posts={posts.posts || []} />
          <NetworkSidebar
            receivedRequests={networkData.receivedRequests}
            sentRequests={networkData.sentRequests}
            suggestions={networkData.suggestions}
          />
        </div>
      </div>
    </main>
  );
}