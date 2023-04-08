# WD1.4 Tagger & Editor

App for tagging images and editing those tags

Note: uses about 8-9 GB of storage after all packages and models are downloaded

<img alt="wd tagger" src="https://user-images.githubusercontent.com/76718358/230708175-3bd38fc0-c840-4aab-bc2a-a64e4efd2eb8.jpg" width="512" />

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
