import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import os
import threading
import time
import logging

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('priceget_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PythonService(win32serviceutil.ServiceFramework):
    _svc_name_ = "PriceGetService"
    _svc_display_name_ = "Price Get Python Service"
    _svc_description_ = "Flask service for getting price data from K3Cloud"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_running = True
        self.flask_thread = None

    def SvcStop(self):
        logger.info("收到停止服务信号")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_running = False

    def SvcDoRun(self):
        logger.info("服务开始运行")
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                             servicemanager.PYS_SERVICE_STARTED,
                             (self._svc_name_, ''))
        self.main()

    def run_flask(self):
        """在单独的线程中运行Flask应用"""
        try:
            logger.info("正在启动Flask应用...")
            
            # 动态导入，避免启动时的导入错误
            from server import app
            
            logger.info("Flask应用导入成功，开始运行...")
            
            # 使用 0.0.0.0 而不是 127.0.0.1
            app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
            
        except Exception as e:
            error_msg = f"Flask应用启动失败: {str(e)}"
            logger.error(error_msg)
            servicemanager.LogErrorMsg(error_msg)

    def main(self):
        try:
            logger.info("服务主函数开始执行")
            
            # 获取当前脚本所在目录
            script_dir = os.path.dirname(os.path.abspath(__file__))
            logger.info(f"脚本目录: {script_dir}")
            
            # 切换到server.py所在目录
            os.chdir(script_dir)
            logger.info(f"工作目录: {os.getcwd()}")
            
            # 在单独的线程中启动Flask应用
            self.flask_thread = threading.Thread(target=self.run_flask)
            self.flask_thread.daemon = True
            self.flask_thread.start()
            
            logger.info("Flask线程已启动，等待停止信号...")
            
            # 等待停止信号
            while self.is_running:
                # 检查停止事件
                if win32event.WaitForSingleObject(self.hWaitStop, 1000) == win32event.WAIT_OBJECT_0:
                    logger.info("收到停止信号")
                    break
                
                # 检查Flask线程是否还在运行
                if not self.flask_thread.is_alive():
                    error_msg = "Flask应用线程已停止"
                    logger.error(error_msg)
                    servicemanager.LogErrorMsg(error_msg)
                    break
                    
        except Exception as e:
            error_msg = f"服务运行错误: {str(e)}"
            logger.error(error_msg)
            servicemanager.LogErrorMsg(error_msg)

if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(PythonService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(PythonService)