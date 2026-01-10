import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  // TODO: Implement registration form with useAuthStore

  const handleRegister = () => {
    // TODO: Call auth service
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-lg pt-3xl pb-xl">
          <Text className="text-3xl font-bold text-text-primary mb-xs">Create account</Text>
          <Text className="text-base text-text-secondary">Join Bitenex to start ordering</Text>
        </View>

        <View className="flex-1 px-lg pb-2xl">
          {/* Name Input */}
          <View className="mb-lg">
            <Text className="text-sm font-medium text-text-primary mb-sm">Full Name</Text>
            <TextInput
              className="h-12 border border-border-light rounded-md px-md text-base"
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </View>

          {/* Email Input */}
          <View className="mb-lg">
            <Text className="text-sm font-medium text-text-primary mb-sm">Email</Text>
            <TextInput
              className="h-12 border border-border-light rounded-md px-md text-base"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Phone Input */}
          <View className="mb-lg">
            <Text className="text-sm font-medium text-text-primary mb-sm">Phone Number</Text>
            <TextInput
              className="h-12 border border-border-light rounded-md px-md text-base"
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Password Input */}
          <View className="mb-lg">
            <Text className="text-sm font-medium text-text-primary mb-sm">Password</Text>
            <TextInput
              className="h-12 border border-border-light rounded-md px-md text-base"
              placeholder="Create a password"
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          {/* Confirm Password Input */}
          <View className="mb-lg">
            <Text className="text-sm font-medium text-text-primary mb-sm">Confirm Password</Text>
            <TextInput
              className="h-12 border border-border-light rounded-md px-md text-base"
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="password-new"
            />
          </View>

          {/* Terms */}
          <Text className="text-sm text-text-secondary text-center mb-2xl" style={{ lineHeight: 20 }}>
            By signing up, you agree to our{' '}
            <Text className="text-primary-500">Terms of Service</Text> and{' '}
            <Text className="text-primary-500">Privacy Policy</Text>
          </Text>

          {/* Register Button */}
          <TouchableOpacity className="h-[52px] bg-primary-500 rounded-xl items-center justify-center mb-2xl" onPress={handleRegister}>
            <Text className="text-base font-semibold text-text-inverse">Create Account</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-base text-text-secondary">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-base text-primary-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
