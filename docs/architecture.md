# Architecture overview

> High-level architecture of the boilers stack. For detailed design decisions, see
> `docs/adr/`. For the roadmap, see `docs/todo/README.md`.

## Stack diagram

```mermaid
graph TB
    subgraph Browser["Browser"]
        RSC["Next.js App<br/>(RSC + Client Components)"]
        SW["Service Worker<br/>(Push + Cache)"]
        WS["WebSocket Client<br/>(useMessaging)"]
    end

    subgraph Nextjs["Next.js Server (BFF)"]
        proxy["proxy.ts<br/>(Middleware: i18n, CSP, Auth)"]
        RH["Route Handlers<br/>(/api/*)"]
        RSC_SERVER["Server Components<br/>(RSC + Server Actions)"]
    end

    subgraph NestJS["NestJS Backend"]
        direction TB
        GraphQL["GraphQL API<br/>(Apollo Server)"]
        REST["REST API<br/>(OpenAPI/Swagger)"]
        GRPC["gRPC Services"]
        WS_GATEWAY["WebSocket Gateways<br/>(Messaging + Realtime)"]
        SSE["SSE Endpoint"]

        subgraph Services["Business Services"]
            Auth["Auth Module<br/>(Passport + JWT + Session)"]
            Social["Social Module<br/>(Posts, Comments, Reactions)"]
            Billing["Billing Module<br/>(Tiers + Mock Payments)"]
            Messaging["Messaging Module<br/>(DMs + Chat Rooms)"]
            Notifications["Notifications Module<br/>(In-app + Push)"]
            Admin["Admin Module<br/>(Roles + Tier Management)"]
            Profile["Profile Module<br/>(User Settings)"]
            Upload["Upload Module<br/>(MinIO + Image Processing)"]
        end

        subgraph Infra["Infrastructure Services"]
            Queue["BullMQ Job Queue"]
            Outbox["Transactional Outbox"]
            Mail["Mail Service<br/>(Resend/SMTP)"]
            OTel["OpenTelemetry<br/>(Traces)"]
        end
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL<br/>(Prisma ORM)"]
        Redis[("Redis<br/>(Session Cache + Pub/Sub)"]
        MinIO[("MinIO<br/>(S3 Object Storage)"]
        ES[("Elasticsearch<br/>(Audit Logs)"]
    end

    subgraph Messaging_Infra["Message Brokers"]
        Kafka[("Kafka<br/>(Frontend Events)"]
        RabbitMQ[("RabbitMQ<br/>(AMQP)"]
        NATS[("NATS<br/>(JetStream)"]
        MQTT[("MQTT<br/>(IoT)"]
    end

    %% Flows
    Browser -->|HTTP| Nextjs
    Browser -->|WebSocket| WS_GATEWAY
    SW -->|Push API| Notifications

    proxy -->|Route| RH
    proxy -->|Route| RSC_SERVER
    RH -->|GraphQL + REST| NestJS
    RSC_SERVER -->|Server Fetch| NestJS

    GraphQL --> Auth
    GraphQL --> Social
    GraphQL --> Billing
    GraphQL --> Messaging
    GraphQL --> Notifications
    GraphQL --> Admin
    GraphQL --> Profile
    REST --> Upload

    Auth --> Redis
    Auth --> PG
    Social --> PG
    Billing --> PG
    Billing --> Redis
    Messaging --> PG
    Messaging --> Redis
    Notifications --> PG
    Notifications --> Redis
    Upload --> MinIO
    Admin --> PG
    Admin --> Redis
    Profile --> PG
    Profile --> Redis

    Outbox --> PG
    Outbox --> Queue
    Queue --> Mail
    Queue --> Notifications
    Queue --> ES

    Notifications -.->|VAPID| SW
    Mail -.->|SMTP/Resend| Email["Email (User)"]

    %% Styling
    classDef browser fill:#e1f5fe,stroke:#01579b
    classDef nextjs fill:#fff3e0,stroke:#e65100
    classDef nestjs fill:#e8f5e9,stroke:#1b5e20
    classDef data fill:#f3e5f5,stroke:#4a148c
    classDef broker fill:#fff8e1,stroke:#f57f17
    classDef external fill:#fce4ec,stroke:#b71c1c

    class Browser browser
    class Nextjs nextjs
    class NestJS,GraphQL,REST,GRPC,WS_GATEWAY,SSE nestjs
    class PG,Redis,MinIO,ES data
    class Kafka,RabbitMQ,NATS,MQTT broker
    class Email external
```

## Data flow patterns

### Authenticated request (BFF path)

```
Browser              Next.js BFF                  NestJS Backend         Redis/Postgres
   │                     │                             │                     │
   │── GET /v1/feed ────>│                             │                     │
   │                     │── sessionTokenHeaders() ────>│                     │
   │                     │── graphqlFetch(query) ──────>│                     │
   │                     │                             │── HGETALL ──────────>│
   │                     │                             │<── session data ─────│
   │                     │                             │── (optional PG) ────>│
   │                     │<── response ────────────────│                     │
   │<── SSR page ────────│                             │                     │
```

### Real-time messaging

```
Browser              NestJS Gateway              Redis               Other Browser
   │                     │                         │                     │
   │── ws connect ──────>│                         │                     │
   │── {type:"auth"} ───>│── HGETALL ──────────────>│                     │
   │<── authenticated ───│                         │                     │
   │── {type:"message"} ─>│── PUBLISH ─────────────>│                     │
   │                     │                         │── SUBSCRIBE ────────>│
   │                     │<────────────────────────│                     │
   │                     │── PG insert ────────────>│                     │
   │<── {type:"message"} │                         │                     │
   │                     │── {type:"message"} ────────────────────────────>│
```

## Service ports

| Service | Port | Profile |
|---------|------|---------|
| Next.js (frontend) | 3100 | core |
| NestJS (backend) | 3000 | core |
| gRPC | 5050 | core |
| Postgres | 5432 | core |
| Redis | 6379 | core |
| Elasticsearch | 9200 | core |
| Kibana | 5601 | core |
| Fluent Bit | 24224 | core |
| MinIO API | 9000 | core |
| MinIO Console | 9001 | core |
| RabbitMQ | 5672 | brokers |
| NATS | 4222 | brokers |
| MQTT | 1883 | brokers |
| Kafka | 29092 | kafka |
| MongoDB | 27017 | mongo |
| Mailpit SMTP | 1025 | mail |
| Mailpit UI | 8025 | mail |
| Redis Commander | 8081 | tools |
