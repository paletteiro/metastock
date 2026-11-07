import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { Colors, Radius, Typography } from '../../constants/theme';
import { useAppStore, MediaFile, MetadataResult } from '../../store/appStore';
import { MediaTypeBadge, FileThumb } from '../../components/MediaTypeBadge';

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatBytes(bytes: number) {
  if (bytes < 1000000) return (bytes / 1000).toFixed(0) + ' KB';
  return (bytes / 1000000).toFixed(1) + ' MB';
}

// Simulate AI generation
async function simulateGenerate(
  files: MediaFile[],
  onProgress: (n: number) => void
): Promise<MetadataResult[]> {
  const results: MetadataResult[] = [];
  for (let i = 0; i < files.length; i++) {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
    onProgress(Math.round(((i + 1) / files.length) * 100));
    const f = files[i];
    results.push({
      id: uuid(),
      fileId: f.id,
      file: f,
      title: `Professional ${f.type} — ${f.name.replace(/\.[^.]+$/, '').replace(/-/g, ' ')}`,
      description:
        'High-quality stock asset ideal for commercial and editorial use. Clean composition with strong visual impact.',
      category: f.type === 'video' ? 'Footage & Video' : 'Nature & Landscapes',
      keywords: [
        'professional',
        f.type,
        'stock',
        'commercial',
        'high quality',
        'editorial',
        'modern',
        'clean',
      ],
      colors: ['#D4853A', '#2C5F3E', '#4A7BAA'],
      modelRelease: false,
      propertyRelease: false,
      score: 75 + Math.floor(Math.random() * 20),
      platforms: ['Shutterstock', 'Adobe Stock'],
      createdAt: new Date(),
      status: 'done',
    });
  }
  return results;
}

