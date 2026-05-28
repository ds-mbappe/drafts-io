import { Button, Kbd } from '@heroui/react';
import { SearchIcon } from 'lucide-react';

export const SearchControls = ({ onOpenSearch }: { onOpenSearch: () => void }) => (
  <>
    <Button size="sm" variant="secondary" onPress={onOpenSearch} className="hidden 2xl:!flex">
      <div className="flex justify-between w-[250px]">
        <div className="flex items-center gap-1">
          <SearchIcon />
          <p>{"Search"}</p>
        </div>

        <Kbd>⌘K</Kbd>
      </div>
    </Button>

    <Button variant="ghost" isIconOnly size="sm" className="2xl:hidden" onPress={onOpenSearch}>
      <SearchIcon />
    </Button>
  </>
);
