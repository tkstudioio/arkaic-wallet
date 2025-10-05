import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCreateProfile } from "@/hooks/use-create-profile";
import { ArkaicProfile } from "@/types/arkaic";
import { faker } from "@faker-js/faker";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { capitalize } from "lodash";
import { View } from "react-native";
import { match } from "ts-pattern";
import PrivateKeyInput from "./private-key-input";

export default function CreateProfileForm() {
  const router = useRouter();
  const defaultValues: ArkaicProfile = {
    name: capitalize(faker.color.human()) + " " + faker.animal.petName(),
    privateKey: "",
    arkadeServerUrl: "",
    avatar: faker.image.avatarGitHub(),
  };

  const createProfileMutation = useCreateProfile();

  function goBack() {
    router.replace("/");
  }
  return (
    <Formik
      initialValues={defaultValues}
      onSubmit={createProfileMutation.mutate}
    >
      {({ handleChange, handleBlur, handleSubmit, values }) => (
        <VStack space={"4xl"}>
          <Avatar size={"2xl"} className='mx-auto'>
            <AvatarFallbackText>-</AvatarFallbackText>
            <AvatarImage source={{ uri: values.avatar }} src={values.avatar} />
          </Avatar>
          <View>
            <Text>Profile name</Text>
            <Input size={"xl"}>
              <InputField
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                value={values.name}
              />
            </Input>
          </View>
          <View>
            <Text>Private key</Text>
            <PrivateKeyInput
              onChangeText={handleChange("privateKey")}
              onBlur={handleBlur("privateKey")}
              value={values.privateKey}
            />
          </View>
          <View>
            <Text>Arkade server URL</Text>
            <Input>
              <InputField
                placeholder='inser ASP url'
                onChangeText={handleChange("arkadeServerUrl")}
                onBlur={handleBlur("arkadeServerUrl")}
                value={values.arkadeServerUrl}
              />
            </Input>
          </View>
          <VStack space={"md"}>
            {match(createProfileMutation)
              .with({ isSuccess: true }, () => (
                <Button
                  onPress={() => handleSubmit()}
                  disabled={createProfileMutation.isPending}
                >
                  <ButtonText>Create and open</ButtonText>
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
        </VStack>
      )}
    </Formik>
  );
}
