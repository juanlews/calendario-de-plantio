import React, { useEffect } from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// ─── tipos ────────────────────────────────────────────────────────────────

export type AuthState = 'idle' | 'loading' | 'error';

export interface LockIconProps {
  locked: boolean;
  authState?: AuthState;
  size?: number;
  color?: string; // pega do tema do app
  errorColor?: string;
  loadingColor?: string;
}

// ─── componentes animados ────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── constantes ───────────────────────────────────────────────────────────

// Pivô real de um cadeado: lado DIREITO da aste (x=17, y=10 no viewBox 24×24)
// A aste gira em sentido horário — o lado esquerdo (livre) sobe
const OPEN_DEG = 55; // posição aberta
const OVERSHOOT_DEG = 68; // overshoot antes do bounce

// ─── componente ───────────────────────────────────────────────────────────

export const LockIcon: React.FC<LockIconProps> = ({
  locked,
  authState = 'idle',
  size = 64,
  color = '#1D9E75',
  errorColor = '#E24B4A',
  loadingColor = '#BA7517',
}) => {
  const rotation = useSharedValue(locked ? 0 : OPEN_DEG);
  const shakeX = useSharedValue(0);
  const keyholeAlpha = useSharedValue(locked ? 1 : 0);

  useEffect(() => {
    // ── loading: pulso leve enquanto aguarda biometria ─────────────────
    if (authState === 'loading') {
      rotation.value = withSpring(locked ? 6 : OPEN_DEG + 4, {
        damping: 6,
        stiffness: 120,
      });
      return;
    }

    // ── error: shake mais agressivo, sem mover a aste ─────────────────
    if (authState === 'error') {
      shakeX.value = withSequence(
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-1.5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      // Volta à posição correta
      rotation.value = withSpring(locked ? 0 : OPEN_DEG, {
        damping: 15,
        stiffness: 200,
      });
      keyholeAlpha.value = withTiming(locked ? 1 : 0, { duration: 200 });
      return;
    }

    // ── abrir ─────────────────────────────────────────────────────────────
    if (!locked) {
      // Aste: snap rápido para overshoot → spring de volta para OPEN_DEG
      rotation.value = withSequence(
        withTiming(OVERSHOOT_DEG, {
          duration: 160,
          easing: Easing.out(Easing.cubic),
        }),
        withSpring(OPEN_DEG, {
          damping: 7,
          stiffness: 200,
          mass: 0.7,
        }),
      );

      // Keyhole some rápido junto com o snap
      keyholeAlpha.value = withTiming(0, { duration: 100 });

      // Corpo: shake síncrono com o estalo (delay = metade do snap)
      shakeX.value = withDelay(80, withSequence(
        withTiming(-3, { duration: 45 }),
        withTiming(3, { duration: 45 }),
        withTiming(-2, { duration: 45 }),
        withTiming(2, { duration: 45 }),
        withTiming(-1.2, { duration: 45 }),
        withTiming(1.2, { duration: 45 }),
        withTiming(-0.6, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      ));

      // ── fechar ────────────────────────────────────────────────────────────
    } else {
      // Aste: ultrapassa levemente (negativo) e mola de volta
      rotation.value = withSequence(
        withTiming(-6, {
          duration: 110,
          easing: Easing.in(Easing.cubic),
        }),
        withSpring(0, {
          damping: 12,
          stiffness: 260,
        }),
      );

      // Keyhole aparece depois que a aste trava
      keyholeAlpha.value = withDelay(180, withTiming(1, { duration: 200 }));

      // Shake menor: sensação de "clique" do mecanismo
      shakeX.value = withDelay(60, withSequence(
        withTiming(-2, { duration: 40 }),
        withTiming(2, { duration: 40 }),
        withTiming(-1, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      ));
    }
  }, [locked, authState]);

  // ── pivô em coordenadas do View (proporção 17/24 e 10/24) ────────────────
  const pivotX = (17 / 24) * size;
  const pivotY = (10 / 24) * size;

  // Aste gira em torno do pivô direito
  const shackleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pivotX },
      { translateY: pivotY },
      { rotate: `${rotation.value}deg` },
      { translateX: -pivotX },
      { translateY: -pivotY },
    ],
  }));

  // Corpo inteiro se move no eixo X (shake)
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Keyhole: opacidade animada via animatedProps
  const keyholeProps = useAnimatedProps(() => ({
    opacity: keyholeAlpha.value,
  }));

  // Cor reage ao authState
  const activeColor =
    authState === 'error' ? errorColor :
    authState === 'loading' ? loadingColor :
    color;

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>

      {/* Corpo + buraco da fechadura */}
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="10" width="16" height="11" rx="2" fill={activeColor} />
        <AnimatedCircle
          cx="12"
          cy="15.5"
          r="1.5"
          fill="white"
          animatedProps={keyholeProps}
        />
      </Svg>

      {/* Aste — View separado para transform independente do corpo */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: 0, left: 0, width: size, height: size },
          shackleStyle,
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M7 10V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V10"
            stroke={activeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

    </Animated.View>
  );
};