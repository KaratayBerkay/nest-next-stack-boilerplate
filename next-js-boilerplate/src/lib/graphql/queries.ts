// `me` is served from the Redis session snapshot (no Postgres on the hot path),
// so only snapshot fields exist: id, email, role, tier.
export const ME_QUERY = `
  query Me {
    me {
      id
      email
      role
      tier
    }
  }
`;

export const ME_ID_QUERY = `
  query Me {
    me {
      id
    }
  }
`;

export const POSTS_QUERY = `
  query Posts($cursor: ID, $take: Int, $search: String) {
    postList(cursor: $cursor, take: $take, search: $search) {
      id
      title
      content
      coverImage
      imageUrl
      status
      createdAt
      author {
        id
        name
        email
      }
      reactions {
        id
        type
        userId
      }
      _count {
        comments
        reactions
      }
    }
  }
`;

export const POST_QUERY = `
  query Post($id: ID!) {
    post(id: $id) {
      id
      title
      content
      coverImage
      imageUrl
      status
      createdAt
      author {
        id
        name
        email
      }
      comments {
        id
        body
        createdAt
        author {
          id
          name
          email
        }
        reactions {
          id
          type
          userId
        }
        parentId
        _count {
          replies
        }
      }
      reactions {
        id
        type
        userId
        user {
          id
          name
        }
      }
      _count {
        comments
        reactions
      }
    }
  }
`;

export const CREATE_POST_MUTATION = `
  mutation CreatePost($data: CreatePostInput!) {
    createPost(data: $data) {
      id
      title
      content
      imageUrl
      createdAt
      author {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_COMMENT_MUTATION = `
  mutation CreateComment($data: CreateCommentInput!) {
    createComment(data: $data) {
      id
      body
      createdAt
      author {
        id
        name
        email
      }
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = `
  mutation UpdateComment($id: ID!, $data: UpdateCommentInput!) {
    updateComment(id: $id, data: $data) {
      id
      body
      createdAt
      updatedAt
      author {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_COMMENT_MUTATION = `
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
    }
  }
`;

export const UPDATE_POST_MUTATION = `
  mutation UpdatePost($id: ID!, $data: UpdatePostInput!) {
    updatePost(id: $id, data: $data) {
      id
      title
      content
      author {
        id
        name
        email
      }
    }
  }
`;

export const DELETE_POST_MUTATION = `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

export const CREATE_REACTION_MUTATION = `
  mutation CreateReaction($data: CreateReactionInput!) {
    createReaction(data: $data) {
      id
      type
      userId
    }
  }
`;

export const MY_NOTIFICATIONS_QUERY = `
  query MyNotifications($cursor: ID, $take: Int) {
    myNotifications(cursor: $cursor, take: $take) {
      id
      title
      body
      type
      readAt
      createdAt
      payload
      actor {
        id
        name
        email
      }
    }
  }
`;

export const UNREAD_COUNT_QUERY = `
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = `
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id)
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = `
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;
