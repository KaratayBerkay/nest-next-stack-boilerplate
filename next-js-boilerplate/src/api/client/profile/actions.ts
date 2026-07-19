import { useQueryClient } from "@tanstack/react-query";

export function useProfileActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["profile"] });

  const updateProfile = async (data: {
    name: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    const { updateProfileServer } = await import("@/api/server/profile/update");
    await updateProfileServer(data);
    await invalidate();
  };

  const uploadAvatar = async (file: File) => {
    const { uploadAvatarServer } =
      await import("@/api/server/profile/upload-avatar");
    const result = await uploadAvatarServer(file);
    await invalidate();
    return result;
  };

  const checkUsername = async (username: string) => {
    const { checkUsernameAvailableServer } =
      await import("@/api/server/profile/username-available");
    return checkUsernameAvailableServer(username);
  };

  return { updateProfile, uploadAvatar, checkUsername };
}
