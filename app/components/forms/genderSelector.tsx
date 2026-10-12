import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { Wrapper } from "../wrapper";

type GenderSelectionProps = {
  gender: "male" | "female";
  onChange: (gender: "male" | "female") => void;
  className?: string;
};

export function GenderSelector({ gender, onChange, className }: GenderSelectionProps) {
  const options = [
    { value: "male", label: "M" },
    { value: "female", label: "F" },
  ];

  return (
    <Wrapper direction="column" className={className} gap="gap-2">
      <Text className="w-full font-bold">Gênero</Text>

      <Wrapper
        direction="row"
        align="start"
        justify="start"
        gap="gap-2"
        className="rounded-md bg-base-200 p-2 shadow-sm shadow-base-300"
      >
        {options.map((g) => (
          <Button
            variant={gender === g.value ? "default" : "ghost"}
            key={g.value}
            onPress={() => onChange(g.value as "male" | "female")}
          >
            <Text>{g.label}</Text>
          </Button>
        ))}
      </Wrapper>
    </Wrapper>
  );
}
