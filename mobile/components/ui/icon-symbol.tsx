import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleSheet } from 'react-native';

export type IconSymbolProps = SymbolViewProps & {
  name: string;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
};

export function IconSymbol({ name, size = 24, color = '#000', weight = 'regular', style, ...props }: IconSymbolProps) {
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color}
      weight={weight}
      style={[styles.icon, { width: size, height: size }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
});


