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
import { faker } from "@faker-js/faker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { capitalize, merge } from "lodash";
import { Link2, User } from "lucide-react-native";
import { match } from "ts-pattern";
import PrivateKeyInput from "./private-key-input";
import { Card } from "./ui/card";

function generateProfileName(): string {
  return capitalize(faker.color.human()) + " " + faker.animal.petName();
}

export default function CreateOrRestoreProfileForm(props: {
  restore?: boolean;
}) {
  const router = useRouter();
  const createProfileMutation = useCreateProfile();

  const defaultValues = {
    name: "",
    privateKey: "",
    arkadeServerUrl: "",
    avatar: faker.image.avatarGitHub(),
  };

  return (
    <Formik
      initialValues={
        props.restore
          ? defaultValues
          : merge(defaultValues, { name: generateProfileName() })
      }
      onSubmit={createProfileMutation.mutate}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <>
          <Avatar size={"xl"} className='mx-auto'>
            <AvatarFallbackText>-</AvatarFallbackText>
            <AvatarImage source={{ uri: values.avatar }} src={values.avatar} />
          </Avatar>
          <Card className='w-full gap-8'>
            <VStack space='xs'>
              <Text>Profile name</Text>
              <Input size={"xl"}>
                <InputIcon as={User} />
                <InputField
                  placeholder='profile name'
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
                generateInitialKey={!props.restore}
              />
            </VStack>
            <VStack space='xs'>
              <Text>Arkade server URL</Text>
              <Input size={"xl"}>
                <InputIcon as={Link2} />
                <InputField
                  onChangeText={handleChange("arkadeServerUrl")}
                  onBlur={handleBlur("arkadeServerUrl")}
                  placeholder='insert ASP url'
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
                  <Button
                    variant={"link"}
                    action={"negative"}
                    onPress={router.back}
                  >
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
                      onPress={router.back}
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
