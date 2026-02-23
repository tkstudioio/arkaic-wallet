import LogoFull from "@/components/icons/logo";
import { useDeleteProfile } from "@/hooks/use-delete-profile";
import useProfileStore from "@/stores/profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  EllipsisVertical,
  KeyRound,
  PowerOff,
  Trash2,
} from "lucide-react-native";
import { PropsWithChildren, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native";
import ToastManager from "toastify-react-native";
import { Badge, BadgeText } from "../ui/badge";
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from "../ui/menu";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "../ui/modal";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
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
  const { profile } = useProfileStore();
  const deleteProfileMutation = useDeleteProfile();
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuTriggerRef = useRef(null);

  const mnemonicWords = profile?.mnemonic?.split(" ") ?? [];

  const handleDeleteConfirm = () => {
    if (!profile) return;
    deleteProfileMutation.mutate(profile.name, {
      onSuccess: () => {
        setShowDeleteModal(false);
        router.replace("/");
      },
    });
  };

  return (
    <>
      <ScrollView className='pt-24 pb-24 bg-arkaic-background'>
        <VStack space={"4xl"} className='items-center'>
          <HStack className='items-center justify-between w-full px-arkaic-md'>
            <LogoFull height={24} width={100} className='flex-1' />
            <Menu
              placement='bottom right'
              trigger={(triggerProps) => (
                <Button
                  ref={menuTriggerRef}
                  action={"secondary"}
                  variant={"link"}
                  className='w-min'
                  size={"xs"}
                  {...triggerProps}
                >
                  <ButtonText>{profile?.name}</ButtonText>
                  <ButtonIcon as={EllipsisVertical} />
                </Button>
              )}
            >
              {mnemonicWords.length > 0 && (
                <MenuItem
                  key='backup'
                  textValue='Backup seed phrase'
                  onPress={() => setShowBackupModal(true)}
                >
                  <KeyRound
                    size={16}
                    className='text-arkaic-foreground mr-2'
                  />
                  <MenuItemLabel>Backup seed phrase</MenuItemLabel>
                </MenuItem>
              )}
              <MenuItem
                key='logout'
                textValue='Log out'
                onPress={() => router.replace("/")}
              >
                <PowerOff size={16} className='text-arkaic-foreground mr-2' />
                <MenuItemLabel>Log out</MenuItemLabel>
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                key='delete'
                textValue='Delete account'
                onPress={() => setShowDeleteModal(true)}
              >
                <Trash2 size={16} className='text-error-500 mr-2' />
                <MenuItemLabel className='text-error-500'>
                  Delete account
                </MenuItemLabel>
              </MenuItem>
            </Menu>
          </HStack>

          {props.children}
        </VStack>
      </ScrollView>

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
              <Text>
                Write down these {mnemonicWords.length} words in order. Do not
                share them with anyone.
              </Text>
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

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='md'>Delete account</Heading>
          </ModalHeader>
          <ModalBody>
            <VStack space='sm'>
              <Text>
                Are you sure you want to delete{" "}
                <Text bold>{profile?.name}</Text>?
              </Text>
              <Text>
                This action is irreversible. If you have not backed up your seed
                phrase, you will permanently lose access to this wallet and its
                funds.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='outline'
              action='secondary'
              onPress={() => setShowDeleteModal(false)}
              disabled={deleteProfileMutation.isPending}
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              action='negative'
              onPress={handleDeleteConfirm}
              disabled={deleteProfileMutation.isPending}
            >
              {deleteProfileMutation.isPending ? (
                <Spinner />
              ) : (
                <ButtonText>Delete</ButtonText>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
