import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export function ShowSuccess() {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successContent}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={40} color="#10b981" />
        </View>
        <Text style={styles.successTitle}>Success!</Text>
        <Text style={styles.successSubtitle}>Data saved successfully</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
     successContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#d1fae5',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
})