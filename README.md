# 移动端H5图片压缩上传

大体的思路是，部分API的兼容性请参照[caniuse](www.caniuse.com)：

1. 利用[FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader),读取`blob对象`,或者是`file对象`，将图片转化为`data uri`的形式。
2. 使用`canvas`,在页面上新建一个画布,利用`canvas`提供的API,将图片画入这个画布当中。
3. 利用`canvas.toDataURL()`，进行图片的压缩，得到图片的`data uri`的值
4. 上传文件。

步骤1当中，在进行图片压缩前，还是对图片大小做了判断的，如果图片大小小于200KB时，是直接进行图片上传，不进行图片的压缩，如果图片的大小是大于200KB，则是先进行图片的压缩再上传:

```javascript
    <input type="file" id="choose" accept="image/*">
```


```javascript
    var fileChooser = document.getElementById("choose"),
        maxSize = 200 * 1024;   //200KB
    fileChoose.change = function() {
        var file = this.files[0],   //读取文件
            reader = new FileReader();
            
            reader.onload = function() {
                var result = this.result,   //result为data url的形式
                    img = new Image(),
                    img.src = result;
                    
                    
                if(result.length < maxSize) {  
                    imgUpload(result);      //图片直接上传
                } else {
                    var data = compress(img);    //图片首先进行压缩
                    imgUpload(data);                //图片上传
                }
            }
            
            reader.readAsDataURL(file);
    }
```

步骤2，3：
```javascript
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
        
    function compress(img) {
        canvas.width = img.width;
        canvas.height = img.height;
        
        //利用canvas进行绘图
        
        //将原来图片的质量压缩到原先的0.2倍。
        var data = canvas.toDataURL('image/jpeg', 0.2); //data url的形式
        
        return data;
    }
```
在利用canvas进行绘图的过程中,IOS图片上传过程中，存在着这样的问题：

1. 当你竖着拿手机的时候，拍完照，上传图片时，会出现照片自动旋转的情况，而横着拍照并上传图片时不会出现这个问题。这个时候如果想纠正图片自动旋转的情况，将图片转化为二进制的数据`(使用了binaryajax.js)`，方便获取图片的`exif信息`，通过获取`exif的信息`来确定图片旋转的角度`(使用了exif.js)`，然后再进行图片相应的旋转处理。[解决方法请戳我](http://bbs.it-home.org/thread-55474-1-1.html)
2. 在`IOS`中，当图片的大小大于 2MB时，会出现图片压扁的情况，这个时候需要重置图片的比例。[解决方法请戳我](http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios)
3. 利用FileReader，读取图片的过程需要花费一定时间,将图片数据注入到canvas画布中需要一定时间，图片压缩的过程中，图片越大，CPU计算消耗的时间也越长，可能会出现顿卡的情况。总之，就是这个过程当中需要花费一定时间。
4. IOS8.1的版本中有个`FileReader`的bug: `FileReader`读取的图片转化为Base64时，字符串为空，[具体的问题描述请戳我](http://stackoverflow.com/questions/25999083/filereader-not-working-on-ios-8), 遇到这个情况的话- - 还是老老实实把图片不做压缩处理扔给服务端吧. 


步骤4,文件上传有2种方式:

1. 将图片转化为`base64`
2. 将图片数据转为`Blob对象`，使用`FormData`上传文件

方式1可以通过`xhr ajax`或者`xhr2 FormData`进行提交。

方法2这里就有个大坑了。[具体描述请戳我](https://code.google.com/p/android/issues/detail?id=39882)

简单点说就是：`Blob对象`是无法注入到`FormData对象`当中的。

当你拿到了图片的`data uri数据`后，将其转化为`Blob`数据类型
```javascript
    var ndata = compress(img);
    ndata = window.atob(ndata); //将base64格式的数据进行解码
    
    //新建一个buffer对象，用以存储图片数据
    var buffer = new Uint8Array(ndata.length);
    for(var i = 0; i < text.length; i++) {
        buffer[i] = ndata.charCodeAt(i);
    }
    
    //将buffer对象转化为Blob数据类型
    var blob = getBlob([buffer]);
    
    var fd = new FormData(),
        xhr = new XMLHttpRequest();
    fd.append('file', blob);
    
    xhr.open('post', url);
    xhr.onreadystatechange = function() {
        //do something
    }
    xhr.send(fd);
```

在新建`Blob对象`中有需要进行兼容性的处理，特别是对于不支持`FormData`上传`blob`的andriod机的兼容性处理。[具体的方法请戳我](https://github.com/gokercebeci/canvasResize)
主要实现的细节是通过重写HTTP请求。


---

## 2月19日更新

在安卓机器中, 部分机型不支持`JPEG`格式的图片导出, 在`fex-team`提供的`webuploader`插件当中有个`jpegencoder.js`和`androidpatch.js`插件主要是解决这个问题, [链接请戳我](https://github.com/fex-team/webuploader/blob/master/src/runtime/html5/androidpatch.js)，不过在部分`4.x`的机型, 在`webview`里面对`file`对象进行了阉割，比如你拿不到`file.type`的值。 唉- -。

## 2月22日更新
`Android4.4`下`<input type="file">`由于系统`WebView`的`openFileChooser`接口更改，导致无法选择文件，从而导致无法上传文件. [bug描述请戳我](https://code.google.com/p/android/issues/detail?id=62220)



## 使用

```javascript
  npm install
  npm run build
```

* 支持AMD, CMD模块化的引入方式
* 也可通过外链

```javascript
  canvasResize(this.files[0], {
      crop: false,    // 是否裁剪
      quality: 0.9,   // 压缩质量  0 - 1
      rotate: 0,      // 旋转角度 
      callback(baseStr) {
        console.log(baseStr.length)
      }
    })
```

## Some Tips

 * 在使用`FormData`进行文件上传的时候，没有将图片文件转化为`blob`，而是转为了`base64`，主要是考虑到部分机型的兼容性的问题。
 * 在遇到一些是由于`native`端上导致的问题的时候，比如在安卓`4.4.x`的部分机型(主要集中在原生的系统，部门国产机，对`openFileChooser`做过兼容)当中无法唤起选择图片或拍照的接口,
 这个时候还是让`native`的同学给你提供`bridge`去完成图片的压缩和转码吧, 然后你再拿着端上给压缩好的图片去上传吧。
 * 封装好的库中没有提供裁剪的选项，如果需要有这方面的需求，请在`src/canvasResize.js`里面做相应的修改(读读源码也挺好- -)。

## 使用到的库

* [binaryajax.js](https://github.com/jseidelin/binaryajax)
* [canvasResize.js](https://github.com/gokercebeci/canvasResize)
* [exif.js](https://github.com/exif-js/exif-js)
* [andriodpatch.js](https://github.com/fex-team/webuploader/blob/master/src/runtime/html5/androidpatch.js)
* [jpegencoder.js](https://github.com/fex-team/webuploader/blob/master/src/runtime/html5/jpegencoder.js)
