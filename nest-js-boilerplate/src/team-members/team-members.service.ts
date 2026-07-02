import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberInput } from './dto/create-team-member.input';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.teamMember.findMany({ orderBy: { joinedAt: 'asc' } });
  }

  create(userId: string, data: CreateTeamMemberInput) {
    return this.prisma.teamMember.create({
      data: {
        isLead: data.isLead,
        team: { connect: { id: data.teamId } },
        user: { connect: { id: userId } },
      },
    });
  }
}
