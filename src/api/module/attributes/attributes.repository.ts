import { prisma, PrismaTx } from "@core/config/prisma";
import { Size, Color, Material } from "generated/prisma/client";
import { SizeType } from "generated/prisma/enums";
import { getUuid } from "@core/utils/db.helper";


class AttributesRepository {
    public async sizeList(tx: PrismaTx = prisma) {
        return await tx.size.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
                type: true,
            } 
        });
    }

    public async colorList(tx: PrismaTx = prisma) {
        return await tx.color.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
            } 
        });
    }

    public async materialList(tx: PrismaTx = prisma) {
        return await tx.material.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
            } 
        });
    }

    public async getActiveSizes(tx: PrismaTx = prisma) {
        return await tx.size.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                type: true,
            }
        });
    }

    public async getActiveColors(tx: PrismaTx = prisma) {
        return await tx.color.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
            }
        });
    }

    public async getActiveMaterials(tx: PrismaTx = prisma) {
        return await tx.material.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
            }
        });
    }

    public async createSize(data: {
        name: string;
        type: SizeType;
    }, tx: PrismaTx = prisma): Promise<Size> {
        return await tx.size.create({
            data: {
                id: getUuid(),
                name: data.name,
                type: data.type,
                isActive: true,
            },
        });
    }

    public async updateSize(
        id: string,
        data: {
            name?: string;
            type?: SizeType;
        },
        tx: PrismaTx = prisma
    ): Promise<Size> {
        return await tx.size.update({
            where: { id },
            data,
        });
    }

    public async deactivateSize(id: string, tx: PrismaTx = prisma): Promise<Size> {
        return await tx.size.update({
            where: { id },
            data: { isActive: false },
        });
    }

    public async createColor(data: {
        name: string;
    }, tx: PrismaTx = prisma): Promise<Color> {
        return await tx.color.create({
            data: {
                id: getUuid(),
                name: data.name,
                isActive: true,
            },
        });
    }

    public async updateColor(
        id: string,
        data: {
            name?: string;
        },
        tx: PrismaTx = prisma
    ): Promise<Color> {
        return await tx.color.update({
            where: { id },
            data,
        });
    }

    public async deactivateColor(id: string, tx: PrismaTx = prisma): Promise<Color> {
        return await tx.color.update({
            where: { id },
            data: { isActive: false },
        });
    }

    public async createMaterial(data: {
        name: string;
    }, tx: PrismaTx = prisma): Promise<Material> {
        return await tx.material.create({
            data: {
                id: getUuid(),
                name: data.name,
                isActive: true,
            },
        });
    }

    public async updateMaterial(
        id: string,
        data: {
            name?: string;
        },
        tx: PrismaTx = prisma
    ): Promise<Material> {
        return await tx.material.update({
            where: { id },
            data,
        });
    }

    public async deactivateMaterial(id: string, tx: PrismaTx = prisma): Promise<Material> {
        return await tx.material.update({
            where: { id },
            data: { isActive: false },
        });
    }
}

export const attributesRepository = new AttributesRepository();