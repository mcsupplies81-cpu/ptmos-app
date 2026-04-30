import { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'

interface ProGateProps {
  children: ReactNode
  limitReached: boolean
  onUpgrade: () => void
}

export const FREE_TIER_LIMITS = {
  activeProtocols: 1,
  inventoryItems: 1,
  doseLogs: 30,
}

export function ProGate({ children, limitReached, onUpgrade }: ProGateProps) {
  const isPro = useAuthStore((state) => state.isPro)

  if (!isPro && limitReached) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Upgrade to Pro to unlock this feature</Text>
        <Pressable style={styles.button} onPress={onUpgrade}>
          <Text style={styles.buttonText}>Upgrade to Pro</Text>
        </Pressable>
      </View>
    )
  }

  return <>{children}</>
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.card,
    gap: 12,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: Colors.background,
    fontWeight: '600',
  },
})
