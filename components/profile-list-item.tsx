import { useLoginMutation } from "@/hooks/use-login";
import { ArkaicProfile } from "@/types/arkaic";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Button, ButtonText } from "./ui/button";
import { Card } from "./ui/card";
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
import { VStack } from "./ui/vstack";

export function ProfileListItem(props: { profile: ArkaicProfile }) {
  const loginMutation = useLoginMutation();
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const hasMnemonic = !!props.profile.mnemonic;

  const handlePress = () => {
    if (hasMnemonic) {
      setPassphrase("");
      setShowPassphraseModal(true);
    } else {
      loginMutation.mutate({ profile: props.profile });
    }
  };

  const handleLogin = () => {
    setShowPassphraseModal(false);
    loginMutation.mutate({
      profile: props.profile,
      passphrase: passphrase || undefined,
    });
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        <Card>
          <HStack>
            <VStack>
              <Text>{props.profile.name}</Text>
              <Text size={"xs"}>{props.profile.arkadeServerUrl}</Text>
            </VStack>
            {loginMutation.isPending && <Spinner />}
          </HStack>
        </Card>
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
                <Text bold>{props.profile.name}</Text>. Leave empty if you
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
          <ModalFooter>
            <Button
              variant='outline'
              action='secondary'
              onPress={() => setShowPassphraseModal(false)}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button onPress={handleLogin}>
              <ButtonText>Unlock</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
