import argparse
import csv
import os
import sys
import uuid

import cv2
import numpy as np
import torch
from flask import Flask, request
from huggingface_hub import hf_hub_download
from PIL import Image

app = Flask(__name__)

WD14_TAGGERS = {
    "swinv2": "SmilingWolf/wd-v1-4-swinv2-tagger-v2",
    "convnext": "SmilingWolf/wd-v1-4-convnext-tagger-v2",
    "convnextv2": "SmilingWolf/wd-v1-4-convnextv2-tagger-v2",
    # "vit": "SmilingWolf/wd-v1-4-vit-tagger-v2"
}

file_dir = os.path.dirname(os.path.realpath(__file__))
TAGGER_DIR = os.path.join(file_dir, "taggers")

ONNX_FILE = "model.onnx"
CSV_FILE = "selected_tags.csv"
KERAS_FILES = ["keras_metadata.pb", "saved_model.pb"]
SUB_DIR = "variables"
SUB_DIR_FILES = ["variables.data-00000-of-00001", "variables.index"]

IMAGE_SIZE = 448

UNDERSCORE_TAGS = ["0_0", "(o)_(o)", "+_+", "+_-", "._.", "<o>_<o>", "<|>_<|>", "=_=", ">_<", "3_3", "6_9", ">_o", "@_@", "^_^", "o_o", "u_u", "x_x", "|_|", "||_||"]

taggers = {}
use_tensorflow = False

# TODO: redirect print messages from huggingface & read download progress
progress_prefix = "taskStatus:"
start_prefix = progress_prefix + "start|"
update_prefix = progress_prefix + "update|"
end_prefix = progress_prefix + "end|"

def stdout(line):
    sys.stdout.write(line)
    sys.stdout.flush()

def preprocess_image(image_path, height):
    image = Image.open(image_path)
    if image.mode != "RGB":
        image = image.convert("RGB")

    image = np.array(image)
    image = image[:, :, ::-1]

    # pad to square
    size = max(image.shape[0:2])
    pad_x = size - image.shape[1]
    pad_y = size - image.shape[0]
    pad_l = pad_x // 2
    pad_t = pad_y // 2
    image = np.pad(image, ((pad_t, pad_y - pad_t), (pad_l, pad_x - pad_l), (0, 0)), mode="constant", constant_values=255)

    interp = cv2.INTER_AREA if size > height else cv2.INTER_LANCZOS4
    image = cv2.resize(image, (height, height), interpolation=interp)

    image = image.astype(np.float32)
    return image

stop_process = False
running = False

class Tagger:
    tags = []
    character_index = None
    character_threshold = 0.8
    providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
    def __init__(self, model_dir, model_name, repo):
        self.model_path = model_dir
        self.model_name = model_name
        self.repo = repo
        self.loaded = False
    def download(self):
        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Downloading {self.model_name}-onnx tagger\n")
        hf_hub_download(self.repo, ONNX_FILE, cache_dir=os.path.join(TAGGER_DIR, self.model_name), force_download=True, force_filename=ONNX_FILE)
        stdout(f"{end_prefix}{taskId}|Downloaded {self.model_name}-onnx tagger\n")

    def download_keras(self):
        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Downloading {self.model_name}-keras tagger\n")
        count = 0
        total = len(KERAS_FILES) + len(SUB_DIR_FILES)
        for file in KERAS_FILES:
            count += 1
            stdout(f"{update_prefix}{taskId}|{count / total}|Downloading {self.model_name}-keras tagger {count}/{total}\n")
            hf_hub_download(self.repo, file, cache_dir=os.path.join(TAGGER_DIR, self.model_name), force_download=True, force_filename=file)
        for file in SUB_DIR_FILES:
            count += 1
            stdout(f"{update_prefix}{taskId}|{count / total}|Downloading {self.model_name}-keras tagger {count}/{total}\n")
            hf_hub_download(self.repo, file, subfolder=SUB_DIR, cache_dir=os.path.join(TAGGER_DIR, self.model_name, SUB_DIR), force_download=True, force_filename=file)
        stdout(f"{end_prefix}{taskId}|Downloaded {self.model_name}-keras tagger\n")
    def load(self):
        if not os.path.exists(os.path.join(self.model_path, ONNX_FILE)):
            self.download()

        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Loading {self.model_name} tagger\n")
        try:
            self.model = InferenceSession(os.path.join(self.model_path, ONNX_FILE), providers=Tagger.providers)
        except:
            providers = ['CPUExecutionProvider']
            self.model = InferenceSession(os.path.join(self.model_path, ONNX_FILE), providers=providers)
        _, height, _, _ = self.model.get_inputs()[0].shape
        self.height = height
        self.loaded = True
        stdout(f"{end_prefix}{taskId}|Loaded {self.model_name} tagger\n")

    def load_keras(self):
        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Loading {self.model_name} tagger\n")
        try:
            self.model = load_model(self.model_path)
        except:
            self.download_keras()
            self.model = load_model(self.model_path)
        self.loaded = True
        stdout(f"{end_prefix}{taskId}|Loaded {self.model_name} tagger\n")

    def tag_image(self, image_path, threshold_low):
        image = preprocess_image(image_path, self.height)
        image = np.expand_dims(image, 0)

        input_name = self.model.get_inputs()[0].name
        label_name = self.model.get_outputs()[0].name
        confidents = self.model.run([label_name], {input_name: image})[0]

        image_tags = []
        for i, (tag, prob) in enumerate(zip(Tagger.tags[4:], confidents[0][4:])):
            if prob > Tagger.character_threshold or (i < Tagger.character_index - 4 and prob > threshold_low):
                if tag not in UNDERSCORE_TAGS:
                    tag = tag.replace("_", " ")
                image_tags.append({"name": tag, "score": prob.item()}) # convert numpy float32 to native Python type

        return sorted(image_tags, key=lambda x: x["score"], reverse=True)

    def interrogate(self, image_paths, threshold_low):
        global stop_process

        if self.loaded == False:
            self.load()

        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Tagging images 0/{len(image_paths)}\n")
        image_map = {}
        count = 0
        for image_path in image_paths:
            if stop_process:
                stop_process = False
                return
            count += 1
            stdout(f"{update_prefix}{taskId}|{count / len(image_paths)}|Tagging images {count}/{len(image_paths)}\n")
            image_map[image_path] = self.tag_image(image_path, threshold_low)

        stdout(f"{end_prefix}{taskId}|Tagged {count} image{'' if count == 1 else 's'}\n")
        return image_map

    def interrogate_keras(self, image_paths, threshold_low, batch_size = 8):
        global stop_process

        if self.loaded == False:
            self.load_keras()

        taskId = uuid.uuid4()
        stdout(f"{start_prefix}{taskId}|Tagging images 0/{len(image_paths)}\n")

        def run_batch(batch_images, image_map):
            imgs = np.array([im for _, im in batch_images])

            probs = self.model(imgs, training=False)
            probs = probs.numpy()

            for (image_path, _), prob in zip(batch_images, probs):
                image_tags = []
                for i, (tag, p) in enumerate(zip(Tagger.tags[4:], prob[4:])):
                    if p > Tagger.character_threshold or (i < Tagger.character_index - 4 and p > threshold_low):
                        if tag not in UNDERSCORE_TAGS:
                            tag = tag.replace("_", " ")
                        image_tags.append({"name": tag, "score": p.item()}) # convert numpy float32 to native Python type
                image_map[image_path] = sorted(image_tags, key=lambda x: x["score"], reverse=True)

        image_map = {}
        count = 0
        batch_images = []
        for image_path in image_paths:
            if stop_process:
                stop_process = False
                return
            image = preprocess_image(image_path, IMAGE_SIZE)
            batch_images.append((image_path, image))
            if len(batch_images) >= batch_size:
                run_batch(batch_images, image_map)
                count += len(batch_images)
                batch_images.clear()
                stdout(f"{update_prefix}{taskId}|{count / len(image_paths)}|Tagging images {count}/{len(image_paths)}\n")

        if len(batch_images) > 0:
            run_batch(batch_images, image_map)
            count += len(batch_images)
            stdout(f"{update_prefix}{taskId}|{count / len(image_paths)}|Tagging images {count}/{len(image_paths)}\n")

        stdout(f"{end_prefix}{taskId}|Tagged {count} image{'' if count == 1 else 's'}\n")
        return image_map

