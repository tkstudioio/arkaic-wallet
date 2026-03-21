import { BackupSeedphrase } from "@/components/account/backup-seedphrase";
import { DeleteAccount } from "@/components/account/delete-account";
import { Logout } from "@/components/account/logout";
import { Card } from "@/components/ui/card";
import { H1, Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import useAccountStore from "@/stores/account";

export default function SettingsPage() {
  const { account } = useAccountStore();

  if (!account) return null;

  return (
    <>
      <VStack space={"4xl"}>
        <VStack space={"md"}>
          <H1>Account</H1>

          <Card>
            <Large>{account!.name}</Large>
          </Card>
          {account && <P>Account: </P>}
        </VStack>

        <VStack space={"lg"}>
          <BackupSeedphrase />
          <DeleteAccount />

          <Logout />
        </VStack>
      </VStack>
    </>
  );
}
