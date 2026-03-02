import LogoFull from "@/components/icons/logo";
import { VStack } from "@/components/ui/vstack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";

export default function AuthLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <VStack
        className='items-center bg-arkaic-background h-full px-arkaic-md pt-arkaic-xl pb-arkaic-lg'
        space={"4xl"}
      >
        <VStack className='items-center'>
          <LogoFull height={32} width={246} />
        </VStack>
        <VStack className='flex-1 w-full'>{props.children}</VStack>
      </VStack>
    </QueryClientProvider>
  );
}
