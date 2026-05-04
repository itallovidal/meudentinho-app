import { StyleSheet, Text, View } from 'react-native';

export function Article() {
  return (
    <View style={styles.container}>
      <Text>Article</Text>
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
