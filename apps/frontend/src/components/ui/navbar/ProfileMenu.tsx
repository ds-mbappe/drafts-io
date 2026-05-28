import { Avatar, Dropdown } from '@heroui/react';
import type { MenuItem, UserAwareProps } from './types';

export const ProfileMenu = ({
  user,
  menuItems,
}: UserAwareProps & {
  menuItems: MenuItem[];
}) => (
  <Dropdown>
    <Dropdown.Trigger>
      <button className="cursor-pointer">
        <Avatar color="accent" size="sm">
          <Avatar.Image src={user?.avatar ? user.avatar : undefined} />
          <Avatar.Fallback>{user?.email?.split("")?.[0]?.toUpperCase()}</Avatar.Fallback>
        </Avatar>
      </button>
    </Dropdown.Trigger>

    <Dropdown.Popover placement="bottom end">
      <Dropdown.Menu aria-label="Profile Actions">
        <Dropdown.Item id="email" textValue={`signed_in_as`} className="h-14 gap-2">
          <p>{'Signed in as'}</p>
          <p className="font-semibold">{`${user?.firstname} ${user?.lastname}`}</p>
        </Dropdown.Item>

        <>
          {menuItems.map(({ key, label, icon: Icon, onPress, className, danger }) => (
            <Dropdown.Item
              id={key}
              textValue={label}
              className={className}
              variant={danger ? "danger" : undefined}
              onAction={onPress}
            >
              <Icon />{label}
            </Dropdown.Item>
          ))}
        </>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown>
);
