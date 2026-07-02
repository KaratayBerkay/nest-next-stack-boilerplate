import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { gql, registerAndLogin } from './utils/auth';

// Proves the TeamMember resolver end-to-end over GraphQL: traverses FK depth
// (TeamMember -> Team -> Organization -> User) via the JWT user + a flat teamId, behind the
// JWT guard. TeamMember has no schema-generated validators, so this asserts wiring (and the
// hand-written @IsUUID). Requires Postgres + Redis (docker compose up -d).
describe('TeamMembers GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let teamId: string;

  const clearDb = async () => {
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await clearDb();

    const auth = await registerAndLogin(app);
    token = auth.accessToken;
    userId = auth.userId;

    // Seed the FK chain: Organization (owned by the user) -> Team.
    const org = await prisma.organization.create({
      data: { name: 'Acme', slug: `acme-${Date.now()}`, ownerId: userId },
    });
    const team = await prisma.team.create({
      data: { name: 'Core', organizationId: org.id },
    });
    teamId = team.id;
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  it('requires a bearer token (JwtAuthGuard)', async () => {
    const denied = await gql(app, `{ teamMembers { id } }`);
    expect(denied.errors).toBeDefined();
  });

  it('creates a TeamMember (TeamMember->Team->Org->User FK chain)', async () => {
    const body = await gql<{
      createTeamMember: {
        id: string;
        isLead: boolean;
        teamId: string;
        userId: string;
      };
    }>(
      app,
      `mutation { createTeamMember(data: { teamId: "${teamId}", isLead: true }) {
        id isLead teamId userId } }`,
      token,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data!.createTeamMember).toMatchObject({
      isLead: true,
      teamId,
      userId,
    });
  });

  it('rejects a non-UUID teamId via @IsUUID', async () => {
    const body = await gql(
      app,
      `mutation { createTeamMember(data: { teamId: "not-a-uuid" }) { id } }`,
      token,
    );
    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/teamId|uuid/i);
  });

  it('lists team members for an authenticated caller', async () => {
    const body = await gql<{ teamMembers: { id: string; isLead: boolean }[] }>(
      app,
      `{ teamMembers { id isLead } }`,
      token,
    );
    expect(body.errors).toBeUndefined();
    expect(body.data!.teamMembers.length).toBeGreaterThanOrEqual(1);
  });
});
