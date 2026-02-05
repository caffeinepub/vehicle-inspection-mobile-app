import { Label } from '@/components/ui/label';

interface YesNoFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 cursor-pointer"
          />
          <span>Yes</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 cursor-pointer"
          />
          <span>No</span>
        </label>
      </div>
    </div>
  );
}
