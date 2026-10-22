import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AudioManager } from 'react-native-audio-api';
import { Card, s } from '../ui/parts';
import { c, font } from '../ui/theme';

type Info = Awaited<ReturnType<typeof AudioManager.getDevicesInfo>>;

export default function Devices() {
  const [info, setInfo] = useState<Info | null>(null);
  const refresh = useCallback(() => {
    AudioManager.getDevicesInfo().then(setInfo).catch(() => setInfo(null));
  }, []);

  useEffect(() => {
    refresh();
    const sub = AudioManager.addSystemEventListener('routeChange', refresh);
    return () => sub?.remove();
  }, [refresh]);

  const current = info?.currentOutputs[0];
  return (
    <View style={{ gap: 16 }}>
      <Card>
        <Text style={s.label}>ACTIVE OUTPUT</Text>
        <View style={s.row}>
          <MaterialCommunityIcons name="speaker-bluetooth" size={28} color={c.primary} />
          <View>
            <Text style={s.title}>{current?.name ?? 'No output'}</Text>
            <Text style={s.hint}>{current?.category ?? ''}</Text>
          </View>
        </View>
        <Text style={s.hint}>
          Audio follows the system output. Pair your speaker in the phone's Bluetooth settings and it
          appears here automatically.
        </Text>
      </Card>

      <Card>
        <Text style={s.label}>AVAILABLE OUTPUTS</Text>
        {(info?.availableOutputs ?? []).map((d) => (
          <View key={d.id} style={s.rowBetween}>
            <Text style={{ color: c.onSurface, fontFamily: font.body }}>{d.name}</Text>
            <Text style={s.hint}>{d.category}</Text>
          </View>
        ))}
        <Pressable onPress={refresh}>
          <Text style={{ color: c.primary, fontFamily: font.labelBold, fontSize: 11 }}>REFRESH</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={s.label}>INPUT</Text>
        {(info?.currentInputs ?? []).map((d) => (
          <Text key={d.id} style={{ color: c.onSurface, fontFamily: font.body }}>
            {d.name} <Text style={s.hint}>{d.category}</Text>
          </Text>
        ))}
        <Text style={s.hint}>
          Bluetooth speakers add roughly 100-250 ms delay; it is a Bluetooth limit, not an app setting.
        </Text>
      </Card>
    </View>
  );
}
