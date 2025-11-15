import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
  bgColor: string;
}

const menuItems: MenuItem[] = [
  { icon: 'pulse', label: 'Log Migraine', route: '/migraine', color: '#9333ea', bgColor: '#f3e8ff' },
  { icon: 'book', label: 'Diary', route: '/diary', color: '#2563eb', bgColor: '#dbeafe' },
  { icon: 'bar-chart', label: 'Dashboard', route: '/dashboard', color: '#10b981', bgColor: '#d1fae5' },
  { icon: 'trending-up', label: 'Patterns', route: '/patterns', color: '#f59e0b', bgColor: '#fef3c7' },
  { icon: 'document', label: 'Export', route: '/export', color: '#dc2626', bgColor: '#fecaca' },
];

export default function FloatingMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(rotationAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const handleMenuItemPress = (route: string) => {
    toggleMenu();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const menuIconOpacity = rotationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const closeIconOpacity = rotationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const menuIconRotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const closeIconRotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFillObject} onPress={toggleMenu} />
        </Animated.View>
      )}

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const itemAnimation = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(menuItems.length - index) * 74],
        });

        const itemOpacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        const itemScale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <Animated.View
            key={item.route}
            style={[
              styles.menuItemContainer,
              {
                transform: [
                  { translateY: itemAnimation },
                  { scale: itemScale },
                ],
                opacity: itemOpacity,
              },
            ]}
            pointerEvents={isOpen ? 'auto' : 'none'}
          >
            <Pressable
              onPress={() => handleMenuItemPress(item.route)}
              style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: item.bgColor },
                pressed && styles.menuItemPressed,
              ]}
            >
              <View style={styles.menuItemContent}>
                 <Text style={[styles.menuItemText, { color: item.color }]}>{item.label}</Text>
                <View style={[styles.menuIconContainer, { backgroundColor: '#fff' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}

      {/* Main Menu Button */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={toggleMenu}
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
        >
          <View style={{ position: 'relative', width: 32, height: 32 }}>
            <Animated.View 
              style={{ 
                opacity: menuIconOpacity, 
                position: 'absolute',
                transform: [{ rotate: menuIconRotation }],
              }}
            >
              <Ionicons name="menu" size={32} color="#fff" />
            </Animated.View>
            <Animated.View 
              style={{ 
                opacity: closeIconOpacity,
                transform: [{ rotate: closeIconRotation }],
              }}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </Animated.View>
          </View>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1,
  },
  menuItemContainer: {
    position: 'absolute',
    bottom: 60,
    right: 24,
    zIndex: 2,
  },
  menuItem: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItemPressed: {
    transform: [{ scale: 0.96 }],
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 3,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.9 }],
  },
});
