import React, { useEffect, useRef, useState } from 'react'
import { CameraImpl } from './lib/camera'
import './index.css'

export default function WebRTCCamera() {
  const camerImpl = useRef<CameraImpl | null>(null)
  const videoEl = useRef<HTMLVideoElement>(null)
  const canvasCamera = useRef<HTMLCanvasElement>(null)
  const canvasShot = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState('')
  const [pixelRatio, setPixeRatio] = useState(1)
  const [draw, setDraw] = useState(true)

  useEffect(() => {
    if (canvasCamera.current) {
      camerImpl.current = new CameraImpl(canvasCamera.current, canvasShot.current, videoEl.current)
      const camerImplListener = camerImpl.current.listener
      camerImplListener.$on('initdone', () => {
        console.log('initdone')
      })
      camerImplListener.$on('streamLoadError', (err) => {
        console.log('媒体流初始化失败: ', err)
        camerError(err)
      })
      camerImplListener.$on('error', (err) => {
        console.log('camer error: ', err)
        camerError(err)
      })
    }
    return () => {
      camerImpl.current?.stopNavigator()
      camerImpl.current?.closeWindowListener()
    }
  }, [])

  // 获取像素点
  function getCanvasImageData() {
    return camerImpl.current?.getCanvasImageData()
  }
  // 获取图片文件
  function canvasResizetoFile() {
    return camerImpl.current?.canvasResizetoFile()
  }
  function setZoom(value) {
    return camerImpl.current?.setZoom(value)
  }
  function handleZoom(stepVal = 0) {
    const preZoomVal = camerImpl.current?.config.zoom || 1
    const nowZoomVal = preZoomVal + stepVal
    if (nowZoomVal > 0) {
      setZoom(nowZoomVal)
    }
    console.log('zoom:', camerImpl.current?.config.zoom)
  }
  // 相机错误抛出
  function camerError(error) {
    console.log(error, 'camera Error')
  }

  const addZoomHandle = () => {
    handleZoom(0.2)
  }
  const descZoomHandle = () => {
    handleZoom(-0.2)
  }
  return (
    <div className="camera_outer">
      <canvas
        ref={canvasCamera}
        className="video-canvas-ctx"
        // style={{ display: state.draw ? "block" : "hidden" }}
      ></canvas>
      <canvas ref={canvasShot} className="video-shot-ctx"></canvas>
      <video
        ref={videoEl}
        className="video-ctx"
        style={{
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          border: 'none',
          objectFit: 'cover',
        }}
        autoPlay
      ></video>
      {imgSrc && (
        <div className="img_bg_camera">
          <img src={imgSrc} alt="" className="tx_img" />
        </div>
      )}
      <div className="btn_area">
        <div className="zoom_btn" onClick={addZoomHandle}>
          +
        </div>
        <div className="zoom_btn" onClick={descZoomHandle}>
          -
        </div>
      </div>
    </div>
  )
}
