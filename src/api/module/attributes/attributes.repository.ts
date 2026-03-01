import { prisma } from "@core/config/prisma";
import { Size, Color, Material } from "generated/prisma/client";
import { SizeType } from "generated/prisma/enums";
import { getUuid } from "@core/utils/db.helper";


class AttributesRepository {

    // -------------------- Size --------------------

    public async sizeList() {
        return await prisma.size.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
                type: true,
                createdAt: true,
            } 
        });
    }

    public async getActiveSizeList() {
        return await prisma.size.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                type: true,
            }
        });
    }

    public async getActiveSize(sizeId: string) {
        return await prisma.size.findUnique({
            where: { id: sizeId, isActive: true },
        });
    }

    public async createSize(data: {
        name: string;
        type: SizeType;
    }): Promise<Size> {
        return await prisma.size.create({
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
            isActive?: boolean;
        }
    ): Promise<Size> {
        return await prisma.size.update({
            where: { id },
            data,
        });
    }

    public async sizeCount() {
        return await prisma.size.count()
    }


    // -------------------- Color --------------------

    public async colorList() {
        return await prisma.color.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
                createdAt: true,
            } 
        });
    }

    public async getActiveColorList() {
        return await prisma.color.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
            }
        });
    }

    public async getActiveColor(colorId: string) {
        return await prisma.color.findUnique({
            where: { id: colorId, isActive: true },
        });
    }

    public async createColor(data: {
        name: string;
    }): Promise<Color> {
        return await prisma.color.create({
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
            isActive?: boolean;
        }
    ): Promise<Color> {
        return await prisma.color.update({
            where: { id },
            data,
        });
    }

    public async colorCount() {
        return await prisma.color.count()
    }


    // -------------------- Material --------------------

    public async materialList() {
        return await prisma.material.findMany({ 
            select: {
                id: true,
                isActive: true,
                name: true,
                createdAt: true,
            }
        });
    }


    public async getActiveMaterialList() {
        return await prisma.material.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
            }
        });
    }

    public async getActiveMaterial(materialId: string) {
        return await prisma.material.findUnique({
            where: { id: materialId, isActive: true },
        });
    }

    public async createMaterial(data: {
        name: string;
    }): Promise<Material> {
        return await prisma.material.create({
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
            isActive?: boolean;
        }
    ): Promise<Material> {
        return await prisma.material.update({
            where: { id },
            data,
        });
    }

    public async materialCount() {
        return await prisma.material.count()
    }
}

export const attributesRepository = new AttributesRepository();