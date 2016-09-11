### Simple Image Crop plugin for CKEditor

#### Config for django-ckeditor-upload


        {
            'default': {
                'toolbar': 'full',
                'extraPlugins': 'imagecrop',
                'allowedContent': True,
                'cropperCssUrl': 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/0.8.1/cropper.min.css',
                'cropperJsUrl': 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/0.8.1/cropper.min.js',
                'cropperOption': {
                    'aspectRatio': 16 / 9,
                    'autoCropArea': 1,
                    'cropBoxResizable': False,
                    'dragMode': 'move',
                    'background': False
                },
                'resultOption': {
                    'width': 300
                }
            }
        }
