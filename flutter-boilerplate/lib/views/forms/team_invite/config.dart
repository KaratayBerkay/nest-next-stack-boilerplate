class TeamInviteConfig {
  final int maxInvites;
  final List<String> roles;
  final Map<String, String> roleDescriptions;
  final String? messageHint;

  const TeamInviteConfig({
    this.maxInvites = 10,
    this.roles = const ['member', 'admin', 'viewer'],
    this.roleDescriptions = const {
      'member': 'Can view and edit assigned projects',
      'admin': 'Full access to all projects and settings',
      'viewer': 'Read-only access to assigned projects',
    },
    this.messageHint,
  });
}

const teamInviteConfig = TeamInviteConfig();

const List<String> teamInviteSteps = [
  'Emails',
  'Role',
  'Message',
  'Review',
];
