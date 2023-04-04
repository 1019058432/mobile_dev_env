export default function scaleToWindow(canvas, backgroundColor) {
  var scaleX, scaleY, scale, center

  //1. Scale the canvas to the correct size
  //Figure out the scale amount on each axis
  scaleX = window.innerWidth / canvas.offsetWidth
  scaleY = window.innerHeight / canvas.offsetHeight

  //Scale the canvas based on whichever value is less: `scaleX` or `scaleY`
  scale = Math.min(scaleX, scaleY)
  canvas.style.transformOrigin = '0 0'
  canvas.style.transform = 'scale(' + scale + ')'

  //2. Center the canvas.
  //Decide whether to center the canvas vertically or horizontally.
  //Wide canvases should be centered vertically, and
  //square or tall canvases should be centered horizontally
  if (canvas.offsetWidth > canvas.offsetHeight) {
    if (canvas.offsetWidth * scale < window.innerWidth) {
      center = 'horizontally'
    } else {
      center = 'vertically'
    }
  } else {
    if (canvas.offsetHeight * scale < window.innerHeight) {
      center = 'vertically'
    } else {
      center = 'horizontally'
    }
  }

  //Center horizontally (for square or tall canvases)
  var margin
  if (center === 'horizontally') {
    margin = (window.innerWidth - canvas.offsetWidth * scale) / 2
    canvas.style.marginTop = 0 + 'px'
    canvas.style.marginBottom = 0 + 'px'
    canvas.style.marginLeft = margin + 'px'
    canvas.style.marginRight = margin + 'px'
  }

  //Center vertically (for wide canvases)
  if (center === 'vertically') {
    margin = (window.innerHeight - canvas.offsetHeight * scale) / 2
    canvas.style.marginTop = margin + 'px'
    canvas.style.marginBottom = margin + 'px'
    canvas.style.marginLeft = 0 + 'px'
    canvas.style.marginRight = 0 + 'px'
  }

  //3. Remove any padding from the canvas  and body and set the canvas
  //display style to "block"
  canvas.style.paddingLeft = 0 + 'px'
  canvas.style.paddingRight = 0 + 'px'
  canvas.style.paddingTop = 0 + 'px'
  canvas.style.paddingBottom = 0 + 'px'
  canvas.style.display = 'block'

  //4. Set the color of the HTML body background
  document.body.style.backgroundColor = backgroundColor

  //Fix some quirkiness in scaling for Safari
  var ua = navigator.userAgent.toLowerCase()
  if (ua.indexOf('safari') != -1) {
    if (ua.indexOf('chrome') > -1) {
      // Chrome
    } else {
      // Safari
      //canvas.style.maxHeight = "100%";
      //canvas.style.minHeight = "100%";
    }
  }

  //5. Return the `scale` value. This is important, because you'll nee this value
  //for correct hit testing between the pointer and sprites
  return scale
}

function drawCanvas(canvasElement, videoElement, zoom) {
  var context = canvasElement.getContext('2d')
  context.save()
  //Get the dimensions of the canvas
  var canvasWidth = canvasElement.width
  var canvasHeight = canvasElement.height
  //Get the video dimensions
  var videoWidth = videoElement.offsetWidth
  var videoHeight = videoElement.offsetHeight
  //Calculate the scaling factor
  var xScale = (canvasWidth / videoWidth) * zoom
  var yScale = (canvasHeight / videoHeight) * zoom
  //Translate to the center of the canvas
  context.translate(canvasWidth / 2, canvasHeight / 2)
  //Scale around the center of the canvas
  context.scale(xScale, yScale)
  //Draw the video to the canvas
  context.drawImage(videoElement, -videoWidth / 2, -videoHeight / 2, videoWidth, videoHeight)
  context.restore()
}

function drawVideoCenteredOnCanvas(canvasElement, videoElement, zoom) {
  var gl = canvasElement.getContext('webgl')
  if (!gl) {
    return
  }
  var canvasWidth = canvasElement.width
  var canvasHeight = canvasElement.height
  // get video width and height
  var videoWidth = videoElement.videoWidth
  var videoHeight = videoElement.videoHeight
  // calculate video center
  var videoCenterX = videoWidth / 2
  var videoCenterY = videoHeight / 2
  // calculate scaled video width and height
  var scaledVideoWidth = videoWidth * zoom
  var scaledVideoHeight = videoHeight * zoom
  // set canvas transformation attributes
  gl.viewport(0, 0, canvasWidth, canvasHeight)
  gl.scissor(0, 0, canvasWidth, canvasHeight)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // set video transformation attributes
  gl.viewport(0, 0, scaledVideoWidth, scaledVideoHeight)
  gl.scissor(0, 0, scaledVideoWidth, scaledVideoHeight)
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.DEPTH_BUFFER_BIT)
  // set video translation to canvas center
  gl.translate(
    (canvasWidth - scaledVideoWidth) / 2 + videoCenterX,
    (canvasHeight - scaledVideoHeight) / 2 + videoCenterY
  )
  // set video scale
  gl.scale(zoom, zoom)
  // draw video on canvas
  gl.drawImage(videoElement, 0, 0)
}
