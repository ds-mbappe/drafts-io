'use client';

import Link from 'next/link';
import { Button } from '@heroui/react';
import { PenToolIcon } from 'lucide-react';
import { useNewDraftStore } from '@/stores/newDraftStore';

export const HomeActions = () => {
  const { open: openNewDraft } = useNewDraftStore();

  return (
    <div className="flex gap-3 items-center">
      <Button
        className="transition-all hover:scale-105 rounded-sm"
        variant="outline"
        onPress={openNewDraft}
      >
        <PenToolIcon />Write
      </Button>

      <Link href="/account/sign-up">
        <Button
          className="transition-all hover:scale-105 rounded-sm"
          variant="primary"
        >
          Join now
        </Button>
      </Link>
    </div>
  );
};
