import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useLogout } from "@/hooks/account/use-logout";
import { LogOut } from "lucide-react-native";

export function Logout() {
  const { mutate: logout } = useLogout();

  return (
    <Button action={"negative"} onPress={() => logout()}>
      <ButtonIcon as={LogOut} />
      <ButtonText>Log out</ButtonText>
    </Button>
  );
}
