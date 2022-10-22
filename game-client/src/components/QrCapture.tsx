import React, { useEffect, useRef, useState } from 'react';
import { Box, Loader, Text, useMantineTheme } from '@mantine/core';
import jsQR from 'jsqr';
import { useViewportSize } from '@mantine/hooks';

type UseMediaProps = {
  width: number;
  height: number;
}

const useMedia = ({ width, height }: UseMediaProps) => {
  const [stream, setStream] = useState<null | MediaStream>(null);
  const [error, setError] = useState<null | Error>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        const capturedStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'envionment'
          }
        });
        capturedStream.getVideoTracks()[0].enabled = true;
        setStream(capturedStream);
        setError(null);
      } catch (e) {
        console.error(e);
        setStream(null);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [])

  return {
    stream,
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
  captureWidth: number;
  captureHeight: number;
  captureOnce?: boolean;
}

export default function QrCapture ({ onQrPayload, captureWidth, captureHeight, captureOnce = true }: Props) {
  const theme = useMantineTheme();
  const {
    stream,
    error,
    isLoading
  } = useMedia({ width: captureWidth, height: captureHeight });
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [animationFrameCallbackId, setAnimationFrameCallbackId] = useState(0);
  const [qrPayload, setQrPayload] = useState("");

  useEffect(() => {
    if( stream && videoRef.current){
      videoRef.current.srcObject = stream;
      
      const processFrame = () => {
        if( !canvasRef.current || !videoRef.current ) return;
        var ctx = canvasRef.current.getContext('2d');
        if( !ctx ) {
          setAnimationFrameCallbackId(requestAnimationFrame(processFrame))
          return;
        }
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
          if( captureOnce ) return;
        }
        setAnimationFrameCallbackId(requestAnimationFrame(processFrame))
      }
      setAnimationFrameCallbackId(requestAnimationFrame(processFrame));
    }
    else {
      if( videoRef.current) videoRef.current.srcObject = null;
      cancelAnimationFrame(animationFrameCallbackId);
      setAnimationFrameCallbackId(0);
    }

    return () => {
      if( animationFrameCallbackId ) cancelAnimationFrame(animationFrameCallbackId)
    }
  }, [stream])

  useEffect(() => {
    if( stream ) {
      stream.getVideoTracks()[0].enabled = false;
    }
    if( videoRef.current ) videoRef.current.srcObject = null;
  }, [])

  if( isLoading ) return <Loader />
  else if( error ) return <Text color={theme.colors['errorColor'][4]}>{error.name} {error.message}</Text>
  else if( !stream ) return <Text color={theme.colors['errorColor'][4]}>Stream not loaded</Text>
  return (
    <Box sx={{ position: 'relative', display: 'block', width: `${captureWidth}px`, height: `${captureHeight}px`, padding: 0, margin: 'auto' }}>
      <video
        ref={videoRef}
        playsInline
        autoPlay
        width={captureWidth}
        height={captureHeight}
        style={{
          display: stream ? 'block' : 'none',
          position: 'absolute',
          zIndex: 1
        }}
      />
      <canvas
        ref={canvasRef}
        width={captureWidth}
        height={captureHeight}
        style={{
          display: stream ? 'block' : 'none',
          position: 'absolute',
          zIndex: 2
        }}
      />
    </Box>
  )
}