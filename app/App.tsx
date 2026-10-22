import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Devices from './src/screens/Devices';
import FxStudio from './src/screens/FxStudio';
import LiveMic from './src/screens/LiveMic';
import { StoreProvider, useStore } from './src/ui/store';
import { c, font } from './src/ui/theme';

const TABS = [
  { key: 'mic', label: 'LIVE MIC', icon: 'microphone', View: LiveMic },
  { key: 'fx', label: 'FX STUDIO', icon: 'tune-variant', View: FxStudio },
  { key: 'dev', label: 'DEVICES', icon: 'bluetooth-audio', View: Devices },
] as const;

function Shell() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('mic');
  const { live } = useStore();
  const Active = TABS.find((t) => t.key === tab)!.View;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.brand}>EchoMic Pro</Text>
        <View style={[styles.badge, live && styles.badgeLive]}>
          <Text style={[styles.badgeText, live && { color: c.onPrimary }]}>{live ? 'LIVE' : 'IDLE'}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Active />
      </ScrollView>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
            <MaterialCommunityIcons
              name={t.icon}
              size={22}
              color={tab === t.key ? c.primary : c.outline}
            />
            <Text style={[styles.tabText, tab === t.key && { color: c.primary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: c.bg }} />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { color: c.onSurface, fontFamily: font.headline, fontSize: 20 },
  badge: { borderRadius: 999, borderWidth: 1, borderColor: c.outline, paddingHorizontal: 10, paddingVertical: 3 },
  badgeLive: { backgroundColor: c.primary, borderColor: c.primary },
  badgeText: { color: c.outline, fontFamily: font.labelBold, fontSize: 10, letterSpacing: 1 },
  content: { padding: 16, paddingBottom: 32 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: c.surfaceLow,
    borderTopWidth: 1,
    borderTopColor: c.outlineVariant,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabText: { color: c.outline, fontFamily: font.label, fontSize: 9, letterSpacing: 1 },
});
