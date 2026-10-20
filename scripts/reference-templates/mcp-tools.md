These are the tools a pod exposes over [MCP](/docs/build/agents/mcp). Every name starts with `synap_`. An MCP client
lists the same tools with `tools/list`.

- **Listing groups.** A new agent key lists only the entry tools. It lists another group once the agent loads it
  with `synap_load_skill('tools:<group>')`; `tools:builder` loads them all. Keys created before tool profiles
  existed, and keys with the `builder` profile, list every tool. A group narrows the listing only; it is not a
  permission.
- **Permissions.** What a key can call depends on its scopes and grant, checked when the tool runs: see
  [MCP scopes](/docs/build/agents/mcp#scopes). Every write tool goes through the pod's governance, so most writes
  become proposals.
- **Read-only** marks tools whose `readOnlyHint` annotation is set.
