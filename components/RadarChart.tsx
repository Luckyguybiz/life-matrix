import { View } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import type { Sphere } from "../lib/api";

interface Props {
  spheres: Sphere[];
  size: number;
}

const MAX_LEVEL = 10;
const GRID_LEVELS = [2.5, 5, 7.5, 10];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default function RadarChart({ spheres, size }: Props) {
  if (spheres.length < 3) return null;

  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const n = spheres.length;
  const angleStep = 360 / n;

  function getPoints(values: number[]): string {
    return values
      .map((val, i) => {
        const safe = Number(val) || 0;
        const r = (safe / MAX_LEVEL) * maxRadius;
        const { x, y } = polarToCartesian(center, center, r, i * angleStep);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  const currentValues = spheres.map((s) => Number(s.current_level) || 0);
  const targetValues = spheres.map((s) => Number(s.target_level) || 1);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        {/* Grid polygons */}
        {GRID_LEVELS.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const r = (level / MAX_LEVEL) * maxRadius;
            const { x, y } = polarToCartesian(center, center, r, i * angleStep);
            return `${x},${y}`;
          }).join(" ");

          return (
            <Polygon
              key={`grid-${level}`}
              points={pts}
              fill="none"
              stroke="#333"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {spheres.map((_, i) => {
          const { x, y } = polarToCartesian(
            center,
            center,
            maxRadius,
            i * angleStep
          );
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#333"
              strokeWidth={1}
            />
          );
        })}

        {/* Target polygon (dashed outline) */}
        <Polygon
          points={getPoints(targetValues)}
          fill="rgba(255,255,255,0.05)"
          stroke="#555"
          strokeWidth={1.5}
          strokeDasharray="6,4"
        />

        {/* Current level polygon (filled) */}
        <Polygon
          points={getPoints(currentValues)}
          fill="rgba(139,92,246,0.25)"
          stroke="#8b5cf6"
          strokeWidth={2}
        />

        {/* Data points */}
        {currentValues.map((val, i) => {
          const safe = Number(val) || 0;
          const r = (safe / MAX_LEVEL) * maxRadius;
          const { x, y } = polarToCartesian(center, center, r, i * angleStep);
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill={spheres[i].color}
              stroke="#000"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels */}
        {spheres.map((sphere, i) => {
          const { x, y } = polarToCartesian(
            center,
            center,
            maxRadius + 24,
            i * angleStep
          );
          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={y}
              fill={sphere.color}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {sphere.name.length > 12
                ? sphere.name.slice(0, 11) + "..."
                : sphere.name}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
