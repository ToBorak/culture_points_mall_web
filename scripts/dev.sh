#!/usr/bin/env bash
# 前端独立开发脚本：装依赖 → 并行启 H5 + Admin
# 适合只改前端、后端已经跑着的场景
#
# 后端默认在 :8080，可改 BACKEND_URL 环境变量

set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BLUE=$'\033[36m'; RED=$'\033[31m'; RESET=$'\033[0m'
log() { printf '%s[%s] %s%s\n' "$BLUE" "$(date +%H:%M:%S)" "$*" "$RESET"; }
ok()  { printf '%s✓ %s%s\n' "$GREEN" "$*" "$RESET"; }
warn(){ printf '%s⚠ %s%s\n' "$YELLOW" "$*" "$RESET"; }
err() { printf '%s✗ %s%s\n' "$RED" "$*" "$RESET" >&2; }

OS_TYPE="$(uname -s)"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

install_brew_if_missing() {
  if command -v brew >/dev/null 2>&1; then return; fi
  if [[ "$OS_TYPE" != "Darwin" ]]; then return; fi
  log "安装 Homebrew…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  [[ -d "/opt/homebrew" ]] && eval "$(/opt/homebrew/bin/brew shellenv)"
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    ok "Node $(node --version) 已安装"
    return
  fi
  log "安装 Node…"
  if [[ "$OS_TYPE" == "Darwin" ]]; then brew install node
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get install -y nodejs npm
  else err "请手动安装 Node 18+"; exit 1; fi
  ok "Node 安装完成"
}

ensure_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    ok "pnpm $(pnpm --version) 已安装"
    return
  fi
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@latest --activate
  else
    npm install -g pnpm
  fi
  ok "pnpm 启用完成"
}

check_backend() {
  if curl -sf -m 2 "$BACKEND_URL/healthz" >/dev/null 2>&1; then
    ok "后端 $BACKEND_URL 已就绪"
  else
    warn "后端 $BACKEND_URL 未启动；前端可启动但 API 请求会失败"
    warn "请到后端仓库执行：./bootstrap.sh"
  fi
}

install_frontend_deps() {
  log "安装前端依赖（pnpm install）…"
  pnpm install --prefer-frozen-lockfile
  ok "依赖就绪"
}

start_dev() {
  log "启动 H5 :5173 + Admin :5174（pnpm dev）…"
  exec pnpm dev
}

main() {
  install_brew_if_missing
  ensure_node
  ensure_pnpm
  check_backend
  install_frontend_deps
  start_dev
}

main "$@"
