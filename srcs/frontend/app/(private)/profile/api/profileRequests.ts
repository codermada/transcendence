
import { apiFetch } from "./apiFetch";
const API_URL = "https://localhost:9000/nest/radio-creation-request";

export async function getUserProfile(username: string) {
    const userData = { 
        username: username, 
        displayName: "John Doe", 
        avatarUrl: "/profile/avatar.jpg", 
        coverUrl: "/profile/cover.jpg", 
        followerCount: 123, 
        isOwner: true, 
        isFollowing: false, 
    };

//   if (username === "azaria") {
    return userData;
//   }

  return null;
}   