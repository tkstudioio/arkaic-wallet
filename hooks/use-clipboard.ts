import { useMutation } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { Toast } from "toastify-react-native";

export function useCopyToClipboard() {
  return useMutation({
    mutationKey: ["copy-to-clipboard"],
    mutationFn: (data: string) => Clipboard.setStringAsync(data),
    onSuccess: () => Toast.success("Copied to clipboard"),
  });
}

export function usePasteFromClipboard() {
  return useMutation({
    mutationKey: ["paste-from-clipboard"],
    mutationFn: () => Clipboard.getStringAsync(),
    onSuccess: () => Toast.success("Pasted from clipboard"),
  });
}
