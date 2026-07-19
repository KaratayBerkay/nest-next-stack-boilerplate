import { z } from "zod";
import { profileSchema } from "./profile";

export const profileDefaultValues = {
  avatar: [] as {
    id: string
    file: File
    progress: number
    status: string
    preview?: string
  }[],
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  bio: "",
  country: "",
  language: "",
  newsletter: false,
  interests: [] as string[],
  role: "",
  birthDate: undefined as Date | undefined,
  meetingTime: { hours: 0, minutes: 0, seconds: 0 },
  notificationPrefs: { email: true, push: false, sms: false },
} satisfies z.input<typeof profileSchema>;

type ProfileFormValues = typeof profileDefaultValues;

export function createProfileInitialValues(record?: ProfileFormValues): ProfileFormValues {
  if (!record) return { ...profileDefaultValues };
  return {
    ...record,
    birthDate: record.birthDate ?? profileDefaultValues.birthDate,
    avatar: record.avatar ?? profileDefaultValues.avatar,
    interests: record.interests ?? profileDefaultValues.interests,
    meetingTime: record.meetingTime ?? profileDefaultValues.meetingTime,
    notificationPrefs: record.notificationPrefs ?? profileDefaultValues.notificationPrefs,
  };
}
