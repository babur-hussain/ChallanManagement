import { Employee } from '../models/Employee.js';
import { Attendance } from '../models/Attendance.js';
import { logger } from '../lib/logger.js';

export class HrmsService {

    /**
     * Process GPS check in
     */
    static async markAttendance(businessId: string, employeeId: string, lat: number, lng: number, type: 'CHECK_IN' | 'CHECK_OUT') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let att = await Attendance.findOne({ businessId, employeeId, date: today });

        if (!att) {
            if (type === 'CHECK_OUT') throw new Error('Cannot check out without checking in first.');
            att = new Attendance({
                businessId,
                employeeId,
                date: today,
                status: 'PRESENT',
                checkIn: new Date(),
                checkInLocation: { lat, lng }
            });
        } else {
            if (type === 'CHECK_OUT') {
                att.checkOut = new Date();
                att.checkOutLocation = { lat, lng };

                // Simple Overtime calculation (e.g. shift ends at 18:00, checking out at 20:00 -> 2 hrs OT)
                const shiftEndTime = new Date(today);
                shiftEndTime.setHours(18, 0, 0, 0); // Standardize hardcoded shift for this mock
                if (att.checkOut > shiftEndTime) {
                    const diffMs = att.checkOut.getTime() - shiftEndTime.getTime();
                    att.overtimeHours = diffMs / (1000 * 60 * 60);
                }
            }
        }

        await att.save();
        return att;
    }

    /**
     * Generate Payroll for standard Monthly Salary employees
     */
    static async generateMonthlyPayroll(businessId: string, targetMonth: Date) {
        const employees = await Employee.find({ businessId, salaryType: 'MONTHLY', status: 'ACTIVE' });
        const payrollRunId = `PAY-${targetMonth.getFullYear()}-${targetMonth.getMonth() + 1}`;

        const results = [];
        for (const emp of employees) {
            // In real engine: parse leaves from `Attendance`, deduct LWP (Leave Without Pay), add overtime buffers
            const netPay = emp.monthlySalary;

            results.push({
                employeeCode: emp.employeeCode,
                name: emp.fullName,
                basePay: emp.monthlySalary,
                netPay,
                status: 'PROCESSING'
            });
        }

        logger.info(`Processed payroll ${payrollRunId} mapping ${results.length} active employees.`);
        return results;
    }

}
