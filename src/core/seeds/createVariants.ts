import { prisma } from "@core/config/prisma"
import { variantsRepository } from "@mod/variants/variants.repository";
import { generateSkuCode } from "@mod/variants/variants.utils";

type Attrivutes = {
    id: string;
    name: string;
}

const sizes: Attrivutes[] = []
const colors: Attrivutes[] = []
const materials: Attrivutes[] = []

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};


const createVariants = async () => {
    if(sizes.length === 0) {
        const sizeIds = await prisma.size.findMany({
            where: { isActive: true },
            select: { id: true, name: true }
        })
        sizes.push(...sizeIds.map((s) => ({ id: s.id, name: s.name })))
    }
    if(colors.length === 0) {
        const colorIds = await prisma.color.findMany({
            where: { isActive: true },
            select: { id: true, name: true }
        })
        colors.push(...colorIds.map((c) => ({ id: c.id, name: c.name })))
    }
    if(materials.length === 0) {
        const materialIds = await prisma.material.findMany({
            where: { isActive: true },
            select: { id: true, name: true }
        })
        materials.push(...materialIds.map((m) => ({ id: m.id, name: m.name })))
    }

    const products = await prisma.product.findMany({
        where: { status: "ACTIVE", },
        select: {
            _count: { select: { variants: true }},
            id: true,
            slug: true,
        }
    })

    for (const product of products) {
        if (product._count.variants > 0) {
            continue;
        }

        const variantCount = getRandomInt(2, 6);

        const usedCombinations = new Set<string>();

        for (let i = 0; i < variantCount; i++) {
            let attempts = 0;

            let created = false;

            while (attempts < 10 && !created) {
                const size = getRandomItem(sizes);
                const color = getRandomItem(colors);
                const material = getRandomItem(materials);

                const key = `${size.id}-${color.id}-${material.id}`;

                if (usedCombinations.has(key)) {
                    attempts++;
                    continue;
                }

                const exists = await prisma.variant.findFirst({
                    where: {
                        productId: product.id,
                        sizeId: size.id,
                        colorId: color.id,
                        materialId: material.id,
                    },
                });

                if (exists) {
                    attempts++;
                    continue;
                }

                try {
                    await prisma.$transaction(async (tx) => {
                        const variant = await variantsRepository.createVariant({
                            productId: product.id,
                            colorId: color.id,
                            sizeId: size.id,
                            materialId: material.id,
                        }, tx)

                        const skuCode = generateSkuCode(
                            product.slug, 
                            size.name, 
                            color.name, 
                            material.name
                        );

                        await variantsRepository.createProductSku({
                            variantId: variant.id,
                            skuCode,
                            price: getRandomInt(15000, 1000000),
                            stock: getRandomInt(10, 250),
                            isActive: true,
                        }, tx);
                    });

                    usedCombinations.add(key);
                    created = true;
                }
                catch (error) {
                    console.error("Error creating variant:", error);
                    attempts++;
                }
            }
        }
    }
}

(async () => {
    try {
        await createVariants();
        console.log("Variants seeding completed");
    } catch (error) {
        console.error("Seeder failed:", error);
    }
})();