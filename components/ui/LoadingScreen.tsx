import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <View className="flex-1 bg-background-primary justify-center items-center">
      <View className="items-center px-8">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-8">
          <Ionicons name="restaurant" size={48} color="#f37a1d" />
        </View>
        <Text className="text-3xl font-bold text-text-primary mb-1 text-center">
          Taste of Peshawar
        </Text>
        <Text className="text-base text-text-secondary mb-12 text-center">
          Restaurant Management
        </Text>

        <View className="items-center">
          <ActivityIndicator size="large" color="#f37a1d" />
          <Text className="text-base text-text-secondary mt-6 text-center">
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};
