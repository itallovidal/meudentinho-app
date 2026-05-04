import { StyleSheet, Text, View } from 'react-native';

export function Signup() {
  return (
    <View style={styles.container}>
      <Text>Signup</Text>
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
