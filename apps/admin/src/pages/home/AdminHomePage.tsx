import { Panel, Shout } from '@cpm/ui';

export function AdminHomePage() {
  return (
    <div className="space-y-4">
      <Panel shadow="yellow">
        <Shout>欢迎回到 CPM 后台</Shout>
        <p className="mt-4 font-kuaile">
          骨架 + 双屏已就绪。下个 Phase 上线 HR-Agent 与 MCP；再下一个 Phase 上线签到与盲盒。
        </p>
      </Panel>
    </div>
  );
}
