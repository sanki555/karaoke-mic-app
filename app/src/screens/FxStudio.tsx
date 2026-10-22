import React from 'react';
import { Text, View } from 'react-native';
import { Card, SliderRow, ToggleRow, s } from '../ui/parts';
import { useStore } from '../ui/store';
import { c, font } from '../ui/theme';

export default function FxStudio() {
  const { params, set } = useStore();
  return (
    <View style={{ gap: 16 }}>
      <Card>
        <ToggleRow
          title="Flanger Modulator"
          subtitle="Short modulated delay with feedback"
          value={params.flangerOn}
          onChange={(v) => set({ flangerOn: v })}
        />
        <SliderRow
          title="LFO RATE"
          accent={c.secondary}
          value={params.flangerRate}
          min={0.05}
          max={5}
          onChange={(v) => set({ flangerRate: v })}
          format={(v) => `${v.toFixed(2)} Hz`}
          leftLabel="Slow"
          rightLabel="Fast"
        />
        <SliderRow
          title="DEPTH / WET MIX"
          accent={c.secondary}
          value={params.flangerIntensity}
          onChange={(v) => set({ flangerIntensity: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <SliderRow
          title="FEEDBACK"
          accent={c.secondary}
          value={params.flangerFeedback}
          max={0.9}
          onChange={(v) => set({ flangerFeedback: v })}
          format={(v) => `${Math.round((v / 0.9) * 100)}%`}
          leftLabel="Clean"
          rightLabel="Metallic"
        />
      </Card>

      <Card>
        <Text style={{ color: c.onSurface, fontFamily: font.headlineMed, fontSize: 16 }}>
          Studio Reverb Matrix
        </Text>
        <SliderRow
          title="REVERB MIX"
          value={params.reverbMix}
          onChange={(v) => set({ reverbMix: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          leftLabel="Dry"
          rightLabel="Wet"
        />
        <SliderRow
          title="DECAY TIME"
          value={params.reverbSize}
          min={0.4}
          max={4}
          onChange={(v) => set({ reverbSize: Math.round(v * 10) / 10 })}
          format={(v) => `${v.toFixed(1)} s`}
          leftLabel="Room"
          rightLabel="Infinite Stadium"
        />
        <SliderRow
          title="HIGH-FREQUENCY DAMPING"
          value={params.reverbDamping}
          onChange={(v) => set({ reverbDamping: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <Text style={s.hint}>Decay time rebuilds the room when you release the slider position.</Text>
      </Card>
    </View>
  );
}
