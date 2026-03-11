import AccountInfoImage from "@/assets/images/account-info.svg";
import SeedPhraseImage from "@/assets/images/seedphrase.svg";
import SeedPhraseGrid from "@/components/seed-phrase-grid";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { useCreateAccount } from "@/hooks/arkade/use-create-account";
import {
  generateMnemonic,
  getRandomVerificationIndices,
  mnemonicToPrivateKey,
  validateMnemonic,
} from "@/utils/mnemonic";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { ListCheck, Shield, ShieldCheck, User } from "lucide-react-native";
import { useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { match } from "ts-pattern";
import { Large, P, Small } from "./ui/typography";

type WordCount = 12 | 24;

type Step =
  | "wordCount"
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
      const newMnemonic = generateMnemonic(count);
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
    setStep("accountInfo");
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
            width='100%'
          />
          <VStack className='items-center' space='xs'>
            <Large>{isRestore ? "Restore wallet" : "Create new wallet"}</Large>
            <P className='text-center'>
              Choose the mnemonic seed phrase length
            </P>
          </VStack>
        </VStack>
        <VStack space='md' className='w-full'>
          <Button size='lg' onPress={() => handleSelectWordCount(12)}>
            <ButtonIcon as={Shield} />
            <ButtonText>12 words</ButtonText>
          </Button>
          <Button
            size='lg'
            variant='outline'
            onPress={() => handleSelectWordCount(24)}
          >
            <ButtonIcon as={ShieldCheck} />
            <ButtonText>24 words</ButtonText>
          </Button>
          <Button
            size='lg'
            variant='link'
            action='negative'
            onPress={router.back}
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
              <P className='text-center'>
                Write down these words in order. This is the only way to recover
                your wallet.
              </P>
            </VStack>
            <SeedPhraseGrid words={words} isDisabled />
          </VStack>
          <VStack space='md' className='w-full'>
            <Button size='lg' onPress={handleStartVerification}>
              <ButtonIcon as={ListCheck} />
              <ButtonText>Verify backup</ButtonText>
            </Button>
            <Button
              size='lg'
              variant='outline'
              onPress={() => setStep("accountInfo")}
            >
              <ButtonText>Skip</ButtonText>
            </Button>
            <Button
              size='lg'
              variant='link'
              action='negative'
              onPress={() => setStep("wordCount")}
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
              <P className='text-center'>
                Enter the correct word for each position to verify your backup.
              </P>
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
            <Button size='lg' onPress={handleVerify}>
              <ButtonText>Confirm</ButtonText>
            </Button>
            <Button
              size='lg'
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
          <P className='text-center'>
            Enter your {wordCount}-word seed phrase to restore your wallet.
          </P>
        </VStack>
        <SeedPhraseGrid words={restoreWords} onWordChange={updateRestoreWord} />
        <VStack space='md'>
          {restoreSubmitAttempted && !restoreMnemonicValid && (
            <P className='text-error-500 text-center'>
              {restoreWords.some((w) => !w.trim())
                ? `Fill in all ${wordCount} words to continue`
                : "The seed phrase is invalid, please check the words"}
            </P>
          )}
          <Button size='lg' onPress={handleRestoreWordsContinue}>
            <ButtonText>Continue</ButtonText>
          </Button>
          <Button
            size='lg'
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
            width='100%'
          />
          <VStack className='items-center' space='xs'>
            <Large>Account info</Large>
            <P className='text-center'>
              Give your account a name and select an ASP to connect to.
            </P>
          </VStack>
        </VStack>
        <Formik
          initialValues={{
            name: "",
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
                  mnemonic,
                },
                privateKey,
              },
              {
                onSuccess: () => {
                  router.replace("/account/dashboard");
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
                    <P className='text-error-500'>{errors.name}</P>
                  )}
                </VStack>
                <VStack space='xs'>
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
                {match(createAccountMutation)
                  .with({ isError: true }, () => (
                    <>
                      <P className='text-center text-error-500'>
                        Error creating account
                      </P>
                      <Button
                        size='lg'
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
                        size='lg'
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
                          size='lg'
                          variant='link'
                          action='negative'
                          onPress={() =>
                            setStep(isRestore ? "restoreWords" : "showMnemonic")
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
