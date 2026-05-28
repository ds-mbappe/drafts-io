import { View, useColorScheme } from 'react-native';
import { Text } from 'heroui-native/text';

interface Stat {
  value: number;
  label: string;
}

interface Props {
  stats: [Stat, Stat, Stat];
}

function StatItem({ value, label }: Stat) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text className="text-xl font-bold">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

export function ProfileStatRow({ stats }: Props) {
  const isDark = useColorScheme() === 'dark';
  const dividerColor = isDark ? '#2C2C2E' : '#D4D4D8';

  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 24 }}>
      <StatItem {...stats[0]} />
      <View style={{ width: 1, backgroundColor: dividerColor }} />
      <StatItem {...stats[1]} />
      <View style={{ width: 1, backgroundColor: dividerColor }} />
      <StatItem {...stats[2]} />
    </View>
  );
}
