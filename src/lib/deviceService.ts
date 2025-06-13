// src/lib/deviceService.ts

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Define a TypeScript interface for the structure of software serial numbers.
// This assumes the `software_sn` field stores a JSON string like: '[{"software_id": "serial_number"}]'
interface SoftwareSn {
  [key: number]: string;
}

// --- NEW ---
/**
 * Defines the shape of the search parameters for finding devices.
 * All fields are optional.
 */
export interface DeviceSearchParams {
  device_id?: string;
  serial_no?: string;
  device_brand?: string;
  device_model?: string;
  device_name?: string;
  memory?: string;
  cpu?: string;
  harddisk?: string;
  monitor?: string;
  device_ip?: string;
  device_status?: string;
  device_type_id?: number;
  department_id?: number;
}

/**
 * Creates a data provider instance with a search query applied.
 * This function translates the logic from the Yii DeviceSearch model.
 * @param params - An object containing all the search filters.
 * @returns A promise that resolves to an array of devices matching the search criteria.
 */
export async function searchDevices(params: DeviceSearchParams) {
  const where: Prisma.DeviceWhereInput = {
    AND: [], // Using AND to combine all filters, similar to andFilterWhere
  };

  // Build the query dynamically based on provided parameters
  if (params.device_id) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_id: { contains: params.device_id, mode: 'insensitive' } });
  }
  if (params.serial_no) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ serial_no: { contains: params.serial_no, mode: 'insensitive' } });
  }
  if (params.device_brand) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_brand: { contains: params.device_brand, mode: 'insensitive' } });
  }
  if (params.device_model) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_model: { contains: params.device_model, mode: 'insensitive' } });
  }
  if (params.device_name) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_name: { contains: params.device_name, mode: 'insensitive' } });
  }
  if (params.memory) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ memory: { contains: params.memory, mode: 'insensitive' } });
  }
  if (params.cpu) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ cpu: { contains: params.cpu, mode: 'insensitive' } });
  }
  if (params.harddisk) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ harddisk: { contains: params.harddisk, mode: 'insensitive' } });
  }
  if (params.monitor) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ monitor: { contains: params.monitor, mode: 'insensitive' } });
  }
  if (params.device_ip) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_ip: { contains: params.device_ip, mode: 'insensitive' } });
  }
  if (params.device_status) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_status: { equals: params.device_status } });
  }
  if (params.device_type_id) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ device_type_id: { equals: params.device_type_id } });
  }
  if (params.department_id) {
    (where.AND as Prisma.DeviceWhereInput[]).push({ department_id: { equals: params.department_id } });
  }

  // If no filters are applied, the AND array will be empty, returning all devices.
  const devices = await prisma.device.findMany({
    where,
    orderBy: {
      id: 'desc' // Default sorting
    }
  });

  return devices;
}


/**
 * Gets the display status text for a device.
 * @param device_status The current status ('enable', 'disable', etc.)
 * @returns A user-friendly status string.
 */
export function getStatusText(device_status: string | null | undefined): string {
  if (device_status === 'disable') {
    return 'Deprecated';
  }
  if (device_status === 'enable') {
    return 'Normal';
  }
  return 'Unknown';
}

/**
 * Counts devices based on their status.
 * Handles the special 'repair' status by checking the 'job' table.
 * @param status The status to count ('enable', 'disable', 'repair').
 * @returns The number of devices with the given status.
 */
export async function countDevicesByStatus(status: 'enable' | 'disable' | 'repair'): Promise<number> {
  if (status === 'repair') {
    // Counts devices that are in a job that is not 'success' or 'cancel'.
    // Note: This requires the relation between Device and Job to be defined in schema.prisma
    return await prisma.device.count({
      where: {
        jobs: {
          some: {
            job_status: {
              notIn: ['success', 'cancel'],
            },
          },
        },
      },
    });
  } else {
    // Counts devices by their direct status field.
    return await prisma.device.count({
      where: { device_status: status },
    });
  }
}

/**
 * Calculates the age of a device from its usage start date.
 * @param date The start date of device usage.
 * @returns A formatted string like "X years Y months Z days".
 */
