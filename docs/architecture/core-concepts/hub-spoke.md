---
sidebar_position: 2
---

# Hub & Spoke Model

**Understanding the distributed architecture of Synap**

---

## Overview

Synap uses a **Hub & Spoke** architecture where:
- **Data Pod** = Central Hub (data owner)
- **External Intelligence Services** = External Spokes (intelligence providers via marketplace)
- **Protocol** = Standardized communication (Hub Protocol V1.0)

---

## Architecture Diagram

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Hub & Spoke Architecture"
  value={`graph TD
    A[User] --> B[Data Pod - Hub]
    B --> C[External Service - Spoke]
    C --> D[Expert Agents]
    C --> E[External APIs]
    D --> C
    E --> C
    C --> B
    B --> A`} 
/>

---

## Components

### Data Pod (Hub)
- **Role**: Central data repository
- **Ownership**: User owns all data
- **Control**: Initiates all Hub requests
- **Storage**: PostgreSQL + R2/MinIO
- **Open Source**: Self-hostable

### External Intelligence Services (Spokes)
- **Role**: External intelligence providers
- **Ownership**: Third-party services (marketplace)
- **Control**: Respond to Data Pod requests
- **Storage**: No user data storage
- **Services**: Expert agents, specialized AI capabilities

---

## Communication Flow

### 1. User Request
User sends a request through the app → Data Pod

### 2. Local Analysis
Data Pod's local agent analyzes the request

### 3. Service Decision
If complex intelligence is needed, Data Pod calls external intelligence service

### 4. Token Generation
Data Pod generates a temporary access token

### 5. Data Request
Hub requests specific data with the token

### 6. Processing
Hub processes data with expert agents

### 7. Insight Return
Hub returns structured insights

### 8. Event Creation
Data Pod transforms insights into events

---

## Benefits

### Scalability
- Hub can scale independently
- Multiple Data Pods can connect
- No single point of failure

### Security
- Data Pod controls all access
- Temporary tokens only
- Complete audit trail

### Flexibility
- Users can self-host Data Pod
- Hub can evolve independently
- Protocol enables interoperability

---

## Protocol Standardization

The Hub Protocol V1.0 ensures:
- ✅ Type-safe communication (Zod schemas)
- ✅ Secure authentication (JWT tokens)
- ✅ Complete traceability (audit logs)
- ✅ Standardized insights (HubInsight schema)

---

**Next**: See [Hub Protocol Flow](../hub-protocol-flow.md) for detailed flow documentation.

