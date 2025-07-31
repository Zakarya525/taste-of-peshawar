import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

export default function SettingsScreen() {
  const { branch, branchUser, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  const handleFeatureNotImplemented = (featureName: string) => {
    Alert.alert(
      "Feature Not Available",
      `${featureName} is not implemented yet. This feature will be available in a future update.`,
      [{ text: "OK" }]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color="#e34691" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent ? (
        rightComponent
      ) : showArrow && onPress ? (
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      ) : null}
    </TouchableOpacity>
  );

  const SwitchItem = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color="#e34691" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#e2e8f0", true: "#e34691" }}
        thumbColor="#ffffff"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* User Info */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={24} color="#ffffff" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {branchUser?.full_name || "User"}
              </Text>
              <Text style={styles.userRole}>{branchUser?.role || "Staff"}</Text>
              <Text style={styles.userBranch}>{branch?.name} Branch</Text>
            </View>
          </View>
        </Card>

        {/* Notifications */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SwitchItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive alerts for new orders"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SwitchItem
            icon="volume-high"
            title="Sound Alerts"
            subtitle="Play sounds for new orders"
            value={soundEnabled}
            onValueChange={setSoundEnabled}
          />
        </Card>

        {/* App Settings */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SwitchItem
            icon="refresh"
            title="Auto Refresh"
            subtitle="Automatically refresh data"
            value={autoRefresh}
            onValueChange={setAutoRefresh}
          />
          <SettingItem
            icon="color-palette"
            title="Theme"
            subtitle="Light mode"
            onPress={() => handleFeatureNotImplemented("Theme Settings")}
          />
          <SettingItem
            icon="language"
            title="Language"
            subtitle="English"
            onPress={() => handleFeatureNotImplemented("Language Settings")}
          />
        </Card>

        {/* Support */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help & FAQ"
            onPress={() => handleFeatureNotImplemented("Help & FAQ")}
          />
          <SettingItem
            icon="document-text"
            title="User Manual"
            onPress={() => handleFeatureNotImplemented("User Manual")}
          />
          <SettingItem
            icon="mail"
            title="Contact Support"
            onPress={() => handleFeatureNotImplemented("Contact Support")}
          />
        </Card>

        {/* About */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy Policy"
            onPress={() => handleFeatureNotImplemented("Privacy Policy")}
          />
          <SettingItem
            icon="document"
            title="Terms of Service"
            onPress={() => handleFeatureNotImplemented("Terms of Service")}
          />
        </Card>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            variant="danger"
            size="large"
            fullWidth
            onPress={signOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e34691",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  userBranch: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  signOutContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});
