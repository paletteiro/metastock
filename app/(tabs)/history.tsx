import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { Colors, Radius, Typography } from '../../constants/theme';
import { useAppStore, MetadataResult } from '../../store/appStore';
import { MediaTypeBadge, ScorePill, StatusBadge } from '../../components/MediaTypeBadge';

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

async function downloadCSV(rows: MetadataResult[], filename: string) {
  const csv = generateCSV(rows);
  if (Platform.OS === 'web') {
    const blob = new (window as any).Blob([csv], { type: 'text/csv' });
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
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    Alert.alert('Export saved', `File saved to:\n${path}`);
  }
}

type Filter = 'all' | 'photo' | 'video' | 'vector' | 'png';

function formatDate(d: Date) {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '—';
  if (bytes < 1000000) return (bytes / 1000).toFixed(0) + ' KB';
  return (bytes / 1000000).toFixed(1) + ' MB';
}

function ResultCard({ item }: { item: MetadataResult }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/result/${item.id}`)}
      activeOpacity={0.75}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.thumbBox, { backgroundColor: Colors.surfaceHigh }]}>
          <Text style={styles.thumbEmoji}>
            {item.file.type === 'video' ? '▶' : item.file.type === 'vector' ? '◈' : '◉'}
          </Text>
        </View>
      </View>
      <View style={styles.cardMid}>
        <Text style={styles.cardName} numberOfLines={1}>{item.file.name}</Text>
        <View style={styles.cardMeta}>
          <MediaTypeBadge type={item.file.type} />
          {item.status === 'done' && (
            <Text style={styles.cardKeywords}>{item.keywords.length} keywords</Text>
          )}
          <Text style={styles.cardSize}>{formatBytes(item.file.size)}</Text>
        </View>
        {item.status === 'done' && item.category ? (
          <Text style={styles.cardCategory} numberOfLines={1}>{item.category}</Text>
        ) : null}
      </View>
      <View style={styles.cardRight}>
        <StatusBadge status={item.status} />
        {item.status === 'done' && <ScorePill score={item.score} />}
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { results } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const matchType = filter === 'all' || r.file.type === filter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.file.name.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.keywords.some((k) => k.includes(q)) ||
        r.category.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [results, search, filter]);

  const stats = useMemo(() => ({
    total: results.length,
    keywords: results.reduce((a, r) => a + r.keywords.length, 0),
    avgScore: results.filter((r) => r.score > 0).reduce((a, r, _, arr) => a + r.score / arr.length, 0),
  }), [results]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.8}
          onPress={() => downloadCSV(filtered, 'metastock-export.csv')}
        >
          <Text style={styles.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>Files</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{stats.keywords.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Keywords</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{Math.round(stats.avgScore)}%</Text>
          <Text style={styles.statLabel}>Avg score</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search files, keywords, category…"
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['all', 'photo', 'video', 'vector', 'png'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ResultCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>◈</Text>
            <Text style={styles.emptyText}>No files found</Text>
            <Text style={styles.emptySubtext}>Upload and generate metadata to see them here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontFamily: Typography.displayItalic, color: Colors.textPrimary },
  exportBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  exportBtnText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontFamily: Typography.display, color: Colors.textPrimary },
  statLabel: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary },
  statDivider: { width: 0.5, backgroundColor: Colors.border, marginVertical: 4 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 10, height: 42, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: 12 },
  searchIcon: { fontSize: 18, color: Colors.textTertiary },
  searchInput: { flex: 1, fontSize: 13, fontFamily: Typography.body, color: Colors.textPrimary },

  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.violetBg, borderColor: Colors.violetDim },
  filterChipText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textTertiary },
  filterChipTextActive: { color: Colors.violetLight },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  separator: { height: 8 },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'center' },
  cardLeft: {},
  thumbBox: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 18, color: Colors.textSecondary },
  cardMid: { flex: 1, gap: 4 },
  cardName: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardKeywords: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary },
  cardSize: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary },
  cardCategory: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  cardDate: { fontSize: 10, fontFamily: Typography.body, color: Colors.textTertiary },

  empty: { paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 36, color: Colors.textTertiary },
  emptyText: { fontSize: 16, fontFamily: Typography.bodyMedium, color: Colors.textSecondary },
  emptySubtext: { fontSize: 13, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'center' },
});
