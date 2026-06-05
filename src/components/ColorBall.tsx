/**
 * ColorBall — preview visual da cor primária do tema.
 *
 * Distribuição da bola (estilo "gráfico de pizza") — 4 segmentos:
 * - 50% (meia bola): cor primária principal (primary) — 180°
 * - 25% (1/4): cor de fundo/surface (background no light, surface no dark) — 90°
 * - 25% (1/4): cor secundária (secondary) — 3ª cor mais usada na UI — 90°
 * - Completa o círculo: primaryContainer (harmonia visual) — 90°
 * Total = 360° (círculo completo)
 *
 * Pode receber cores específicas (para preview no modal) ou usar o tema atual (padrão).
 * Usa react-native-svg para desenho vetorial preciso.
 * Puramente visual — sem interação.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useThemeCtx } from '../theme/ThemeProvider';
import type { MD3Theme } from 'react-native-paper';

export type ColorBallProps = {
  size?: number;
  /** Cores específicas para preview (ex: no modal de seleção de tema) */
  themeColors?: MD3Theme['colors'];
  /** Se true, usa background/surface do tema light; se false, do dark */
  isDark?: boolean;
};

const ColorBall: React.FC<ColorBallProps> = ({
  size = 80,
  themeColors,
  isDark,
}) => {
  const { theme, isDark: currentIsDark } = useThemeCtx();

  // Se passou themeColors, usa elas; senão usa o tema atual
  const colors = themeColors ?? theme.colors;
  const darkMode = isDark ?? currentIsDark;

  const primary = colors.primary;
  const background = colors.background;
  const surface = colors.surface;
  const secondary = colors.secondary;
  const primaryContainer = colors.primaryContainer;

  // Cor de fundo: background no light, surface no dark
  const backgroundColor = darkMode ? surface : background;

  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Função para gerar path de arco SVG (setor circular)
  // startAngle e endAngle em graus, onde 0° = direita, 90° = baixo, -90° = topo
  const arcPath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Segmento 1: Primary (50% - topo/meia bola) - de -90° a 90° = 180° */}
        <Path d={arcPath(-90, 90)} fill={primary} />

        {/* Segmento 2: Background/Surface (25% - direita) - de 90° a 180° = 90° */}
        <Path d={arcPath(90, 180)} fill={backgroundColor} />

        {/* Segmento 3: Secondary (25% - baixo/esquerda) - de 180° a 270° = 90° */}
        <Path d={arcPath(180, 270)} fill={secondary} />

        {/* Segmento 4: PrimaryContainer (25% - esquerda) - de 270° a 360° = 90° */}
        <Path d={arcPath(270, 360)} fill={primaryContainer} />

        {/* Borda externa sutil */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - 1}
          fill="none"
          stroke={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
          strokeWidth={1.5}
        />

        {/* Ponto central decorativo */}
        <Circle
          cx={radius}
          cy={radius}
          r={size * 0.08}
          fill={darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ColorBall;