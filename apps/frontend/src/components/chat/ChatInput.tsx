import React, { useState } from 'react';
import { Button, TextArea } from '@heroui/react';
import { SendHorizonalIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const t = useTranslations('aiChat');
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 border-t border-divider">
      <TextArea
        rows={1}
        variant="secondary"
        placeholder={t('inputPlaceholder')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        isIconOnly
        variant="primary"
        onPress={handleSend}
        isDisabled={!value.trim() || disabled}
        className="mb-0.5 shrink-0"
      >
        <SendHorizonalIcon size={18} />
      </Button>
    </div>
  );
}
