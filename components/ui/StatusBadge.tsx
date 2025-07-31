import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          bgColor: 'bg-primary-50',
          textColor: 'text-primary-500',
          icon: 'add-circle',
          text: 'New',
        };
      case 'Preparing':
        return {
          bgColor: 'bg-warning-50',
          textColor: 'text-warning-500',
          icon: 'time',
          text: 'Preparing',
        };
      case 'Ready':
        return {
          bgColor: 'bg-success-50',
          textColor: 'text-success-500',
          icon: 'checkmark-circle',
          text: 'Ready',
        };
      case 'Completed':
        return {
          bgColor: 'bg-neutral-100',
          textColor: 'text-neutral-500',
          icon: 'checkmark-done',
          text: 'Completed',
        };
      default:
        return {
          bgColor: 'bg-neutral-100',
          textColor: 'text-neutral-500',
          icon: 'help-circle',
          text: status,
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'px-1 py-0.5 rounded-sm',
          text: 'text-xs',
          iconSize: 12,
        };
      case 'medium':
        return {
          container: 'px-2 py-1 rounded-md',
          text: 'text-sm',
          iconSize: 14,
        };
      case 'large':
        return {
          container: 'px-4 py-2 rounded-lg',
          text: 'text-base',
          iconSize: 16,
        };
      default:
        return {
          container: 'px-2 py-1 rounded-md',
          text: 'text-sm',
          iconSize: 14,
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <View
      className={`flex-row items-center justify-center ${config.bgColor} ${sizeClasses.container}`}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as any}
          size={sizeClasses.iconSize}
          color={config.textColor.replace('text-', '').split('-').join('-')}
          className="mr-1"
        />
      )}
      <Text
        className={`text-center font-medium ${config.textColor} ${sizeClasses.text}`}
      >
        {config.text}
      </Text>
    </View>
  );
}; 