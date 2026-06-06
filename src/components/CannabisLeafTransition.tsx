import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';
import CannabisLeafSvg from '../../assets/Cannabis_leaf.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CannabisLeafTransitionProps {
  /** Quando true, inicia a animação completa (cresce → troca → encolhe) */
  visible: boolean;
  /** Conteúdo ANTES da transição (tela de auth) */
  fromChildren?: React.ReactNode;
  /** Conteúdo DEPOIS da transição (app principal) */
  toChildren?: React.ReactNode;
  /** Callback chamado quando a transição completa (encolheu totalmente) */
  onComplete?: () => void;
  /** Duração fase crescer (ms) - padrão: 800 */
  growDuration?: number;
  /** Duração fase encolher (ms) - padrão: 400 */
  shrinkDuration?: number;
  /** Cor da folha (padrão: primary do tema) */
  leafColor?: string;
  /** Atraso entre cobrir tela e começar encolher (ms) - padrão: 50 */
  swapDelay?: number;
}

type Phase = 'idle' | 'growing' | 'swapping' | 'shrinking' | 'done';

export const CannabisLeafTransition: React.FC<CannabisLeafTransitionProps> = ({
  visible,
  fromChildren,
  toChildren,
  onComplete,
  growDuration = 800,
  shrinkDuration = 400,
  leafColor = '#1D9E75',
  swapDelay = 50,
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const phase = useRef<Phase>('idle');
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [showToContent, setShowToContent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Diagonal da tela + margem para garantir cobertura total
  const maxDim = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT);
  const baseSize = 100; // viewBox do SVG
  const targetScale = (maxDim / baseSize) * 1.5; // 50% extra para cobrir cantos

  useEffect(() => {
    if (!visible) {
      // Reset para estado inicial
      scale.value = 0;
      rotation.value = 0;
      opacity.value = 1;
      phase.current = 'idle';
      setShowToContent(false);
      setIsAnimating(false);
      return;
    }

    if (phase.current !== 'idle') return; // Evita re-trigger
    phase.current = 'growing';
    setIsAnimating(true);

    // ===== FASE 1: CRESCER do centro até cobrir tela =====
    scale.value = withSequence(
      // Crescimento rápido com overshoot orgânico
      withTiming(targetScale * 1.12, {
        duration: growDuration * 0.7,
        easing: Easing.out(Easing.cubic),
      }),
      // Spring bounce para tamanho final
      withTiming(targetScale, {
        duration: growDuration * 0.3,
        easing: Easing.out(Easing.elastic(1.2)),
      }),
    );

    // Rotação sutil orgânica durante crescimento
    rotation.value = withSequence(
      withTiming(-4, { duration: growDuration * 0.25, easing: Easing.out(Easing.quad) }),
      withTiming(4, { duration: growDuration * 0.25, easing: Easing.inOut(Easing.quad) }),
      withTiming(-2, { duration: growDuration * 0.2, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: growDuration * 0.2 }),
    );

    // Troca conteúdo ao final do crescimento (usa setTimeout baseado na duração conhecida)
    const swapTimeout = setTimeout(() => {
      phase.current = 'swapping';
      setShowToContent(true); // Troca fromChildren → toChildren
    }, growDuration);

    // ===== FASE 2 + 3: Após swapDelay, ENCLHER =====
    const totalGrowTime = growDuration + swapDelay;
    const shrinkTimeout = setTimeout(() => {
      if (phase.current !== 'swapping') return;
      phase.current = 'shrinking';

      // Encolhe rápido com ease-in (sensação de "apagar")
      scale.value = withTiming(0, {
        duration: shrinkDuration,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: shrinkDuration * 0.6,
        easing: Easing.in(Easing.quad),
      });

      // Callback final
      const finalTimeout = setTimeout(() => {
        runOnJS(() => {
          phase.current = 'done';
          setIsAnimating(false);
          onCompleteRef.current?.();
        })();
      }, shrinkDuration + 20);

      return () => clearTimeout(finalTimeout);
    }, totalGrowTime);

    return () => {
      clearTimeout(swapTimeout);
      clearTimeout(shrinkTimeout);
    };
  }, [visible, targetScale, growDuration, shrinkDuration, swapDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  // Não renderiza nada se idle e invisible
  if (!visible && phase.current === 'idle') {
    return fromChildren ?? null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Conteúdo de baixo (fromChildren ou toChildren) */}
      <View style={styles.contentLayer}>
        {showToContent ? toChildren : fromChildren}
      </View>

      {/* Folha animada POR CIMA de tudo */}
      <Animated.View style={[styles.leafWrapper, animatedStyle]}>
        <CannabisLeafSvg width={baseSize} height={baseSize} fill={leafColor} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999, // Acima de TUDO (modals, headers, etc)
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  contentLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  leafWrapper: {
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});