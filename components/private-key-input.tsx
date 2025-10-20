import { useMutation } from "@tanstack/react-query";
import { getRandomBytesAsync } from "expo-crypto";

import { Input, InputField, InputIcon } from "@/components/ui/input";
import { join, map } from "lodash";
import { KeyRound } from "lucide-react-native";
import { useEffect } from "react";

type PrivateKeyInputProps = {
  onChangeText: (field: string) => void;
  onBlur: (e: any) => void;
  value: string;
  generateInitialKey?: boolean;
};

export default function PrivateKeyInput(props: PrivateKeyInputProps) {
  const privateKeyMutation = useMutation({
    mutationKey: ["private-key"],
    mutationFn: async () => {
      const bytes = await getRandomBytesAsync(32);
      const arrayBuffer = new Uint8Array(bytes.buffer);

      const privateKey = join(
        map(arrayBuffer, (x) => x.toString(16).padStart(2, "0")),
        ""
      );

      return privateKey;
    },
  });

  useEffect(() => {
    if (!props.generateInitialKey) return;
    async function generatePrivateKey() {
      const newPrivateKey = await privateKeyMutation.mutateAsync();
      props.onChangeText(newPrivateKey);
    }

    generatePrivateKey();
  }, []);

  return (
    <Input size={"xl"}>
      <InputIcon as={KeyRound} />
      <InputField placeholder='private key' {...props} />
    </Input>
  );
}
