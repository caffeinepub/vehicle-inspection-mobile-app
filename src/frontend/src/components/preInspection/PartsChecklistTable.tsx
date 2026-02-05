import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { PartChecklist, PartStatus } from '../../backend';
import { DEFAULT_PARTS } from '../../utils/preInspectionSchema';

interface PartsChecklistTableProps {
  parts: PartChecklist[];
  onChange: (parts: PartChecklist[]) => void;
}

export default function PartsChecklistTable({ parts, onChange }: PartsChecklistTableProps) {
  const addPart = () => {
    const newPart: PartChecklist = {
      partName: '',
      status: PartStatus.safe,
      remarks: '',
    };
    onChange([...parts, newPart]);
  };

  const updatePart = (index: number, field: keyof PartChecklist, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removePart = (index: number) => {
    onChange(parts.filter((_, i) => i !== index));
  };

  const addDefaultParts = () => {
    const newParts = DEFAULT_PARTS.map(name => ({
      partName: name,
      status: PartStatus.safe,
      remarks: '',
    }));
    onChange([...parts, ...newParts]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" onClick={addPart} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Part
        </Button>
        {parts.length === 0 && (
          <Button type="button" onClick={addDefaultParts} variant="outline" size="sm">
            Add Default Parts
          </Button>
        )}
      </div>

      {parts.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left font-semibold">Part Name</th>
                  <th className="p-2 text-center font-semibold w-20">Safe</th>
                  <th className="p-2 text-center font-semibold w-20">Scratch</th>
                  <th className="p-2 text-center font-semibold w-20">Pressed</th>
                  <th className="p-2 text-center font-semibold w-20">Broken</th>
                  <th className="p-2 text-left font-semibold">Remarks</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <Input
                        value={part.partName}
                        onChange={(e) => updatePart(index, 'partName', e.target.value)}
                        placeholder="Part name"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={part.status === PartStatus.safe}
                        onChange={() => updatePart(index, 'status', PartStatus.safe)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={part.status === PartStatus.scratch}
                        onChange={() => updatePart(index, 'status', PartStatus.scratch)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={part.status === PartStatus.pressed}
                        onChange={() => updatePart(index, 'status', PartStatus.pressed)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={part.status === PartStatus.broken}
                        onChange={() => updatePart(index, 'status', PartStatus.broken)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={part.remarks}
                        onChange={(e) => updatePart(index, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePart(index)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
