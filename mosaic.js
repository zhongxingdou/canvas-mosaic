function Mosaic(wrap, image, option) {
    var defaults = {
        saveType: 'png', // png or jpg
        saveQuality: 1, // <=1 .5 .3 
        drawInterval: 50, //毫秒
        size: 15, //像素, 方块的大小
        transparent: .7, // 方块的透明度
        canvas: null
    }
    if (!option) {
        option = defaults
    } else {
        for (var p in defaults) {
            if (!(p in option) || !option[p]) {
                option[p] = defaults[p]
            }
        }
    }
    this.option = option
    this.wrap = wrap
    this.image = image
    this._enabled = true

    var self = this
    var canvas = option.canvas
    if (typeof image === 'string') {
        var tempImage = new Image()
        // tempImage.setAttribute('crossOrigin', 'anonymous')
        var src = image
        tempImage.src = src
        tempImage.onload = function() {
            self.init(tempImage)
        }
    } else { // image is an Element   
        self.init(this.image)
    }
}

Mosaic.prototype.reset = function() {
    var self = this
    var image = self.image
    if (typeof image === 'string') {
        var tempImage = new Image()
        // tempImage.setAttribute('crossOrigin', 'anonymous')
        var src = image
        tempImage.src = src
        tempImage.onload = function() {
            self.drawImgToCanvas(tempImage)
        }
    } else { // image is an Element   
        self.drawImgToCanvas(image)
    }
}

Mosaic.prototype.toggle = function(enable) {
    if (arguments.length > 0) {
        this._enabled = !!enable
    } else {
        this._enabled = !this._enabled
    }
    this.canvas.style.cursor = this._enabled ? 'pointer' : ''
}

Mosaic.prototype.isEnabled = function() {
    return this._enabled
}

Mosaic.prototype.init = function(image) {
    if (!this.canvas) {
        var width = image.width
        var height = image.height
        this.canvas = this.createCanvas(width, height)
    }
    this.canvas.style.cursor = this._enabled ? 'pointer' : ''
    this.context = this.canvas.getContext('2d')

    this.drawImgToCanvas(image)
    this.initPainting()
}

Mosaic.prototype.createCanvas = function(width, height) {
    var canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.wrap.appendChild(canvas)
    return canvas
}

Mosaic.prototype.drawImgToCanvas = function(image) {
    this.context.drawImage(image, 0, 0)
}

/**
 * @param <Number> size 方块大小
 * @param <Number> interval 绘制间隔时间
 */
Mosaic.prototype.initPainting = function() {
    var self = this
    var canvas = self.canvas
    var interval = self.option.drawInterval
    var lastTime = 0
    var transparent = self.option.transparent

    function delegateDraw(event) {
        var size = self.option.size
        // var x = event.clientX - canvas.clientLeft - size
        // var y = event.clientY - canvas.clientTop - size
        var x = event.layerX
        var y = event.layerY
        var pixel = self.context.getImageData(x, y, 1, 1).data
        var color = 'rgba(' + pixel[0] + ',' + pixel[1] +
             ',' + pixel[2] + ',' + transparent + ')';


        var now = new Date()
        if (now - lastTime < interval) return

        self.draw(x, y, color)
        lastTime = new Date()
    }

    var drawAble = false
    canvas.addEventListener('mousedown', function(event) {
        if (self.isEnabled()) {
            drawAble = true
            canvas.addEventListener('mousemove', delegateDraw)
        }
    })

    canvas.addEventListener('mouseup', function(event) {
        drawAble = false
        canvas.removeEventListener('mousemove', delegateDraw)
    })
}

Mosaic.randomColor = function() {
    var floor = Math.floor
    var rand = Math.random
    return [floor(rand() * 255), floor(rand() * 255), floor(rand() * 255)]
}

Mosaic.prototype.draw = function(x, y, color) {
    var size = this.option.size
    var trans = this.option.transparent
    // var color = Mosaic.randomColor().concat(trans)

    // this.context.fillStyle = "rgba(" + color.join(',') + ")"
    this.context.fillStyle = color
    this.context.fillRect(x, y, size, size)
}

/*
 * @param <Number> quality <= 1
 */
Mosaic.prototype.saveCanvas = function(imageType, quality) {
    if (!imageType) imageType = this.option.saveType
    if (!quality) quality = this.option.saveQuality
    var type = imageType === 'png' ? 'png' : 'jpeg'

    if (type === 'png') {
        return this.canvas.toDataURL()
    } else {
        return this.canvas.toDataURL('image/' + type, quality || 1)
    }
}