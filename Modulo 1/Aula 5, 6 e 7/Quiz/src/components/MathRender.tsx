import React from "react";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface MathRenderProps {
  text: string;
  block?: boolean;
}

export default function MathRender({ text, block = false }: MathRenderProps) {
  // Render as block or inline math
  if (block) {
    return <BlockMath math={text} />;
  }
  return <InlineMath math={text} />;
}
