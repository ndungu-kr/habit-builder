import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── "?" trigger button ───

function HelpTrigger({
  size = 22,
  onPress,
  onLayout,
}: {
  size?: number;
  onPress: () => void;
  onLayout?: (x: number, y: number, width: number, height: number) => void;
}) {
  const { colors } = useTheme();
  const ref = useRef<View>(null);

  const handlePress = () => {
    if (onLayout && ref.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        onLayout(x, y, width, height);
      });
    }
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        ref={ref}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'Nunito_700Bold',
            fontSize: size * 0.6,
            color: colors.textSecondary,
            lineHeight: size * 0.7,
          }}
        >
          ?
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Popover content (short explanations) ───

function PopoverContent({
  title,
  body,
  triggerX,
  triggerY,
  triggerWidth,
  triggerHeight,
}: {
  title?: string;
  body: string;
  triggerX: number;
  triggerY: number;
  triggerWidth: number;
  triggerHeight: number;
}) {
  const { colors } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const popoverWidth = 280;

  // Decide: show above or below the trigger
  const showBelow = triggerY < screenHeight / 2;

  // Vertical position
  const top = showBelow
    ? triggerY + triggerHeight + 12
    : undefined;
  const bottom = showBelow
    ? undefined
    : screenHeight - triggerY + 12;

  // Horizontal: center on trigger, clamp to screen edges
  let left = triggerX + triggerWidth / 2 - popoverWidth / 2;
  if (left < 16) left = 16;
  if (left + popoverWidth > SCREEN_WIDTH - 16) left = SCREEN_WIDTH - 16 - popoverWidth;

  // Arrow points to trigger center
  const arrowLeft = Math.max(12, Math.min(triggerX + triggerWidth / 2 - left - 8, popoverWidth - 28));

  return (
    <View
      style={{
        position: 'absolute',
        top,
        bottom,
        left,
        width: popoverWidth,
      }}
    >
      {/* Arrow on top (when popover is below trigger) */}
      {showBelow && (
        <View style={{ marginLeft: arrowLeft, marginBottom: -1 }}>
          <Svg width={16} height={9} viewBox="0 0 16 9">
            <Path d="M0 9h16L9 1.5a1.5 1.5 0 0 0-2 0L0 9Z" fill={colors.surface} stroke={colors.border} strokeWidth={1} />
          </Svg>
        </View>
      )}

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 14,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 32,
          elevation: 12,
        }}
      >
        {title && (
          <Text
            style={{
              fontFamily: 'Nunito_700Bold',
              fontSize: 13.5,
              color: colors.textPrimary,
              letterSpacing: -0.05,
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
        )}
        <Text
          style={{
            fontFamily: 'Nunito_500Medium',
            fontSize: 13.5,
            color: colors.textSecondary,
            lineHeight: 20,
            letterSpacing: -0.05,
          }}
        >
          {body}
        </Text>
      </View>

      {/* Arrow on bottom (when popover is above trigger) */}
      {!showBelow && (
        <View style={{ marginLeft: arrowLeft, marginTop: -1 }}>
          <Svg width={16} height={9} viewBox="0 0 16 9">
            <Path d="M0 0h16L9 7.5a1.5 1.5 0 0 1-2 0L0 0Z" fill={colors.surface} stroke={colors.border} strokeWidth={1} />
          </Svg>
        </View>
      )}
    </View>
  );
}
// ─── Bottom sheet content (longer explanations with examples) ───

function SheetContent({
  title,
  body,
  examples,
  onDismiss,
}: {
  title: string;
  body: string;
  examples?: string[];
  onDismiss: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -20 },
        shadowOpacity: 0.15,
        shadowRadius: 48,
        elevation: 20,
      }}
    >
      {/* Handle */}
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <View
          style={{
            width: 40,
            height: 5,
            borderRadius: 999,
            backgroundColor: colors.textTertiary,
            opacity: 0.5,
          }}
        />
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 16,
                color: '#fff',
                lineHeight: 19,
              }}
            >
              ?
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Nunito_700Bold',
              fontSize: 11.5,
              color: colors.accent,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            How it works
          </Text>
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'Nunito_800ExtraBold',
            fontSize: 22,
            color: colors.textPrimary,
            marginTop: 10,
            letterSpacing: -0.4,
            lineHeight: 26,
          }}
        >
          {title}
        </Text>

        {/* Body */}
        <Text
          style={{
            fontFamily: 'Nunito_500Medium',
            fontSize: 14.5,
            color: colors.textSecondary,
            marginTop: 8,
            lineHeight: 22,
          }}
        >
          {body}
        </Text>

        {/* Examples */}
        {examples && examples.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text
              style={{
                fontFamily: 'Nunito_700Bold',
                fontSize: 11,
                color: colors.textSecondary,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              The mechanic
            </Text>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 12,
                paddingHorizontal: 14,
                gap: 10,
              }}
            >
              {examples.map((ex, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      backgroundColor: colors.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Nunito_800ExtraBold',
                        fontSize: 10,
                        color: colors.accent,
                      }}
                    >
                      {i + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Nunito_500Medium',
                      fontSize: 13.5,
                      color: colors.textPrimary,
                      lineHeight: 20,
                      flex: 1,
                    }}
                  >
                    {ex}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Got it button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: 999,
            padding: 15,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Nunito_700Bold',
              fontSize: 15,
              color: colors.textPrimary,
            }}
          >
            Got it
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main export: HelpTooltip ───

// mode "popover" = small inline tooltip
// mode "sheet" = bottom sheet with examples

interface HelpTooltipProps {
  mode: 'popover' | 'sheet';
  title?: string;
  body: string;
  examples?: string[];
  size?: number;
}

export default function HelpTooltip({ mode, title, body, examples, size = 22 }: HelpTooltipProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [triggerPos, setTriggerPos] = useState({ x: 0, y: 0, width: 0, height: 0 });

  return (
    <>
      <HelpTrigger
        size={size}
        onPress={() => setVisible(true)}
        onLayout={(x, y, width, height) => {
          setTriggerPos({ x, y, width, height });
        }}
      />

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        {mode === 'popover' ? (
          <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)}>
            <PopoverContent
              title={title}
              body={body}
              triggerX={triggerPos.x}
              triggerY={triggerPos.y}
              triggerWidth={triggerPos.width}
              triggerHeight={triggerPos.height}
            />
          </Pressable>
        ) : (
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1 }} onPress={() => setVisible(false)} />
            <SheetContent
              title={title || ''}
              body={body}
              examples={examples}
              onDismiss={() => setVisible(false)}
            />
          </View>
        )}
      </Modal>
    </>
  );
}