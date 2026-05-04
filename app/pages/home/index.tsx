import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { fetchHealthcheck } from '@/api/healthcheck';
import { StyleSheet, View } from 'react-native';

export function Home() {
  const handleMockTest = async () => {
    try {
      const result = await fetchHealthcheck();
      console.log('healthcheck mock:', result);
    } catch (error) {
      console.error('healthcheck mock error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Button onPress={handleMockTest}>
        <Text>testar mock!</Text>
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
