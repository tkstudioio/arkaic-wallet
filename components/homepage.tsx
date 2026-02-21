import { useProfiles } from "@/hooks/use-profiles";
import { Image } from "expo-image";
import { map } from "lodash";
import { Dimensions } from "react-native";
import { match } from "ts-pattern";
import { CreateProfile } from "./create-profile";
import LogoFull from "./icons/logo";
import AuthLayout from "./layout/auth-layout";
import { ProfileListItem } from "./profile-list-item";
import { Heading } from "./ui/heading";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

export function Home() {
  const profilesQuery = useProfiles();

  return (
    <AuthLayout>
      {match(profilesQuery)
        .with({ data: [] }, () => (
          <VStack space={"4xl"}>
            <Image
              source={require("@/assets/images/no-accounts.svg")}
              style={{
                height: Dimensions.get("window").height * 0.3,
              }}
            />
            <VStack>
              <Heading className='text-center' size={"2xl"}>
                No accounts found
              </Heading>
              <Text className='text-center'>
                create a new account or restore from private key to get started
                with arkaic wallet
              </Text>
            </VStack>
            <CreateProfile />
          </VStack>
        ))
        .otherwise(({ data: profiles }) => (
          <VStack className='items-center justify-center' space={"3xl"}>
            <VStack className='items-center'>
              <LogoFull height={32} width={246} className='flex-1' />
            </VStack>
            <VStack className='items-center'>
              <Heading>Login to one account</Heading>
              <Text>tap on an account and log in</Text>
            </VStack>
            <VStack space={"md"}>
              {map(profiles, (profile, index) => (
                <ProfileListItem profile={profile} key={profile.name + index} />
              ))}
            </VStack>
            <CreateProfile />
          </VStack>
        ))}
    </AuthLayout>
  );
}
