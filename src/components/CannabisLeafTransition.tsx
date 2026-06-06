import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Caminho SVG de uma folha de cannabis (viewBox 24x24)
// Substitua por um path mais detalhado se quiser
const CANNABIS_LEAF_PATH = 'M12 2.5a.5.5 0 0 1 .5.5v1.28l.96-.26a.5.5 0 0 1 .28.96l-.96.26v1.4l1.1-.63a.5.5 0 0 1 .5.86l-1.1.64.63 1.1a.5.5 0 0 1-.86.5l-.64-1.1v1.4l.96-.26a.5.5 0 0 1 .28.96l-.96.26v1.28a.5.5 0 0 1-1 0v-1.28l-.96.26a.5.5 0 0 1-.28-.96l.96-.26v-1.4l-1.1.63a.5.5 0 0 1-.5-.86l1.1-.64-.63-1.1a.5.5 0 0 1 .86-.5l.64 1.1v-1.4l-.96.26a.5.5 0 0 1-.28-.96l.96-.26v-1.28a.5.5 0 0 1 .5-.5z';

export interface CannabisLeafTransitionProps {
  /** Quando true, inicia a animação de revelação */
  visible: boolean;
  /** Conteúdo a ser revelado (a tela principal do app) */
  children: React.ReactNode;
  /** Callback chamado quando a animação de revelação termina */
  onComplete?: () => void;
  /** Duração da animação em ms (padrão: 1200) */
  duration?: number;
  /** Cor da máscara (deve ser opaco para funcionar) - padrão: black */
  maskColor?: string;
  /** Tamanho base do SVG antes do scale (padrão: 28) */
  baseSize?: number;
}

export const CannabisLeafTransition: React.FC<CannabisLeafTransitionProps> = ({
  visible,
  children,
  onComplete,
  duration = 1200,
  maskColor = 'black',
  baseSize = 28,
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!visible) {
      scale.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) });
      rotation.value = withTiming(0, { duration: 300 });
      return;
    }

    // Escala necessária para cobrir a tela inteira (diagonal)
    const maxDim = Math.sqrt(width * width + height * height);
    const targetScale = (maxDim / baseSize) * 1.2; // 20% extra para garantir cobertura total

    // Sequência: rotação sutil + escala com overshoot + bounce
    scale.value = withSequence(
      // Fase 1: crescimento rápido com overshoot
      withTiming(targetScale * 1.08, {
        duration: duration * 0.65,
        easing: Easing.out(Easing.cubic),
      }),
      // Fase 2: spring bounce de volta ao tamanho alvo
      withTiming(targetScale, {
        duration: duration * 0.35,
        easing: Easing.out(Easing.elastic(1.1)),
      }),
    );

    // Rotação sutil para dar vida orgânica
    rotation.value = withSequence(
      withTiming(-3, { duration: duration * 0.3, easing: Easing.out(Easing.quad) }),
      withTiming(3, { duration: duration * 0.3, easing: Easing.inOut(Easing.quad) }),
      withTiming(-1.5, { duration: duration * 0.2, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: duration * 0.2 }),
    );

    // Callback ao final da animação
    const totalDuration = duration;
    const timeout = setTimeout(() => {
      runOnJS(() => onCompleteRef.current?.())();
    }, totalDuration + 50); // pequena margem

    return () => clearTimeout(timeout);
  }, [visible, width, height, baseSize, duration]);

  const animatedMaskStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // Se não está visível e escala é 0, não renderiza a máscara (otimização)
  if (!visible && scale.value === 0) {
    return null;
  }

  return (
    <MaskedView
      style={styles.containerAbsoluto}
      maskElement={
        <View style={styles.maskContainer} pointerEvents="none">
          <Animated.View style={[styles.svgWrapper, animatedMaskStyle]}>
            <Svg width={baseSize} height={baseSize} viewBox="0 0 24 24">
              <Path d={CANNABIS_LEAF_PATH} fill={maskColor} />
            </Svg>
          </Animated.View>
        </View>
      }
    >
      {children}
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  containerAbsoluto: {
    ...StyleSheet.absoluteFill,
    zIndex: 100, // Acima de tudo
  },
  maskContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    width: 'auto',
    height: 'auto',
  },
});

// Exporta também o path para quem quiser personalizar
export { CANNABIS_LEAF_PATH };