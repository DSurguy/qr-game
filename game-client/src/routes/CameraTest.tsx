import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Text, TextInput } from '@mantine/core';
import jsQR from 'jsqr';

const useMedia = () => {
  const [stream, setStream] = useState<null | MediaStream>(null);
  const [cameraTrack, setCameraTrack] = useState<null | MediaStreamTrack>(null);
  const [error, setError] = useState<null | Error>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        const capturedStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: 500,
            height: 500,
            frameRate: {
              ideal: 15,
              max: 30
            }
          }
        });
        const videoTracks = capturedStream.getVideoTracks();
        setStream(capturedStream);
        setCameraTrack(videoTracks[0]);
        console.log(videoTracks);
      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [])

  return {
    stream,
    cameraTrack,
    error,
    isLoading
  } as const;
}

type Point = {
  x: number;
  y: number;
}

const drawLine = (ctx: CanvasRenderingContext2D, begin: Point, end: Point, color: string) =>  {
  ctx.beginPath();
  ctx.moveTo(begin.x, begin.y);
  ctx.lineTo(end.x, end.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();
}

type Props = {
  onQrPayload: (payload: string) => void;
}

export default function CameraTestRoute ({ onQrPayload }: Props) {
  const {
    stream,
    cameraTrack,
    error,
    isLoading
  } = useMedia();
  const canvasRef = useRef<HTMLCanvasElement>()
  const videoRef = useRef<HTMLVideoElement>()
  const [animationFrameCallbackId, setAnimationFrameCallbackId] = useState(0);
  const [qrPayload, setQrPayload] = useState("");

  useEffect(() => {
    if( stream && videoRef.current){
      videoRef.current.srcObject = stream;
      
      const processFrame = () => {
        if( !canvasRef.current || !videoRef.current ) return;
        var ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        var imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if( code ) {
          drawLine(ctx, code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          drawLine(ctx, code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          drawLine(ctx, code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          drawLine(ctx, code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
          setQrPayload(code.data)
          onQrPayload(code.data);
        }
        setAnimationFrameCallbackId(requestAnimationFrame(processFrame))
      }
      setAnimationFrameCallbackId(requestAnimationFrame(processFrame));
    }
    else {
      videoRef.current.srcObject = null;
      cancelAnimationFrame(animationFrameCallbackId);
      setAnimationFrameCallbackId(0);
    }

    return () => {
      if( animationFrameCallbackId ) cancelAnimationFrame(animationFrameCallbackId)
    }
  }, [stream])

  return (
    <Box>
      { isLoading && "Loading..." }
      { error && <Text color="red">{error.name} {error.message}</Text>}
      { stream && "GET STREAM" }
      <Button>Capture Frame</Button>
      <Box sx={{ display: 'relative', width: '500px', height: '500px' }}>
        <video
          ref={videoRef}
          playsInline
          autoPlay
          width="500"
          height="500"
          style={{
            display: stream ? 'block' : 'none',
            position: 'absolute',
            zIndex: 1
          }}
        />
        <canvas
          ref={canvasRef}
          width="500"
          height="500"
          style={{
            display: stream ? 'block' : 'none',
            position: 'absolute',
            zIndex: 2
          }}
        />
      </Box>
      { qrPayload && <TextInput value={qrPayload} readOnly sx={{ fontFamily: 'monospace'}} />}
    </Box>
  )
}