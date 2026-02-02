import { UAParser } from "ua-parser-js";
import { DeviceType } from "generated/prisma/enums";


// ---------- Constants ----------
export const MAX_SESSION_PER_USER = 5;



// ---------- Helpers ----------
export const getDeviceInfo = (userAgent?: string): { deviceName?: string, deviceType?: DeviceType } => {
    if (!userAgent) return { deviceName: undefined, deviceType: undefined };

    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const deviceType = device.type === "mobile"
        ? DeviceType.MOBILE
        : device.type === "tablet"
            ? DeviceType.TABLET
            : DeviceType.DESKTOP;
    
    const deviceName = `${browser.name ?? "Unknown Browser"} on ${os.name ?? "Unknown OS"}`;

    return { deviceName, deviceType };
}