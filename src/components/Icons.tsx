import Svg, { Path, Circle, G, Rect } from 'react-native-svg';

// Streak flame icon - warm, filled
export function IconFlame({ size = 22, color = '#C4835A' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c.6 2.4-.8 3.6-2.2 5.2-1.7 1.9-3 3.7-3 6.3A5.2 5.2 0 0 0 12 19.8a5.2 5.2 0 0 0 5.2-5.3c0-2-1-3.4-2-4.6-.5.9-1.3 1.5-2.3 1.5C13.6 8.9 13 6.3 12 3Z"
        fill={color} stroke={color} strokeWidth={1.4} strokeLinejoin="round"
      />
    </Svg>
  );
}

// Freeze balance snowflake
export function IconSnowflake({ size = 14, color = '#7A7068' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3v18" />
        <Path d="M3 12h18" />
        <Path d="M5.6 5.6l12.8 12.8" />
        <Path d="M18.4 5.6L5.6 18.4" />
        <Path d="M9.5 5L12 7.5 14.5 5" />
        <Path d="M9.5 19L12 16.5 14.5 19" />
        <Path d="M5 9.5L7.5 12 5 14.5" />
        <Path d="M19 9.5L16.5 12 19 14.5" />
      </G>
    </Svg>
  );
}

// Checkmark
export function IconCheck({ size = 14, color = '#fff', strokeWidth = 2.4 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Plus icon for FAB and add buttons
export function IconPlus({ size = 22, color = '#fff', strokeWidth = 2.2 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" />
    </Svg>
  );
}

// Bottom nav - Today tab
export function IconHome({ size = 24, color = '#000', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8.8Z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round"
        fill={filled ? color : 'none'} fillOpacity={filled ? 0.15 : 0}
      />
    </Svg>
  );
}

// Bottom nav - Journey tab
export function IconChart({ size = 24, color = '#000', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={4} y={13} width={4} height={7} rx={1.2}
          fill={filled ? color : 'none'} fillOpacity={filled ? 0.15 : 0} />
        <Rect x={10} y={8} width={4} height={12} rx={1.2}
          fill={filled ? color : 'none'} fillOpacity={filled ? 0.15 : 0} />
        <Rect x={16} y={4} width={4} height={16} rx={1.2}
          fill={filled ? color : 'none'} fillOpacity={filled ? 0.15 : 0} />
      </G>
    </Svg>
  );
}

// Bottom nav - Settings tab
export function IconGear({ size = 24, color = '#000', filled = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={12} cy={12} r={3}
          fill={filled ? color : 'none'} fillOpacity={filled ? 0.15 : 0} />
        <Path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M5.6 18.4l1.6-1.6M16.8 7.2l1.6-1.6" />
      </G>
    </Svg>
  );
}

// Right chevron for banners and list items
export function IconChevronRight({ size = 16, color = '#000' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Habit card status indicator
// States: unpledged (dashed), pledged (outline), completed (filled + check),
// partial (half-filled), skipped (dash through)
interface StatusCircleProps {
  state: 'unpledged' | 'pledged' | 'completed' | 'partial' | 'skipped';
  accent: string;
  muted: string; // textTertiary color for inactive states
  size?: number;
}

export function StatusCircle({ state, accent, muted, size = 30 }: StatusCircleProps) {
  const stateLabels: Record<string, string> = {
    unpledged: 'Not pledged',
    pledged: 'Pledged',
    completed: 'Completed',
    partial: 'Partially completed',
    skipped: 'Skipped',
  };
  const sw = 2;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;

  if (state === 'unpledged') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={stateLabels[state]}>
        <Circle cx={cx} cy={cy} r={r} stroke={muted} strokeWidth={sw}
          fill="none" strokeDasharray="3 3" />
      </Svg>
    );
  }

  if (state === 'pledged') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={stateLabels[state]}>
        <Circle cx={cx} cy={cy} r={r} stroke={accent} strokeWidth={sw} fill="none" />
      </Svg>
    );
  }

  if (state === 'completed') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={stateLabels[state]}>
        <Circle cx={cx} cy={cy} r={r + sw / 2} fill={accent} />
        <Path d={`M${cx - 6} ${cy} l4 4 l8 -8`} stroke="#fff" strokeWidth={2.4}
          strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    );
  }

  if (state === 'partial') {
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={stateLabels[state]}>
        <Circle cx={cx} cy={cy} r={r} stroke={accent} strokeWidth={sw} fill="none" />
        <Path d={`M${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} fill={accent} />
      </Svg>
    );
  }

  // skipped
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel={stateLabels[state]}>
      <Circle cx={cx} cy={cy} r={r} stroke={muted} strokeWidth={sw} fill="none" />
      <Path d={`M${cx - 5} ${cy} l10 0`} stroke={muted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}