import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type VehicleDetails = {
    vehicleNumber : Text;
    engineNumber : Text;
    chassisNumber : Text;
    makeModel : Text;
    odometer : Nat;
  };

  public type PhotoMetadata = {
    filePath : Text;
    gpsCoordinates : Text;
    timestamp : Nat;
    watermarkText : Text;
  };

  public type VehicleInspection = {
    id : Nat;
    user : Principal;
    vehicleDetails : VehicleDetails;
    photos : [PhotoMetadata];
    remarks : Text;
    pdfReference : Text;
    timestamp : Nat;
  };

  public type InspectionSummary = {
    id : Nat;
    vehicleNumber : Text;
    makeModel : Text;
    timestamp : Nat;
  };

  public type LocationData = {
    latitude : Float;
    longitude : Float;
    address : Text;
  };

  public type UserProfile = {
    name : Text;
    contactNumber : Text;
  };

  public type DashboardStats = {
    totalInspections : Nat;
    totalPhotos : Nat;
    totalUsers : Nat;
  };

  // New detailed inspection model
  public type InspectionHeader = {
    refNo : Text;
    company : Text;
    vehicleNo : Text;
    customerName : Text;
    customerAddress : Text;
    dealerAgent : Text;
    inspectionPlace : Text;
    inspectionDate : Text;
    inspectionTime : Text;
    recommendedForInsurance : Bool; // Yes = true, No = false
  };

  public type PartStatus = {
    #safe;
    #scratch;
    #pressed;
    #broken;
  };

  public type PartChecklist = {
    partName : Text;
    status : PartStatus;
    remarks : Text;
  };

  public type VehicleSpecs = {
    oldPolicyFrom : Text;
    chassisNo : Text;
    engineNo : Text;
    modelVariant : Text;
    color : Text;
    fuelType : {
      #petrol;
      #diesel;
      #cngLpg;
    };
    yearOfManufacturing : Text;
    odometerReading : Nat;
  };

  public type ElectricalAccessory = {
    name : Text;
    isWorking : Bool;
    remarks : Text;
  };

  public type NonElectricalAccessory = {
    name : Text;
    isPresent : Bool;
    remarks : Text;
  };

  public type GlassStatus = {
    glassName : Text;
    isSafe : Bool;
    isBroken : Bool;
    remarks : Text;
  };

  public type PreviousInsuranceDetails = {
    insuranceCompany : Text;
    policyNumber : Text;
    expiryDate : Text;
    numOfClaims : Nat;
    timeLapse : Text;
  };

  public type Declaration = {
    proposerName : Text;
    surveyorName : Text;
    signatureDate : Text;
  };

  public type DetailedInspection = {
    id : Nat;
    user : Principal;
    header : InspectionHeader;
    vehicleSpecs : VehicleSpecs;
    partsChecklist : [PartChecklist];
    electricalAccessories : [ElectricalAccessory];
    nonElectricalAccessories : [NonElectricalAccessory];
    glasses : [GlassStatus];
    previousInsurance : PreviousInsuranceDetails;
    declaration : Declaration;
    photos : [PhotoMetadata];
    timestamp : Nat;
  };

  var nextInspectionId = 0;

  let inspections = Map.empty<Nat, VehicleInspection>();
  let detailedInspections = Map.empty<Nat, DetailedInspection>();
  let userInspections = Map.empty<Principal, [Nat]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Dashboard Stats - requires user permission
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let totalInspections = inspections.size() + detailedInspections.size();
    let totalPhotos = inspections.values().foldLeft(
      0,
      func(acc, inspection) {
        acc + inspection.photos.size();
      },
    ) + detailedInspections.values().foldLeft(
      0,
      func(acc, inspection) {
        acc + inspection.photos.size();
      },
    );
    let totalUsers = userInspections.size();

    {
      totalInspections;
      totalPhotos;
      totalUsers;
    };
  };

  // New: Create Detailed Inspection
  public shared ({ caller }) func createDetailedInspection(header : InspectionHeader, vehicleSpecs : VehicleSpecs) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create inspections");
    };

    let inspectionId = nextInspectionId;
    nextInspectionId += 1;

    let emptyInsuranceDetails : PreviousInsuranceDetails = {
      insuranceCompany = "";
      policyNumber = "";
      expiryDate = "";
      numOfClaims = 0;
      timeLapse = "";
    };

    let emptyDeclaration : Declaration = {
      proposerName = "";
      surveyorName = "";
      signatureDate = "";
    };

    let inspection : DetailedInspection = {
      id = inspectionId;
      user = caller;
      header;
      vehicleSpecs;
      partsChecklist = [];
      electricalAccessories = [];
      nonElectricalAccessories = [];
      glasses = [];
      previousInsurance = emptyInsuranceDetails;
      declaration = emptyDeclaration;
      photos = [];
      timestamp = Int.abs(Time.now());
    };

    detailedInspections.add(inspectionId, inspection);

    let userInspectionIds = switch (userInspections.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };
    let updatedInspectionIds = userInspectionIds.concat([inspectionId]);
    userInspections.add(caller, updatedInspectionIds);

    inspectionId;
  };

  // Add Part to Checklist
  public shared ({ caller }) func addPartToChecklist(inspectionId : Nat, part : PartChecklist) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedParts = inspection.partsChecklist.concat([part]);
    let updatedInspection = { inspection with partsChecklist = updatedParts };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Add Electrical Accessory
  public shared ({ caller }) func addElectricalAccessory(inspectionId : Nat, accessory : ElectricalAccessory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedAccessories = inspection.electricalAccessories.concat([accessory]);
    let updatedInspection = { inspection with electricalAccessories = updatedAccessories };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Add Non-Electrical Accessory
  public shared ({ caller }) func addNonElectricalAccessory(inspectionId : Nat, accessory : NonElectricalAccessory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedAccessories = inspection.nonElectricalAccessories.concat([accessory]);
    let updatedInspection = { inspection with nonElectricalAccessories = updatedAccessories };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Add Glass Status
  public shared ({ caller }) func addGlassStatus(inspectionId : Nat, glass : GlassStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedGlasses = inspection.glasses.concat([glass]);
    let updatedInspection = { inspection with glasses = updatedGlasses };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Update Previous Insurance Details
  public shared ({ caller }) func updatePreviousInsurance(inspectionId : Nat, details : PreviousInsuranceDetails) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedInspection = { inspection with previousInsurance = details };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Update Declaration
  public shared ({ caller }) func updateDeclaration(inspectionId : Nat, declaration : Declaration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);
    let updatedInspection = { inspection with declaration };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Add Photo to Detailed Inspection
  public shared ({ caller }) func addPhotoToDetailedInspection(inspectionId : Nat, photo : PhotoMetadata) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify inspections");
    };
    let inspection = getInspection(inspectionId, caller);

    let updatedInspection = { inspection with photos = inspection.photos.concat([photo]) };
    detailedInspections.add(inspectionId, updatedInspection);
  };

  // Get Inspection (Internal Helper)
  private func getInspection(id : Nat, caller : Principal) : DetailedInspection {
    switch (detailedInspections.get(id)) {
      case (null) { Runtime.trap("Inspection not found") };
      case (?inspection) {
        if (inspection.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot modify other users' inspections");
        };
        inspection;
      };
    };
  };

  // Get Detailed Inspection
  public query ({ caller }) func getDetailedInspectionById(inspectionId : Nat) : async DetailedInspection {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspections");
    };
    switch (detailedInspections.get(inspectionId)) {
      case (null) { Runtime.trap("Inspection not found") };
      case (?inspection) {
        if (inspection.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view other users' inspections");
        };
        inspection;
      };
    };
  };

  // List Caller’s Inspection Summaries
  public query ({ caller }) func getCallerInspectionSummaries() : async [InspectionSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view inspection summaries");
    };

    let userInspectionIds = switch (userInspections.get(caller)) {
      case (null) { return [] };
      case (?ids) { ids };
    };

    let detailedSummaries = List.empty<InspectionSummary>();

    for (id in userInspectionIds.values()) {
      switch (detailedInspections.get(id)) {
        case (?inspection) {
          let summary : InspectionSummary = {
            id = inspection.id;
            vehicleNumber = inspection.header.vehicleNo;
            makeModel = inspection.vehicleSpecs.modelVariant;
            timestamp = inspection.timestamp;
          };
          detailedSummaries.add(summary);
        };
        case (null) {};
      };
    };

    detailedSummaries.toArray();
  };
};
