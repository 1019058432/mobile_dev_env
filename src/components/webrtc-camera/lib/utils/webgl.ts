import * as mat4 from 'gl-mat4'

const vertextSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  uniform float zoom; 
  varying vec2 v_texCoord;
  void main(void) {
    gl_Position = vec4(a_position.x*zoom,a_position.y * zoom , 0, 1.0);
    v_texCoord = a_texCoord;
  }
`

const fragmentSource = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type)
  if (!shader) {
    return null
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('a error occured compiling shader', gl.getShaderInfoLog(shader))
    return
  }

  return shader
}

const createProgram = (gl: WebGL2RenderingContext, shaders: WebGLShader[]) => {
  const program = gl.createProgram()
  if (!program) {
    return null
  }

  shaders.forEach((shader) => gl.attachShader(program, shader))
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('a error occured linking program ', gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)
  return program
}

const setAttribute = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  data: number[],
  attribute: string
) => {
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
  // 获取顶点属性的在着色器中的索引，并激活它
  const aVertexPositionLocation = gl.getAttribLocation(program, attribute)
  gl.enableVertexAttribArray(aVertexPositionLocation)
  // 设置顶点属性如何从顶点缓冲对象中取值。每次从数组缓冲对象中读取2个值
  gl.vertexAttribPointer(aVertexPositionLocation, 2, gl.FLOAT, false, 0, 0)
}

const drawTexture = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  video: HTMLVideoElement
) => {
  // 绘制前，清理canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0) // 指定颜色缓冲区的清除值
  gl.clearDepth(1.0) // 指定深度缓冲区的清除值
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

const createImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }

    img.onerror = (e) => {
      reject(e)
    }
    img.crossOrigin = 'crossOrigin'
    img.src = src
  })
}

const imageTexture = (gl: WebGL2RenderingContext, image: HTMLImageElement) => {
  var texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  return texture!
}

const createVideoTexture = (gl, program, needPixel?: boolean) => {
  // 是否需要保留缓冲区像素以用于获取
  if (needPixel) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  }

  // 将视频帧的纹理数据写入缓冲区
  let texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 设置纹理模式，该模式描述了如何处理视频的边缘
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  // 设置纹理过滤器，该模式描述了如何在视频缩放时处理像素
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 缩小
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR) // 放大
}

const getTexturePixel = (gl: WebGL2RenderingContext, x, y, width, height) => {
  // 需要开启：gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const subTexture = new Uint8Array(width * height * 4)
  gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, subTexture)
  return subTexture
}

/**
 * 创建一个指定宽高的纹理容器，将编排好层级的纹理数组叠加到容器指定位置
 * @param gl gl上下文
 * @param width 模板宽
 * @param height 模板高
 * @param numTextures 纹理数量
 * @param data 纹理数组
 */
const createMultiTextureTemp = (
  gl: WebGL2RenderingContext,
  width,
  height,
  numTextures,
  // eslint-disable-next-line no-undef
  data: TexImageSource[] = []
) => {
  const textureArray = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray)
  gl.texImage3D(
    gl.TEXTURE_2D_ARRAY, // 纹理类型
    0, // MIP 级别
    gl.RGBA, // 内部格式
    width, // 宽度
    height, // 高度
    numTextures, // 纹理数量
    0, // 边框大小
    gl.RGBA, // 像素格式
    gl.UNSIGNED_BYTE, // 数据类型
    null // 数据指针
  )
  for (let i = 0; i < numTextures; i++) {
    gl.texSubImage3D(
      gl.TEXTURE_2D_ARRAY, // 纹理类型
      0, // MIP 级别
      0, // x 偏移量
      0, // y 偏移量
      i, // z 偏移量，即纹理编号
      width, // 宽度
      height, // 高度
      1, // 深度，即纹理数量
      gl.RGBA, // 像素格式
      gl.UNSIGNED_BYTE, // 数据类型
      data[i] // 纹理数据
    )
  }
  // 生成 MIP 映射
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY)
}

export const playVideoInWebGL = (
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  width: number,
  height: number
) => {
  /* *** 环境准备 *** */

  // 获得webgl上下文
  const gl = canvas.getContext('webgl2')
  if (!gl) return
  gl.clearColor(0, 0, 0, 0)
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, width, height)

  // 分别创建顶点着色器和片段着色器
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertextSource)
  if (!vertexShader) return
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!fragmentShader) return

  // 创建应用程序
  const program = createProgram(gl, [vertexShader, fragmentShader])
  if (!program) return

  // 设置顶点坐标属性
  const vertexPostion = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]
  setAttribute(gl, program, vertexPostion, 'a_position')

  // 设置纹理坐标属性
  const txtCoordData = [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]
  setAttribute(gl, program, txtCoordData, 'a_texCoord')

  const zoomVal = 1.0
  const zoomValLocation = gl.getUniformLocation(program, 'zoom')
  gl.uniform1f(zoomValLocation, zoomVal)

  // 创建视频纹理
  createVideoTexture(gl, program)
  /* *** 播放动画 *** */

  const animation = () => {
    drawTexture(gl, program, video) // 重新绘制纹理
    requestAnimationFrame(animation)
  }
  animation()

  gl['program'] = program
  return gl
}

/**
 * 从video中心读取指定宽高的像素数组
 * @param gl webgl上下文
 * @param video
 * @param width
 * @param height
 * @returns
 */
export function getTextureFromVideo(gl, video, width, height) {
  const x = video.width / 2 - width / 2
  const y = video.height / 2 - height / 2
  return getTexturePixel(gl, x, y, width, height)
}

// 缩放
export function setWeglZoom(gl: WebGL2RenderingContext | null, zoomVal: number) {
  if (!gl) {
    return
  }
  const zoomValLocation = gl.getUniformLocation(gl['program'], 'zoom')
  gl.uniform1f(zoomValLocation, zoomVal)
}
