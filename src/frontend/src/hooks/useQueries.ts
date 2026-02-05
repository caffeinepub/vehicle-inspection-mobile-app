import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  InspectionHeader,
  VehicleSpecs,
  PartChecklist,
  GlassStatus,
  ElectricalAccessory,
  NonElectricalAccessory,
  PreviousInsuranceDetails,
  Declaration,
  PhotoMetadata,
  DetailedInspection,
  InspectionSummary,
} from '../backend';
import { Variant_cngLpg_petrol_diesel } from '../backend';

export function useCreateDetailedInspection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ header, vehicleSpecs }: { header: InspectionHeader; vehicleSpecs: VehicleSpecs }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDetailedInspection(header, vehicleSpecs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInspections'] });
    },
  });
}

export function useSavePreInspectionForm() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inspectionId,
      recommendedForInsurance,
      fuelType,
      partsChecklist,
      glasses,
      electricalAccessories,
      nonElectricalAccessories,
      previousInsurance,
      declaration,
    }: {
      inspectionId: bigint;
      recommendedForInsurance: boolean;
      fuelType: Variant_cngLpg_petrol_diesel;
      partsChecklist: PartChecklist[];
      glasses: GlassStatus[];
      electricalAccessories: ElectricalAccessory[];
      nonElectricalAccessories: NonElectricalAccessory[];
      previousInsurance: PreviousInsuranceDetails;
      declaration: Declaration;
    }) => {
      if (!actor) throw new Error('Actor not available');

      for (const part of partsChecklist) {
        await actor.addPartToChecklist(inspectionId, part);
      }

      for (const glass of glasses) {
        await actor.addGlassStatus(inspectionId, glass);
      }

      for (const accessory of electricalAccessories) {
        await actor.addElectricalAccessory(inspectionId, accessory);
      }

      for (const accessory of nonElectricalAccessories) {
        await actor.addNonElectricalAccessory(inspectionId, accessory);
      }

      await actor.updatePreviousInsurance(inspectionId, previousInsurance);
      await actor.updateDeclaration(inspectionId, declaration);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['detailedInspection', variables.inspectionId.toString()] });
    },
  });
}

export function useAddPhotoToDetailedInspection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inspectionId, photo }: { inspectionId: bigint; photo: PhotoMetadata }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPhotoToDetailedInspection(inspectionId, photo);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['detailedInspection', variables.inspectionId.toString()] });
    },
  });
}

export function useGetDetailedInspectionById(inspectionId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DetailedInspection | null>({
    queryKey: ['detailedInspection', inspectionId?.toString()],
    queryFn: async () => {
      if (!actor || inspectionId === null) return null;
      return actor.getDetailedInspectionById(inspectionId);
    },
    enabled: !!actor && !actorFetching && inspectionId !== null,
  });
}

export function useGetUserInspections() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<InspectionSummary[]>({
    queryKey: ['userInspections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerInspectionSummaries();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Temporary stub for adding remarks - currently no-op until backend implements this
export function useAddRemarks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inspectionId, remarks }: { inspectionId: bigint; remarks: string }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend needs to implement addRemarks method for DetailedInspection
      // For now, this is a no-op that succeeds
      console.warn('addRemarks not yet implemented in backend - remarks not saved:', remarks);
      return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['detailedInspection', variables.inspectionId.toString()] });
    },
  });
}
