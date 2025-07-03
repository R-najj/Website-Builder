"use client";

import React, { useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { ItemTypes, DraggableSectionProps, DragItem } from "@/types";
import { SectionRenderer } from "./sections/SectionRenderer";
import { useCanvasActions } from "@/store/canvasStore";

export function DraggableSection({
  section,
  index,
  isSelected,
  onClick,
}: DraggableSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { moveSection } = useCanvasActions();

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ItemTypes.SECTION,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SECTION,
    item: () => {
      return { id: section.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="cursor-move"
    >
      <SectionRenderer
        section={section}
        isSelected={isSelected}
        onClick={onClick}
      />
    </div>
  );
}
