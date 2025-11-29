# This script converts the official YOLOv8 PyTorch model (.pt) into the 
# ONNX format required for the C# inference service.

from ultralytics import YOLO

def export_to_onnx(model_name='yolo11x.pt', export_path='yolo11x.onnx'):
    """
    Loads a YOLO PyTorch model and exports it to the ONNX format.
    
    The model weights (.pt) will be downloaded automatically if not present.
    """
    print(f"--- Starting YOLO Model Export ({model_name} to ONNX) ---")
    
    try:
        model = YOLO(model_name) 
        # ----------------------
        
        print("Model loaded successfully.")
        
        success = model.export(format="onnx", imgsz=640, name=export_path)

        if success:
            # Use Path to get the absolute path cleanly
            absolute_path = Path(export_path).resolve() 
            print(f"\n✅ Export successful!")
            print(f"File saved to: {absolute_path}")
            print("Copy this .onnx file into the 'Models/' directory of your C# project.")
        else:
            print("\n❌ Export failed. Check the ultralytics documentation or dependencies.")

    except Exception as e:
        print(f"\nAn error occurred during export: {e}")
        print("Ensure you have installed the required packages: pip install ultralytics")

if __name__ == '__main__':
    # Using the 'yolov8n.pt' model as the default since 'yolo11x.pt' is not standard
    export_to_onnx(model_name='yolov8n.pt')