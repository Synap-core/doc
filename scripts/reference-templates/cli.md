`@synap-core/cli` (command `synap`) connects computers and AI agents to a pod and works with the pod from a terminal.
It needs Node.js 20 or later.

```bash
npm install -g @synap-core/cli    # or run it once with: npx @synap-core/cli <command>
synap --help
synap <command> --help
```

`--pod <name>` works on every command: it runs that one command against a saved pod profile instead of the active
pod.

## Files and environment

| File | Contents |
|---|---|
| `~/.synap/credentials.json` | Your Synap account token. |
| `~/.synap/config.json` | Saved pods: URL, workspace, agent identity and key. (Older versions used `pod-config.json`.) |

Never commit them.

| Variable | Default |
|---|---|
| `SYNAP_CP_URL` | `https://api.synap.live` |
| `SYNAP_LANDING_URL` | `https://synap.live` |
