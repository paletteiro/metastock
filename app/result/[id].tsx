import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Colors, Radius, Typography } from '../../constants/theme';
import { useAppStore } from '../../store/appStore';
import { ScorePill, MediaTypeBadge } from '../../components/MediaTypeBadge';

const PLATFORMS = ['Shutterstock', 'Adobe Stock', 'Getty Images', 'Alamy', 'Dreamstime', 'Pond5'];

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { results, updateResult, deleteResult } = useAppStore();
  const result = results.find((r) => r.id === id);

  const [editTitle, setEditTitle] = useState(result?.title ?? '');
  const [editDesc, setEditDesc] = useState(result?.description ?? '');
  const [keywords, setKeywords] = useState(result?.keywords ?? []);
  const [newKeyword, setNewKeyword] = useState('');
  const [platforms, setPlatforms] = useState(result?.platforms ?? []);

  if (!result) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Result not found</Text>
      </View>
    );
  }

  const handleSave = () => {
    updateResult(id, { title: editTitle, description: editDesc, keywords, platforms });
    Alert.alert('Saved', 'Metadata updated successfully.');
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Remove this file from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteResult(id);
          router.back();
        },
      },
    ]);
  };

  const copyAll = async () => {
    const text = [
      `Title: ${editTitle}`,
      `Description: ${editDesc}`,
      `Category: ${result.category}`,
      `Keywords: ${keywords.join(', ')}`,
    ].join('\n\n');
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'All metadata copied to clipboard.');
  };

  const addKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Drag indicator */}
      <View style={styles.dragIndicator} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle} numberOfLines={1}>{result.file.name}</Text>
          <View style={styles.topMeta}>
            <MediaTypeBadge type={result.file.type} />
            <ScorePill score={result.score} />
          </View>
        </View>
        <TouchableOpacity onPress={copyAll} style={styles.copyAllBtn} activeOpacity={0.8}>
          <Text style={styles.copyAllText}>Copy all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Score card */}
        <View style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreCardLabel}>Metadata score</Text>
            <Text style={styles.scoreCardNum}>{result.score}%</Text>
          </View>
          <View style={styles.scoreBarBig}>
            <View style={[styles.scoreBarFill, {
              width: `${result.score}%` as any,
              backgroundColor: result.score >= 85 ? Colors.green : result.score >= 65 ? Colors.amber : Colors.red,
            }]} />
          </View>
          <Text style={styles.scoreHint}>
            {result.score >= 85 ? 'Excellent — ready to submit' : result.score >= 65 ? 'Good — minor improvements possible' : 'Needs improvement'}
          </Text>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TouchableOpacity onPress={() => Clipboard.setStringAsync(editTitle)}>
              <Text style={styles.copyBtn}>copy</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.titleInput}
            value={editTitle}
            onChangeText={setEditTitle}
            multiline
            placeholderTextColor={Colors.textTertiary}
            placeholder="Enter a descriptive title…"
          />
          <Text style={styles.charCount}>{editTitle.length} / 100</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TouchableOpacity onPress={() => Clipboard.setStringAsync(editDesc)}>
              <Text style={styles.copyBtn}>copy</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.titleInput, styles.descInput]}
            value={editDesc}
            onChangeText={setEditDesc}
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.textTertiary}
            placeholder="Describe your asset in detail…"
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{result.category || '—'}</Text>
          </View>
        </View>

        {/* Keywords */}
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Keywords ({keywords.length})</Text>
            <TouchableOpacity onPress={() => Clipboard.setStringAsync(keywords.join(', '))}>
              <Text style={styles.copyBtn}>copy all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsWrap}>
            {keywords.map((kw) => (
              <TouchableOpacity
                key={kw}
                style={styles.tag}
                onPress={() => removeKeyword(kw)}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>{kw}</Text>
                <Text style={styles.tagX}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.addTagRow}>
            <TextInput
              style={styles.addTagInput}
              value={newKeyword}
              onChangeText={setNewKeyword}
              placeholder="Add keyword…"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={addKeyword}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addKeyword} activeOpacity={0.8}>
              <Text style={styles.addTagBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Colors */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Color palette</Text>
          <View style={styles.colorsRow}>
            {result.colors.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.colorSwatch, { backgroundColor: c }]}
                onPress={() => Clipboard.setStringAsync(c)}
                activeOpacity={0.7}
              />
            ))}
            <Text style={styles.colorsHint}>{result.colors.length} dominant colors · tap to copy</Text>
          </View>
        </View>

        {/* Release */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Release info</Text>
          <View style={[styles.releaseBox, { borderColor: result.modelRelease ? Colors.greenDim : Colors.border }]}>
            <View style={[styles.releaseDot, { backgroundColor: result.modelRelease ? Colors.green : Colors.textTertiary }]} />
            <Text style={styles.releaseText}>
              {result.modelRelease ? 'Model release attached' : 'No model release needed'}
            </Text>
          </View>
          <View style={[styles.releaseBox, { borderColor: result.propertyRelease ? Colors.greenDim : Colors.border, marginTop: 6 }]}>
            <View style={[styles.releaseDot, { backgroundColor: result.propertyRelease ? Colors.green : Colors.textTertiary }]} />
            <Text style={styles.releaseText}>
              {result.propertyRelease ? 'Property release attached' : 'No property release needed'}
            </Text>
          </View>
        </View>

        {/* Platforms */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Export to platforms</Text>
          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => {
              const active = platforms.includes(p);
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
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={copyAll} activeOpacity={0.85}>
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete from history</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  dragIndicator: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 8 },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  closeBtn: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 12, color: Colors.textSecondary },
  topTitle: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  topMeta: { flexDirection: 'row', gap: 6, marginTop: 4 },
  copyAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.violetDim, backgroundColor: Colors.violetBg },
  copyAllText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.violetLight },

  content: { padding: 16, paddingBottom: 48 },

  scoreCard: { backgroundColor: Colors.surfaceHigh, borderRadius: Radius.lg, padding: 16, marginBottom: 16, gap: 8 },
  scoreCardLabel: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary },
  scoreCardNum: { fontSize: 32, fontFamily: Typography.display, color: Colors.textPrimary },
  scoreBarBig: { height: 6, borderRadius: 3, backgroundColor: Colors.border, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 3 },
  scoreHint: { fontSize: 12, fontFamily: Typography.body, color: Colors.textSecondary },

  field: { marginBottom: 16 },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontSize: 11, fontFamily: Typography.bodyMedium, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  copyBtn: { fontSize: 11, fontFamily: Typography.body, color: Colors.violet },

  titleInput: { backgroundColor: Colors.surfaceHigh, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, padding: 12, fontSize: 14, fontFamily: Typography.body, color: Colors.textPrimary, lineHeight: 20 },
  descInput: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 10, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },

  categoryPill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.violetBg, borderWidth: 0.5, borderColor: Colors.violetDim },
  categoryText: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.violetLight },

  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.violetBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, fontFamily: Typography.body, color: Colors.violetLight },
  tagX: { fontSize: 14, color: Colors.violetDim, lineHeight: 16 },
  addTagRow: { flexDirection: 'row', gap: 8 },
  addTagInput: { flex: 1, height: 38, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surfaceHigh, paddingHorizontal: 12, fontSize: 13, fontFamily: Typography.body, color: Colors.textPrimary },
  addTagBtn: { height: 38, paddingHorizontal: 16, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.violetDim, backgroundColor: Colors.violetBg, alignItems: 'center', justifyContent: 'center' },
  addTagBtnText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.violetLight },

  colorsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  colorSwatch: { width: 28, height: 28, borderRadius: Radius.full },
  colorsHint: { fontSize: 11, fontFamily: Typography.body, color: Colors.textTertiary, marginLeft: 4 },

  releaseBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: Radius.md, borderWidth: 0.5 },
  releaseDot: { width: 8, height: 8, borderRadius: 4 },
  releaseText: { fontSize: 13, fontFamily: Typography.body, color: Colors.textSecondary },

  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  platformChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border },
  platformChipActive: { backgroundColor: Colors.violetBg, borderColor: Colors.violetDim },
  platformChipText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textTertiary },
  platformChipTextActive: { color: Colors.violetLight },

  actions: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 10 },
  saveBtn: { flex: 1, backgroundColor: Colors.violet, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: Typography.bodyMedium, color: '#fff' },
  exportBtn: { flex: 1, borderRadius: Radius.lg, paddingVertical: 14, alignItems: 'center', borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surfaceHigh },
  exportBtnText: { fontSize: 14, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  deleteBtn: { alignItems: 'center', paddingVertical: 12 },
  deleteBtnText: { fontSize: 13, fontFamily: Typography.body, color: Colors.red },
});
