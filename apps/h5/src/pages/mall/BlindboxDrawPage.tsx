import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import { BlindboxWheel, ComicButton, Panel, Shout, Stamp } from '@cpm/ui';
import goldDust from './goldDust.json';

interface DrawResp {
  win: boolean;
  prizeName: string;
  prizeImage?: string;
  amount: number;
}

interface Prize {
  id: number;
  prizeName: string;
  prizeImage: string;
  weight: number;
}

export function BlindboxDrawPage() {
  const { id } = useParams();
  const boxId = Number(id);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<DrawResp | null>(null);
  const [resultIdx, setResultIdx] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    // 奖品池在真实场景下可通过 API 获取；当前用静态数据演示
    setPrizes([
      { id: 1, prizeName: '未中奖', prizeImage: '', weight: 60 },
      { id: 2, prizeName: '咖啡券', prizeImage: '', weight: 25 },
      { id: 3, prizeName: '帆布袋', prizeImage: '', weight: 10 },
      { id: 4, prizeName: 'T 恤', prizeImage: '', weight: 5 },
    ]);
  }, [boxId]);

  const segments = prizes.map((p, i) => ({
    label: p.prizeName,
    color: (['#a8a8a8', '#ff9f43', '#4facfe', '#ff7eb3'] as const)[i % 4],
  }));

  const draw = async () => {
    setShowReveal(false);
    setSpinning(true);
    try {
      const token = localStorage.getItem('cpm_jwt');
      const { data } = await axios.post<DrawResp>(
        '/api/v1/mall/blindbox/draw',
        { boxId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const idx = prizes.findIndex((p) => p.prizeName === data.prizeName);
      setResultIdx(idx >= 0 ? idx : 0);
      setResult(data);
    } catch (_e) {
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper p-4 flex flex-col items-center">
      {result?.win && <Lottie animationData={goldDust} loop={false} className="fixed inset-0 pointer-events-none" />}
      <Panel shadow="purple">
        <Shout tone="pink">盲盒抽奖 · {boxId}</Shout>
      </Panel>
      <BlindboxWheel
        segments={segments}
        spinning={spinning}
        resultIndex={resultIdx}
        onSpinEnd={() => {
          setSpinning(false);
          setShowReveal(true);
        }}
      />
      <ComicButton size="lg" tone="red" onClick={draw} disabled={spinning}>
        {spinning ? '旋转中…' : '抽！'}
      </ComicButton>
      {showReveal && result && (
        <Panel shadow={result.win ? 'yellow' : 'blue'} className="mt-4">
          {result.win ? (
            <div className="flex flex-col items-center">
              <Stamp text="WIN!" color="red" />
              <div className="font-qingke text-2xl mt-2">🎉 {result.prizeName}</div>
              <div className="text-sm text-ink/60">已扣除 {result.amount} 积分</div>
            </div>
          ) : (
            <div className="text-center">
              <Stamp text="差一点!" color="blue" />
              <p className="mt-3 font-kuaile">
                本次未中奖，<b>不扣分</b>，下次更近一步！
              </p>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
