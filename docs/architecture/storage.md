---
sidebar_position: 6
---

# Storage System

**Hybrid storage architecture for Synap Backend**

---

## Overview

Synap uses a **hybrid storage system** that strictly separates:
- **Metadata**: Stored in PostgreSQL (fast, indexable)
- **Content**: Stored in R2/MinIO (economical, scalable)

This separation enables:
- ✅ **Performance**: Fast queries on metadata
- ✅ **Cost**: Content storage 15x cheaper
- ✅ **Scalability**: Unlimited content without DB impact
- ✅ **Flexibility**: Switch between R2 (production) and MinIO (local)

---

## Architecture

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Storage Architecture"
  value={`graph TD
    A[Application] --> B[Storage Factory]
    B --> C{R2 or MinIO?}
    C -->|Production| D[Cloudflare R2]
    C -->|Development| E[MinIO Local]
    D --> F[S3-Compatible API]
    E --> F`} 
/>

---

## Providers

### Cloudflare R2 (Production)

**Advantages**:
- ✅ Zero egress fees
- ✅ S3-compatible API
- ✅ 15x cheaper than PostgreSQL storage
- ✅ Unlimited scalability

**Configuration**:
```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=synap-storage
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### MinIO (Local Development)

**Advantages**:
- ✅ 100% S3-compatible
- ✅ Runs locally (Docker)
- ✅ Zero cloud dependencies
- ✅ Perfect for development

**Configuration**:
```env
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=synap-storage
```

---

## Usage

### Unified Interface

```typescript
import { storage } from '@synap/storage';

// Upload
const metadata = await storage.upload(
  'user-123/note-456.md',
  '# My Note\n\nContent here',
  { contentType: 'text/markdown' }
);

// Download
const content = await storage.download('user-123/note-456.md');

// Delete
await storage.delete('user-123/note-456.md');

// Build path
const path = storage.buildPath(userId, 'note', entityId, 'md');
// Returns: "user-123/note-456.md"
```

### Path Structure

Paths follow the pattern:
```
{userId}/{entityType}/{entityId}.{extension}
```

**Examples**:
- `user-123/note-abc-456.md`
- `user-123/task-xyz-789.md`
- `user-123/project-def-012.md`

---

## Data Separation

### Metadata (PostgreSQL)

Stored in the `entities` table:
```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,        -- 'note', 'task', 'project'
  title TEXT,
  preview TEXT,              -- First 500 characters
  file_url TEXT,              -- URL to content
  file_path TEXT,             -- Path in storage
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Content (R2/MinIO)

Stored as files in the storage:
- Format: Markdown, text, etc.
- Path: `{userId}/{type}/{id}.md`
- Metadata: Content-Type, size, checksum

---

## Best Practices

1. **Always use the unified interface** - `import { storage } from '@synap/storage'`
2. **Never access providers directly** - Use the abstraction
3. **Use `buildPath()`** - For generating paths
4. **Handle errors** - Providers can fail
5. **Test with MinIO locally** - R2 in production

---

**Next**: See [Deployment Overview](../../deployment/overview.md) for production setup.

