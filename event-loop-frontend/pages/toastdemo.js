import { useToast } from "@/components/ui/use-toast";

export const ToastDemo = () => {
    const {toast} = useToast();

    return (
        <Button
            onClick={() => {
                toast({
                    title: "Hello, Toast!",
                    description: "Testing a toast component"
                })
            }}
            Show Toast
        ></Button>
    )
}