import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-primary text-orange-500">Rhythmé App</Text>
      <Link href={"/(tabs)/Focus"}>Focus Page</Link>
      <Link href={"/(tabs)/Habits"}>Habits Page</Link>
      <Link href={"/(tabs)/Tasks"}>Tasks Page</Link>
      <Link href={"/(tabs)/Goals"}>Goals Page</Link>
    </View>
  );
}
