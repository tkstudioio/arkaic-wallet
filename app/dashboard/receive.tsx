import AppLayout from "@/components/layout/app-layout";
import { ReceiveComponent } from "@/components/receive";
import { VStack } from "@/components/ui/vstack";

export default function ReceivePage() {
  return (
    <AppLayout>
      <VStack className='px-6 h-full  justify-center'>
        <ReceiveComponent />
      </VStack>
    </AppLayout>
  );
}
