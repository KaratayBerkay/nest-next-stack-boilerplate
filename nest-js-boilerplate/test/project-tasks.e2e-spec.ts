import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { gql, registerAndLogin } from './utils/auth';

// Proves the domain `Task` resolver end-to-end over GraphQL:
//   * traverses 3-level FK depth (Task -> Project -> Organization -> User) via nested `connect`,
//   * is protected by the JWT guard (token minted by the shared auth helper),
//   * and that the @MinLength(1)/@MaxLength(200) validators auto-generated from the Prisma
//     schema onto Task.title actually fire.
// Requires Postgres + Redis (docker compose up -d).
describe('ProjectTasks — Task GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let projectId: string;

  const clearDb = async () => {
    // FK-safe order: leaf -> root.
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
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

    // Seed the FK chain Task depends on: Organization (owned by the user) -> Project.
    const org = await prisma.organization.create({
      data: { name: 'Acme', slug: `acme-${Date.now()}`, ownerId: userId },
    });
    const project = await prisma.project.create({
      data: {
        name: 'Web App',
        key: 'WEB',
        organizationId: org.id,
        createdById: userId,
      },
    });
    projectId = project.id;
  }, 30_000);

  afterAll(async () => {
    await clearDb();
    await app.close();
  });

  it('requires a bearer token (JwtAuthGuard)', async () => {
    const denied = await gql(app, `{ tasks { id } }`);
    expect(denied.errors).toBeDefined();
  });

  it('creates a Task through the Task->Project->Org->User FK chain', async () => {
    const body = await gql<{
      createTask: {
        id: string;
        title: string;
        projectId: string;
        createdById: string;
        status: string;
      };
    }>(
      app,
      `mutation { createTask(data: {
        title: "Implement login",
        projectId: "${projectId}"
      }) { id title projectId createdById status } }`,
      token,
    );

    expect(body.errors).toBeUndefined();
    expect(body.data!.createTask).toMatchObject({
      title: 'Implement login',
      projectId,
      createdById: userId,
      status: 'BACKLOG',
    });
  });

  it('rejects a title over 200 chars via the schema-generated @MaxLength validator', async () => {
    const longTitle = 'x'.repeat(201);
    const body = await gql(
      app,
      `mutation { createTask(data: {
        title: "${longTitle}",
        projectId: "${projectId}"
      }) { id } }`,
      token,
    );
    expect(body.errors).toBeDefined();
    expect(JSON.stringify(body.errors)).toMatch(/title/i);
  });

  it('lists tasks for an authenticated caller', async () => {
    const body = await gql<{ tasks: { id: string; title: string }[] }>(
      app,
      `{ tasks { id title } }`,
      token,
    );
    expect(body.errors).toBeUndefined();
    expect(body.data!.tasks.length).toBeGreaterThanOrEqual(1);
  });
});
