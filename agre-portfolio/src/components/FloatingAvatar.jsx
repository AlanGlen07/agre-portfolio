
import { useEffect, useRef, useState } from "react";
import robot from "../assets/images/robot.png";
import "../style/FloatingAvatar.css";

export default function FloatingAvatar() {
  const [position, setPosition] = useState(() => {
    const width = window.innerWidth <= 600 ? 100 : 150;
    const height = width * 1.5;
    return {
      x: Math.max(0, window.innerWidth - width - 20),
      y: Math.max(0, window.innerHeight - height - 50),
    };
  });
  const [dragging, setDragging] = useState(false);

  const draggingRef = useRef(false);
  const dragData = useRef({
    pointerX: 0,
    pointerY: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth <= 600 ? 100 : 150;
      const height = width * 1.5;

      setPosition((previous) => ({
        x: Math.max(
          0,
          Math.min(previous.x, window.innerWidth - width)
        ),
        y: Math.max(
          0,
          Math.min(previous.y, window.innerHeight - height)
        ),
      }));
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handlePointerDown(event) {
    event.preventDefault();

    draggingRef.current = true;
    setDragging(true);

    event.currentTarget.setPointerCapture(event.pointerId);

    dragData.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: position.x,
      startY: position.y,
    };
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) return;

    const deltaX = event.clientX - dragData.current.pointerX;
    const deltaY = event.clientY - dragData.current.pointerY;

    const robotWidth = window.innerWidth <= 600 ? 100 : 150;
    const robotHeight = robotWidth * 1.5;

    setPosition({
      x: Math.max(
        0,
        Math.min(
          window.innerWidth - robotWidth,
          dragData.current.startX + deltaX
        )
      ),
      y: Math.max(
        0,
        Math.min(
          window.innerHeight - robotHeight,
          dragData.current.startY + deltaY
        )
      ),
    });
  }

  function handlePointerUp() {
    draggingRef.current = false;
    setDragging(false);
  }

  return (
    <div
      className={`robot-draggable ${dragging ? "is-dragging" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="img"
      aria-label="Draggable robot assistant"
    >
      <img
        src={robot}
        alt="My robot avatar"
        draggable={false}
        className="robot-image"
      />

      <div className="robot-label">
        <span className="robot-dot" />
        ALAN.pogi
      </div>
    </div>
  );
}
