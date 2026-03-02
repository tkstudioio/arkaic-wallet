import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { useCreateAccount } from "@/hooks/use-create-account";
import {
  generateMnemonic,
  getRandomVerificationIndices,
  mnemonicToPrivateKey,
  validateMnemonic,
} from "@/utils/mnemonic";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
  ChevronDown,
  ListCheck,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { match } from "ts-pattern";
import AccountInfoImage from "@/assets/images/account-info.svg";
import SeedPhraseImage from "@/assets/images/seedphrase.svg";
import { Card } from "./ui/card";
import { Large, Muted, P, Small } from "./ui/typography";

type WordCount = 12 | 24;

type Step =
  | "wordCount"
  | "passphrase"
  | "showMnemonic"
  | "verify"
  | "restoreWords"
  | "accountInfo";

export default function CreateOrRestoreAccountForm(props: {
  restore?: boolean;
}) {
  const router = useRouter();
  const createAccountMutation = useCreateAccount();

  const [step, setStep] = useState<Step>("wordCount");
  const [wordCount, setWordCount] = useState<WordCount>(12);
  const [mnemonic, setMnemonic] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [restoreWords, setRestoreWords] = useState<string[]>([]);
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [verificationAnswers, setVerificationAnswers] = useState<string[]>([]);
  const [verificationError, setVerificationError] = useState(false);
  const [restoreSubmitAttempted, setRestoreSubmitAttempted] = useState(false);

  const isRestore = props.restore === true;

  const handleSelectWordCount = (count: WordCount) => {
    setWordCount(count);
    if (isRestore) {
      setRestoreWords(new Array(count).fill(""));
      setStep("restoreWords");
    } else {
      setStep("passphrase");
    }
  };

  const handlePassphraseContinue = () => {
    if (isRestore) {
      setStep("accountInfo");
    } else {
      const newMnemonic = generateMnemonic(wordCount);
      setMnemonic(newMnemonic);
      setStep("showMnemonic");
    }
  };

  const handleStartVerification = () => {
    const indices = getRandomVerificationIndices(wordCount, 5);
    setVerificationIndices(indices);
    setVerificationAnswers(new Array(5).fill(""));
    setVerificationError(false);
    setStep("verify");
  };

  const handleVerify = () => {
    const words = mnemonic.split(" ");
    const allCorrect = verificationIndices.every(
      (wordIndex, i) =>
        verificationAnswers[i].trim().toLowerCase() ===
        words[wordIndex].toLowerCase(),
    );
    if (allCorrect) {
      setStep("accountInfo");
    } else {
      setVerificationError(true);
    }
  };

  const handleRestoreWordsContinue = () => {
    setRestoreSubmitAttempted(true);
    const joined = restoreWords.map((w) => w.trim().toLowerCase()).join(" ");
    if (!validateMnemonic(joined)) {
      return;
    }
    setMnemonic(joined);
    setStep("passphrase");
  };

  const updateRestoreWord = (index: number, value: string) => {
    setRestoreWords((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateVerificationAnswer = (index: number, value: string) => {
    setVerificationAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const restoreMnemonicValid =
    restoreWords.length > 0 &&
    validateMnemonic(restoreWords.map((w) => w.trim().toLowerCase()).join(" "));

  return match(step)
    .with("wordCount", () => (
      <VStack className='flex-1 w-full justify-between'>
        <VStack space='xl' className='items-center flex-1 justify-center'>
          <SeedPhraseImage
            height={Dimensions.get("window").height * 0.25}
            width="100%"
          />
          <VStack className='items-center' space='xs'>
            <Large>
              {isRestore ? "Restore wallet" : "Create new wallet"}
            </Large>
            <Muted className='text-center'>
              Choose the mnemonic seed phrase length
            </Muted>
          </VStack>
        </VStack>
        <VStack space='md' className='w-full'>
          <Button onPress={() => handleSelectWordCount(12)}>
            <ButtonIcon as={Shield} />
            <ButtonText>12 words</ButtonText>
          </Button>
          <Button action='secondary' onPress={() => handleSelectWordCount(24)}>
            <ButtonIcon as={ShieldCheck} />
            <ButtonText>24 words</ButtonText>
          </Button>
          <Button variant='link' action='negative' onPress={router.back}>
            <ButtonText>Go back</ButtonText>
          </Button>
        </VStack>
      </VStack>
    ))
    .with("passphrase", () => (
      <VStack className='flex-1 w-full justify-between'>
        <VStack space='4xl' className='items-center flex-1 justify-center'>
          <VStack className='items-center' space='xs'>
            <Large>Passphrase</Large>
            <Muted className='text-center'>
              Add an optional passphrase for extra security. Leave empty if you
              {"don't want one."}
            </Muted>
          </VStack>

          <VStack space='xs' className='w-full'>
            <Small>Passphrase (optional)</Small>
            <Input size='xl'>
              <InputField
                placeholder='Enter passphrase'
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
              />
            </Input>
          </VStack>
        </VStack>

        <VStack space='md' className='w-full'>
          <Button onPress={handlePassphraseContinue}>
            <ButtonText>Continue</ButtonText>
          </Button>
          <Button
            variant='link'
            action='negative'
            onPress={() => setStep("wordCount")}
          >
            <ButtonText>Go back</ButtonText>
          </Button>
        </VStack>
      </VStack>
    ))
    .with("showMnemonic", () => {
      const words = mnemonic.split(" ");
      return (
        <VStack className='flex-1 w-full justify-between'>
          <VStack space='xl' className='items-center flex-1 justify-center'>
            <VStack className='items-center' space='xs'>
              <Large>Your seed phrase</Large>
              <Muted className='text-center'>
                Write down these words in order. This is the only way to recover
                your wallet.
              </Muted>
            </VStack>
            <Card className='w-full' variant='ghost'>
              <HStack className='flex-wrap gap-2 justify-center'>
                {words.map((word, i) => (
                  <Badge key={i} action='muted' size='lg' className='px-3 py-2'>
                    <BadgeText>
                      {i + 1}. {word}
                    </BadgeText>
                  </Badge>
                ))}
              </HStack>
            </Card>
          </VStack>
          <VStack space='md' className='w-full'>
            <Button onPress={handleStartVerification}>
              <ButtonIcon as={ListCheck} />
              <ButtonText>Verify backup</ButtonText>
            </Button>
            <Button action='secondary' onPress={() => setStep("accountInfo")}>
              <ButtonText>Skip</ButtonText>
            </Button>
            <Button
              variant='link'
              action='negative'
              onPress={() => setStep("passphrase")}
            >
              <ButtonText>Go back</ButtonText>
            </Button>
          </VStack>
        </VStack>
      );
    })
    .with("verify", () => {
      return (
        <VStack className='flex-1 w-full justify-between'>
          <VStack space='4xl' className='items-center flex-1 justify-center'>
            <VStack className='items-center' space='xs'>
              <Large>Verify backup</Large>
              <Muted className='text-center'>
                Enter the correct word for each position to verify your backup.
              </Muted>
            </VStack>

            <VStack space={"xl"}>
              {verificationIndices.map((wordIndex, i) => (
                <VStack space='xs' key={wordIndex}>
                  <Small>Word #{wordIndex + 1}</Small>
                  <Input size='xl'>
                    <InputField
                      placeholder={`Enter word #${wordIndex + 1}`}
                      value={verificationAnswers[i]}
                      onChangeText={(val: string) =>
                        updateVerificationAnswer(i, val)
                      }
                      autoCapitalize='none'
                      autoCorrect={false}
                    />
                  </Input>
                </VStack>
              ))}
            </VStack>

            {verificationError && (
              <P className='text-error-500 text-center'>
                Some words are incorrect. Please try again.
              </P>
            )}
          </VStack>
          <VStack space='md' className='w-full'>
            <Button onPress={handleVerify}>
              <ButtonText>Confirm</ButtonText>
            </Button>
            <Button
              variant='link'
              action='negative'
              onPress={() => setStep("showMnemonic")}
            >
              <ButtonText>Go back</ButtonText>
            </Button>
          </VStack>
        </VStack>
      );
    })
    .with("restoreWords", () => (
      <ScrollView style={{ width: "100%" }} contentContainerStyle={{ gap: 32 }}>
        <VStack className='items-center' space='xs'>
          <Large>Enter seed phrase</Large>
          <Muted className='text-center'>
            Enter your {wordCount}-word seed phrase to restore your wallet.
          </Muted>
        </VStack>
        <VStack space='sm'>
          {restoreWords.map((word, i) => (
            <HStack key={i} space='sm' className='items-center'>
              <Small className='w-8 text-right'>{i + 1}.</Small>
              <Input size='xl' className='flex-1'>
                <InputField
                  placeholder={`Word ${i + 1}`}
                  value={word}
                  onChangeText={(val: string) => updateRestoreWord(i, val)}
                  autoCapitalize='none'
                  autoCorrect={false}
                />
              </Input>
            </HStack>
          ))}
        </VStack>
        <VStack space='md'>
          {restoreSubmitAttempted && !restoreMnemonicValid && (
            <P className='text-error-500 text-center'>
              {restoreWords.some((w) => !w.trim())
                ? `Fill in all ${wordCount} words to continue`
                : "The seed phrase is invalid, please check the words"}
            </P>
          )}
          <Button onPress={handleRestoreWordsContinue}>
            <ButtonText>Continue</ButtonText>
          </Button>
          <Button
            variant='link'
            action='negative'
            onPress={() => setStep("wordCount")}
          >
            <ButtonText>Go back</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    ))
    .with("accountInfo", () => (
      <VStack className='flex-1 w-full justify-between'>
        <VStack space='4xl' className='items-center flex-1 justify-center'>
          <AccountInfoImage
            height={Dimensions.get("window").height * 0.25}
            width="100%"
          />
          <VStack className='items-center' space='xs'>
            <Large>Account info</Large>
            <Muted className='text-center'>
              Give your account a name and select an ASP to connect to.
            </Muted>
          </VStack>
        </VStack>
        <Formik
          initialValues={{
            name: "",
            arkadeServerUrl: "https://arkade.computer",
          }}
          validate={(values) => {
            const errors: { name?: string } = {};
            if (values.name.trim().length < 3) {
              errors.name = "Account name must be at least 3 characters";
            }
            return errors;
          }}
          onSubmit={(values) => {
            const privateKey = mnemonicToPrivateKey(
              mnemonic,
              passphrase || undefined,
            );

            createAccountMutation.mutate(
              {
                account: {
                  name: values.name,
                  arkadeServerUrl: values.arkadeServerUrl,
                  mnemonic,
                },
                privateKey,
              },
              {
                onSuccess: () => {
                  router.replace("/dashboard");
                },
              },
            );
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <VStack space='4xl' className='w-full'>
              <VStack className='w-full' space={"xl"}>
                <VStack space='xs'>
                  <Small>Account name</Small>
                  <Input size='xl' isInvalid={!!(touched.name && errors.name)}>
                    <InputIcon as={User} />
                    <InputField
                      placeholder='Insert account name'
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      value={values.name}
                    />
                  </Input>
                  {touched.name && errors.name && (
                    <Muted className='text-error-500'>
                      {errors.name}
                    </Muted>
                  )}
                </VStack>
                <VStack space='xs'>
                  <Small>Arkade server URL</Small>
                  <Select
                    selectedValue={values.arkadeServerUrl}
                    onValueChange={handleChange("arkadeServerUrl")}
                  >
                    <SelectTrigger size='xl'>
                      <SelectInput placeholder='Select ASP server' />
                      <SelectIcon as={ChevronDown} />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem
                          label='mainnet — arkade.computer'
                          value='https://arkade.computer'
                        />
                        <SelectItem
                          label='Mutinynet — mutinynet.arkade.sh'
                          value='https://mutinynet.arkade.sh'
                        />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </VStack>
              </VStack>
              <VStack space='md' className='w-full'>
                {match(createAccountMutation)
                  .with({ isError: true }, () => (
                    <>
                      <P className='text-center text-error-500'>
                        Error creating account
                      </P>
                      <Button
                        variant='link'
                        action='negative'
                        onPress={router.back}
                      >
                        <ButtonText>Go back</ButtonText>
                      </Button>
                    </>
                  ))
                  .otherwise(({ isPending }) => (
                    <>
                      <Button
                        onPress={() => handleSubmit()}
                        disabled={isPending || !!errors.name}
                      >
                        {isPending ? (
                          <Spinner />
                        ) : (
                          <ButtonText>Create and open</ButtonText>
                        )}
                      </Button>
                      {!isPending && (
                        <Button
                          variant='link'
                          action='negative'
                          onPress={() =>
                            setStep(isRestore ? "passphrase" : "showMnemonic")
                          }
                        >
                          <ButtonText>Go back</ButtonText>
                        </Button>
                      )}
                    </>
                  ))}
              </VStack>
            </VStack>
          )}
        </Formik>
      </VStack>
    ))
    .exhaustive();
}
