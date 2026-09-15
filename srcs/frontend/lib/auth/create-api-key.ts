import { authClient } from "@/lib/auth/auth-client";

const createApiKey = async () => {
  try {
    const { data: key, error } = await authClient.apiKey.create({
      name: "My Frontend App Key",
      // Optional: expiresIn is in seconds (e.g., 7 days)
      expiresIn: 60 * 60 * 24 * 7, 
      // Optional: add metadata
      metadata: {
        environment: "development",
      },
    });

    if (error) {
      console.error("Failed to create key:", error);
      return;
    }

    // IMPORTANT: The actual key value is only shown ONCE here.
    console.log("Your new API Key:", key.key);
    
    // You should display this to the user and prompt them to save it.
    // After this, only the metadata (like the ID) is retrievable.
  } catch (err) {
    console.error("Unexpected error:", err);
  }
};