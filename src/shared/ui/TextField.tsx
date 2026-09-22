import type { InputHTMLAttributes } from "react";
import { useId } from "react";
import { cx } from "../lib/cx";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** 방 코드처럼 글자를 벌려 쓸 때 */
  code?: boolean;
};

export function TextField({ label, code = false, className, id, ...rest }: TextFieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} className={cx("input", code && "code", className)} {...rest} />
    </div>
  );
}
