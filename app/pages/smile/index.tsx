import { StyleSheet, Text, View } from 'react-native';

export function Smile() {
  return (
    <View style={styles.container}>
      <Text>Smile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
