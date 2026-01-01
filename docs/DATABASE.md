# 🗄️ Database Schema Documentation

## Overview

The Mwembeshi Farm Management System uses PostgreSQL as its primary database. The schema is designed to handle all aspects of a mixed-use farm including livestock, crops, workers, and equipment.

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MWEMBESHI FARM - ER DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │    User     │
                                    │─────────────│
                                    │ id          │
                                    │ email       │
                                    │ name        │
                                    │ role        │
                                    │ language    │
                                    └──────┬──────┘
                                           │
           ┌───────────────────────────────┼───────────────────────────────┐
           │                               │                               │
           ▼                               ▼                               ▼
    ┌─────────────┐               ┌─────────────┐               ┌─────────────────┐
    │   Animal    │               │    Task     │               │ EquipmentUsage  │
    │─────────────│               │─────────────│               │─────────────────│
    │ id          │               │ id          │               │ id              │
    │ tag         │               │ title       │               │ equipmentId     │
    │ type        │               │ category    │               │ usedById        │
    │ breed       │               │ status      │               │ checkoutTime    │
    │ gender      │               │ assignedTo  │               │ returnTime      │
    │ status      │               │ createdBy   │               └────────┬────────┘
    └──────┬──────┘               └──────┬──────┘                        │
           │                             │                               │
           │                             │                               ▼
           │                             ▼                      ┌─────────────────┐
           │                      ┌─────────────┐               │   Equipment     │
           │                      │ TaskWorker  │               │─────────────────│
           │                      │─────────────│               │ id              │
           │                      │ taskId      │               │ name            │
           │                      │ workerId    │               │ code            │
           │                      └──────┬──────┘               │ category        │
           │                             │                      │ status          │
           │                             ▼                      └────────┬────────┘
           │                      ┌─────────────┐                        │
           │                      │   Worker    │                        ▼
           │                      │─────────────│               ┌─────────────────┐
           │                      │ id          │               │  Maintenance    │
           │                      │ firstName   │               │─────────────────│
           │                      │ lastName    │               │ id              │
           │                      │ position    │               │ equipmentId     │
           │                      │ dailyRate   │               │ type            │
           │                      └──────┬──────┘               │ cost            │
           │                             │                      └─────────────────┘
           │              ┌──────────────┼──────────────┐
           │              │              │              │
           │              ▼              ▼              ▼
           │       ┌──────────┐  ┌──────────┐  ┌──────────┐
           │       │Attendance│  │ Payment  │  │TaskWorker│
           │       │──────────│  │──────────│  │──────────│
           │       │ workerId │  │ workerId │  │ taskId   │
           │       │ date     │  │ amount   │  │ workerId │
           │       │ status   │  │ payType  │  └──────────┘
           │       └──────────┘  └──────────┘
           │
           ▼
    ┌──────────────────────────────────────────────────────┐
    │                    ANIMAL RELATIONS                   │
    └──────────────────────────────────────────────────────┘
           │
           ├──────────────────────────────────────────────────┐
           │                                                  │
           ▼                                                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   ┌──────────────┐
    │  Treatment  │    │WeightRecord │    │ Production  │   │BreedingRecord│
    │─────────────│    │─────────────│    │─────────────│   │──────────────│
    │ animalId    │    │ animalId    │    │ animalId    │   │ animalId     │
    │ type        │    │ weight      │    │ type        │   │ maleId       │
    │ medication  │    │ recordedAt  │    │ quantity    │   │ breedingDate │
    │ cost        │    └─────────────┘    │ unit        │   │ offspring    │
    └─────────────┘                       └─────────────┘   └──────────────┘


    ┌──────────────────────────────────────────────────────┐
    │                     CROP RELATIONS                    │
    └──────────────────────────────────────────────────────┘

    ┌─────────────┐         ┌─────────────┐
    │  CropType   │         │    Field    │
    │─────────────│         │─────────────│
    │ id          │         │ id          │
    │ name        │         │ name        │
    │ localName   │         │ size        │
    │ category    │         │ irrigation  │
    └──────┬──────┘         └──────┬──────┘
           │                       │
           └───────────┬───────────┘
                       │
                       ▼
                ┌─────────────┐
                │  Planting   │
                │─────────────│
                │ cropTypeId  │
                │ fieldId     │
                │ plantingDate│
                │ status      │
                └──────┬──────┘
                       │
           ┌───────────┼───────────┬───────────┐
           │           │           │           │
           ▼           ▼           ▼           ▼
    ┌───────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │CropActivity│ │CropInput│ │ Harvest │ │         │
    │───────────│ │─────────│ │─────────│ │         │
    │ type      │ │ name    │ │ quantity│ │         │
    │ cost      │ │ type    │ │ quality │ │         │
    └───────────┘ │ cost    │ │ soldPrice│ │         │
                  └─────────┘ └─────────┘ └─────────┘


    ┌──────────────────────────────────────────────────────┐
    │                  INVENTORY & FINANCE                  │
    └──────────────────────────────────────────────────────┘

    ┌─────────────────┐         ┌─────────────┐         ┌─────────────┐
    │  InventoryItem  │         │   Expense   │         │   Income    │
    │─────────────────│         │─────────────│         │─────────────│
    │ id              │         │ id          │         │ id          │
    │ name            │         │ category    │         │ category    │
    │ currentStock    │         │ amount      │         │ amount      │
    │ minStock        │         │ vendor      │         │ buyer       │
    └────────┬────────┘         └─────────────┘         └─────────────┘
             │
             ▼
    ┌────────────────────┐
    │InventoryTransaction│
    │────────────────────│
    │ itemId             │
    │ type               │
    │ quantity           │
    │ unitCost           │
    └────────────────────┘
