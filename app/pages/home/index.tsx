import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { fetchHealthcheck } from "@/api/healthcheck";
import { Wrapper } from "@/components/wrapper";
import { Header } from "@/components/header";

export function Home() {
  const handleMockTest = async () => {
    try {
      const result = await fetchHealthcheck();
      console.log("healthcheck mock:", result);
    } catch (error) {
      console.error("healthcheck mock error:", error);
    }
  };

  return (
    <Wrapper
      className="bg-base-100 flex-1"
      direction="column"
      align="center"
      justify="start"
    >
      <Header />
      <Wrapper
        className="bg-base-100 flex-1"
        direction="column"
        align="center"
        justify="center"
      >
        <Text>Home</Text>
        <Button onPress={handleMockTest}>
          <Text>testar mock!</Text>
        </Button>
      </Wrapper>
    </Wrapper>
  );
}
