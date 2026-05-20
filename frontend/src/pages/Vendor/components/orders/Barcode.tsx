import React from 'react';

interface BarcodeProps {
  value: string;
  height?: number;
  showText?: boolean;
}

// Bảng ánh xạ mã hóa Code 39 tiêu chuẩn (9 bit đại diện cho 5 vạch và 4 khoảng trắng)
// 1 = Rộng (Wide), 0 = Hẹp (Narrow)
// Các vị trí lẻ (1, 3, 5, 7, 9) là vạch đen (bars)
// Các vị trí chẵn (2, 4, 6, 8) là khoảng trắng (spaces)
const CODE39_MAP: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100',
  'A': '100001001', 'B': '001001001', 'C': '101001000', 'D': '000011001',
  'E': '100011000', 'F': '001011000', 'G': '000001101', 'H': '100001100',
  'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110',
  'U': '110000001', 'V': '011000001', 'W': '111000000', 'X': '010010001',
  'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
  '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
};

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 50,
  showText = true
}) => {
  // Chuẩn hóa chuỗi in: viết hoa và bọc bằng hai ký tự start/stop '*'
  const upperValue = value.toUpperCase();
  const formatText = `*${upperValue}*`;

  // Kiểm tra chuỗi chứa ký tự không hợp lệ
  for (const char of upperValue) {
    if (!CODE39_MAP[char] && char !== '*') {
      return <div style={{ color: 'red', fontSize: '12px' }}>Ký tự mã vạch không hợp lệ: {char}</div>;
    }
  }

  // Cấu hình kích thước vạch vẽ
  const narrowWidth = 1.5;
  const wideWidth = narrowWidth * 3;
  const gapWidth = narrowWidth;

  let currentX = 10; // Khoảng đệm lề trái
  const rects: { x: number; width: number; fill: string }[] = [];

  // Tạo toàn bộ vạch đen và trắng dạng SVG rect
  for (let i = 0; i < formatText.length; i++) {
    const char = formatText[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP['*'];

    for (let bitIdx = 0; bitIdx < 9; bitIdx++) {
      const isBar = bitIdx % 2 === 0;
      const isWide = pattern[bitIdx] === '1';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push({
          x: currentX,
          width,
          fill: '#000000'
        });
      }

      currentX += width;
    }
    
    // Thêm khoảng hở nhỏ giữa các ký tự
    currentX += gapWidth;
  }

  const totalWidth = currentX + 10; // Thêm khoảng đệm lề phải

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '5px 0' }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: '350px' }}
      >
        {rects.map((rect, idx) => (
          <rect
            key={idx}
            x={rect.x}
            y={0}
            width={rect.width}
            height={height}
            fill={rect.fill}
          />
        ))}
      </svg>
      {showText && (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '2px', letterSpacing: '2px', color: '#000' }}>
          {value}
        </span>
      )}
    </div>
  );
};
