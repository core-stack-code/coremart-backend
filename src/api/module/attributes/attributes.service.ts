import { attributesRepository } from "./attributes.repository";
import { 
    CreateColorPayload, CreateMaterialPayload, CreateSizePayload, UpdateColorPayload, UpdateMaterialPayload, UpdateSizePayload
} from "./attributes.validator";


class AttributesService {
    public async handleSizeList() {
        return await attributesRepository.sizeList();
    }

    public async handleColorList() {
        return await attributesRepository.colorList();
    }

    public async handleMaterialList() {
        return await attributesRepository.materialList();
    }

    public async handleAttributeList() {
        const [ sizes, colors, materials ] = await Promise.all([
            attributesRepository.getActiveSizeList(),
            attributesRepository.getActiveColorList(),
            attributesRepository.getActiveMaterialList(),
        ]);

        return { sizes, colors, materials }
    }

    public async checkAttributes(sizeId: string, colorId: string, materialId: string) {
        const [ size, color, material ] = await Promise.all([
            attributesRepository.getActiveSize(sizeId),
            attributesRepository.getActiveColor(colorId),
            attributesRepository.getActiveMaterial(materialId),
        ]);

        if (!size || !color || !material) {
            throw new Error("Invalid variant attributes");
        }
    }

    public async handleCreateSize(payload: CreateSizePayload) {
        return await attributesRepository.createSize({
            name: payload.name,
            type: payload.type,
        });
    }

    public async handleUpdateSize(sizeId: string, payload: UpdateSizePayload) {
        return await attributesRepository.updateSize(sizeId, {
            name: payload.name,
            type: payload.type,
            isActive: payload.isActive,
        });
    }

    public async handleCreateColor(payload: CreateColorPayload) {
        return await attributesRepository.createColor({
            name: payload.name,
        });
    }

    public async handleUpdateColor(colorId: string, payload: UpdateColorPayload) {
        return await attributesRepository.updateColor(colorId, {
            name: payload.name,
            isActive: payload.isActive,
        });
    }

    public async handleCreateMaterial(payload: CreateMaterialPayload) {
        return await attributesRepository.createMaterial({
            name: payload.name,
        });
    }

    public async handleUpdateMaterial(materialId: string, payload: UpdateMaterialPayload) {
        return await attributesRepository.updateMaterial(materialId, {
            name: payload.name,
            isActive: payload.isActive,
        });
    }
}

export const attributesService = new AttributesService();