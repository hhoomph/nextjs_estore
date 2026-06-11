# Consolidated Learnings

## Bun (v1.3.14+) on Windows

### Pattern: Bun reads npm cache config from `.npmrc`

Bun 在 Windows 上会读取 `.npmrc` 中的 `cache` 和 `prefix` 配置,并将其作为自己的包缓存目录。

**根因**: 如果 `.npmrc` 的 `cache` 路径指向只读目录(如 VS Installer 的 `M:\Programs Files\packages\npm`),Bun 会报 `AccessDenied accessing temporary directory` 错误。

**解决方案**:
1. 修改 `~/.npmrc` 中的 `cache` 为可写路径
2. 创建 `~/.bunfig.toml` 配置 `cacheDir`
3. 如果遇到 Windows Defender EPERM,第二次运行通常可以成功

**关键修复文件**:
```toml
# ~/.bunfig.toml
[install]
cacheDir = "C:\Users\<user>\.bun-cache"
```

```ini
# ~/.npmrc
cache=C:\Users\<user>\AppData\Local\npm-cache
prefix=M:\vm4w\nodejs
```

### Debugging Commands
```powershell
# 检查 npm 实际使用的缓存路径
npm config get cache
npm config get prefix

# 检查 Bun 版本
bun --version

# 清理 Bun 缓存
bun pm cache rm
```

## Windows 权限问题

### Pattern: VS Installer packages 目录是只读的
`M:\Programs Files\packages` 是 Visual Studio Installer 的 packages 目录。所有者是 `NT AUTHORITY\SYSTEM`,普通用户只有 `ReadAndExecute` 权限。**绝对不能**用这个路径作为 npm/Bun 的缓存目录。

### Pattern: Windows Defender EPERM
Bun 在缓存目录写入文件时可能遇到 `EPERM: Operation not permitted (NtSetInformationFile())`。这是 Windows Defender 实时保护导致的。解决方案:
1. 第二次运行 `bun install` 通常可以成功(已下载的包会被缓存)
2. 或者添加 Windows Defender 排除路径

---

## TypeScript 6.0

### Pattern: Stricter contravariant parameter checking on generic type aliases
TS 6.0 enforces stricter contravariant parameter checking on generic type aliases. Custom function types with narrower parameter types fail to assign to broader generic types like recharts' `Formatter<TValue, TName>`.

**Example**: A `formatter?: (value: string | number, name?: string) => [string, string]` prop fails when passed to recharts `<Tooltip>` because `ValueType` includes `readonly (string | number)[]`.

**Solution**: Either widen the parameter types to match the generic exactly, or use `as any` cast at the JSX prop level (pragmatic for third-party type mismatches).

**Key files**: `components/features/admin/analytics-chart.tsx`

---

## ESLint 10

### Pattern: eslint-plugin-react@7.x incompatible with ESLint 10
`eslint-plugin-react@7.37.x` uses `contextOrFilename.getFilename()` which was removed in ESLint 10. This affects projects using `eslint-config-next` which pulls in `eslint-plugin-react@7.x` as a dependency.

**Solution**: Pin ESLint to `^9.27.0` in package.json. The `eslint-config-next` ecosystem hasn't yet updated to support ESLint 10.

---

## Package Update Strategy

### Pattern: bun update only updates within semver ranges
`bun update` respects the `^` prefix in package.json and only updates to the latest version within that range. Major version bumps (e.g., `typescript` 5.x → 6.x) require explicitly changing the version in package.json.

**Approach**: Edit package.json directly with all target versions (both safe and major bumps), then run `bun install` once. This is faster and more predictable than running individual `bun add` commands.

### Pattern: Verifying build errors are pre-existing
When a build fails after package updates, stash changes and build with original versions to determine if the error is pre-existing or a regression. Use `git stash && bun install && bun run build && git stash pop`.

---

## Next.js / Turbopack

### Pattern: @better-auth/kysely-adapter Turbopack build error
`@better-auth/kysely-adapter` imports `DEFAULT_MIGRATION_LOCK_TABLE`/`DEFAULT_MIGRATION_TABLE` from `kysely@0.29.2` which no longer exports them. Turbopack's static ESM analysis catches this at build time. This is a known compatibility issue between better-auth and kysely versions, not related to package updates.

---

## Cline MCP Server Management

### Pattern: Bypass npx + shebang for stdio MCP servers (Universal Fix)
If a stdio MCP server fails with `Bun failed to remap this bin` or any shebang-resolution error:
1. `npm install -g <pkg>@latest`
2. Read `<pkg>/package.json` → `"bin"` field to find the real entry `.js` path
3. Configure Cline: `command: "node"`, `args: ["<absolute-path-to-entry.js>"]`

**Verified for**: `next-devtools-mcp`, `@magicuidesign/mcp`, `@agentdeskai/browser-tools-mcp`, `byterover-cli`

### Pattern: MCP config source of truth
`C:\Users\oomph\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` — not `.vscode/mcp.json`. Cline re-reads it on every server start.

### Pattern: `disabled: true` may not be durable
Cline resets `disabled` fields back to `false` on reload. The only reliable fix for a server the user wants active is to make it work. Disabling is only appropriate for servers the user does NOT need.

### Pattern: Detecting GitHub repo renames
If `github.com/org/repo` 404s or the MCP source isn't where the config says, use GitHub's `search_repositories` API to find the current name. Example: `campfirein/cipher` → `campfirein/byterover-cli`.

### Pattern: Streamable-HTTP vs SSE for MCP
A Cline MCP `type: "sse"` server that returns 405 on GET is Streamable HTTP. Verify with `curl -X POST` + an `initialize` JSON-RPC body. Fix: disable, switch transport, or run `mcp-remote` as stdio→http bridge.

### Pattern: MCP validation via temp file, not `node -e`
`node -e "..."` with Windows paths + quoting deadlocks in Git Bash MINGW. Persist the script to a file under `scripts/`, run it once.

### Pattern: Rollback backups for Cline MCP config
Keep three layers: `.pre-mcp-fix.bak`, `.pre-mcp-fix2.bak`, `.pre-mcp-fix3.bak`. Roll back by copying the chosen `.bak` over `cline_mcp_settings.json` and reloading Cline.
