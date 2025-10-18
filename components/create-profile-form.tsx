import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCreateProfile } from "@/hooks/use-create-profile";
import { ArkaicProfile } from "@/types/arkaic";
import { faker } from "@faker-js/faker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { capitalize } from "lodash";
import { Link2, User } from "lucide-react-native";
import { match } from "ts-pattern";
import PrivateKeyInput from "./private-key-input";
import { Card } from "./ui/card";

function generateProfile(): ArkaicProfile {
  return {
    name: capitalize(faker.color.human()) + " " + faker.animal.petName(),
    privateKey: "",
    arkadeServerUrl: "",
    avatar: faker.image.avatarGitHub(),
  };
}

export default function CreateProfileForm() {
  const router = useRouter();
  const createProfileMutation = useCreateProfile();

  function goBack() {
    router.replace("/");
  }

  return (
    <Formik
      initialValues={generateProfile()}
      onSubmit={createProfileMutation.mutate}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <>
          <Avatar size={"xl"} className='mx-auto'>
            <AvatarFallbackText>-</AvatarFallbackText>
            <AvatarImage source={{ uri: values.avatar }} src={values.avatar} />
          </Avatar>
          <Card className='w-full gap-4'>
            <VStack space='xs'>
              <Text>Profile name</Text>
              <Input size={"xl"}>
                <InputIcon as={User} />
                <InputField
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                />
              </Input>
            </VStack>
            <VStack space='xs'>
              <Text>Private key</Text>
              <PrivateKeyInput
                onChangeText={handleChange("privateKey")}
                onBlur={handleBlur("privateKey")}
                value={values.privateKey}
              />
            </VStack>
            <VStack space='xs'>
              <Text>Arkade server URL</Text>
              <Input>
                <InputIcon as={Link2} />
                <InputField
                  placeholder='inser ASP url'
                  onChangeText={handleChange("arkadeServerUrl")}
                  onBlur={handleBlur("arkadeServerUrl")}
                  value={values.arkadeServerUrl}
                />
              </Input>
            </VStack>
          </Card>
          <VStack space={"md"}>
            {match(createProfileMutation)
              .with({ isSuccess: true }, () => (
                <Button
                  onPress={() => handleSubmit()}
                  disabled={createProfileMutation.isPending}
                >
                  <ButtonText>Create profile</ButtonText>
                </Button>
              ))
              .with({ isError: true }, () => (
                <>
                  <Text className='text-center'>Error creating profile</Text>
                  <Button variant={"link"} action={"negative"} onPress={goBack}>
                    <ButtonText>Go back</ButtonText>
                  </Button>
                </>
              ))
              .otherwise(({ isPending }) => (
                <>
                  <Button
                    onPress={() => handleSubmit()}
                    disabled={createProfileMutation.isPending}
                  >
                    {isPending ? (
                      <Spinner />
                    ) : (
                      <ButtonText>Create and open</ButtonText>
                    )}
                  </Button>
                  {!isPending ? (
                    <Button
                      variant={"link"}
                      action={"negative"}
                      onPress={goBack}
                    >
                      <ButtonText>Go back</ButtonText>
                    </Button>
                  ) : null}
                </>
              ))}
          </VStack>
        </>
      )}
    </Formik>
  );
}
