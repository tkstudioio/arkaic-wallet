import { VStack } from "@/components/ui/vstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";

export default function AuthLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <VStack className='my-auto items-center ' space={"4xl"}>
        <VStack>{props.children}</VStack>
      </VStack>
    </QueryClientProvider>
  );
}
