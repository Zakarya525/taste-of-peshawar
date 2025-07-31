import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<'Cardiff' | 'Wembley' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password || !selectedBranch) {
      Alert.alert('Error', 'Please fill in all fields and select a branch');
      return;
    }

    setIsLoading(true);
    console.log('Attempting login for:', email, 'branch:', selectedBranch);
    const { error } = await signIn(email, password, selectedBranch);
    setIsLoading(false);

    if (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    } else {
      console.log('Login successful, redirect should happen automatically');
    }
  };

  const BranchButton = ({ branch, name, color }: { branch: 'Cardiff' | 'Wembley'; name: string; color: string }) => (
    <Button
      title={name}
      variant={selectedBranch === branch ? 'primary' : 'outline'}
      size="large"
      fullWidth
      style={[styles.branchButton, { borderColor: color }]}
      onPress={() => setSelectedBranch(branch)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant" size={48} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Taste of Peshawar</Text>
            <Text style={styles.subtitle}>Restaurant Management</Text>
          </View>

          <Card variant="elevated" padding="large" margin="medium">
            <Text style={styles.sectionTitle}>Select Branch</Text>
            <View style={styles.branchContainer}>
              <BranchButton
                branch="Cardiff"
                name="Cardiff Branch"
                color="#3b82f6"
              />
              <View style={styles.branchSpacer} />
              <BranchButton
                branch="Wembley"
                name="Wembley Branch"
                color="#10b981"
              />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Login Details</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                title="Sign In"
                size="large"
                fullWidth
                loading={isLoading}
                onPress={handleLogin}
                style={styles.loginButton}
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure access to restaurant management system
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  branchContainer: {
    marginBottom: 24,
  },
  branchSpacer: {
    height: 12,
  },
  branchButton: {
    marginBottom: 8,
  },
  formContainer: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
}); 