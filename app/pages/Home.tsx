import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StyleSheet, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Button><Text>oi! ta ai!</Text>
      </Button>
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
