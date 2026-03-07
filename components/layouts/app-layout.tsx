import LogoFull from "@/components/icons/logo";
import SeedPhraseGrid from "@/components/seed-phrase-grid";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { useDeleteAccount } from "@/hooks/arkade/use-delete-account";
import useAccountStore from "@/stores/account";
import { SingleKey, Transaction } from "@arkade-os/sdk";
import { base64 } from "@scure/base";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  FileKey2,
  LogOut,
  MenuIcon,
  PenTool,
  TrashIcon,
} from "lucide-react-native";
import { PropsWithChildren, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import ToastManager from "toastify-react-native";
import NavigationMenu from "../navigation-menu";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Input, InputField } from "../ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../ui/modal";
import { Spinner } from "../ui/spinner";
import { Large, Muted, P } from "../ui/typography";
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
  const { account, fingerprint, logout } = useAccountStore();

  const deleteAccountMutation = useDeleteAccount();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignPsbtModal, setShowSignPsbtModal] = useState(false);
  const [psbtInput, setPsbtInput] = useState("");
  const [psbtError, setPsbtError] = useState<string>();
  const [isSigning, setIsSigning] = useState(false);

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

  const handleSignPsbt = async () => {
    if (!account?.privateKey) {
      setPsbtError("No private key available");
      return;
    }

    const trimmed = psbtInput.trim();
    if (!trimmed) {
      setPsbtError("Please enter a PSBT");
      return;
    }

    setIsSigning(true);
    setPsbtError(undefined);

    try {
      const psbtBytes = base64.decode(trimmed);
      const tx = Transaction.fromPSBT(psbtBytes);
      const identity = SingleKey.fromHex(account.privateKey);
      const signedTx = await identity.sign(tx);
      const signedPsbt = base64.encode(signedTx.toPSBT());

      console.log("=== SIGNED PSBT ===");
      console.log(signedPsbt);
      console.log("===================");

      setPsbtInput("");
      setShowSignPsbtModal(false);
    } catch (e) {
      setPsbtError(e instanceof Error ? e.message : "Failed to sign PSBT");
    } finally {
      setIsSigning(false);
    }
  };

  if (!account) router.replace("/");

  return (
    <>
      <View className='flex-1 pt-16 bg-arkaic-background'>
        <VStack space={"4xl"} className='items-center flex-1'>
          <HStack className='items-center justify-between w-full px-arkaic-md'>
            <LogoFull height={24} width={100} className='flex-1' />
            <Button
              variant={"outline"}
              size={"sm"}
              action={"neutral"}
              className='w-min'
              onPress={() => setShowDrawer(true)}
            >
              <ButtonIcon as={MenuIcon} />
            </Button>
          </HStack>
          <ScrollView className='flex-1 p-4 w-full'>
            {props.children}
          </ScrollView>
        </VStack>
      </View>

      <NavigationMenu />

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

      <Modal
        isOpen={showSignPsbtModal}
        onClose={() => {
          setShowSignPsbtModal(false);
          setPsbtError(undefined);
          setPsbtInput("");
        }}
        size='lg'
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md'>Sign PSBT</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space='md'>
              <P>
                Paste a base64-encoded PSBT to sign with this account&apos;s
                key.
              </P>
              <Input size='md' className='h-max py-3'>
                <InputField
                  placeholder='Base64 PSBT...'
                  value={psbtInput}
                  onChangeText={setPsbtInput}
                  multiline
                />
              </Input>
              {psbtError && <Muted className='text-red-500'>{psbtError}</Muted>}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <VStack space='md'>
              <Button onPress={handleSignPsbt} disabled={isSigning}>
                {isSigning ? <Spinner /> : <ButtonText>Sign</ButtonText>}
              </Button>
              <Button
                variant='link'
                action='negative'
                onPress={() => {
                  setShowSignPsbtModal(false);
                  setPsbtError(undefined);
                  setPsbtInput("");
                }}
                disabled={isSigning}
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
            <VStack space='xs'>
              <Large>Menu</Large>
              {fingerprint && <Muted>Fingerprint: {fingerprint}</Muted>}
            </VStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack space={"lg"}>
              <Button
                variant={"outline"}
                action={"neutral"}
                onPress={() => {
                  setShowBackupModal(true);
                }}
              >
                <ButtonIcon as={FileKey2} />
                <ButtonText>Backup seed phrase</ButtonText>
              </Button>

              <Button
                variant={"outline"}
                action={"negative"}
                onPress={() => {
                  setShowDeleteModal(true);
                }}
              >
                <ButtonIcon as={TrashIcon} />
                <ButtonText>Delete account</ButtonText>
              </Button>

              <Button
                variant={"outline"}
                action={"neutral"}
                onPress={() => {
                  setShowSignPsbtModal(true);
                }}
              >
                <ButtonIcon as={PenTool} />
                <ButtonText>Sign PSBT</ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button
              action={"negative"}
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
