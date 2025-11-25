---
sidebar_position: 3
---

# Notes API

**Complete API reference for notes management**

---

## Create Note

```typescript
POST /trpc/notes.create
{
  "content": "# My Note\n\nContent here",
  "title": "My Note",
  "autoEnrich": true
}
```

---

## List Notes

```typescript
GET /trpc/notes.list
{
  "limit": 20,
  "offset": 0
}
```

---

## Get Note

```typescript
GET /trpc/notes.get
{
  "noteId": "note-123"
}
```

---

## Update Note

```typescript
POST /trpc/notes.update
{
  "noteId": "note-123",
  "content": "# Updated Note\n\nNew content"
}
```

---

## Delete Note

```typescript
POST /trpc/notes.delete
{
  "noteId": "note-123"
}
```

---

**Next**: See [Chat API](./chat.md) for conversational interface.

