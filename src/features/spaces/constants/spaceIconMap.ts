import {
  IconBeach,
  IconBuilding,
  IconCalendarEvent,
  IconCar,
  IconCoffee,
  IconCreditCard,
  IconGasStation,
  IconHome,
  IconMapPin,
  IconPlane,
  IconPizza,
  IconPlus,
  IconReceipt,
  IconTag,
  IconTool,
  IconUserHeart,
  IconUsers,
  IconWallet,
  IconStar
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import type { SpaceIcon } from '../types/spaceIcon';

export const spaceIconMap: Record<SpaceIcon, TablerIcon> = {
  home: IconHome,
  building: IconBuilding,
  wallet: IconWallet,
  'credit-card': IconCreditCard,
  'pig-money': IconReceipt,
  'tools-kitchen-2': IconTool,
  pizza: IconPizza,
  coffee: IconCoffee,
  plane: IconPlane,
  beach: IconBeach,
  map: IconMapPin,
  car: IconCar,
  'gas-station': IconGasStation,
  users: IconUsers,
  'user-heart': IconUserHeart,
  'party-popper': IconPlus,
  cake: IconCoffee,
  'calendar-event': IconCalendarEvent,
  star: IconStar,
  tag: IconTag
};
