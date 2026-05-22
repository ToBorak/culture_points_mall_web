import { useEffect, useState } from 'react';
import axios from 'axios';
import { Panel, ComicButton, Halftone, Shout } from '@cpm/ui';
import { Link } from 'react-router-dom';

interface Item {
  ID: number;
  Type: string;
  Name: string;
  Cost: number;
  ImageURL: string;
}

export function MallPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('cpm_jwt');
    axios
      .get<{ items: Item[] }>('/api/v1/mall/items', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setItems(r.data.items))
      .catch(() => {});
  }, []);

  return (
    <Halftone className="min-h-screen p-4">
      <Shout tone="red">积分商城</Shout>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {items.map((it) => (
          <Panel key={it.ID} shadow={it.Type === 'blindbox' ? 'pink' : 'green'}>
            {it.ImageURL && (
              <img src={it.ImageURL} alt={it.Name} className="w-full h-24 object-contain" />
            )}
            <div className="font-kuaile mt-2">{it.Name}</div>
            <div className="font-bangers text-cRed text-xl mt-1">{it.Cost} 分</div>
            {it.Type === 'blindbox' ? (
              <Link to={`/mall/blindbox/${it.ID}`}>
                <ComicButton size="sm" tone="red">抽！</ComicButton>
              </Link>
            ) : (
              <ComicButton size="sm" tone="yellow">兑换</ComicButton>
            )}
          </Panel>
        ))}
      </div>
    </Halftone>
  );
}
