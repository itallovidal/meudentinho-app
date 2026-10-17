import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { Wrapper } from "@/components/wrapper";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
    >
      <DialogContent className="gap-4 p-5">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <Wrapper className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={onCancel}
          >
            <Text>Cancelar</Text>
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            className="flex-1"
            onPress={onConfirm}
          >
            <Text>{confirmLabel}</Text>
          </Button>
        </Wrapper>
      </DialogContent>
    </Dialog>
  );
}
