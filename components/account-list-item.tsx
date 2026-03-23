import { useLogin } from "@/hooks/account/use-login";
import { ArkaicAccount } from "@/types/arkaic";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, AvatarFallbackText } from "./ui/avatar";
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
import { Large, P } from "./ui/typography";
import { VStack } from "./ui/vstack";

export function AccountListItem(props: { account: ArkaicAccount }) {
  const loginMutation = useLogin();
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const hasMnemonic = !!props.account.mnemonic;

  const handlePress = () => {
    if (!hasMnemonic) {
      loginMutation.mutate({ account: props.account });
      return;
    }

    setPassphrase("");
    setShowPassphraseModal(true);
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
              <AvatarFallbackText>{props.account.name}</AvatarFallbackText>
            </Avatar>
            <VStack className='flex-1' space='xs'>
              <Large className='text-arkaic-foreground'>
                {props.account.name}
              </Large>
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
              <P>
                Enter your passphrase to unlock{" "}
                <P className='font-heading'>{props.account.name}</P>. Leave
                empty if you didn&apos;t set one.
              </P>
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
                variant='link'
                action='negative'
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
