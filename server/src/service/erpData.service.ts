import prisma from '../prisma'

interface PriceData {
    FMaterialId: string;
    FMaterialName: string;
    FPrice: number;
    FUnitID: number;
  }
class DataGetService {
    async getCodeByProjectCode(projectCodes: string[]) {
        const projects = await prisma.project.findMany({
            where: {
                code: {
                    in: projectCodes,
                },
            },
            include: {
                equipments: {
                    include: {
                        workstations: {
                            include: {
                                materials: {
                                    select: {
                                        code: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
        
        const materialCodes: string[] = [];
        
        projects.forEach(project => {
            project.equipments.forEach(equipment => {
                equipment.workstations.forEach(workstation => {
                    workstation.materials.forEach(material => {
                        materialCodes.push(material.code);
                    });
                });
            });
        });
        
        return [...new Set(materialCodes)];
    }
    async getDataFromWebPai(materialIdList: string[]) {
       
        
        console.log(materialIdList);
        const result = await fetch("http://localhost:5000/getPrice_test",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({ "materialIdList": materialIdList })
        })
        if (!result.ok) {
            throw new Error('价格获取失败')
        }
        const data = await result.json()
        const priceData: PriceData[] = data.data;
        const pricesByMaterial = new Map<string, number[]>();
         // 收集每个物料的所有价格
         priceData.forEach(item => {
            if (!pricesByMaterial.has(item.FMaterialId)) {
                pricesByMaterial.set(item.FMaterialId, []);
            }
            pricesByMaterial.get(item.FMaterialId)?.push(item.FPrice);
        });
        
        // 处理每个物料的价格并更新数据库
        const updatePromises = Array.from(pricesByMaterial.entries()).map(async ([materialCode, prices]) => {
            // 计算最高价、最低价和平均价
            const highestPrice = Math.max(...prices);
            const lowestPrice = Math.min(...prices);
            const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            
            // 更新数据库中对应物料的价格信息
            return prisma.material.updateMany({
                where: { code: materialCode },
                data: {
                    highestPrice,
                    lowestPrice,
                    averagePrice
                }
            });
        });
        
        // 等待所有更新完成
        await Promise.all(updatePromises);
        
        // 返回处理后的价格数据
        const processedData = Array.from(pricesByMaterial.entries()).map(([materialCode, prices]) => ({
            materialCode,
            highestPrice: Math.max(...prices),
            lowestPrice: Math.min(...prices),
            averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length
        }));
        
        return processedData;
    }
}
export default new DataGetService()
