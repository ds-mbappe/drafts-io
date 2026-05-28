import { View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Text } from 'heroui-native/text';

// ── TipTap Node Renderer ───────────────────────────────────────────────────────

interface NodeRendererProps {
  node: any;
  isDark: boolean;
  depth?: number;
}

export function renderMarks(text: string, marks: any[] = [], isDark: boolean): React.ReactNode {
  let style: any = { color: isDark ? '#E4E4E7' : '#18181B', fontSize: 16, lineHeight: 26 };
  for (const mark of marks) {
    if (mark.type === 'bold') style = { ...style, fontWeight: '700' };
    if (mark.type === 'italic') style = { ...style, fontStyle: 'italic' };
    if (mark.type === 'strike') style = { ...style, textDecorationLine: 'line-through' };
    if (mark.type === 'underline') style = { ...style, textDecorationLine: 'underline' };
    if (mark.type === 'code') {
      style = {
        ...style,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        color: isDark ? '#FB923C' : '#EA580C',
        fontSize: 14,
      };
    }
  }
  return <Text key={text} style={style}>{text}</Text>;
}

export function TipTapNode({ node, isDark, depth = 0 }: NodeRendererProps) {
  if (!node) return null;

  const bodyColor = isDark ? '#E4E4E7' : '#18181B';
  const mutedColor = isDark ? '#71717A' : '#A1A1AA';
  const codeBg = isDark ? '#1C1C1E' : '#F4F4F5';
  const borderColor = isDark ? '#3F3F46' : '#E4E4E7';
  const quoteBarColor = isDark ? '#4A4A52' : '#D4D4D8';

  switch (node.type) {
    case 'doc':
      return (
        <View>
          {(node.content ?? []).map((child: any, i: number) => (
            <TipTapNode key={i} node={child} isDark={isDark} depth={depth} />
          ))}
        </View>
      );

    case 'paragraph': {
      const inlineContent = (node.content ?? []).map((child: any, i: number) => {
        if (child.type === 'text') return renderMarks(child.text ?? '', child.marks, isDark);
        if (child.type === 'hardBreak') return <Text key={i}>{'\n'}</Text>;
        return null;
      });
      return (
        <Text style={{ fontSize: 16, lineHeight: 26, color: bodyColor, marginBottom: 14 }}>
          {inlineContent}
        </Text>
      );
    }

    case 'heading': {
      const level = node.attrs?.level ?? 1;
      const sizes = [28, 24, 20, 18, 16, 16];
      const sz = sizes[level - 1] ?? 18;
      const text = (node.content ?? [])
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text ?? '')
        .join('');
      return (
        <Text style={{
          fontSize: sz, fontWeight: '700', color: bodyColor,
          marginTop: level <= 2 ? 24 : 16, marginBottom: 8, lineHeight: sz * 1.3,
        }}>
          {text}
        </Text>
      );
    }

    case 'bulletList':
      return (
        <View style={{ marginBottom: 14 }}>
          {(node.content ?? []).map((item: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: mutedColor, fontSize: 16, marginRight: 8, lineHeight: 26 }}>•</Text>
              <View style={{ flex: 1 }}>
                {(item.content ?? []).map((child: any, j: number) => (
                  <TipTapNode key={j} node={child} isDark={isDark} depth={depth + 1} />
                ))}
              </View>
            </View>
          ))}
        </View>
      );

    case 'orderedList': {
      const start = node.attrs?.start ?? 1;
      return (
        <View style={{ marginBottom: 14 }}>
          {(node.content ?? []).map((item: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ color: mutedColor, fontSize: 16, marginRight: 8, lineHeight: 26, minWidth: 20 }}>
                {start + i}.
              </Text>
              <View style={{ flex: 1 }}>
                {(item.content ?? []).map((child: any, j: number) => (
                  <TipTapNode key={j} node={child} isDark={isDark} depth={depth + 1} />
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    case 'blockquote':
      return (
        <View style={{
          borderLeftWidth: 3, borderLeftColor: quoteBarColor,
          paddingLeft: 16, marginBottom: 14, marginLeft: 4,
        }}>
          {(node.content ?? []).map((child: any, i: number) => (
            <TipTapNode key={i} node={child} isDark={isDark} depth={depth + 1} />
          ))}
        </View>
      );

    case 'codeBlock': {
      const code = (node.content ?? [])
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text ?? '')
        .join('');
      return (
        <View style={{
          backgroundColor: codeBg, borderRadius: 8, padding: 14,
          marginBottom: 14, borderWidth: 1, borderColor,
        }}>
          <Text style={{
            fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
            fontSize: 13, color: isDark ? '#A5F3FC' : '#0369A1', lineHeight: 20,
          }}>
            {code}
          </Text>
        </View>
      );
    }

    case 'horizontalRule':
      return <View style={{ height: 1, backgroundColor: borderColor, marginVertical: 20 }} />;

    case 'imageUploader':
      if (!node.attrs?.src) return null;

      return (
        <Image
          source={{ uri: node.attrs.src }}
          style={{ width: '100%', height: 220, borderRadius: 8, marginBottom: 14 }}
          contentFit="cover"
        />
      );

    default:
      return null;
  }
}
