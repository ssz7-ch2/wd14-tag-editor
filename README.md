# WD1.4 Tagger & Editor

App for tagging images and editing those tags

Note: uses about 8-9 GB of storage after all packages and models are downloaded

<img alt="wd tagger" src="https://user-images.githubusercontent.com/76718358/230708175-3bd38fc0-c840-4aab-bc2a-a64e4efd2eb8.jpg" width="512" />

## Usage

1. open images
2. tag images
3. add/edit/remove tags
4. save tags to file

Tags with grayed out text are not included when saving tags to file.

It is also possible to edit the score for each tag by appending `:<score>` to the tag.  
e.g. `tomato:0.8` will set the score for tomato to 0.8

## Shortcuts

| Key               | Action                     |
| ----------------- | -------------------------- |
| `ALT + A`         | add tag to all images      |
| `ALT + SHIFT + A` | add tag to selected images |
| `ALT + Q`         | tag all images             |
| `ALT + SHIFT + Q` | tag selected images        |
| `ALT + S`         | save tags to txt file      |
| `CTRL + F`        | find tag                   |
| `ALT + I`         | include tag                |

## Settings

| Settings        | Description                                                                         |
| --------------- | ----------------------------------------------------------------------------------- |
| Tagger Model    | wd1.4 tagger model used for tagging the images (swinv2, convnextv2, convnext)       |
| Use Tensorflow  | use tensorflow instead of onnxruntime                                               |
| Batch Size      | batch size for tensorflow (onnx model only uses batch 1)                            |
| Threshold       | tags below this threshold are grayed out and not saved when saving tags             |
| Threshold Low   | threshold for the tagger model, tags below this threshold won't be displayed at all |
| Save Tag Scores | save tag scores when saving tags (for training with weighted captions/tags)         |

## Run Without Image Tagging Functionality

It is possible to use the app as only a tag editor by placing an empty venv folder within the python folder.

- python
  - venv

This will drastically reduce the amount of space required to use the app (~280MB).

## Manual Setup

The app searches for python/taggers and python/venv folder. It will download and install the necessary files and packages if those folders don't exist.

### python venv

You can use the following commands if you wish to setup the python venv manually.

```powershell
cd python
python -m venv venv
.\venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu117
pip install -r requirements.txt
```

### tagger models

The app downloads these three models  
https://huggingface.co/SmilingWolf/wd-v1-4-swinv2-tagger-v2  
https://huggingface.co/SmilingWolf/wd-v1-4-convnextv2-tagger-v2  
https://huggingface.co/SmilingWolf/wd-v1-4-convnext-tagger-v2

Folder structure for the tagger models

- python
  - taggers
    - selected_tags.csv
    - \<tagger model name\>
      - keras_metadata.pb
      - saved_model.pb
      - model.onnx
      - variables
        - variables.data-00000-of-00001
        - variables.index

## Developing

Install dependencies

```powershell
npm install
```

Start app in dev mode

```powershell
npm run start
```

Package app

```powershell
npm run package
```
