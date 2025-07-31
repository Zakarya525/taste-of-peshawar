import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, Theme } from "../../constants/Colors";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="restaurant" size={48} color={Colors.primary[500]} />
        </View>
        <Text style={styles.title}>Taste of Peshawar</Text>
        <Text style={styles.subtitle}>Restaurant Management</Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.fontSize["3xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: Theme.spacing.xxl,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: Theme.typography.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Theme.spacing.lg,
    textAlign: "center",
  },
});
