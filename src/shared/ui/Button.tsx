import type { ButtonHTMLAttributes } from "react";
import { cx } from "../lib/cx";

type Variant = "default" | "primary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  /** 지금 눌러야 할 버튼임을 은은하게 알린다 */
  attention?: boolean;
};

export function Button({
  variant = "default",
  attention = false,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "btn",
        variant === "primary" && "primary",
        variant === "ghost" && "ghost",
        attention && "ready",
        className,
      )}
      {...rest}
    />
  );
}
