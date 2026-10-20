Every change on a pod is recorded as an event. This page lists the event types an automation trigger can name, which
webhooks deliver and the event log returns.

Automation trigger patterns accept an exact type (`entity.create.completed`), an action wildcard (`entity.create.*`)
or a subject wildcard (`entity.*`). Filter keys are the fields a trigger can match on; the pod's trigger picker shows
them.

The backend also generates table-level event names (`{table}.{action}.{phase}`, for example
`entities.create.requested`) for schema documentation and admin introspection. Automation triggers do not match
those strings: use the types below.
