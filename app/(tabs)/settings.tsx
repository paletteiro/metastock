import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Colors, Radius, Typography } from '../../constants/theme';
import { useAppStore, MetadataResult } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { supabase } from '../../lib/supabase';

function generateCSV(rows: MetadataResult[]): string {
  const headers = ['Filename', 'Title', 'Description', 'Category', 'Keywords', 'ModelRelease', 'PropertyRelease', 'Score', 'Platforms'];
  const lines = rows.map((r) => [
    r.file.name,
    `"${r.title.replace(/"/g, '""')}"`,
    `"${r.description.replace(/"/g, '""')}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    `"${r.keywords.join('; ')}"`,
    r.modelRelease ? 'Yes' : 'No',
    r.propertyRelease ? 'Yes' : 'No',
    String(r.score),
    `"${r.platforms.join('; ')}"`,
  ].join(','));
  return [headers.join(','), ...lines].join('\n');
}

function generateJSON(rows: MetadataResult[]): string {
  return JSON.stringify(rows.map((r) => ({
    filename: r.file.name,
    title: r.title,
    description: r.description,
    category: r.category,
    keywords: r.keywords,
    modelRelease: r.modelRelease,
    propertyRelease: r.propertyRelease,
    score: r.score,
    platforms: r.platforms,
  })), null, 2);
}

function generateXML(rows: MetadataResult[]): string {
  const items = rows.map((r) => `  <file>
    <filename>${r.file.name}</filename>
    <title>${r.title}</title>
    <description>${r.description}</description>
    <category>${r.category}</category>
    <keywords>${r.keywords.join('; ')}</keywords>
    <modelRelease>${r.modelRelease}</modelRelease>
    <propertyRelease>${r.propertyRelease}</propertyRelease>
    <score>${r.score}</score>
    <platforms>${r.platforms.join('; ')}</platforms>
  </file>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<files>\n${items}\n</files>`;
}

async function downloadFile(content: string, filename: string, mime: string) {
  if (Platform.OS === 'web') {
    const blob = new (window as any).Blob([content], { type: mime });
    const url = (window as any).URL.createObjectURL(blob);
    const a = (window as any).document.createElement('a');
    a.href = url;
    a.download = filename;
    (window as any).document.body.appendChild(a);
    a.click();
    (window as any).document.body.removeChild(a);
    (window as any).URL.revokeObjectURL(url);
  } else {
    const path = (FileSystem.documentDirectory ?? '') + filename;
    await FileSystem.writeAsStringAsync(path, content, { encoding: FileSystem.EncodingType.UTF8 });
    Alert.alert('File saved', `Saved to:\n${path}`);
  }
}

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

function RowLink({ label, sub, right, onPress }: { label: string; sub?: string; right?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.rowRight}>{right ?? '›'}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { results, clearResults } = useAppStore();
  const { user } = useAuthStore();
  const {
    selectedPlatforms,
    autoKeywords,
    releaseDetect,
    colorPalette,
    exportFormat,
    keywordCount,
    togglePlatform,
    setAutoKeywords,
    setReleaseDetect,
    setColorPalette,
    setExportFormat,
    setKeywordCount,
  } = useSettingsStore();

  const handleDownloadAll = () => {
    if (results.length === 0) {
      Alert.alert('No data', 'There are no results to export.');
      return;
    }
    if (exportFormat === 'csv') {
      downloadFile(generateCSV(results), 'metastock-history.csv', 'text/csv');
    } else if (exportFormat === 'json') {
      downloadFile(generateJSON(results), 'metastock-history.json', 'application/json');
    } else {
      downloadFile(generateXML(results), 'metastock-history.xml', 'application/xml');
    }
  };

  const handleClearHistory = () => {
    Alert.alert('Clear all history', 'This will permanently delete all results. Cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: () => clearResults() },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(feature, 'This feature is coming soon.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.user_metadata?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {user?.user_metadata?.full_name ?? 'User'}
            </Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
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
          <RowLink
            label="Download all history"
            sub={`${results.length} file${results.length !== 1 ? 's' : ''} · ${exportFormat.toUpperCase()}`}
            right="↓"
            onPress={handleDownloadAll}
          />
        </Section>

        {/* Account */}
        <Section title="Account">
          <RowLink label="Manage subscription" sub="Pro — renews 1 Jan 2026" onPress={() => handleComingSoon('Manage subscription')} />
          <View style={styles.rowDivider} />
          <RowLink label="Usage this month" sub="42 of unlimited generates" onPress={() => handleComingSoon('Usage this month')} />
          <View style={styles.rowDivider} />
          <RowLink label="API access" sub="Connect to your own backend" onPress={() => handleComingSoon('API access')} />
        </Section>

        {/* Danger */}
        <Section title="Data">
          <RowLink label="Clear all history" sub="Cannot be undone" right="›" onPress={handleClearHistory} />
          <View style={styles.rowDivider} />
          <TouchableOpacity style={styles.row} onPress={handleSignOut} activeOpacity={0.7}>
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
