import Slider from '@react-native-community/slider';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { c, font } from './theme';

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SliderRow({
  title,
  icon,
  value,
  onChange,
  min = 0,
  max = 1,
  format,
  accent = c.primary,
  leftLabel,
  rightLabel,
}: {
  title: string;
  icon?: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  format: (v: number) => string;
  accent?: string;
  leftLabel?: string;
  rightLabel?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={s.rowBetween}>
        <View style={s.row}>
          {icon}
          <Text style={s.label}>{title}</Text>
        </View>
        <Text style={[s.value, { color: accent }]}>{format(value)}</Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        onValueChange={onChange}
        minimumTrackTintColor={accent}
        maximumTrackTintColor={c.surfaceHighest}
        thumbTintColor={accent}
      />
      {leftLabel || rightLabel ? (
        <View style={s.rowBetween}>
          <Text style={s.hint}>{leftLabel}</Text>
          <Text style={s.hint}>{rightLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ToggleRow({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={s.rowBetween}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.hint}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.surfaceHighest, true: c.secondaryContainer }}
        thumbColor={value ? c.secondary : c.outline}
      />
    </View>
  );
}

export const s = StyleSheet.create({
  card: {
    backgroundColor: c.surfaceLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.outlineVariant,
    padding: 16,
    gap: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: c.onSurface, fontFamily: font.labelBold, fontSize: 12, letterSpacing: 1 },
  value: { fontFamily: font.labelBold, fontSize: 14 },
  title: { color: c.onSurface, fontFamily: font.headlineMed, fontSize: 16 },
  hint: { color: c.onSurfaceVariant, fontFamily: font.label, fontSize: 10 },
});
