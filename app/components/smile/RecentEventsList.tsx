import React from 'react';
import { View } from 'react-native';
import { Card } from '@/components/card';
import { Text } from '@/components/ui/text';
import { ToothEvent } from '@/types/teeth';

export default function RecentEventsList({ items }: { items: ToothEvent[] }) {
  return (
    <Card icon={<Text>🕘</Text>} title="Últimos Registros">
      <View>
        {items.map((it) => (
          <View key={it.id} style={{ marginBottom: 8 }}>
            <Text variant="h5">{it.toothType} • {it.eventType}</Text>
            <Text>{new Date(it.occurrenceDate).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
