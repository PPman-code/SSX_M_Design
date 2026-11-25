import { useId, type SyntheticEvent } from 'react';
import './VerificationCodeInput.css';

const codeLength = 6;

function moveCaretToEnd({ currentTarget: input }: SyntheticEvent<HTMLInputElement>) {
  const end = input.value.length;
  if (input.selectionStart !== end || input.selectionEnd !== end) {
    input.setSelectionRange(end, end);
  }
}

export function VerificationCodeInput({ label, value, onValueChange, error }: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  const activeCell = Math.min(value.length, codeLength - 1);

  return <div className="ssx-verification-code-field">
    <div className="ssx-verification-code" data-error={!!error}>
      <div className="ssx-verification-code-cells" aria-hidden="true">
        {Array.from({ length: codeLength }, (_, index) => (
          <span key={index} className="ssx-verification-code-cell" data-current={index === activeCell}>
            {value[index]}
          </span>
        ))}
      </div>
      <input
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? id : undefined}
        className="ssx-verification-code-native"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={codeLength}
        value={value}
        onFocus={moveCaretToEnd}
        onClick={moveCaretToEnd}
        onSelect={moveCaretToEnd}
        onChange={event => onValueChange(event.currentTarget.value.replace(/\D/g, '').slice(0, codeLength))}
        onPaste={event => {
          event.preventDefault();
          const digits = event.clipboardData.getData('text').replace(/\D/g, '');
          const next = digits.length >= codeLength ? digits : value + digits;
          moveCaretToEnd(event);
          onValueChange(next.slice(0, codeLength));
        }}
      />
    </div>
    {error && <p id={id} className="ssx-verification-code-error" role="alert">{error}</p>}
  </div>;
}
