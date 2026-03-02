import { useLoginMutation } from "@/hooks/use-login";
import { ArkaicAccount } from "@/types/arkaic";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "./ui/avatar";
import { Button, ButtonText } from "./ui/button";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { Input, InputField } from "./ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./ui/modal";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { Large, Muted, Small } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function AccountListItem(props: { account: ArkaicAccount }) {
  const loginMutation = useLoginMutation();
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const hasMnemonic = !!props.account.mnemonic;

  const handlePress = () => {
    if (hasMnemonic) {
      setPassphrase("");
      setShowPassphraseModal(true);
    } else {
      loginMutation.mutate({ account: props.account });
    }
  };

  const handleLogin = () => {
    setShowPassphraseModal(false);
    loginMutation.mutate({
      account: props.account,
      passphrase: passphrase || undefined,
    });
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        <View className='bg-arkaic-fill rounded-arkaic-card px-arkaic-md py-arkaic-md'>
          <HStack className='items-center' space='lg'>
            <Avatar size='lg'>
              {props.account.avatar ? (
                <AvatarImage source={{ uri: props.account.avatar }} />
              ) : (
                <AvatarFallbackText>
                  {props.account.name}
                </AvatarFallbackText>
              )}
            </Avatar>
            <VStack className='flex-1' space='xs'>
              <Large className='text-arkaic-foreground'>
                {props.account.name}
              </Large>
              <Small className='text-arkaic-muted'>
                {props.account.arkadeServerUrl}
              </Small>
            </VStack>
            {loginMutation.isPending && <Spinner />}
          </HStack>
        </View>
      </TouchableOpacity>

      <Modal
        isOpen={showPassphraseModal}
        onClose={() => setShowPassphraseModal(false)}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md'>Enter passphrase</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space='sm'>
              <Text>
                Enter your passphrase to unlock{" "}
                <Text bold>{props.account.name}</Text>. Leave empty if you
                {"didn't set one."}
              </Text>
              <Input size='xl'>
                <InputField
                  placeholder='Passphrase'
                  value={passphrase}
                  onChangeText={setPassphrase}
                  secureTextEntry
                />
              </Input>
            </VStack>
          </ModalBody>
          <ModalFooter className='w-full'>
            <VStack space={"md"} className='w-full'>
              <Button onPress={handleLogin} className='w-full'>
                <ButtonText>Unlock</ButtonText>
              </Button>
              <Button
                variant='ghost'
                action='secondary'
                onPress={() => setShowPassphraseModal(false)}
                className='w-full'
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