@app.post("/tag")
def get_tags():
    global running, use_tensorflow
    try:
        args = request.json
        if "model" not in args or "image_paths" not in args:
            return "Missing parameters", 400
        tagger = taggers[args["model"]]
        image_paths = args["image_paths"]
        threshold_low = 0.05
        batch_size = 8
        if "threshold_low" in args:
            threshold_low = args["threshold_low"]
        if "batch_size" in args:
            batch_size = args["batch_size"]

        running = True
        if use_tensorflow:
            tags = tagger.interrogate_keras(image_paths, threshold_low, batch_size)
        else:
            tags = tagger.interrogate(image_paths, threshold_low)
        running = False

        if tags is None:
            return "", 444
        return tags
    except Exception as e:
        sys.stderr.writelines(str(e))
        return ('Internal server error', 500)

@app.post("/cancel")
def cancel():
    global stop_process
    if running:
        stop_process = True
    return "", 204


if __name__ == "__main__":
    if not os.path.exists(TAGGER_DIR):
        # download csv file separately since it's the same for all repos
        hf_hub_download(WD14_TAGGERS["swinv2"], CSV_FILE, cache_dir=TAGGER_DIR, force_download=True, force_filename=CSV_FILE)

    taggers["swinv2"] = Tagger(os.path.join(TAGGER_DIR, "swinv2"), "swinv2", WD14_TAGGERS["swinv2"])
    taggers["convnextv2"] = Tagger(os.path.join(TAGGER_DIR, "convnextv2"), "convnextv2", WD14_TAGGERS["convnextv2"])
    taggers["convnext"] = Tagger(os.path.join(TAGGER_DIR, "convnext"), "convnext", WD14_TAGGERS["convnext"])
    # taggers["vit"] = Tagger(os.path.join(TAGGER_DIR, "vit"), "vit")

    parser = argparse.ArgumentParser()
    parser.add_argument("--use_tensorflow", action="store_true")
    parser.add_argument("--model", type=str, default="swinv2")

    args = parser.parse_args()

    use_tensorflow = args.use_tensorflow

    if use_tensorflow:
        from tensorflow.keras.models import load_model
    else:
        from onnxruntime import InferenceSession

    try:
        with open(os.path.join(TAGGER_DIR, "selected_tags.csv"), "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            lines = [row for row in reader]
            rows = lines[1:]
        Tagger.tags = [row[1] for row in rows]
        Tagger.character_index = next(i for i, row in enumerate(rows) if row[2] == '4')

        if use_tensorflow:
            taggers[args.model].load_keras()
        else:
            taggers[args.model].load()

        app.run(host="127.0.0.1", port=5000)
    except Exception as e:
        sys.stderr.writelines(str(e))
