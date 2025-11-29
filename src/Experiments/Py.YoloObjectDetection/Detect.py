# -------------------------------------------------------------------------------------
# YOLOv11x Batch Object Detection Script (using Ultralytics Library)
#
# This script loads the pretrained YOLOv11x model and runs inference on ALL images
# contained within a specified input directory.
#
# PREREQUISITES:
# pip install ultralytics
# -------------------------------------------------------------------------------------

from ultralytics import YOLO
import os

# --- Configuration ---

# The 'x' model is the extra-large and most accurate variant of YOLOv11.
MODEL_NAME = 'yolo11x.pt'

# MANDATORY: Place all the images you want to process in this directory.
# YOLO will automatically detect and process all common image files inside it.
INPUT_DIR = 'images_to_process/'

# Directory where the output images with detections will be saved
OUTPUT_DIR = 'runs/detect'
PROJECT_NAME = 'yolo11x_batch_inference'

def run_object_detection():
    """
    Loads the YOLO model, runs inference on the input directory, and processes the results for all images.
    """
    try:
        # 1. Load a pre-trained YOLO model
        print(f"Loading model: {MODEL_NAME}...")
        # The model weights will be automatically downloaded on first run.
        model = YOLO(MODEL_NAME)
        print("Model loaded successfully.")

        # Ensure the input directory exists (optional safety check)
        if not os.path.isdir(INPUT_DIR):
             print(f"\n--- WARNING: Input directory '{INPUT_DIR}' not found. ---")
             print("Please create this folder and add your images before running the script.")
             return

        # 2. Run inference on the image source (directory path handles the batch)
        print(f"\nRunning batch prediction on all images in: {INPUT_DIR}")
        
        # The 'predict' method returns a list of 'Results' objects, one for each image processed.
        # save=True tells Ultralytics to automatically save the annotated images.
        results = model.predict(
            source=INPUT_DIR,
            save=True,
            project=OUTPUT_DIR,
            name=PROJECT_NAME,
            # Use 'batch' argument if you want to explicitly define batch size (e.g., batch=16)
            # Adjust confidence threshold (e.g., 0.25) to filter weak detections
            conf=0.25
        )

        # 3. Process and display the results metadata for each image in the batch
        print("\n--- Detection Results Summary ---")
        print(f"Total images processed in batch: {len(results)}")
        
        output_folder = os.path.join(OUTPUT_DIR, PROJECT_NAME)
        print(f"Annotated images saved to the folder: {os.path.abspath(output_folder)}")

        # Iterate over the results (one result object per image)
        for i, result in enumerate(results):
            # Extract the original filename from the result object's path
            filename = os.path.basename(result.path)

            print(f"\n[{i + 1}/{len(results)}] Image: {filename}")
            
            # Access the bounding box data
            boxes = result.boxes  # Boxes object
            num_detected = len(boxes)
            print(f"  Total objects detected: {num_detected}")
            
            if num_detected > 0:
                print("  Detected Objects:")
                # Iterate through each detected box
                for box in boxes:
                    # Confidence score (item() extracts the float from the tensor)
                    conf = box.conf[0].item()
                    # Class ID 
                    class_id = int(box.cls[0].item())
                    # Class name mapping
                    class_name = result.names[class_id]
                    # Bounding box coordinates (xyxy format: top-left x, top-left y, bottom-right x, bottom-right y)
                    coords = box.xyxy[0].tolist()
                    
                    print(f"    - Class: {class_name} (Conf: {conf:.2f}, Coords: [{coords[0]:.0f}, {coords[1]:.0f}, {coords[2]:.0f}, {coords[3]:.0f}])")
            else:
                print("  No objects detected above confidence threshold.")


    except Exception as e:
        print(f"An error occurred during detection: {e}")
        print("Please ensure you have run 'pip install ultralytics' and check your environment setup.")

if __name__ == "__main__":
    run_object_detection()