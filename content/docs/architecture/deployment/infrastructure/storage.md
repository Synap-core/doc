---
sidebar_position: 2
---

# Storage Setup

**File storage configuration for production**

---

## Overview

Synap uses object storage (S3-compatible) for file content, keeping metadata in PostgreSQL.

---

## Providers

### Cloudflare R2 (Recommended)

**Advantages**:
- Zero egress fees
- S3-compatible API
- Cost-effective
- Global CDN

**Setup**:
1. Create R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Configure in `.env`:

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=synap-storage
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### AWS S3

```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_BUCKET_NAME=synap-storage
```

### MinIO (Self-Hosted)

```env
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=synap-storage
```

---

## Bucket Configuration

### CORS Setup

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Lifecycle Policies

Configure lifecycle policies for:
- Old file cleanup
- Cost optimization
- Compliance requirements

---

## Security

### Access Control

- Use IAM roles (AWS) or API tokens (R2)
- Never expose credentials in code
- Use presigned URLs for temporary access
- Enable bucket versioning (optional)

---

## Monitoring

### Key Metrics

- Storage usage
- Request rates
- Error rates
- Cost tracking

---

**Next**: See [Production Deployment](../data-pod/production.md) for complete setup.
