---
sidebar_position: 1
---

# Contributing to Core

**Help improve Data Pod for everyone**

---

## Two Ways to Contribute

### 1. Core Features

Add fundamental capabilities to Data Pod:
- Database improvements
- API infrastructure
- Performance optimizations
- Security enhancements

**Guide**: This section

### 2. Plugins

Extend Data Pod with new features:
- Add specific capabilities
- AI integrations
- Custom workflows

**Guide**: [Extending Synap →](../extending/overview)

---

## When to Contribute Core vs Plugin

**Core contribution** when:
- ✅ Benefits all users
- ✅ Infrastructure/foundation
- ✅ Performance/security critical
- ✅ Requires deep integration

**Plugin** when:
- ✅ Specific use case
- ✅ Optional functionality
- ✅ Can be modular
- ✅ AI/external service

**Not sure?** Open a discussion on GitHub!

---

## Getting Started

### 1. Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/backend.git
cd backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Start Services

```bash
docker compose up -d  # PostgreSQL, MinIO, Kratos, etc.
cd apps/api && pnpm dev
```

---

## Monorepo Structure

```
synap-backend/
├── apps/
│   └── api/              # Main API application
├── packages/
│   ├── api/              # tRPC routers
│   ├── database/         # Schema, migrations
│   ├── events/           # Event types
│   ├── client/           # SDK
│   └── core/             # Shared utilities
└── services/
    └── intelligence/     # Example service
```

**Key principle**: Packages are reusable, apps consume them.

[Learn more →](./monorepo-structure)

---

## Development Workflow

### 1. Create Branch

```bash
git checkout -b feature/my-improvement
```

### 2. Make Changes

Follow these guides:
- [Adding Routers](./router-development)
- [Database Changes](./database-migrations)
- [Working with Events](./event-system)

### 3. Test

```bash
pnpm test
pnpm build  # Check for errors
```

### 4. Submit PR

```bash
git push origin feature/my-improvement
# Open PR on GitHub
```

---

## Code Standards

- **TypeScript**: Strict mode enabled
- **Style**: Prettier + ESLint (auto-format on save)
- **Tests**: Required for new features
- **Commits**: Clear, descriptive messages

[Code Style Guide →](./code-style)

---

## Common Tasks

### Add New API Endpoint
→ [Router Development](./router-development)

### Add Database Table
→ [Database Migrations](./database-migrations)

### Add Event Type
→ [Event System](./event-system)

### Fix Bug
→ [Testing Guide](./testing)

---

## Getting Help

- **Questions**: Open GitHub discussion
- **Bugs**: Create GitHub issue
- **Ideas**: Start a discussion first

---

## Next Steps

1. **Understand structure** → [Monorepo Guide](./monorepo-structure)
2. **Pick a task** → Check GitHub issues labeled "good first issue"
3. **Make changes** → Follow development guides
4. **Submit PR** → We'll review and help!

**Thank you for contributing! 🎉**