```

## Table Descriptions

### Core Entities

#### Users
- **Purpose**: System users (farm owner, supervisors, staff)
- **Key Fields**: email, role, language preference
- **Relationships**: Creates tasks, records attendance, uses equipment

#### Animals
- **Purpose**: Track all livestock on the farm
- **Supported Types**: GOAT, COW, SHEEP, CHICKEN, PIG
- **Key Features**: 
  - Parent-child relationships for breeding lineage
  - Status tracking (active, sold, deceased)
  - Tag-based identification

#### CropType & Planting
- **Purpose**: Manage crop cultivation from planning to harvest
- **Key Features**:
  - Multiple plantings per crop type
  - Field assignment
  - Activity and input tracking

#### Workers
- **Purpose**: Manage farm staff
- **Key Features**:
  - Different worker types (permanent, casual, seasonal)
  - Attendance tracking
  - Payment history

#### Equipment
- **Purpose**: Track farm tools and machinery
- **Key Features**:
  - Usage logs
  - Maintenance schedules
  - Depreciation tracking

### Supporting Entities

| Table | Purpose |
|-------|---------|
| `treatments` | Animal health records |
| `weight_records` | Animal weight history |
| `production` | Milk, eggs, wool production |
| `breeding_records` | Breeding and pregnancy tracking |
| `crop_activities` | Farming activities (weeding, spraying) |
| `crop_inputs` | Fertilizers, pesticides used |
| `harvests` | Harvest records with sales |
| `attendance` | Worker attendance logs |
| `payments` | Worker payment history |
| `tasks` | Farm task management |
| `maintenance` | Equipment maintenance logs |
| `equipment_usage` | Equipment checkout/return |
| `inventory_items` | Stock management |
| `expenses` | Financial outflows |
| `incomes` | Financial inflows |
| `sync_logs` | Offline sync queue |

## Key Relationships

### Animal Breeding Lineage
```sql
-- Self-referential relationship for tracking parentage
Animal (mother_id) → Animal (id)
Animal (father_id) → Animal (id)
```

### Crop Lifecycle
```sql
CropType → Planting → CropActivity
                   → CropInput
                   → Harvest
```

### Worker Management
```sql
Worker → Attendance (daily records)
      → Payment (salary/wages)
      → TaskWorker → Task (assignments)
```

## Indexing Strategy

All tables have indexes on:
- Primary keys (automatic)
- Foreign keys for joins
- Date fields for time-based queries
- Status/category fields for filtering

## Data Types (Zambian Context)

### Currency
- All monetary values use `DECIMAL(12, 2)` for ZMW (Zambian Kwacha)
- Supports values up to 9,999,999,999.99 ZMW

### Measurements
- Weight: `DECIMAL(8, 2)` in kilograms
- Area: `DECIMAL(10, 4)` in hectares
- Volume: `DECIMAL(10, 2)` in liters

### Identification
- `nrc` field for National Registration Card (Zambian ID)
- Animal `tag` for farm identification system

## Migration Commands

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migration to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

## Seed Data

The seed file (`prisma/seed.ts`) includes:
- Default crop types (tomatoes, onions, maize, rape)
- Initial settings
- Sample data for testing

## Backup Strategy

Recommended backup schedule:
- **Daily**: Automated backups via Supabase
- **Weekly**: Manual export to CSV
- **Monthly**: Full database dump to secure storage

```bash
# Manual backup command
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```
