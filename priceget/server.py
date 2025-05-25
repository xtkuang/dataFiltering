from flask import Flask, request, jsonify
from k3cloud_webapi_sdk.main import K3CloudApiSdk

# api_sdk = K3CloudApiSdk()
# api_sdk.Init(config_path='./conf.ini', config_node='config')

app = Flask(__name__)

# @app.route('/getPrice', methods=['GET'])
# def get_price():
#     data = request.get_json()
    
#     try:
#         # 调用金蝶云API查询价格数据
#         response = api_sdk.View("PUR_PriceCategory", {
#             "FormId": "PUR_PriceCategory",
#             "FieldKeys": "FMaterialId,FPrice",
#             "FilterString": [f"FMaterialId='{material_id}'"],
#             "Limit": 1
#         })
        
#         if response.get('Result') and response['Result']['Result']:
#             price_data = response['Result']['Result'][0]
#             return jsonify({'FPrice': price_data['FPrice'], 'FmaterialId': material_id})
        
#         return jsonify({'error': '未找到该物料价格'}), 404
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route("/getPrice_test", methods=["POST"])
def get_price_test():
    
    data = request.get_json()
    material_id_list = data.get("materialIdList")
    test_data = [
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.8376070000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.4102560000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.1538460000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":5.9829060000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.5000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":170.9401710000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":165.2000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":175.8000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":160.5000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":180.2500000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":200.0000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":195.5000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":205.7500000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":198.0000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":202.3000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.2500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.7500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.3500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":172.6000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":168.9000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":199.5000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":201.8000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.4500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.5500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":169.7500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":171.2500000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":203.5000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":197.8000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.6500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.8500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":173.9000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":167.3000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":204.2000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":196.7000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.9500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.1500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":174.6000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":166.4000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":205.1000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":195.9000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.0500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.2500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":175.3000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":165.7000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":206.0000000000},
    {"FMaterialId":"ZY-016-5050","FMaterialName":"智能手机-65","FUnitID":10101,"FPrice":195.0000000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.3500000000},
    {"FMaterialId":"ZY-016-5048","FMaterialName":"电池（批号+辅）","FUnitID":10101,"FPrice":6.4500000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":176.0000000000},
    {"FMaterialId":"ZY-016-5049","FMaterialName":"蓝牙耳机","FUnitID":10101,"FPrice":164.8000000000}
    ]
    return jsonify({"data":test_data})
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
