import React from 'react';
import { Card } from '@/components/card';
import { Text } from '@/components/ui/text';
import { Wrapper } from '@/components/wrapper';

export default function PredictionsCard({ items }: { items: any[] }) {
  return (
    <Card icon={<Text>📆</Text>} title="Previsões">
      {items.map((it) => (
        <Wrapper key={it.id} className="mb-2">
          <Text>{it.title}</Text>
          <Text variant="caption">Previsto: {new Date(it.expectedDate).toLocaleDateString()}</Text>
        </Wrapper>
      ))}
    </Card>
  );
}
