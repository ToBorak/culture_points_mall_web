import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { Panel, Shout } from '@cpm/ui';

export function ActivityCodePage() {
  const { id } = useParams();
  const [code, setCode] = useState<string | null>(null);
  const activityId = Number(id);
  const h5Base = window.location.origin.replace(':5174', ':5173');

  useEffect(() => {
    const wsURL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host.replace(':5174', ':8080')}/admin/activities/${activityId}/signin-codes/stream`;
    const ws = new WebSocket(wsURL);
    ws.onmessage = (ev) => {
      try {
        const obj = JSON.parse(ev.data) as { code: string };
        setCode(obj.code);
      } catch {
        // ignore parse errors
      }
    };
    return () => ws.close();
  }, [activityId]);

  const url = code ? `${h5Base}/signin?a=${activityId}&c=${code}` : '';

  return (
    <div>
      <Shout tone="green">活动 #{activityId} 签到大屏</Shout>
      <Panel shadow="green" className="mt-4 flex items-center justify-center" style={{ minHeight: 400 }}>
        {code ? (
          <div className="flex flex-col items-center">
            <QRCodeCanvas value={url} size={300} bgColor="#fffef8" fgColor="#1a1a1a" />
            <div className="mt-3 font-bangers text-3xl">CODE: {code}</div>
            <div className="mt-1 text-xs text-ink/60">每 30s 自动刷新</div>
          </div>
        ) : (
          <div>连接中...</div>
        )}
      </Panel>
    </div>
  );
}
