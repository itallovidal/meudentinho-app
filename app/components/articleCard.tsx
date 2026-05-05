import { Text } from "./ui/text";
import { Wrapper } from "./wrapper";

export function ArticleCard({
  image,
  title,
  category,
  className = "",
}: {
  image: React.ReactNode;
  title: string;
  category: string;
  className?: string;
}) {
  return (
    <Wrapper
      className={`w-full overflow-hidden rounded-3xl bg-primary-500 px-5 py-6 ${className}`}
      direction="column"
      align="start"
      justify="start"
    >
      {image}
      <Text variant="h3" className="mt-4">
        {title}
      </Text>
      <Text variant="h4" className="mt-2 text-base-300">
        {category}
      </Text>
    </Wrapper>
  );
}
