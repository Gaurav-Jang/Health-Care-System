import os
import numpy as np
import gdown
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.applications.vgg16 import preprocess_input

# --- Model path ---
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "model.keras")


MODEL_URL = "https://drive.google.com/file/d/1h7_N71pWN4gcPzZ8b9h34Mp5HhRwyEze/view?usp=sharing"

# --- Fix for batch_shape issue (older Keras models) ---
def input_layer_fix(*args, **kwargs):
    kwargs.pop('batch_shape', None)
    return InputLayer(*args, **kwargs)

# --- Download model if not exists ---
if not os.path.exists(MODEL_PATH):
    os.makedirs(MODEL_DIR, exist_ok=True)
    print("Downloading model from Google Drive...")
    gdown.download(MODEL_URL, MODEL_PATH, quiet=False)

# --- Load the model safely ---
model = load_model(MODEL_PATH, custom_objects={'InputLayer': input_layer_fix})
print("✅ Model loaded successfully!")

# --- Class labels (must match training label order) ---
class_labels = ['glioma', 'meningioma', 'notumor', 'pituitary']

# --- Brain regions (optional) ---
regions = ["Frontal Lobe", "Parietal Lobe", "Occipital Lobe", "Temporal Lobe"]

# --- Preprocess single image ---
def preprocess_image(image_path, image_size=224):
    """
    Load an image, resize, and preprocess it for VGG16.
    """
    img = load_img(image_path, target_size=(image_size, image_size))
    img_array = img_to_array(img)
    img_array = preprocess_input(img_array)  # Important for VGG16
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# --- Prediction function ---
def predict_mri(image_path):
    """
    Predict tumor type and confidence for a single MRI image.
    """
    img_array = preprocess_image(image_path, 224)
    
    preds = model.predict(img_array)
    predicted_index = np.argmax(preds, axis=1)[0]
    confidence = float(np.max(preds, axis=1)[0] * 100)

    # Optional brain region mapping
    region_index = predicted_index if predicted_index < len(regions) else 0
    region = regions[region_index]

    return {
        "prediction": class_labels[predicted_index],
        "confidence": confidence,
        "region": region
    }
