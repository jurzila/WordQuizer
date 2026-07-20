import { Animated, Text, TouchableOpacity } from "react-native";
import { sharedStyles } from "../theme/sharedStyles";
import { useEffect, useRef } from "react";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
  text: string;
  onPress: () => void;
  disabled: boolean;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
  onWrongAnimationComplete?: () => void;
};

export function QuizCard(props: Props) {
  const wrongAnim = useRef(new Animated.Value(0)).current;
  const animatedBackground = wrongAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#9ad1e6", "#c9181e"],
  });

  useEffect(() => {
    if (props.isWrong) {
      Animated.sequence([
        Animated.timing(wrongAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: false,
        }),
        Animated.timing(wrongAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start(() => {
        props.onWrongAnimationComplete?.();
      });
    }
  }, [props.isWrong]);
  return (
    <AnimatedTouchable
      style={[
        sharedStyles.quizCard,
        props.isMatched && sharedStyles.quizCardMatched,
        props.isSelected && sharedStyles.quizCardSelected,
        !props.isMatched && { backgroundColor: animatedBackground },
      ]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={sharedStyles.quizCardText}>{props.text}</Text>
    </AnimatedTouchable>
  );
}
