import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ElectricalAccessory, NonElectricalAccessory } from '../../backend';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AccessoriesSectionProps {
  electricalAccessories: ElectricalAccessory[];
  nonElectricalAccessories: NonElectricalAccessory[];
  onElectricalChange: (accessories: ElectricalAccessory[]) => void;
  onNonElectricalChange: (accessories: NonElectricalAccessory[]) => void;
}

export default function AccessoriesSection({
  electricalAccessories,
  nonElectricalAccessories,
  onElectricalChange,
  onNonElectricalChange,
}: AccessoriesSectionProps) {
  const addElectrical = () => {
    const newAccessory: ElectricalAccessory = {
      name: '',
      isWorking: true,
      remarks: '',
    };
    onElectricalChange([...electricalAccessories, newAccessory]);
  };

  const updateElectrical = (index: number, field: keyof ElectricalAccessory, value: any) => {
    const updated = [...electricalAccessories];
    updated[index] = { ...updated[index], [field]: value };
    onElectricalChange(updated);
  };

  const removeElectrical = (index: number) => {
    onElectricalChange(electricalAccessories.filter((_, i) => i !== index));
  };

  const addNonElectrical = () => {
    const newAccessory: NonElectricalAccessory = {
      name: '',
      isPresent: true,
      remarks: '',
    };
    onNonElectricalChange([...nonElectricalAccessories, newAccessory]);
  };

  const updateNonElectrical = (index: number, field: keyof NonElectricalAccessory, value: any) => {
    const updated = [...nonElectricalAccessories];
    updated[index] = { ...updated[index], [field]: value };
    onNonElectricalChange(updated);
  };

  const removeNonElectrical = (index: number) => {
    onNonElectricalChange(nonElectricalAccessories.filter((_, i) => i !== index));
  };

  return (
    <Tabs defaultValue="electrical" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="electrical">Electrical</TabsTrigger>
        <TabsTrigger value="non-electrical">Non-Electrical</TabsTrigger>
      </TabsList>

      <TabsContent value="electrical" className="space-y-4">
        <Button type="button" onClick={addElectrical} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Electrical Accessory
        </Button>

        {electricalAccessories.length > 0 && (
          <div className="space-y-3">
            {electricalAccessories.map((accessory, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label className="text-sm font-semibold">Accessory {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeElectrical(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name / Make</Label>
                    <Input
                      value={accessory.name}
                      onChange={(e) => updateElectrical(index, 'name', e.target.value)}
                      placeholder="e.g., Stereo / Make"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Working Status</Label>
                    <div className="flex items-center gap-4 h-10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={accessory.isWorking}
                          onChange={() => updateElectrical(index, 'isWorking', true)}
                          className="w-4 h-4"
                        />
                        <span>Working</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!accessory.isWorking}
                          onChange={() => updateElectrical(index, 'isWorking', false)}
                          className="w-4 h-4"
                        />
                        <span>Not Working</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input
                    value={accessory.remarks}
                    onChange={(e) => updateElectrical(index, 'remarks', e.target.value)}
                    placeholder="Optional remarks"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="non-electrical" className="space-y-4">
        <Button type="button" onClick={addNonElectrical} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Non-Electrical Accessory
        </Button>

        {nonElectricalAccessories.length > 0 && (
          <div className="space-y-3">
            {nonElectricalAccessories.map((accessory, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Label className="text-sm font-semibold">Accessory {index + 1}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeNonElectrical(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={accessory.name}
                      onChange={(e) => updateNonElectrical(index, 'name', e.target.value)}
                      placeholder="e.g., Seat Covers"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Present Status</Label>
                    <div className="flex items-center gap-4 h-10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={accessory.isPresent}
                          onChange={() => updateNonElectrical(index, 'isPresent', true)}
                          className="w-4 h-4"
                        />
                        <span>Present</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!accessory.isPresent}
                          onChange={() => updateNonElectrical(index, 'isPresent', false)}
                          className="w-4 h-4"
                        />
                        <span>Not Present</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input
                    value={accessory.remarks}
                    onChange={(e) => updateNonElectrical(index, 'remarks', e.target.value)}
                    placeholder="Optional remarks"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
