import { LOGIN_PATH } from "@/constants/routes";

export function UnauthenticatedMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <p className="text-muted text-sm">{message}</p>
      <a
        href={LOGIN_PATH}
        className="bg-brand rounded-lg px-4 py-2 text-sm text-white"
      >
        Sign In
      </a>
    </div>
  );
}
