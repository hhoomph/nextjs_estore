$path='C:\Users\oomph\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json'
try {
    $j = Get-Content -Raw $path | ConvertFrom-Json
} catch {
    Write-Error "Failed to parse JSON: $_"
    exit 2
}
$errors = @()
foreach ($p in $j.mcpServers.psobject.Properties) {
    $name = $p.Name
    $srv = $p.Value
    if ($name -notmatch '^[a-zA-Z0-9._-]+$') { $errors += "Server name '$name' contains invalid characters" }
    $type = $srv.type
    if (-not $type) { $errors += "Server '$name' missing 'type' field" } else { if ($type -notin @('http','sse','stdio')) { $errors += "Server '$name' has unknown type '$type'" } }
    if ($null -eq $srv.timeout) { $errors += "Server '$name' missing 'timeout' field" } else { if (-not ($srv.timeout -is [int32] -or $srv.timeout -is [int64] -or $srv.timeout -is [double])) { $errors += "Server '$name' timeout not numeric" } }
    if ($type -in @('http','sse')) { if (-not $srv.url) { $errors += "Server '$name' of type '$type' missing 'url'" } }
    if ($type -eq 'stdio') { if (-not $srv.command) { $errors += "Server '$name' of type 'stdio' missing 'command'" } }
    if ($srv.command -and -not ($srv.command -is [string])) { $errors += "Server '$name' command must be string" }
    if ($srv.args -and -not ($srv.args -is [System.Object[]])) { $errors += "Server '$name' args must be array" } else { if ($srv.args) { foreach ($a in $srv.args) { if (-not ($a -is [string])) { $errors += "Server '$name' args contain non-string" } } } }
    if ($srv.autoApprove -and -not ($srv.autoApprove -is [System.Object[]])) { $errors += "Server '$name' autoApprove must be array" } else { if ($srv.autoApprove) { foreach ($ap in $srv.autoApprove) { if (-not ($ap -is [string])) { $errors += "Server '$name' autoApprove contains non-string" } } } }
    if ($srv.env) { if (-not ($srv.env -is [System.Management.Automation.PSCustomObject])) { $errors += "Server '$name' env should be object" } else { foreach ($k in $srv.env.psobject.Properties) { if (-not ($k.Value -is [string])) { $errors += "Server '$name' env.$($k.Name) value not string" } } } }
}
if ($errors.Count -eq 0) { Write-Output "VALIDATION PASSED: no issues found"; exit 0 } else { Write-Output "VALIDATION ERRORS:"; foreach ($e in $errors) { Write-Output "- $e" }; exit 2 }