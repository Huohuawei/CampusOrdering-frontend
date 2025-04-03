 <#
.SYNOPSIS
  批量创建 Vue3 路由空文件结构
.DESCRIPTION
  仅创建文件不写入内容，生成：
  - routes/ 下的三个角色路由文件
  - guards/ 下的两个守卫文件
  - 路由主入口文件 index.ts
#>

# 配置项目路径（请修改为你的实际路径）
$projectRoot = "F:\GithubDeskTop\project\CampusOrdering"
$routerPath = Join-Path $projectRoot "src\router"

# 1. 创建目录结构
$structure = @{
    "routes" = @("user.routes.ts", "merchant.routes.ts", "admin.routes.ts")
    "guards" = @("auth.guard.ts", "role.guard.ts")
}

# 2. 创建目录和空文件
foreach ($item in $structure.GetEnumerator()) {
    if ($item.Key -match "/") {
        # 处理子目录
        $dirPath = Join-Path $routerPath $item.Key
        if (-not (Test-Path $dirPath)) {
            New-Item -Path $dirPath -ItemType Directory | Out-Null
        }
        
        # 创建目录下的文件
        foreach ($file in $item.Value) {
            $filePath = Join-Path $dirPath $file
            if (-not (Test-Path $filePath)) {
                New-Item -Path $filePath -ItemType File | Out-Null
                Write-Host "创建文件: $filePath" -ForegroundColor Green
            }
        }
    } else {
        # 处理根目录文件
        if ($item.Value -eq $null) {
            $filePath = Join-Path $routerPath $item.Key
            if (-not (Test-Path $filePath)) {
                New-Item -Path $filePath -ItemType File | Out-Null
                Write-Host "创建文件: $filePath" -ForegroundColor Green
            }
        }
    }
}
