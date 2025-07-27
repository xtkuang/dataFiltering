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
        const result = await fetch("http://127.0.0.1:5000/getPrice",{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({ "materialIdList": materialIdList })
        })
        if (!result.ok) {
            return {
                code: 500,
                message: result.statusText,
            }
        }
        const data = await result.json()
        const priceData: any[] = data.data; // 使用any类型暂时避开类型检查
        const pricesByMaterial = new Map<string, number[]>();
         // 收集每个物料的所有价格
        priceData.forEach(item => {
            // 使用正确的字段名访问物料ID
            const materialId = item["FMaterialId.FNumber"];
            if (!pricesByMaterial.has(materialId)) {
                pricesByMaterial.set(materialId, []);
            }
            pricesByMaterial.get(materialId)?.push(item.FPrice);
        });
        
        // 处理每个物料的价格并更新数据库
        const updatePromises = Array.from(pricesByMaterial.entries()).map(async ([materialCode, prices]) => {
            try {
                // 检查materialCode是否有效
                if (!materialCode) {
                    console.error('发现无效的materialCode');
                    return null; // 跳过无效的materialCode
                }
                
                // 检查prices数组是否为空
                if (!prices || prices.length === 0) {
                    console.error(`物料 ${materialCode} 没有价格数据`);
                    return null; // 跳过没有价格数据的物料
                }
                
                // 过滤掉非数字价格
                const validPrices = prices.filter(price => 
                    typeof price === 'number' && !isNaN(price) && isFinite(price));
                
                // 再次检查有效价格数组是否为空
                if (validPrices.length === 0) {
                    console.error(`物料 ${materialCode} 没有有效的数字价格`);
                    return null; // 跳过没有有效价格的物料
                }
                
                // 计算最高价、最低价和平均价
                const highestPrice = Math.max(...validPrices);
                const lowestPrice = Math.min(...validPrices);
                const averagePrice = Number((validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length).toFixed(5));
                
                // 更新数据库中对应物料的价格信息
                return prisma.material.updateMany({
                    where: { code: materialCode },
                    data: {
                        highestPrice,
                        lowestPrice,
                        averagePrice
                    }
                });
            } catch (error) {
                console.error(`处理物料 ${materialCode} 时出错:`, error);
                return null; // 出错时跳过此物料
            }
        });
        
        // 过滤掉null值并等待所有有效更新完成
        const results = await Promise.all(updatePromises.filter(p => p !== null));
        
        // 返回处理后的价格数据 - 只返回成功处理的物料价格
        const processedData = Array.from(pricesByMaterial.entries())
            .filter(([materialCode, prices]) => {
                // 过滤条件：materialCode有效且有有效价格
                if (!materialCode) return false;
                const validPrices = prices.filter(price => 
                    typeof price === 'number' && !isNaN(price) && isFinite(price));
                return validPrices.length > 0;
            })
            .map(([materialCode, prices]) => {
                // 过滤有效价格
                const validPrices = prices.filter(price => 
                    typeof price === 'number' && !isNaN(price) && isFinite(price));
                
                return {
                    materialCode,
                    highestPrice: Math.max(...validPrices),
                    lowestPrice: Math.min(...validPrices),
                    averagePrice: Number((validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length).toFixed(5))
                };
            });
        
        return processedData;
    }
}
export default new DataGetService()
