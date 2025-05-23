import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Passenger, Vehicle, User, Company } from '../types';

interface ReportData {
  passenger: Passenger;
  driver: User;
  vehicle: Vehicle;
  company: Company;
  reportId: string;
}

/**
 * Generate a PDF report for a passenger
 */
export const generatePDF = async (data: ReportData): Promise<Blob> => {
  const { passenger, driver, vehicle, company, reportId } = data;
  
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add company header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name, 105, 20, { align: 'center' });
  
  // Add report title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER TRANSPORT REPORT', 105, 30, { align: 'center' });
  
  // Add report ID and date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${reportId}`, 20, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Add passenger information section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Passenger Information', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${passenger.name}`, 25, 65);
  doc.text(`Nationality: ${passenger.nationality}`, 25, 70);
  doc.text(`ID/Passport: ${passenger.identificationNumber}`, 25, 75);
  doc.text(`From: ${passenger.fromLocation}`, 25, 80);
  doc.text(`Destination: ${passenger.destination}`, 25, 85);
  doc.text(`Trip Date: ${new Date(passenger.tripDate).toLocaleDateString()}`, 25, 90);
  
  // Add driver information section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Driver Information', 20, 105);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${driver.name}`, 25, 115);
  doc.text(`ID: ${driver.identificationNumber || 'N/A'}`, 25, 120);
  doc.text(`Nationality: ${driver.nationality || 'N/A'}`, 25, 125);
  
  // Add vehicle information section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Information', 20, 140);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Make: ${vehicle.make}`, 25, 150);
  doc.text(`Model: ${vehicle.model}`, 25, 155);
  doc.text(`Type: ${vehicle.vehicleType}`, 25, 160);
  doc.text(`Plate Number: ${vehicle.plateNumber}`, 25, 165);
  doc.text(`Chassis Number: ${vehicle.chassisNumber}`, 25, 170);
  
  // Generate QR code
  const reportUrl = `https://appdomain.com/report/${reportId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(reportUrl, {
    width: 120,
    margin: 1,
  });
  
  // Add QR code to the PDF
  doc.addImage(qrCodeDataUrl, 'PNG', 150, 130, 30, 30);
  
  // Add QR code label
  doc.setFontSize(8);
  doc.text('Scan to verify report', 165, 165, { align: 'center' });
  
  // Add footer
  doc.setFontSize(8);
  doc.text(`This report was generated on ${new Date().toLocaleString()}`, 105, 280, { align: 'center' });
  doc.text(`Verification URL: ${reportUrl}`, 105, 285, { align: 'center' });
  
  // Add watermark
  doc.setFontSize(40);
  doc.setTextColor(230, 230, 230);
  doc.text(company.name, 105, 160, {
    align: 'center',
    angle: 45,
  });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Return PDF as blob
  return doc.output('blob');
};

/**
 * Save the PDF to local storage (for offline mode)
 */
export const savePDFToStorage = async (reportId: string, pdfBlob: Blob): Promise<void> => {
  // Convert blob to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        localStorage.setItem(`report_${reportId}`, reader.result as string);
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });
};

/**
 * Get a PDF from local storage
 */
export const getPDFFromStorage = (reportId: string): string | null => {
  return localStorage.getItem(`report_${reportId}`);
};

/**
 * Generate a unique report ID
 */
export const generateReportId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};