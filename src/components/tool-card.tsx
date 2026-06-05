import { router } from 'expo-router';
import { View } from 'react-native';

import { ServiceRowCard } from '@/components/ui/service-row-card';
import { type Feature } from '@/constants/features';

type Props = {
  feature: Feature;
  width: number;
};

const COMPACT_CARD_WIDTH = 420;

export function ToolCard({ feature, width }: Props) {
  const compact = width < COMPACT_CARD_WIDTH;

  return (
    <View style={{ width }}>
      <ServiceRowCard
        icon={feature.icon}
        accent={feature.accent}
        title={feature.title}
        description={compact ? feature.tagline : feature.subtitle}
        badge={feature.badge}
        compact={compact}
        onPress={() => router.push(feature.route)}
      />
    </View>
  );
}
