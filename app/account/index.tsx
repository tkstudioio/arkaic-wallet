import { BackupSeedphrase } from "@/components/account/backup-seedphrase";
import { DeleteAccount } from "@/components/account/delete-account";
import { Avatar, AvatarFallbackText } from "@/components/ui/avatar";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Large, Muted, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useLogout } from "@/hooks/account/use-logout";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { first } from "lodash";
import { ChevronRight, LogOut } from "lucide-react-native";
import { ScrollView } from "react-native";

export default function Account() {
  const { account, fingerprint } = useAccountStore();
  const { mutate: logout } = useLogout();
  const router = useRouter();

  if (!account) return null;

  return (
    <VStack className='flex-1'>
      <VStack space={"xl"}>
        <Card>
          <VStack space='md'>
            <HStack>
              <VStack className='flex-1'>
                <Large>{account.name}</Large>
                <P>{fingerprint}</P>
              </VStack>
              <Avatar>
                <AvatarFallbackText>{first(account.name)}</AvatarFallbackText>
              </Avatar>
            </HStack>
            <Divider />
            <Button
              variant='link'
              action='negative'
              className='justify-between'
              onPress={() => logout()}
            >
              <ButtonText>Log out</ButtonText>
              <ButtonIcon as={LogOut} />
            </Button>
          </VStack>
        </Card>
        <Divider />
      </VStack>
      <ScrollView className='flex-1'>
        <VStack space='4xl' className='pt-4'>
          <VStack space='md'>
            <Muted>Listings</Muted>
            <Card>
              <VStack space='md'>
                <Button
                  variant='link'
                  action='neutral'
                  className='w-full justify-between'
                  onPress={() => router.push("/account/listings")}
                >
                  <ButtonText>Selling</ButtonText>
                  <ButtonIcon as={ChevronRight} />
                </Button>
                <Divider />
                <Button
                  variant='link'
                  action='neutral'
                  className='w-full justify-between'
                  onPress={() => router.push("/account/purchased" as any)}
                >
                  <ButtonText>Purchased</ButtonText>
                  <ButtonIcon as={ChevronRight} />
                </Button>
                <Divider />

                <Button
                  variant='link'
                  action='neutral'
                  className='w-full justify-between'
                  onPress={() => router.push("/account/disputed" as any)}
                >
                  <ButtonText>Disputed</ButtonText>
                  <ButtonIcon as={ChevronRight} />
                </Button>
              </VStack>
            </Card>
          </VStack>

          <VStack space='md'>
            <Muted>Account actions</Muted>
            <Card>
              <VStack space='md'>
                <BackupSeedphrase />
                <Divider />
                <DeleteAccount />
              </VStack>
            </Card>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}
