import AppLayout from "@/components/layout/app-layout";
import { SendComponent } from "@/components/send";
import { VStack } from "@/components/ui/vstack";

export default function SendPage() {
  return (
    <AppLayout>
      <VStack className='px-6 h-full justify-center'>
        <SendComponent />
      </VStack>
    </AppLayout>
  );
}
