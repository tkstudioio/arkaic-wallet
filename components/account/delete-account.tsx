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
import { P } from "@/components/ui/typography";
import { VStack } from "@/components/ui/vstack";
import { useDeleteAccount } from "@/hooks/account/use-delete-account";
import useAccountStore from "@/stores/account";
import { useRouter } from "expo-router";
import { TrashIcon } from "lucide-react-native";
import { useState } from "react";

export function DeleteAccount() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteAccountMutation = useDeleteAccount();
  const { account } = useAccountStore();
  const router = useRouter();

  const handleDeleteConfirm = () => {
    if (!account) return;
    deleteAccountMutation.mutate(account.name, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.replace("/");
      },
    });
  };
  return (
    <>
      <Button
        variant='link'
        action='negative'
        className='w-full justify-between'
        onPress={() => setShowDeleteModal(true)}
      >
        <ButtonText>Delete account</ButtonText>
        <ButtonIcon as={TrashIcon} />
      </Button>
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
    </>
  );
}
