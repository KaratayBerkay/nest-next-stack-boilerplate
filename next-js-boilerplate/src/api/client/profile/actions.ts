export function useProfileActions() {
  const updateProfile = async (data: {
    name?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    chatNickname?: string | null;
  }) => {
    const { updateProfileServer } = await import("@/api/server/profile/update");
    await updateProfileServer(data);
  };

  const uploadAvatar = async (file: File) => {
    const { uploadAvatarServer } =
      await import("@/api/server/profile/upload-avatar");
    return uploadAvatarServer(file);
  };

  const checkUsername = async (username: string) => {
    const { checkUsernameAvailableServer } =
      await import("@/api/server/profile/username-available");
    return checkUsernameAvailableServer(username);
  };

  return { updateProfile, uploadAvatar, checkUsername };
}
