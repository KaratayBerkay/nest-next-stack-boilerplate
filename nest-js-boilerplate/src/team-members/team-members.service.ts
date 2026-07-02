import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { CreateTeamMemberInput } from './dto/create-team-member.input';

@Injectable()
export class TeamMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenStore: TokenStoreService,
  ) {}

  findAll() {
    return this.prisma.teamMember.findMany({ orderBy: { joinedAt: 'asc' } });
  }

  async create(userId: string, data: CreateTeamMemberInput) {
    const member = await this.prisma.teamMember.create({
      data: {
        isLead: data.isLead,
        team: { connect: { id: data.teamId } },
        user: { connect: { id: userId } },
      },
    });
    // Rewrite teamIds in the live Redis session so the user's next guarded
    // request sees the new team membership without re-login.
    const teamIds = (
      await this.prisma.teamMember.findMany({
        where: { userId },
        select: { teamId: true },
      })
    ).map((t) => t.teamId);
    await this.tokenStore
      .rewriteFieldsForUser(userId, { teamIds: JSON.stringify(teamIds) })
      .catch(() => {});
    return member;
  }
}
