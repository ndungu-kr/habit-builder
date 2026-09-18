import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// Non-virtualized list component for use as DraxList's `component` prop.
// Passing this to DraxList replaces its default FlatList, which prevents the
// "VirtualizedLists nested inside plain ScrollViews" warning (and the broken
// drag-preview positioning it causes) when DraxList sits inside a ScrollView.
// Safe for small lists (< ~20 items) where virtualization overhead isn't worth it.
export const PlainList = React.forwardRef<View, {
  data: any[];
  renderItem: (info: { item: any; index: number }) => React.ReactNode;
  keyExtractor: (item: any, index: number) => string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>(({ data, renderItem, keyExtractor, style, contentContainerStyle }, ref) => (
  <View ref={ref} style={[style, contentContainerStyle]}>
    {data.map((item, index) => (
      <View key={keyExtractor(item, index)}>
        {renderItem({ item, index })}
      </View>
    ))}
  </View>
));

PlainList.displayName = 'PlainList';