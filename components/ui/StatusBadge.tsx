import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../../constants/Colors';

interface StatusBadgeProps {
  status: 'New' | 'Preparing' | 'Ready' | 'Completed';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  animated = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'New':
        return {
          color: Colors.primary[500],
          backgroundColor: Colors.primary[50],
          icon: 'add-circle',
          text: 'New',
        };
      case 'Preparing':
        return {
          color: Colors.warning[500],
          backgroundColor: Colors.warning[50],
          icon: 'time',
          text: 'Preparing',
        };
      case 'Ready':
        return {
          color: Colors.success[500],
          backgroundColor: Colors.success[50],
          icon: 'checkmark-circle',
          text: 'Ready',
        };
      case 'Completed':
        return {
          color: Colors.neutral[500],
          backgroundColor: Colors.neutral[100],
          icon: 'checkmark-done',
          text: 'Completed',
        };
      default:
        return {
          color: Colors.neutral[500],
          backgroundColor: Colors.neutral[100],
          icon: 'help-circle',
          text: status,
        };
    }
  };

  const config = getStatusConfig();

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          padding: Theme.spacing.xs,
          fontSize: Theme.typography.fontSize.xs,
          iconSize: 12,
          borderRadius: Theme.borderRadius.sm,
        };
      case 'medium':
        return {
          padding: Theme.spacing.sm,
          fontSize: Theme.typography.fontSize.sm,
          iconSize: 14,
          borderRadius: Theme.borderRadius.md,
        };
      case 'large':
        return {
          padding: Theme.spacing.md,
          fontSize: Theme.typography.fontSize.md,
          iconSize: 16,
          borderRadius: Theme.borderRadius.lg,
        };
      default:
        return {
          padding: Theme.spacing.sm,
          fontSize: Theme.typography.fontSize.sm,
          iconSize: 14,
          borderRadius: Theme.borderRadius.md,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeConfig.padding,
          paddingVertical: sizeConfig.padding / 2,
          borderRadius: sizeConfig.borderRadius,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={sizeConfig.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: sizeConfig.fontSize,
            fontWeight: Theme.typography.fontWeight.medium,
          },
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Theme.spacing.xs,
  },
  text: {
    textAlign: 'center',
  },
}); 