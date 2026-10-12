import { Switch } from '@base-ui/react/switch';
export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <Switch.Root className="toggle" aria-label={label} checked={checked} onCheckedChange={onChange}>
      <Switch.Thumb className="toggle-thumb" />
    </Switch.Root>
  );
}
