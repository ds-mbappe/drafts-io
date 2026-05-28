import { Button, Dropdown } from '@heroui/react';
import { THEME_OPTIONS } from './constants';
import type { ThemeKey } from './types';

export const ThemeSwitcher = ({
  theme,
  onSwitch,
}: {
  theme?: string;
  onSwitch: (value: ThemeKey) => void;
}) => {
  const currentThemeOption = THEME_OPTIONS.find((option) => option.key === theme?.toString());
  const CurrentIcon = currentThemeOption?.icon;

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button id="trigger-theme" isIconOnly variant="ghost" size="sm" className="rounded-sm">
          {CurrentIcon && <CurrentIcon />}
        </Button>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Theme switcher" disabledKeys={[`${theme}_theme`]}>
          {THEME_OPTIONS.map(({ key, label, icon: Icon }) => (
            <Dropdown.Item
              key={`${key}_theme`}
              id={`${key}_theme`}
              textValue={label}
              onAction={() => onSwitch(key)}
            >
              <Icon />{label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
