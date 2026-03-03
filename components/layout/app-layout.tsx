import LogoFull from "@/components/icons/logo";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { useDeleteAccount } from "@/hooks/use-delete-account";
import useAccountStore from "@/stores/account";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FileKey2, LogOut, MenuIcon } from "lucide-react-native";
import { PropsWithChildren, useMemo, useState } from "react";
import { View } from "react-native";
import ToastManager from "toastify-react-native";
import { Badge, BadgeText } from "../ui/badge";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../ui/modal";
import { Spinner } from "../ui/spinner";
import { Large, P } from "../ui/typography";
import { VStack } from "../ui/vstack";

export default function AppLayout(props: PropsWithChildren) {
  const client = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={client}>
      <AppLayoutContent>{props.children}</AppLayoutContent>
      <ToastManager />
    </QueryClientProvider>
  );
}

function AppLayoutContent(props: PropsWithChildren) {
  const router = useRouter();
  const { account, logout } = useAccountStore();
  const deleteAccountMutation = useDeleteAccount();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const mnemonicWords = account?.mnemonic?.split(" ") ?? [];

  const handleDeleteConfirm = () => {
    if (!account) return;
    deleteAccountMutation.mutate(account.name, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setShowDrawer(false);
        router.replace("/");
      },
    });
  };

  return (
    <>
      <View className='flex-1 pt-16 bg-arkaic-background'>
        <VStack space={"4xl"} className='items-center flex-1'>
          <HStack className='items-center justify-between w-full px-arkaic-md'>
            <LogoFull height={24} width={100} className='flex-1' />
            <Button
              variant={"outline"}
              size={"sm"}
              className='w-min'
              onPress={() => setShowDrawer(true)}
            >
              <ButtonIcon as={MenuIcon} />
            </Button>
          </HStack>

          {props.children}
        </VStack>
      </View>

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
            <VStack space='md'>
              <P>
                Write down these {mnemonicWords.length} words in order. Do not
                share them with anyone.
              </P>
              <HStack className='flex-wrap gap-2 justify-center'>
                {mnemonicWords.map((word, i) => (
                  <Badge key={i} action='muted' size='lg' className='px-3 py-2'>
                    <BadgeText>
                      {i + 1}. {word}
                    </BadgeText>
                  </Badge>
                ))}
              </HStack>
            </VStack>
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

      <Drawer
        isOpen={showDrawer}
        size='lg'
        anchor='right'
        onClose={() => {
          setShowDrawer(false);
        }}
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <Large>Menu</Large>
          </DrawerHeader>
          <DrawerBody>
            <VStack space={"lg"}>
              <Button
                variant='outline'
                action={"positive"}
                onPress={() => {
                  setShowBackupModal(true);
                }}
              >
                <ButtonIcon as={FileKey2} />
                <ButtonText>Backup seed phrase</ButtonText>
              </Button>

              <Button
                variant='outline'
                action={"negative"}
                onPress={() => {
                  setShowDeleteModal(true);
                }}
              >
                <ButtonIcon as={FileKey2} />
                <ButtonText>Delete account</ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button
              action={"negative"}
              variant='outline'
              onPress={() => {
                logout();
                router.replace("/");
                setShowDrawer(false);
              }}
            >
              <ButtonIcon as={LogOut} />
              <ButtonText>Log out</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
