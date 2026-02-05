import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { GlassStatus } from '../../backend';
import { DEFAULT_GLASSES } from '../../utils/preInspectionSchema';

interface GlassStatusTableProps {
  glasses: GlassStatus[];
  onChange: (glasses: GlassStatus[]) => void;
}

export default function GlassStatusTable({ glasses, onChange }: GlassStatusTableProps) {
  const addGlass = () => {
    const newGlass: GlassStatus = {
      glassName: '',
      isSafe: true,
      isBroken: false,
      remarks: '',
    };
    onChange([...glasses, newGlass]);
  };

  const updateGlass = (index: number, field: keyof GlassStatus, value: any) => {
    const updated = [...glasses];
    if (field === 'isSafe' && value === true) {
      updated[index] = { ...updated[index], isSafe: true, isBroken: false };
    } else if (field === 'isBroken' && value === true) {
      updated[index] = { ...updated[index], isSafe: false, isBroken: true };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const removeGlass = (index: number) => {
    onChange(glasses.filter((_, i) => i !== index));
  };

  const addDefaultGlasses = () => {
    const newGlasses = DEFAULT_GLASSES.map(name => ({
      glassName: name,
      isSafe: true,
      isBroken: false,
      remarks: '',
    }));
    onChange([...glasses, ...newGlasses]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" onClick={addGlass} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Glass
        </Button>
        {glasses.length === 0 && (
          <Button type="button" onClick={addDefaultGlasses} variant="outline" size="sm">
            Add Default Glasses
          </Button>
        )}
      </div>

      {glasses.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left font-semibold">Glass Name</th>
                  <th className="p-2 text-center font-semibold w-20">Safe</th>
                  <th className="p-2 text-center font-semibold w-20">Broken</th>
                  <th className="p-2 text-left font-semibold">Remarks</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {glasses.map((glass, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">
                      <Input
                        value={glass.glassName}
                        onChange={(e) => updateGlass(index, 'glassName', e.target.value)}
                        placeholder="Glass name"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={glass.isSafe}
                        onChange={() => updateGlass(index, 'isSafe', true)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="radio"
                        checked={glass.isBroken}
                        onChange={() => updateGlass(index, 'isBroken', true)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={glass.remarks}
                        onChange={(e) => updateGlass(index, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGlass(index)}
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
