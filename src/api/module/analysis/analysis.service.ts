import { brandRepository } from "@mod/brand/brand.repository"
import { attributesRepository } from "@mod/attributes/attributes.repository"


class AnalysisService {
    public async getBrandAtrributeCount() {
        const [ brands, sizes, colors, materials ] = await Promise.all([
            brandRepository.count(),
            attributesRepository.sizeCount(),
            attributesRepository.colorCount(),
            attributesRepository.materialCount()
        ])

        return { brands, sizes, colors, materials }
    }
}

export const analysisService = new AnalysisService()