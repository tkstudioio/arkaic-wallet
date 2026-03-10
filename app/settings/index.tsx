import SeedPhraseGrid from "@/components/seed-phrase-grid";
import AppLayout from "@/components/layouts/app-layout";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { H1, Muted, P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useDeleteAccount } from "@/hooks/arkade/use-delete-account";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { FileKey2, LogOut, TrashIcon } from "lucide-react-native";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function SettingsPage() {
  const router = useRouter();
  const { account, fingerprint, logout } = useAccountStore();
  const deleteAccountMutation = useDeleteAccount();

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const mnemonicWords = account?.mnemonic?.split(" ") ?? [];

  const handleDeleteConfirm = () => {
    if (!account) return;
    deleteAccountMutation.mutate(account.name, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.replace("/");
      },
    });
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <AppLayout>
      <VStack className='px-arkaic-md flex-1' space={"4xl"}>
        <VStack space={"md"}>
          <H1>Settings</H1>
          {account && <P>Account: {account.name}</P>}
          {fingerprint && <Muted>Fingerprint: {fingerprint}</Muted>}
        </VStack>

        <VStack space={"lg"}>
          <Button
            variant={"outline"}
            action={"neutral"}
            onPress={() => setShowBackupModal(true)}
          >
            <ButtonIcon as={FileKey2} />
            <ButtonText>Backup seed phrase</ButtonText>
          </Button>

          <Button
            variant={"outline"}
            action={"negative"}
            onPress={() => setShowDeleteModal(true)}
          >
            <ButtonIcon as={TrashIcon} />
            <ButtonText>Delete account</ButtonText>
          </Button>

          <Button action={"negative"} onPress={handleLogout}>
            <ButtonIcon as={LogOut} />
            <ButtonText>Log out</ButtonText>
          </Button>
        </VStack>
      </VStack>

      <Modal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        size='lg'
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md'>Seed phrase backup</Heading>
          </ModalHeader>
          <ModalBody>
            <ScrollView>
              <VStack space='md'>
                <P>
                  Write down these {mnemonicWords.length} words in order. Do not
                  share them with anyone.
                </P>
                <SeedPhraseGrid words={mnemonicWords} isDisabled />
              </VStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setShowBackupModal(false)}>
              <ButtonText>Close</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md'>Delete account</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space='sm'>
              <P>
                Are you sure you want to delete{" "}
                <P className='font-heading'>{account?.name}</P>?
              </P>
              <P>
                This action is irreversible. If you have not backed up your seed
                phrase, you will permanently lose access to this wallet and its
                funds.
              </P>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack space={"md"}>
              <Button
                action='negative'
                onPress={handleDeleteConfirm}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? (
                  <Spinner />
                ) : (
                  <ButtonText>Delete</ButtonText>
                )}
              </Button>
              <Button
                variant='link'
                action='negative'
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteAccountMutation.isPending}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
