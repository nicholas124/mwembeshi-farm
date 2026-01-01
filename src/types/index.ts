// Animal Types
export type AnimalType = 'GOAT' | 'COW' | 'SHEEP' | 'CHICKEN' | 'PIG' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';
export type AnimalStatus = 'ACTIVE' | 'SOLD' | 'DECEASED' | 'TRANSFERRED' | 'SLAUGHTERED';
export type AcquisitionMethod = 'PURCHASED' | 'BORN' | 'DONATED' | 'TRADED';
export type TreatmentType = 'VACCINATION' | 'DEWORMING' | 'MEDICATION' | 'SURGERY' | 'CHECKUP' | 'INJURY' | 'OTHER';

// Crop Types
export type CropCategory = 'VEGETABLE' | 'GRAIN' | 'FRUIT' | 'LEGUME' | 'TUBER' | 'OTHER';
export type IrrigationType = 'RAINFED' | 'DRIP' | 'SPRINKLER' | 'FLOOD' | 'MANUAL';
export type PlantingStatus = 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTING' | 'COMPLETED' | 'FAILED';
export type ActivityType = 'LAND_PREP' | 'PLANTING' | 'WEEDING' | 'FERTILIZING' | 'SPRAYING' | 'IRRIGATION' | 'INSPECTION' | 'OTHER';
export type InputType = 'FERTILIZER' | 'PESTICIDE' | 'HERBICIDE' | 'FUNGICIDE' | 'SEED' | 'OTHER';
export type HarvestQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

// Worker Types
export type WorkerType = 'PERMANENT' | 'CASUAL' | 'SEASONAL' | 'CONTRACT';
export type WorkerStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'SICK' | 'HOLIDAY';
export type PaymentType = 'SALARY' | 'WAGE' | 'BONUS' | 'ADVANCE' | 'OVERTIME' | 'OTHER';

// Task Types
export type TaskCategory = 'LIVESTOCK' | 'CROPS' | 'EQUIPMENT' | 'MAINTENANCE' | 'GENERAL' | 'ADMINISTRATIVE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Equipment Types
export type EquipmentCategory = 'VEHICLE' | 'TRACTOR' | 'HAND_TOOL' | 'POWER_TOOL' | 'IRRIGATION' | 'STORAGE' | 'PROCESSING' | 'OTHER';
export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'BROKEN' | 'RETIRED';
export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type MaintenanceType = 'PREVENTIVE' | 'REPAIR' | 'INSPECTION' | 'REPLACEMENT' | 'CLEANING' | 'OTHER';

// Inventory Types
export type InventoryCategory = 'FEED' | 'FERTILIZER' | 'PESTICIDE' | 'SEEDS' | 'FUEL' | 'MEDICINE' | 'SPARE_PARTS' | 'PACKAGING' | 'OTHER';
export type TransactionType = 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'TRANSFER' | 'WASTE' | 'RETURN';

// Finance Types
export type ExpenseCategory = 'LIVESTOCK' | 'CROPS' | 'LABOR' | 'EQUIPMENT' | 'FUEL' | 'UTILITIES' | 'TRANSPORT' | 'VETERINARY' | 'SEEDS_FERTILIZER' | 'REPAIRS' | 'OTHER';
export type IncomeCategory = 'LIVESTOCK_SALE' | 'CROP_SALE' | 'MILK_SALE' | 'EGG_SALE' | 'PRODUCE_SALE' | 'SERVICES' | 'OTHER';

// User Types
export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'STAFF';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Stats
export interface DashboardStats {
  livestock: {
    total: number;
    byType: Record<AnimalType, number>;
    recentBirths: number;
    needingAttention: number;
  };
  crops: {
    activePlantings: number;
    readyToHarvest: number;
    totalFields: number;
    totalArea: number;
  };
  workers: {
    total: number;
    presentToday: number;
    onLeave: number;
  };
  equipment: {
    total: number;
    inUse: number;
    needingMaintenance: number;
  };
  tasks: {
    pending: number;
    inProgress: number;
    completedThisWeek: number;
  };
}

// Form Data Types
export interface AnimalFormData {
  tag: string;
  name?: string;
  type: AnimalType;
  breed?: string;
  gender: Gender;
  dateOfBirth?: Date;
  acquisitionMethod: AcquisitionMethod;
  purchasePrice?: number;
  motherId?: string;
  fatherId?: string;
  color?: string;
  weight?: number;
  notes?: string;
}

export interface PlantingFormData {
  cropTypeId: string;
  fieldId: string;
  plantingDate: Date;
  expectedHarvest?: Date;
  areaPlanted: number;
  seedQuantity?: number;
  seedUnit?: string;
  seedCost?: number;
  season?: string;
  notes?: string;
}

export interface WorkerFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  nrc?: string;
  dateOfBirth?: Date;
  position: string;
  workerType: WorkerType;
  dailyRate?: number;
  monthlyRate?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface EquipmentFormData {
  name: string;
  code: string;
  category: EquipmentCategory;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  location?: string;
  notes?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: Date;
  assignedToId?: string;
  estimatedHours?: number;
  notes?: string;
}
