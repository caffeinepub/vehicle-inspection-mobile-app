import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ElectricalAccessory {
    name: string;
    isWorking: boolean;
    remarks: string;
}
export interface DetailedInspection {
    id: bigint;
    glasses: Array<GlassStatus>;
    user: Principal;
    nonElectricalAccessories: Array<NonElectricalAccessory>;
    declaration: Declaration;
    electricalAccessories: Array<ElectricalAccessory>;
    timestamp: bigint;
    vehicleSpecs: VehicleSpecs;
    photos: Array<PhotoMetadata>;
    partsChecklist: Array<PartChecklist>;
    previousInsurance: PreviousInsuranceDetails;
    header: InspectionHeader;
}
export interface Declaration {
    proposerName: string;
    signatureDate: string;
    surveyorName: string;
}
export interface InspectionHeader {
    customerName: string;
    inspectionDate: string;
    inspectionTime: string;
    inspectionPlace: string;
    company: string;
    customerAddress: string;
    recommendedForInsurance: boolean;
    refNo: string;
    dealerAgent: string;
    vehicleNo: string;
}
export interface PhotoMetadata {
    watermarkText: string;
    gpsCoordinates: string;
    filePath: string;
    timestamp: bigint;
}
export interface PartChecklist {
    status: PartStatus;
    partName: string;
    remarks: string;
}
export interface DashboardStats {
    totalInspections: bigint;
    totalUsers: bigint;
    totalPhotos: bigint;
}
export interface VehicleSpecs {
    modelVariant: string;
    chassisNo: string;
    color: string;
    engineNo: string;
    odometerReading: bigint;
    oldPolicyFrom: string;
    yearOfManufacturing: string;
    fuelType: Variant_cngLpg_petrol_diesel;
}
export interface GlassStatus {
    glassName: string;
    isSafe: boolean;
    isBroken: boolean;
    remarks: string;
}
export interface InspectionSummary {
    id: bigint;
    vehicleNumber: string;
    timestamp: bigint;
    makeModel: string;
}
export interface NonElectricalAccessory {
    isPresent: boolean;
    name: string;
    remarks: string;
}
export interface UserProfile {
    name: string;
    contactNumber: string;
}
export interface PreviousInsuranceDetails {
    timeLapse: string;
    insuranceCompany: string;
    expiryDate: string;
    numOfClaims: bigint;
    policyNumber: string;
}
export enum PartStatus {
    broken = "broken",
    scratch = "scratch",
    pressed = "pressed",
    safe = "safe"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_cngLpg_petrol_diesel {
    cngLpg = "cngLpg",
    petrol = "petrol",
    diesel = "diesel"
}
export interface backendInterface {
    addElectricalAccessory(inspectionId: bigint, accessory: ElectricalAccessory): Promise<void>;
    addGlassStatus(inspectionId: bigint, glass: GlassStatus): Promise<void>;
    addNonElectricalAccessory(inspectionId: bigint, accessory: NonElectricalAccessory): Promise<void>;
    addPartToChecklist(inspectionId: bigint, part: PartChecklist): Promise<void>;
    addPhotoToDetailedInspection(inspectionId: bigint, photo: PhotoMetadata): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDetailedInspection(header: InspectionHeader, vehicleSpecs: VehicleSpecs): Promise<bigint>;
    getCallerInspectionSummaries(): Promise<Array<InspectionSummary>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getDetailedInspectionById(inspectionId: bigint): Promise<DetailedInspection>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDeclaration(inspectionId: bigint, declaration: Declaration): Promise<void>;
    updatePreviousInsurance(inspectionId: bigint, details: PreviousInsuranceDetails): Promise<void>;
}
