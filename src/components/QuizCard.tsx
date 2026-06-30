import { Text, TouchableOpacity } from "react-native";
import { sharedStyles } from "../theme/sharedStyles";

type Props = {
  text: string;
  onPress: () => void;
  disabled: boolean;
  isMatched: boolean;
  isSelected: boolean;
  isWrong: boolean;
};

export function QuizCard(props: Props) {
  return (
    <TouchableOpacity
      style={[
        sharedStyles.quizCard,
        props.isMatched && sharedStyles.quizCardMatched,
        props.isWrong && sharedStyles.quizCardWrong,
        props.isSelected && sharedStyles.quizCardSelected,
      ]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={sharedStyles.quizCardText}>{props.text}</Text>
    </TouchableOpacity>
  );
}
