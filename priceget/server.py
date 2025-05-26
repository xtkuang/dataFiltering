from re import M
from shlex import join
from flask import Flask, request, jsonify
import json
from k3cloud_webapi_sdk.main import K3CloudApiSdk

api_sdk = K3CloudApiSdk("http://10.6.0.11/k3cloud/")
api_sdk.Init(config_path='./conf.ini', config_node='config')

app = Flask(__name__)
@app.route('/getPrice', methods=['POST'])
def get_price():
    data = request.get_json()
    material_id_list = data.get('materialIdList')
    
    if not material_id_list:
        return jsonify({'error': '未提供物料ID列表'}), 400
    
    # 分批处理，每批25个物料ID
    batch_size = 25
    all_results = []
    
    for i in range(0, len(material_id_list), batch_size):
        batch = material_id_list[i:i+batch_size]
        
        # 构建FilterString
        filter_string = []
        for material_id in batch:
            filter_item = {
                "FieldName": "FMaterialId.FNumber",
                "Compare": "67",  # 等于
                "Value": material_id,
                "Left": "",
                "Right": "",
                "Logic": "1"  # OR逻辑
            }
            filter_string.append(filter_item)
        
        try:
            response = api_sdk.BillQuery({
                "FormId": "PUR_PurchaseOrder",
                "FieldKeys": "FMaterialId.FNumber,FMaterialName,FPrice",
                "FilterString": filter_string,
                "OrderString": "",
                "TopRowCount": 0,
                "StartRow": 0,
                "Limit": 8000,
                "SubSystemId": ""
            })
            if response:
                all_results.extend(json.loads(response))
            
        except Exception as e:
            print(f"批次处理错误: {str(e)}")
            # 继续处理下一批，而不是立即返回错误
    
    if all_results:
        return jsonify({'data': all_results})
    else:
        return jsonify({'error': '未找到任何物料价格'}), 404
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
