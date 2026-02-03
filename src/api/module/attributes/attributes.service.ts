import { attributesRepository } from "./attributes.repository";
import { ColorAttributeInput, MaterialAttributeInput, SizeAttributeInput } from "./attributes.validator";


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
        const sizes = await attributesRepository.getActiveSizes();
        const colors = await attributesRepository.getActiveColors();
        const materials = await attributesRepository.getActiveMaterials();

        return { sizes, colors, materials }
    }

    public async handleCreateSize(payload: SizeAttributeInput) {
        return await attributesRepository.createSize({
            name: payload.name,
            type: payload.type,
        });
    }

    public async handleUpdateSize(sizeId: string, payload: SizeAttributeInput) {
        return await attributesRepository.updateSize(sizeId, {
            name: payload.name,
            type: payload.type,
        });
    }

    public async handleDeactivateSize(sizeId: string) {
        return await attributesRepository.deactivateSize(sizeId);
    }

    public async handleCreateColor(payload: ColorAttributeInput) {
        return await attributesRepository.createColor({
            name: payload.name,
        });
    }

    public async handleUpdateColor(colorId: string, payload: ColorAttributeInput) {
        return await attributesRepository.updateColor(colorId, {
            name: payload.name,
        });
    }

    public async handleDeactivateColor(colorId: string) {
        return await attributesRepository.deactivateColor(colorId);
    }

    public async handleCreateMaterial(payload: MaterialAttributeInput) {
        return await attributesRepository.createMaterial({
            name: payload.name,
        });
    }

    public async handleUpdateMaterial(materialId: string, payload: MaterialAttributeInput) {
        return await attributesRepository.updateMaterial(materialId, {
            name: payload.name,
        });
    }

    public async handleDeactivateMaterial(materialId: string) {
        return await attributesRepository.deactivateMaterial(materialId);
    }
}

export const attributesService = new AttributesService();