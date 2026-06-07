import { RadarChart2D, RadarChart3D } from '@cpm/ui';
import { useMemo } from 'react';

export interface PassportRadarProps {
  scoresByDimension: { dimensionId: number; dimensionCode: string; dimensionName: string; totalScore: number }[];
}

const isLowEndDevice = () => {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return mem <= 4;
};

const colorByCode: Record<string, string> = {
  customer_first: '#ff9f43',
  candor: '#4facfe',
  innovation: '#ff7eb3',
  ownership: '#6dd5a3',
};

export function PassportRadar({ scoresByDimension }: PassportRadarProps) {
  const data = useMemo(
    () =>
      scoresByDimension.map((s) => ({
        code: s.dimensionCode,
        name: s.dimensionName,
        score: s.totalScore,
        max: 200,
        color: colorByCode[s.dimensionCode] ?? '#1a1a1a',
      })),
    [scoresByDimension],
  );
  const low = isLowEndDevice();
  return low ? <RadarChart2D data={data} /> : <RadarChart3D data={data} />;
}
