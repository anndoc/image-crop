CKEDITOR.dialog.add('cropDialog', function (editor) {
    var cropper,
        canvasId,
        canvas,
        imageType = 'image/jpeg',
        width = parseInt(window.innerWidth * 80 / 100),
        height = parseInt(window.innerHeight * 80 / 100),
        options = editor.config.cropperOption,
        initCropper = function (e) {
            if (!canvas)
                // grab generated random DOM ID
                canvasId = CKEDITOR.dialog.getCurrent().getContentElement('cropTab', 'image').domId;
                canvas = window.document.getElementById(canvasId);

            if (!cropper)
                cropper = new Cropper(canvas, options);
        },
        uploadOnChange = function (e) {
            var url = window.URL || window.webkitURL,
                blobURL,
                file = e.target.files[0];

            initCropper(e);

            if (/^image\/\w+/.test(file.type)) {
                blobURL = URL.createObjectURL(file);
                cropper.reset().replace(blobURL);
            } else {
                window.alert(editor.lang.imagecrop.wrongImageType);
            }
        },
        ref = CKEDITOR.tools.addFunction(function (url) {
            var dialog = editor._.filebrowserSe.getDialog(),
                abbr = dialog.element;

            abbr.setAttribute('src', url);
            abbr.setAttribute('data-cke-saved-src', url);
            dialog.commitContent(abbr);
            if (dialog.insertMode)
                editor.insertElement(abbr);
        });

    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality) {

                var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
                    len = binStr.length,
                    arr = new Uint8Array(len);

                for (var i = 0; i < len; i++) {
                    arr[i] = binStr.charCodeAt(i);
                }

                callback(new Blob([arr], {type: type || imageType}));
            }
        });
    }

    return {
        title: editor.lang.imagecrop.title,
        width: width,
        height: height,
        contents: [
            {
                id: 'cropTab',
                label: editor.lang.imagecrop.cropTab,
                filebrowser: 'uploadButton',
                elements: [
                    {
                        type: 'hbox',
                        widths: ['80%', '20%'],
                        children: [
                            {
                                type: 'html',
                                html: '<img>',
                                id: 'image',
                                label: editor.lang.common.image,
                                style: 'max-width: 100%; height: ' + parseInt(window.innerHeight * 80 / 100) + 'px; border-color:#CECECE',
                                setup: function(element) {
                                    cropper.reset().replace(element.getAttribute('src'));
                                }
                            },
                            {
                                type: 'vbox',
                                align: 'right',
                                children: [
                                    {
                                        type: 'file',
                                        id: 'upload',
                                        label: editor.lang.common.browseServer,
                                        onClick: function (e) {
                                            e.sender.$.removeEventListener('change', uploadOnChange, false);
                                            e.sender.$.addEventListener('change', uploadOnChange, false);
                                        }
                                    }, {
                                        type: 'fileButton',
                                        style: 'display: none',
                                        id: 'uploadButton',
                                        label: editor.lang.imagecrop.btnUpload,
                                        for: ['cropTab', 'upload'],
                                        filebrowser: {
                                            action: 'QuickUpload'
                                        },
                                        onClick: function () {
                                            var dialog = this.getDialog(),
                                                form = dialog.getContentElement('cropTab', 'upload').getInputElement().$.form,
                                                fileName = dialog.getContentElement('cropTab', 'upload').getInputElement().$.value.replace(/^.*[\\\/]/, '') || 'upload.jpg',
                                                formData,
                                                xhr = new XMLHttpRequest();

                                            editor._.filebrowserSe = this;

                                            xhr.onreadystatechange = function (response) {
                                                if (xhr.readyState == 4 && xhr.status == 200) {
                                                    form.ownerDocument.write(response.target.responseText);
                                                    cropper.destroy();
                                                    canvas.removeAttribute('src');
                                                }
                                            };

                                            if (form) {
                                                cropper.getCroppedCanvas(editor.config.resultOption).toBlob(function (blob) {
                                                    formData = new FormData();
                                                    formData.append('upload', blob, fileName);
                                                    xhr.open('POST', (form.action + '&CKEditorFuncNum=' + ref), true); // todo
                                                    xhr.send(formData);
                                                });
                                            }
                                            return false;
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        onLoad: function (e) {
            initCropper(e);
            window.console.log('onLoad ', e);
        },
        onShow: function () {
            var selection = editor.getSelection();
            var element = selection.getStartElement();

            if (element)
                element = element.getAscendant('img', true);

            if (!element || element.getName() != 'img') {
                element = editor.document.createElement('img');
                this.insertMode = true;
            }
            else
                this.insertMode = false;

            this.element = element;
            if (!this.insertMode)
                this.setupContent(this.element);
        },
        onOk: function () {
            var dialog = this,
                uploadButton = dialog.getContentElement('cropTab', 'uploadButton');
            uploadButton.click();
        }
    }
});
