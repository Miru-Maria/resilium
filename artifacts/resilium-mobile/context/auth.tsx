import { useUser, useAuth as useClerkAuth, useClerk } from "@clerk/expo";

export type AuthUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
        firstName: clerkUser.firstName ?? null,
        lastName: clerkUser.lastName ?? null,
        profileImageUrl: clerkUser.imageUrl ?? null,
      }
    : null;

  const signOut = async () => {
    await clerkSignOut();
  };

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  return {
    user,
    isSignedIn: !!isSignedIn,
    isLoaded,
    signOut,
    getAuthHeaders,
  };
}
