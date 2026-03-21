import SeedPhraseGrid from "@/components/seed-phrase-grid";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Large, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import useAccountStore from "@/stores/account";
import { FileKey2 } from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";

export function BackupSeedphrase() {
  const [open, setOpen] = useState(false);
  const { account } = useAccountStore();

  if (!account?.mnemonic) return;
  const mnemonicWords = account?.mnemonic?.split(" ") ?? [];

  return (
    <>
      <Button
        variant='link'
        action='neutral'
        className='w-full justify-between'
        onPress={() => setOpen(true)}
      >
        <ButtonText>Backup seed phrase</ButtonText>
        <ButtonIcon as={FileKey2} />
      </Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} size='lg'>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Large className='text-center w-full'>Seed phrase backup</Large>
          </ModalHeader>
          <ModalBody>
            <ScrollView>
              <VStack space='md'>
                <P className='text-center'>
                  Write down these {mnemonicWords.length} words in order. Do not
                  share them with anyone.
                </P>

                <SeedPhraseGrid words={mnemonicWords} isDisabled />
              </VStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => setOpen(false)}
              variant={"link"}
              action={"neutral"}
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
