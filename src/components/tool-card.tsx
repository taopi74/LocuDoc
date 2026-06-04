import { router } from 'expo-router';
import { View } from 'react-native';

import { ServiceRowCard } from '@/components/ui/service-row-card';
import { type Feature } from '@/constants/features';

type Props = {
  feature: Feature;
  width: number;
};

export function ToolCard({ feature, width }: Props) {
  return (
    <View style={{ width }}>
      <ServiceRowCard
        icon={feature.icon}
        accent={feature.accent}
        title={feature.title}
        description={feature.subtitle}
        badge={feature.badge}
        onPress={() => router.push(feature.route)}
      />
    </View>
  );
}