export default function GenerateScreen() {
  const { pendingFiles, addFiles, removeFile, clearPending, addResult, isGenerating, generationProgress, setGenerating, setProgress } =
    useAppStore();
  const [urlText, setUrlText] = useState('');
  const [activeType, setActiveType] = useState<'photo' | 'video' | 'vector'>('photo');

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        activeType === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!res.canceled) {
      const files: MediaFile[] = res.assets.map((a) => ({
        id: uuid(),
        uri: a.uri,
        name: a.fileName ?? a.uri.split('/').pop() ?? 'file',
        size: a.fileSize ?? 0,
        type: activeType === 'video' ? 'video' : 'photo',
        mimeType: a.mimeType,
      }));
      addFiles(files);
    }
  }, [activeType, addFiles]);

  const pickDocument = useCallback(async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', 'application/postscript', 'application/illustrator'],
      multiple: true,
    });
    if (!res.canceled) {
      const files: MediaFile[] = res.assets.map((a) => ({
        id: uuid(),
        uri: a.uri,
        name: a.name,
        size: a.size ?? 0,
        type: a.name.match(/\.(eps|ai|svg)$/i) ? 'vector' : a.name.match(/\.(mp4|mov|avi)$/i) ? 'video' : a.name.match(/\.png$/i) ? 'png' : 'photo',
        mimeType: a.mimeType ?? undefined,
      }));
      addFiles(files);
    }
  }, [addFiles]);

  const handleGenerate = useCallback(async () => {
    if (pendingFiles.length === 0) return;
    setGenerating(true);
    setProgress(0);
    try {
      const results = await simulateGenerate(pendingFiles, setProgress);
      results.forEach(addResult);
      clearPending();
      router.push('/history');
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  }, [pendingFiles, setGenerating, setProgress, addResult, clearPending]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>
            <Text style={styles.logoText}>MetaStock</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>PRO</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Generate{'\n'}metadata</Text>
        <Text style={styles.pageSub}>AI-powered for microstocker</Text>

        {/* Media type selector */}
        <View style={styles.typeRow}>
          {(['photo', 'video', 'vector'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, activeType === t && styles.typeChipActive]}
              onPress={() => setActiveType(t)}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeChipText, activeType === t && styles.typeChipTextActive]}>
                {t === 'photo' ? 'Photo / Illus' : t === 'video' ? 'Video' : 'Vector / PNG'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload zone */}
        <TouchableOpacity
          style={styles.uploadZone}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <View style={styles.uploadIconWrap}>
            <Text style={styles.uploadIconText}>↑</Text>
          </View>
          <Text style={styles.uploadTitle}>Drop or tap to upload</Text>
          <Text style={styles.uploadSub}>JPEG · PNG · SVG · EPS · MP4 · MOV</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={pickDocument}
            activeOpacity={0.8}
          >
            <Text style={styles.browseBtnText}>Browse files</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* URL input */}
        <View style={styles.urlRow}>
          <View style={styles.urlDivider}><Text style={styles.urlDividerText}>or paste URL</Text></View>
          <View style={styles.urlInputRow}>
            <TextInput
              style={styles.urlInput}
              value={urlText}
              onChangeText={setUrlText}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.fetchBtn}
              onPress={() => {
                if (urlText.trim()) {
                  addFiles([{
                    id: uuid(),
                    uri: urlText.trim(),
                    name: urlText.split('/').pop() ?? 'url-image',
                    size: 0,
                    type: activeType === 'video' ? 'video' : 'photo',
                  }]);
                  setUrlText('');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.fetchBtnText}>Fetch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''} ready</Text>
              <TouchableOpacity onPress={clearPending}>
                <Text style={styles.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {pendingFiles.map((f) => (
                <FileThumb
                  key={f.id}
                  file={f}
                  onRemove={() => removeFile(f.id)}
                />
              ))}
            </ScrollView>

            {/* Generate button */}
            {isGenerating ? (
              <View style={styles.progressWrap}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${generationProgress}%` as any }]} />
                </View>
                <Text style={styles.progressText}>Analysing with AI… {generationProgress}%</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleGenerate}
                activeOpacity={0.85}
              >
                <Text style={styles.generateBtnText}>
                  ✦  Generate metadata for {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for best results</Text>
          {[
            'Use high-resolution originals (min. 4MP for photos)',
            'Ensure good lighting and sharp focus',
            'For vectors, upload original EPS or AI files',
            'Add model/property release info after generation',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>◆</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMark: { width: 32, height: 32, borderRadius: Radius.md, backgroundColor: Colors.violet, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 14, color: '#fff' },
  logoText: { fontSize: 16, fontFamily: Typography.displayItalic, color: Colors.textPrimary },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.violetBg, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.violetDim },
  planText: { fontSize: 10, fontFamily: Typography.bodyMedium, color: Colors.violetLight, letterSpacing: 1 },

  pageTitle: { fontSize: 38, fontFamily: Typography.displayItalic, color: Colors.textPrimary, lineHeight: 44, marginBottom: 6 },
  pageSub: { fontSize: 14, fontFamily: Typography.body, color: Colors.textSecondary, marginBottom: 24 },

  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeChip: { flex: 1, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center' },
  typeChipActive: { backgroundColor: Colors.violetBg, borderColor: Colors.violetDim },
  typeChipText: { fontSize: 12, fontFamily: Typography.bodyMedium, color: Colors.textTertiary },
  typeChipTextActive: { color: Colors.violetLight },

  uploadZone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  uploadIconWrap: { width: 52, height: 52, borderRadius: Radius.md, backgroundColor: Colors.violetBg, borderWidth: 0.5, borderColor: Colors.violetDim, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  uploadIconText: { fontSize: 22, color: Colors.violet },
  uploadTitle: { fontSize: 16, fontFamily: Typography.bodyMedium, color: Colors.textPrimary, marginBottom: 4 },
  uploadSub: { fontSize: 12, fontFamily: Typography.body, color: Colors.textTertiary, marginBottom: 16 },
  browseBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 0.5, borderColor: Colors.violet, backgroundColor: Colors.violetBg },
  browseBtnText: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.violetLight },

  urlRow: { marginBottom: 24 },
  urlDivider: { alignItems: 'center', marginBottom: 10 },
  urlDividerText: { fontSize: 12, color: Colors.textTertiary, fontFamily: Typography.body },
  urlInputRow: { flexDirection: 'row', gap: 8 },
  urlInput: { flex: 1, height: 42, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, color: Colors.textPrimary, paddingHorizontal: 12, fontSize: 13, fontFamily: Typography.body },
  fetchBtn: { height: 42, paddingHorizontal: 18, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.border, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  fetchBtnText: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontFamily: Typography.bodyMedium, color: Colors.textPrimary },
  clearText: { fontSize: 12, fontFamily: Typography.body, color: Colors.textTertiary },
  thumbRow: { marginBottom: 16 },

  progressWrap: { gap: 8 },
  progressBarBg: { height: 4, borderRadius: 2, backgroundColor: Colors.border, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2, backgroundColor: Colors.violet },
  progressText: { fontSize: 12, fontFamily: Typography.body, color: Colors.textSecondary, textAlign: 'center' },

  generateBtn: {
    backgroundColor: Colors.violet,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateBtnText: { fontSize: 15, fontFamily: Typography.bodyMedium, color: '#fff' },

  tipsCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.border, padding: 16, gap: 10 },
  tipsTitle: { fontSize: 13, fontFamily: Typography.bodyMedium, color: Colors.textSecondary, marginBottom: 4 },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tipBullet: { fontSize: 8, color: Colors.violet, marginTop: 5 },
  tipText: { flex: 1, fontSize: 13, fontFamily: Typography.body, color: Colors.textTertiary, lineHeight: 18 },
});
