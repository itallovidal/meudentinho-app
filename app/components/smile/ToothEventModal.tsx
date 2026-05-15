import React, { useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { Wrapper } from '@/components/wrapper';
import { Text } from '@/components/ui/text';
// DateTimePicker removed to avoid extra dependency; using simple date input placeholder
import { ToothEvent } from '@/types/teeth';

export default function ToothEventModal({ visible, toothId, onClose, onSubmit }: {
  visible: boolean;
  toothId: string | null;
  onClose: () => void;
  onSubmit: (payload: Omit<ToothEvent, 'id'>) => Promise<void>;
}) {
  const [date, setDate] = useState(new Date());
  const [eventType, setEventType] = useState<'eruption' | 'exfoliation'>('eruption');

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Wrapper className="flex-1 justify-end bg-black/40 p-4">
        <Wrapper className="bg-white rounded-t-xl p-4">
          <Text variant="h4">Registrar Evento</Text>
          <Text className="mt-2">Dente: {toothId}</Text>

          <Wrapper className="flex-row gap-2 mt-4">
            <TouchableOpacity onPress={() => setEventType('eruption')} className={`px-3 py-2 rounded ${eventType==='eruption' ? 'bg-primary-200' : 'bg-base-200'}`}>
              <Text>Erupção</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEventType('exfoliation')} className={`px-3 py-2 rounded ${eventType==='exfoliation' ? 'bg-primary-200' : 'bg-base-200'}`}>
              <Text>Exfoliação</Text>
            </TouchableOpacity>
          </Wrapper>

          <Wrapper className="mt-4">
            <Text>Data: {date.toLocaleDateString()}</Text>
          </Wrapper>

          <Wrapper className="flex-row gap-2 mt-4">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded bg-base-200">
              <Text>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              if (!toothId) return;
              onSubmit({ occurrenceDate: date.toISOString(), dentition: 'permanent', arch: 'upper', side: 'left', toothType: 'central_incisor', eventType });
            }} className="px-4 py-2 rounded bg-primary-700">
              <Text className="text-white">Salvar</Text>
            </TouchableOpacity>
          </Wrapper>
        </Wrapper>
      </Wrapper>
    </Modal>
  );
}
