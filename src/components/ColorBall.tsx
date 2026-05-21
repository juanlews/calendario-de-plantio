/**
 * ColorBall — preview visual da cor primária do tema atual.
 *
 * Uma única bola estilizada (como a de Samsung/Android 12) que mostra
 * a cor #primary em uso pelo tema Material You.
 * Puramente visual — sem interação.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeCtx } from '../theme/ThemeProvider';

export type ColorBallProps = {
  size?: number;
};

const ColorBall: React.FC<ColorBallProps> = ({ size = 56 }) => {
  const { theme } = useThemeCtx();
  const primaryColor = theme.colors.primary;

  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: primaryColor,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  ball: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ColorBall;
