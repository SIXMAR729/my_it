// src/app/devices/[id]/page.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link';

/**
 * Fetches a single device from the database by its ID.
 * @param id The ID of the device to fetch.
 */
async function getDeviceById(id: string) {
  const deviceId = parseInt(id, 10);
  if (isNaN(deviceId)) {
    return null;
  }
  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });
    return device;
  } catch (error) {
    console.error("Failed to fetch device:", error);
    return null;
  }
}

/**
 * The detail page for a single device.
 * It receives `params` from the URL, which includes the dynamic `id`.
 */
export default async function DeviceDetailPage({ params }: { params: { id: string } }) {
  const device = await getDeviceById(params.id);

  if (!device) {
    return (
      <main className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Device Not Found</h1>
          <p className="text-gray-600 mt-2">The device you are looking for does not exist.</p>
          <Link href="/" className="mt-4 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-900 font-medium">
              &larr; Back to Dashboard
          </Link>
          <Link href={`/devices/${device.id}/edit`} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              Edit Device
          </Link>
        </div>
        
        {/* General Information Section */}
        <Section title={device.device_name || 'Device Details'} description="General information and identifiers for this device.">
          <DetailRow label="Device ID" value={device.device_id} />
          <DetailRow label="Serial Number" value={device.serial_no} />
          <DetailRow label="Brand" value={device.device_brand} />
          <DetailRow label="Model" value={device.device_model} />
          <DetailRow label="Status" value={device.device_status} isStatus={true} />
        </Section>

        {/* Technical Specifications Section */}
        <Section title="Technical Specifications" description="Hardware and network configuration.">
            <DetailRow label="CPU" value={device.cpu} />
            <DetailRow label="Memory (RAM)" value={device.memory} />
            <DetailRow label="Hard Disk" value={device.harddisk} />
            <DetailRow label="Monitor" value={device.monitor} />
            <DetailRow label="IP Address" value={device.device_ip} />
            <DetailRow label="MAC Address" value={device.mac} />
            <DetailRow label="Other Hardware" value={device.hardware_other} />
        </Section>

        {/* Purchase & Warranty Section */}
        <Section title="Purchase & Warranty" description="Vendor and warranty information.">
            <DetailRow label="Vendor" value={device.vender} />
            <DetailRow label="Price" value={device.device_price ? `฿${device.device_price.toLocaleString()}` : 'N/A'} />
            <DetailRow label="Date of Use" value={device.date_use ? new Date(device.date_use).toLocaleDateString() : 'N/A'} />
            <DetailRow label="Warranty Expires" value={device.date_expire ? new Date(device.date_expire).toLocaleDateString() : 'N/A'} />
            <DetailRow label="Warranty Details" value={device.warranty} />
        </Section>

      </div>
    </main>
  );
}

// A helper component to make the detail sections cleaner
function Section({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {description}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {children}
        </dl>
      </div>
    </div>
  )
}

// A helper component to render each detail row, now with alternating background colors.
function DetailRow({ label, value, isStatus = false }: { label: string; value: string | null | undefined; isStatus?: boolean}) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 odd:bg-gray-50 even:bg-white">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {isStatus ? (
             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                value === 'enable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
             }`}>
                {value}
            </span>
        ) : (
            <span className="whitespace-pre-wrap">{value}</span>
        )}
      </dd>
    </div>
  )
}
