import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Radius, Typography } from '../constants/theme';
import { MediaFile } from '../store/appStore';

// ── MediaTypeBadge ───────────────────────────────────────────
const TYPE_CONFIG = {
  photo: { label: 'Photo', bg: Colors.violetBg, text: '#A89EF0', border: Colors.violetDim },
  video: { label: 'Video', bg: Colors.greenBg, text: Colors.green, border: Colors.greenDim },
  vector: { label: 'Vector', bg: Colors.amberBg, text: Colors.amber, border: Colors.amberDim },
  png: { label: 'PNG', bg: '#1E1208', text: '#F97316', border: '#7C3A0E' },
};

export function MediaTypeBadge({ type }: { type: keyof typeof TYPE_CONFIG }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.photo;
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[badgeStyles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 0.5 },
  text: { fontSize: 10, fontFamily: Typography.bodyMedium },
});

// ── ScorePill ────────────────────────────────────────────────
export function ScorePill({ score }: { score: number }) {
  const color = score >= 85 ? Colors.green : score >= 65 ? Colors.amber : Colors.red;
  const bg = score >= 85 ? Colors.greenBg : score >= 65 ? Colors.amberBg : Colors.redBg;
  return (
    <View style={[pillStyles.wrap, { backgroundColor: bg }]}>
      <View style={[pillStyles.dot, { backgroundColor: color }]} />
      <Text style={[pillStyles.text, { color }]}>{score}%</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11, fontFamily: Typography.bodyMedium },
});

// ── StatusBadge ───────────────────────────────────────────────
const STATUS_CONFIG = {
  idle: { label: 'Idle', color: Colors.textTertiary, bg: Colors.surfaceHigh },
  processing: { label: 'Processing', color: Colors.amber, bg: Colors.amberBg },
  done: { label: 'Done', color: Colors.green, bg: Colors.greenBg },
  error: { label: 'Error', color: Colors.red, bg: Colors.redBg },
};

export function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  return (
    <View style={[statusStyles.wrap, { backgroundColor: cfg.bg }]}>
      <Text style={[statusStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const statusStyles = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  text: { fontSize: 10, fontFamily: Typography.bodyMedium },
});

// ── FileThumb ─────────────────────────────────────────────────
export function FileThumb({ file, onRemove }: { file: MediaFile; onRemove: () => void }) {
  const typeIcons: Record<string, string> = { photo: '◉', video: '▶', vector: '◈', png: '◻' };
  return (
    <View style={thumbStyles.wrap}>
      <View style={thumbStyles.box}>
        {file.uri && file.uri.startsWith('file://') ? (
          <Image source={{ uri: file.uri }} style={thumbStyles.image} resizeMode="cover" />
        ) : (
          <Text style={thumbStyles.icon}>{typeIcons[file.type] ?? '◉'}</Text>
        )}
        <TouchableOpacity style={thumbStyles.removeBtn} onPress={onRemove} activeOpacity={0.7}>
          <Text style={thumbStyles.removeX}>×</Text>
        </TouchableOpacity>
      </View>
      <Text style={thumbStyles.name} numberOfLines={1}>{file.name.replace(/\.[^.]+$/, '')}</Text>
    </View>
  );
}

const thumbStyles = StyleSheet.create({
  wrap: { width: 72, marginRight: 10, alignItems: 'center', gap: 5 },
  box: { width: 72, height: 72, borderRadius: Radius.md, backgroundColor: Colors.surfaceHigh, borderWidth: 0.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  icon: { fontSize: 22, color: Colors.textSecondary },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center' },
  removeX: { fontSize: 12, color: '#fff', lineHeight: 16 },
  name: { fontSize: 10, fontFamily: Typography.body, color: Colors.textTertiary, textAlign: 'center' },
});
