"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MessagesViewFallback } from "@/fallbacks";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { cn } from "@/lib/cn";
import type { MessagesViewProps } from "@/types/messages/MessagesView-types";
import { useMessagesPage } from "@/hooks/messages/useMessagesPage";
import { MessagesSidebar } from "./MessagesSidebar";
import { ChatView } from "./ChatView";
import { EmptyChatState } from "./EmptyChatState";

export function FreePageView({
  initialUser,
  initialFriends,
  className,
}: MessagesViewProps) {
  return (
    <Suspense fallback={<MessagesViewFallback />}>
      <ErrorBoundary>
        <MessagesPageContent
          initialUser={initialUser}
          initialFriends={initialFriends}
          className={className}
        />
      </ErrorBoundary>
    </Suspense>
  );
}

function MessagesPageContent({
  initialUser,
  initialFriends,
  className,
}: MessagesViewProps) {
  const {
    t,
    user,
    loading,
    friends,
    conversations,
    selectedUser,
    setSelectedUser,
    tab,
    setTab,
    sidebarOpen,
    setSidebarOpen,
    search,
    setSearch,
    findInput,
    setFindInput,
    findResults,
    sentRequestIds,
    setSentRequestIds,
    openConversation,
    debouncedSearch,
    onlineUsers,
    convsError,
    progress,
    direction,
    isSwiping,
    connectionState,
    messagesUser,
  } = useMessagesPage({ initialUser, initialFriends });

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInRequired} />;

  return (
    <div
      className={cn("flex min-h-0 w-full flex-1 overflow-hidden", className)}
    >
      {sidebarOpen && (
        <div
          className="bg-overlay/30 fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <MessagesSidebar
        user={messagesUser}
        conversations={conversations}
        friends={friends}
        selectedUser={selectedUser}
        tab={tab}
        setTab={setTab}
        search={search}
        setSearch={setSearch}
        findInput={findInput}
        setFindInput={setFindInput}
        findResults={findResults}
        sentRequestIds={sentRequestIds}
        setSentRequestIds={setSentRequestIds}
        openConversation={openConversation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        debouncedSearch={debouncedSearch}
        onlineUsers={onlineUsers}
        convsError={convsError}
        progress={progress}
        direction={direction ?? "right"}
        isSwiping={isSwiping}
      />

      <div className="hidden min-h-0 flex-1 md:flex">
        {selectedUser ? (
          <ChatView
            selectedUser={selectedUser}
            user={messagesUser}
            setSelectedUser={setSelectedUser}
            setSidebarOpen={setSidebarOpen}
            onlineUsers={onlineUsers}
            connectionState={connectionState}
          />
        ) : (
          <EmptyChatState />
        )}
      </div>

      <div className="flex min-h-0 flex-1 md:hidden">
        {selectedUser ? (
          <ChatView
            selectedUser={selectedUser}
            user={messagesUser}
            setSelectedUser={setSelectedUser}
            setSidebarOpen={setSidebarOpen}
            onlineUsers={onlineUsers}
            connectionState={connectionState}
          />
        ) : null}
      </div>
    </div>
  );
}
