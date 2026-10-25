import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../../constants/theme';

const PLATFORMS = ['Shutterstock', 'Adobe Stock', 'Getty Images', 'Alamy', 'Dreamstime', 'Pond5', 'Depositphotos'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function RowSwitch({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.violet }}
        thumbColor={value ? Colors.cream : Colors.textTertiary}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
}

function RowLink({ label, sub, right }: { label: string; sub?: string; right?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.rowRight}>{right ?? '›'}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [selectedPlatforms, setSelectedPlatforms] = useState(['Shutterstock', 'Adobe Stock', 'Getty Images']);
  const [autoKeywords, setAutoKeywords] = useState(true);
  const [releaseDetect, setReleaseDetect] = useState(true);
  const [colorPalette, setColorPalette] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xml'>('csv');
  const [keywordCount, setKeywordCount] = useState<'25' | '40' | '50'>('40');

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Andi Microstocker</Text>
            <Text style={styles.profileEmail}>andi@email.com</Text>
          </View>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Platforms */}
        <Section title="Default platforms">
          <Text style={styles.platformHint}>Select platforms to auto-assign on every generation</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => {
              const active = selectedPlatforms.includes(p);
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.platformChip, active && styles.platformChipActive]}
                  onPress={() => togglePlatform(p)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.platformChipText, active && styles.platformChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* AI Options */}
        <Section title="AI generation">
          <RowSwitch label="Auto-generate keywords" sub="AI selects the best tags" value={autoKeywords} onChange={setAutoKeywords} />
          <View style={styles.rowDivider} />
          <RowSwitch label="Model release detection" sub="Detect faces & require release" value={releaseDetect} onChange={setReleaseDetect} />
          <View style={styles.rowDivider} />
          <RowSwitch label="Color palette extraction" sub="Auto-detect dominant colors" value={colorPalette} onChange={setColorPalette} />
          <View style={styles.rowDivider} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Max keywords per file</Text>
              <Text style={styles.rowSub}>Shutterstock recommends 25–50</Text>
            </View>
            <View style={styles.segmented}>
              {(['25', '40', '50'] as const).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.segBtn, keywordCount === v && styles.segBtnActive]}
                  onPress={() => setKeywordCount(v)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.segBtnText, keywordCount === v && styles.segBtnTextActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Section>

        {/* Export */}
        <Section title="Export format">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>File format</Text>
            <View style={styles.segmented}>
              {(['csv', 'json', 'xml'] as const).map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.segBtn, exportFormat === v && styles.segBtnActive]}
                  onPress={() => setExportFormat(v)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.segBtnText, exportFormat === v && styles.segBtnTextActive]}>{v.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.rowDivider} />
          <RowLink label="Download all history" sub="128 files · ~24 KB" right="↓" />
        </Section>

        {/* Account */}
        <Section title="Account">
          <RowLink label="Manage subscription" sub="Pro — renews 1 Jan 2026" />
          <View style={styles.rowDivider} />
          <RowLink label="Usage this month" sub="42 of unlimited generates" />
          <View style={styles.rowDivider} />
          <RowLink label="API access" sub="Connect to your own backend" />
        </Section>

        {/* Danger */}
        <Section title="Data">
          <RowLink label="Clear all history" sub="Cannot be undone" right="›" />
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row}>
            <Text style={[styles.rowLabel, { color: Colors.red }]}>Sign out</Text>
          </TouchableOpacity>
        </Section>

        <Text style={styles.version}>MetaStock v1.0.0 · Made for microstocker</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 28, fontFamily: Typography.displayItalic, color: Colors.textPrimary, marginBottom: 20 },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: 14, marginBottom: 24 },
  avatar: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.violetBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: Typography.display, color: Colors.violet },
  profileName: { fontSize: 15, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  profileEmail: { fontSize: 12, fontFamily: Typography.body, color: Colors.textSecondary },
  proBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.violetBg, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.violetDim },
  proBadgeText: { fontSize: 10, fontFamily: Typography.bodyMedium, color: Colors.violetLight, letterSpacing: 1 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: Typography.bodyMedium, color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden' },

  platformHint: { fontSize: 12, fontFamily: Typography.body, color: Colors.textTertiary, padding: 12, paddingBottom: 8 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, paddingTop: 4 },
  platformChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  platformChipActive: { backgroundColor: Colors.violetBg, borderColor: Colors.violetDim },
  platformChipText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textTertiary },
  platformChipTextActive: { color: Colors.violetLight },

  row: { flexDirection: 'row', alignItems: 'center', padding: 14, minHeight: 52 },
  rowLabel: { fontSize: 14, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  rowSub: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary, marginTop: 1 },
  rowRight: { fontSize: 16, color: Colors.textTertiary },
  rowDivider: { height: 0.5, backgroundColor: Colors.border, marginLeft: 14 },

  segmented: { flexDirection: 'row', borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden' },
  segBtn: { paddingHorizontal: 12, paddingVertical: 7 },
  segBtnActive: { backgroundColor: Colors.violetBg },
  segBtnText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textTertiary },
  segBtnTextActive: { color: Colors.violetLight },

  version: { textAlign: 'center', fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary, marginTop: 8 },
});
