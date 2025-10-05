import { useMutation } from "@tanstack/react-query";
import { getRandomBytesAsync } from "expo-crypto";

import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { join, map } from "lodash";
import { useEffect } from "react";
import { match } from "ts-pattern";

type PrivateKeyInputProps = {
  onChangeText: (field: string) => void;
  onBlur: (e: any) => void;
  value: string;
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
    async function generatePrivateKey() {
      const newPrivateKey = await privateKeyMutation.mutateAsync();
      props.onChangeText(newPrivateKey);
    }

    generatePrivateKey();
  }, []);

  return match(privateKeyMutation)
    .with({ isSuccess: true }, () => (
      <Input size={"xl"}>
        <InputField placeholder='insert private key' {...props} />
      </Input>
    ))
    .otherwise(() => <Spinner />);
}