export function getDeviceAge(date: Date | null | undefined): string {
  if (!date) {
    return 'N/A';
  }

  const now = new Date();
  const start = new Date(date);
  let seconds = Math.floor((now.getTime() - start.getTime()) / 1000);

  if (seconds < 0) return 'Invalid date';

  const years = Math.floor(seconds / 31536000);
  seconds -= years * 31536000;
  const months = Math.floor(seconds / 2628000);
  seconds -= months * 2628000;
  const days = Math.floor(seconds / 86400);

  let parts: string[] = [];
  if (years > 0) parts.push(`${years} year(s)`);
  if (months > 0) parts.push(`${months} month(s)`);
  if (days > 0) parts.push(`${days} day(s)`);
  
  return parts.length > 0 ? parts.join(' ') : 'Less than a day';
}


/**
 * Checks if a specific software ID is associated with a device.
 * @param deviceSoftware - The comma-separated string of software IDs from the device.
 * @param softwareId - The software ID to check for.
 * @returns True if the software is associated, otherwise false.
 */
export function checkSoftwareOnDevice(deviceSoftware: string | null | undefined, softwareId: number): boolean {
    if (!deviceSoftware) {
        return false;
    }
    // Split the string into an array of numbers and check for inclusion.
    const installedSoftwareIds = deviceSoftware.split(',').map(id => parseInt(id.trim(), 10));
    return installedSoftwareIds.includes(softwareId);
}

/**
 * Finds the serial number for a specific software on a given device.
 * @param softwareSnJson - The JSON string of software serial numbers from the device.
 * @param softwareId - The ID of the software to find the SN for.
 * @returns The serial number string or null if not found.
 */
export function findSnForSoftware(softwareSnJson: string | null | undefined, softwareId: number): string | null {
    if (!softwareSnJson) {
        return null;
    }
    try {
        const snArray: SoftwareSn[] = JSON.parse(softwareSnJson);
        for (const snObject of snArray) {
            if (snObject[softwareId]) {
                return snObject[softwareId];
            }
        }
    } catch (error) {
        console.error("Failed to parse software_sn JSON:", error);
    }
    return null;
}

/**
 * Aggregates software installation data across all devices.
 * @returns An object grouped by software type, with counts of installations and serial numbers.
 */
export async function getSoftwareTotals() {
    const devicesWithSoftware = await prisma.device.findMany({
        where: {
            software: {
                not: '',
            },
        },
        select: {
            id: true,
            software: true,
            software_sn: true,
        },
    });

    const allSoftwareDetails = await prisma.software_detail.findMany({
        include: { software_type: true } // Assuming you've set up this relation
    });

    const softwareReport: { [key: string]: { id: number, software_name: string, total_install: number, total_sn: number }[] } = {};

    allSoftwareDetails.forEach(detail => {
        // This requires the relation 'software_type' to be defined in your schema.prisma
        const softwareTypeName = detail.software_type?.software_type || 'Uncategorized';
        if (!softwareReport[softwareTypeName]) {
            softwareReport[softwareTypeName] = [];
        }

        let total_install = 0;
        let total_sn = 0;

        devicesWithSoftware.forEach(device => {
            const installedIds = device.software?.split(',').map(id => parseInt(id.trim())) || [];
            if (installedIds.includes(detail.id)) {
                total_install++;
                if (findSnForSoftware(device.software_sn, detail.id)) {
                    total_sn++;
                }
            }
        });

        softwareReport[softwareTypeName].push({
            id: detail.id,
            software_name: detail.software_detail,
            total_install,
            total_sn,
        });
    });

    return softwareReport;
}

/**
 * NOTE: File Upload Handling
 *
 * In Next.js, file uploads are handled differently than in Yii.
 * You would typically create an API Route (e.g., `src/app/api/upload/route.ts`)
 * that accepts a POST request with `FormData`. This function would then
 * handle saving the file to a directory (like `./public/uploads`) or to a
 * cloud storage service (like AWS S3 or Cloudinary).
 *
 * Below is a placeholder function signature. The actual implementation
 * would live inside an API route.
 */
export async function handleFileUpload(file: File): Promise<string | null> {
    // Example logic for an API route:
    // 1. Get the file from the request FormData.
    // 2. Generate a unique filename.
    // 3. Define the path (e.g., path.join(process.cwd(), 'public/uploads', fileName)).
    // 4. Write the file to the filesystem.
    // 5. Return the public URL of the file (e.g., `/uploads/${fileName}`).

    console.log("File upload logic would be implemented in an API route.", file.name);
    // This is just a placeholder.
    return null;
}
