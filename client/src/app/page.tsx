'use client';

import { useDraw } from "@/hooks/useDraw";
import { drawLine } from "@/utils/drawLine";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { io } from "socket.io-client";

const socket = io('http://localhost:5000');

interface DrawLineProps {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
}

export default function Home() {

  const [color, setColor] = useState<string>('#000');

  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');

    socket.emit('client-ready');

    socket.on('get-canvas-state', () => {
      if (!canvasRef.current?.toDataURL()) {
        return;
      }

      socket.emit('canvas-state', canvasRef.current.toDataURL());
    });

    socket.on('canvas-state-from-server', (state: string) => {
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLineProps) => {
      if (!ctx) {
        return;
      }
      drawLine({ prevPoint, currentPoint, ctx, color });
    });

    socket.on('clear', clear);

    return () => {
      socket.off('get-canvas-state');
      socket.off('canvas-state-from-server');
      socket.off('draw-line');
      socket.off('clear');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit('draw-line', ({ prevPoint, currentPoint, color }));
    drawLine({ ctx, currentPoint, prevPoint, color });
  }

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center">
      <div className="flex flex-col gap-10 pr-10">
        <HexColorPicker color={color} onChange={e => setColor(e)} />
        <button type="button" className="border border-black rounded-md p-2" onClick={() => socket.emit('clear')}>Clear canvas!</button>
      </div>
      <canvas
        onMouseDown={onMouseDown}
        width={750}
        height={750}
        className="border border-black rounded-md"
        ref={canvasRef}
      />
    </div>
  )
}
