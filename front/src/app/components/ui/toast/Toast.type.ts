import * as React from "react";
import { Toast } from "@/hooks/use-toast";

export interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {}
