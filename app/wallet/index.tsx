import { AccountBalance } from "@/components/account-balance";
import { Transactions } from "@/components/transactions";
import { VStack } from "@/components/ui/vstack";
import { Actions } from "@/components/wallet/actions";
import { ScrollView } from "react-native";

export default function Wallet() {
  return (
    <VStack className='flex-1' space='lg'>
      <AccountBalance />
      <Actions />
      <ScrollView className='flex-1'>
        <Transactions />
      </ScrollView>
    </VStack>
  );
}
