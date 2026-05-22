import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Panel, ComicButton, Shout, Stamp, Halftone } from '@cpm/ui';

interface Quiz { question: string; expect: string }

export function SigninPage() {
  const [params] = useSearchParams();
  const activityId = Number(params.get('a') ?? 0);
  const code = params.get('c') ?? '';
  const [step, setStep] = useState<'gps' | 'quiz' | 'submit' | 'ok' | 'fail'>('gps');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [answer, setAnswer] = useState('');
  const [quiz] = useState<Quiz>({
    question: '今天活动主题中哪个价值观最重要？（输入：客户至上 / 团队协作 / 创新求变 / 诚信务实 / 极致专注 / 学习成长）',
    expect: '客户至上',
  });
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 'gps') return;
    if (!navigator.geolocation) {
      setStep('quiz');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep('quiz');
      },
      () => setStep('quiz'),
      { timeout: 6000 },
    );
  }, [step]);

  const submit = async () => {
    setStep('submit');
    const token = localStorage.getItem('cpm_jwt');
    try {
      await axios.post('/api/v1/signin/check', {
        activityId, code,
        gpsLat: gps?.lat, gpsLng: gps?.lng,
        quizExpect: quiz.expect, quizAnswer: answer,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStep('ok');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; reason?: string } } };
      setReason(err?.response?.data?.error ?? err?.response?.data?.reason ?? String(e));
      setStep('fail');
    }
  };

  return (
    <Halftone className="min-h-screen p-4">
      <Panel shadow="yellow">
        <Shout tone="red">签到加分</Shout>
        <div className="mt-3 font-kuaile">活动 #{activityId}</div>

        {step === 'gps' && <div className="mt-4">正在获取定位...</div>}
        {step === 'quiz' && (
          <div className="mt-4 space-y-3">
            <div>{quiz.question}</div>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="block w-full p-2 border-3 border-ink rounded"
              placeholder="输入你的答案"
            />
            <ComicButton onClick={submit} tone="red">提交</ComicButton>
          </div>
        )}
        {step === 'submit' && <div className="mt-4">提交中...</div>}
        {step === 'ok' && (
          <div className="mt-4">
            <Stamp text="DONE" />
            <p className="mt-3">恭喜签到成功，积分已入账！</p>
          </div>
        )}
        {step === 'fail' && (
          <div className="mt-4">
            <Stamp text="FAIL" />
            <p className="mt-3 text-cRed">{reason}</p>
          </div>
        )}
      </Panel>
    </Halftone>
  );
}
