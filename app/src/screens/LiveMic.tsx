import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, SliderRow, ToggleRow } from '../ui/parts';
import { useStore } from '../ui/store';
import { c, font } from '../ui/theme';

const BARS = 24;

function Waveform({ level, active }: { level: number; active: boolean }) {
  return (
    <View style={styles.wave}>
      {Array.from({ length: BARS }, (_, i) => {
        const shape = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.9));
        const h = active ? 6 + level * 44 * shape : 4;
        return <View key={i} style={[styles.bar, { height: h, opacity: active ? 1 : 0.3 }]} />;
      })}
    </View>
  );
}

export default function LiveMic() {
  const { params, set, live, toggleLive, level, error } = useStore();
  const onAir = live && !params.muted;

  const onPress = async () => {
    if (!live) await toggleLive();
    else set({ muted: !params.muted });
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={styles.statusPill}>
        <View style={[styles.dot, { backgroundColor: live ? c.primary : c.outline }]} />
        <Text style={styles.statusText}>
          {live ? 'BROADCASTING TO CURRENT AUDIO OUTPUT' : 'TAP THE MIC TO GO LIVE'}
        </Text>
      </View>

      <View style={styles.micWrap}>
        <Pressable onPress={onPress} style={[styles.mic, onAir && styles.micOn]}>
          <MaterialCommunityIcons
            name={params.muted && live ? 'microphone-off' : 'microphone'}
            size={44}
            color={onAir ? c.primary : c.outline}
          />
          <Text style={[styles.micTitle, onAir && { color: c.onSurface }]}>
            {!live ? 'START' : params.muted ? 'MUTED' : 'ON AIR'}
          </Text>
          <Text style={styles.micSub}>{!live ? 'TAP TO GO LIVE' : 'TAP TO MUTE'}</Text>
        </Pressable>
      </View>

      <Waveform level={level} active={onAir} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {live ? (
        <Pressable onPress={toggleLive} style={styles.stop}>
          <Text style={styles.stopText}>STOP BROADCAST</Text>
        </Pressable>
      ) : null}

      <Card>
        <SliderRow
          title="MASTER VOLUME"
          value={params.volume}
          onChange={(v) => set({ volume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          leftLabel="0%"
          rightLabel="100%"
        />
      </Card>

      <Card>
        <SliderRow
          title="KARAOKE REVERB"
          value={params.reverbMix}
          onChange={(v) => set({ reverbMix: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          leftLabel="Dry"
          rightLabel="Wet"
        />
      </Card>

      <Card>
        <ToggleRow
          title="Flanger Effect"
          subtitle="Jet sweep & modulation"
          value={params.flangerOn}
          onChange={(v) => set({ flangerOn: v })}
        />
        <SliderRow
          title="SWEEP INTENSITY"
          accent={c.secondary}
          value={params.flangerIntensity}
          onChange={(v) => set({ flangerIntensity: v })}
          format={(v) => `${Math.round(v * 100)}%`}
          leftLabel="Subtle"
          rightLabel="Jet Swirl"
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: c.onSurfaceVariant, fontFamily: font.label, fontSize: 10, letterSpacing: 1 },
  micWrap: { alignItems: 'center', paddingVertical: 8 },
  mic: {
    width: 200,
    height: 200,
    borderRadius: 28,
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  micOn: { borderColor: c.primary, shadowColor: c.primary, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12 },
  micTitle: { color: c.outline, fontFamily: font.headline, fontSize: 26 },
  micSub: { color: c.primaryDim, fontFamily: font.label, fontSize: 10, letterSpacing: 1.5 },
  wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 56 },
  bar: { width: 5, borderRadius: 3, backgroundColor: c.primary },
  error: { color: c.error, fontFamily: font.body, textAlign: 'center' },
  stop: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: c.error,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stopText: { color: c.error, fontFamily: font.labelBold, fontSize: 11, letterSpacing: 1.5 },
});
